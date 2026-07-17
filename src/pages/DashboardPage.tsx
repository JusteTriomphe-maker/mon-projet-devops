import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { goalsService } from '../services/goals';
import { habitsService } from '../services/habits';
import { journalService } from '../services/journal';
import { budgetService } from '../services/budget';
import { resourcesService } from '../services/resources';
import { agendaService } from '../services/agenda';
import { ProgressBar } from '../components/ProgressBar';
import type { Goal, Habit, JournalEntry, Transaction, Resource, AgendaEvent } from '../types';

function StatBlock({ emoji, label, value, sub }: { emoji: string; label: string; value: string | number; sub?: string }) {
  return (
    <div className="dash-stat">
      <span className="dash-stat__emoji">{emoji}</span>
      <div className="dash-stat__body">
        <span className="dash-stat__value">{value}</span>
        <span className="dash-stat__label">{label}</span>
        {sub && <span className="dash-stat__sub">{sub}</span>}
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="dash-card">
      <h2 className="dash-card__title">{title}</h2>
      {children}
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      goalsService.getAll(user.id),
      habitsService.getAll(user.id),
      journalService.getAll(user.id),
      budgetService.getAll(user.id),
      resourcesService.getAll(user.id),
      agendaService.getAll(user.id),
    ]).then(([g, h, j, t, r, e]) => {
      setGoals(g);
      setHabits(h);
      setEntries(j);
      setTransactions(t);
      setResources(r);
      setEvents(e);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  const goalStats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'Terminé').length;
    const overdue = goals.filter((g) => g.status === 'En cours' && new Date(g.deadline) < now).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, overdue, rate };
  }, [goals]);

  const habitStats = useMemo(() => {
    const doneToday = habits.filter((h) => h.completedDates.includes(today)).length;
    const bestStreak = habits.reduce((max, h) => {
      let streak = 0;
      let cur = today;
      const sorted = [...h.completedDates].sort().reverse();
      for (const d of sorted) {
        if (d === cur) { streak++; const p = new Date(cur); p.setDate(p.getDate() - 1); cur = p.toISOString().split('T')[0]; }
        else break;
      }
      return Math.max(max, streak);
    }, 0);
    return { total: habits.length, doneToday, bestStreak };
  }, [habits, today]);

  const budgetStats = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { balance: income - expense, income, expense };
  }, [transactions]);

  const upcomingEvents = useMemo(() =>
    events.filter((e) => e.date >= today).slice(0, 3),
    [events, today]
  );

  const recentEntries = entries.slice(0, 3);

  const resourceStats = useMemo(() => ({
    total: resources.length,
    done: resources.filter((r) => r.status === 'terminé').length,
    inProgress: resources.filter((r) => r.status === 'en cours').length,
  }), [resources]);

  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  if (loading) {
    return <div className="loading-screen"><div className="loading-spinner" /></div>;
  }

  const MOOD_EMOJI: Record<string, string> = { great: '😄', good: '🙂', neutral: '😐', bad: '😕', terrible: '😞' };

  return (
    <div className="dashboard-v2">
      <div className="dashboard-v2__header">
        <div>
          <h1>Bonjour, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="dashboard__subtitle">
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stats globales */}
      <div className="dash-stats-row">
        <StatBlock emoji="🎯" label="Objectifs" value={goalStats.total} sub={`${goalStats.completed} terminés`} />
        <StatBlock emoji="🏋️" label="Habitudes" value={`${habitStats.doneToday}/${habitStats.total}`} sub="aujourd'hui" />
        <StatBlock emoji="📓" label="Entrées journal" value={entries.length} sub={recentEntries[0] ? `Dernière : ${new Date(recentEntries[0].createdAt).toLocaleDateString('fr-FR')}` : undefined} />
        <StatBlock emoji="💰" label="Solde" value={fmt(budgetStats.balance)} sub={budgetStats.balance >= 0 ? 'positif' : 'négatif'} />
        <StatBlock emoji="📚" label="Ressources" value={resourceStats.total} sub={`${resourceStats.done} terminées`} />
        <StatBlock emoji="📅" label="Événements à venir" value={upcomingEvents.length} />
      </div>

      <div className="dash-grid">
        {/* Objectifs */}
        <SectionCard title="🎯 Objectifs">
          <ProgressBar value={goalStats.rate} label="Complétion" size="md" />
          <p className="dash-card__meta">{goalStats.completed}/{goalStats.total} complétés · {goalStats.overdue} en retard</p>
          {goals.filter((g) => g.status === 'En cours').slice(0, 3).map((g) => (
            <div key={g.id} className="dash-item">
              <span className={`dash-item__dot dash-item__dot--${g.priority === 'Haute' ? 'red' : g.priority === 'Moyenne' ? 'orange' : 'blue'}`} />
              <span className="dash-item__text">{g.title}</span>
              <span className="dash-item__badge">{g.category}</span>
            </div>
          ))}
          {goals.length === 0 && <p className="dash-card__empty">Aucun objectif</p>}
        </SectionCard>

        {/* Habitudes */}
        <SectionCard title="🏋️ Habitudes du jour">
          <p className="dash-card__meta">Meilleur streak : 🔥 {habitStats.bestStreak} jour{habitStats.bestStreak !== 1 ? 's' : ''}</p>
          {habits.map((h) => {
            const done = h.completedDates.includes(today);
            return (
              <div key={h.id} className="dash-item">
                <span className="dash-item__dot" style={{ background: done ? h.color : 'var(--bg-tertiary)', border: `2px solid ${h.color}` }} />
                <span className="dash-item__text" style={{ textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{h.name}</span>
                {done && <span className="dash-item__badge dash-item__badge--green">✓</span>}
              </div>
            );
          })}
          {habits.length === 0 && <p className="dash-card__empty">Aucune habitude</p>}
        </SectionCard>

        {/* Budget */}
        <SectionCard title="💰 Budget">
          <div className="dash-budget-row">
            <div className="dash-budget-item dash-budget-item--income">
              <span className="dash-budget-item__label">Revenus</span>
              <span className="dash-budget-item__value">+{fmt(budgetStats.income)}</span>
            </div>
            <div className="dash-budget-item dash-budget-item--expense">
              <span className="dash-budget-item__label">Dépenses</span>
              <span className="dash-budget-item__value">-{fmt(budgetStats.expense)}</span>
            </div>
          </div>
          <div className={`dash-balance ${budgetStats.balance >= 0 ? 'dash-balance--positive' : 'dash-balance--negative'}`}>
            Solde : {fmt(budgetStats.balance)}
          </div>
          {transactions.slice(0, 3).map((t) => (
            <div key={t.id} className="dash-item">
              <span className={`dash-item__dot dash-item__dot--${t.type === 'income' ? 'green' : 'red'}`} />
              <span className="dash-item__text">{t.description}</span>
              <span className={`dash-item__amount ${t.type === 'income' ? 'dash-item__amount--green' : 'dash-item__amount--red'}`}>
                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <p className="dash-card__empty">Aucune transaction</p>}
        </SectionCard>

        {/* Agenda */}
        <SectionCard title="📅 Prochains événements">
          {upcomingEvents.length === 0 ? (
            <p className="dash-card__empty">Aucun événement à venir</p>
          ) : upcomingEvents.map((e) => (
            <div key={e.id} className="dash-event">
              <div className="dash-event__date">
                <span className="dash-event__day">{new Date(e.date).getDate()}</span>
                <span className="dash-event__month">{new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
              </div>
              <div className="dash-event__info">
                <span className="dash-event__title">{e.title}</span>
                {e.time && <span className="dash-event__time">{e.time}</span>}
              </div>
              <span className="dash-event__dot" style={{ background: `var(--${e.color === 'purple' ? 'accent' : e.color === 'blue' ? 'blue' : e.color === 'green' ? 'green' : e.color === 'orange' ? 'orange' : 'red'})` }} />
            </div>
          ))}
        </SectionCard>

        {/* Journal */}
        <SectionCard title="📓 Journal récent">
          {recentEntries.length === 0 ? (
            <p className="dash-card__empty">Aucune entrée</p>
          ) : recentEntries.map((e) => (
            <div key={e.id} className="dash-item">
              <span style={{ fontSize: 18 }}>{MOOD_EMOJI[e.mood]}</span>
              <div className="dash-item__col">
                <span className="dash-item__text">{e.title}</span>
                <span className="dash-item__sub">{new Date(e.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Bibliothèque */}
        <SectionCard title="📚 Bibliothèque">
          <div className="dash-resource-stats">
            <div className="dash-resource-stat">
              <span className="dash-resource-stat__value">{resources.filter((r) => r.status === 'à lire').length}</span>
              <span className="dash-resource-stat__label">À lire</span>
            </div>
            <div className="dash-resource-stat">
              <span className="dash-resource-stat__value">{resourceStats.inProgress}</span>
              <span className="dash-resource-stat__label">En cours</span>
            </div>
            <div className="dash-resource-stat">
              <span className="dash-resource-stat__value">{resourceStats.done}</span>
              <span className="dash-resource-stat__label">Terminées</span>
            </div>
          </div>
          {resources.slice(0, 3).map((r) => (
            <div key={r.id} className="dash-item">
              <span className="dash-item__text">{r.title}</span>
              <span className="dash-item__badge">{r.type}</span>
            </div>
          ))}
          {resources.length === 0 && <p className="dash-card__empty">Aucune ressource</p>}
        </SectionCard>
      </div>
    </div>
  );
}
