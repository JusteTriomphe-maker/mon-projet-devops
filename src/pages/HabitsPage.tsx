import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { habitsService } from '../services/habits';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, TrashIcon, CheckIcon } from '../components/Icons';
import type { Habit, HabitInput } from '../types';

const COLORS = ['#7c5cfc', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#f472b6', '#a78bfa'];

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
}

function getStreak(dates: string[]): number {
  if (!dates.length) return 0;
  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let current = today;
  for (const d of sorted) {
    if (d === current) {
      streak++;
      const prev = new Date(current);
      prev.setDate(prev.getDate() - 1);
      current = prev.toISOString().split('T')[0];
    } else break;
  }
  return streak;
}

function HabitForm({ onSubmit, onCancel }: { onSubmit: (input: HabitInput) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onSubmit({ name: name.trim(), description: description.trim(), color });
    setLoading(false);
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nom de l'habitude</label>
        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Méditer 10 min" maxLength={60} autoFocus />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input type="text" className="form-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel..." maxLength={120} />
      </div>
      <div className="form-group">
        <label>Couleur</label>
        <div className="color-picker">
          {COLORS.map((c) => (
            <button key={c} type="button" className={`color-dot ${color === c ? 'color-dot--active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary" disabled={loading || !name.trim()}>
          {loading ? 'Création...' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

export function HabitsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const last7 = getLast7Days();
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    if (!user) return;
    const data = await habitsService.getAll(user.id);
    setHabits(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (input: HabitInput) => {
    if (!user) return;
    await habitsService.create(user.id, input);
    await load();
    setShowCreate(false);
    toast('Habitude créée 🏋️');
  };

  const handleToggle = async (habit: Habit) => {
    if (!user) return;
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habit.id
          ? { ...h, completedDates: h.completedDates.includes(today) ? h.completedDates.filter((d) => d !== today) : [...h.completedDates, today] }
          : h
      )
    );
    await habitsService.toggleDate(user.id, habit.id, today);
  };

  const handleDelete = useCallback(async () => {
    if (!user || !deletingId) return;
    setHabits((prev) => prev.filter((h) => h.id !== deletingId));
    await habitsService.remove(user.id, deletingId);
    setDeletingId(null);
    toast('Habitude supprimée');
  }, [user, deletingId, toast]);

  const completedToday = habits.filter((h) => h.completedDates.includes(today)).length;

  return (
    <div className="service-page">
      <div className="service-page__header">
        <div>
          <h1>Habitudes</h1>
          <p className="service-page__subtitle">{completedToday}/{habits.length} complétées aujourd'hui</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} /> Nouvelle habitude
        </button>
      </div>

      {loading ? (
        <div className="service-page__loading"><div className="loading-spinner" /></div>
      ) : habits.length === 0 ? (
        <div className="service-page__empty">
          <span className="service-page__empty-icon">🏋️</span>
          <h3>Aucune habitude</h3>
          <p>Créez votre première habitude quotidienne.</p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={18} /> Créer une habitude
          </button>
        </div>
      ) : (
        <div className="habits-list">
          {habits.map((habit) => {
            const streak = getStreak(habit.completedDates);
            const doneToday = habit.completedDates.includes(today);
            return (
              <div key={habit.id} className="habit-card">
                <div className="habit-card__left">
                  <div className="habit-card__color" style={{ background: habit.color }} />
                  <div>
                    <h3 className="habit-card__name">{habit.name}</h3>
                    {habit.description && <p className="habit-card__desc">{habit.description}</p>}
                    <span className="habit-card__streak">🔥 {streak} jour{streak !== 1 ? 's' : ''} de suite</span>
                  </div>
                </div>
                <div className="habit-card__right">
                  <div className="habit-week">
                    {last7.map((date) => {
                      const done = habit.completedDates.includes(date);
                      return (
                        <div key={date} className="habit-week__day">
                          <span className="habit-week__label">{DAYS_FR[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1]}</span>
                          <div className={`habit-week__dot ${done ? 'habit-week__dot--done' : ''}`} style={done ? { background: habit.color } : {}} />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    className={`habit-toggle ${doneToday ? 'habit-toggle--done' : ''}`}
                    style={doneToday ? { background: habit.color, borderColor: habit.color } : {}}
                    onClick={() => handleToggle(habit)}
                    title={doneToday ? 'Marquer non fait' : "Marquer fait aujourd'hui"}
                  >
                    <CheckIcon size={18} />
                  </button>
                  <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => setDeletingId(habit.id)}>
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle habitude">
        <HabitForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer l'habitude"
        message="Voulez-vous vraiment supprimer cette habitude et tout son historique ?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
