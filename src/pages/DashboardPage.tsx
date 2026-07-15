import { useMemo } from 'react';
import type { Goal } from '../types';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { TargetIcon, TrophyIcon, ClockIcon, AlertIcon } from '../components/Icons';

interface DashboardPageProps {
  goals: Goal[];
}

export function DashboardPage({ goals }: DashboardPageProps) {
  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'Terminé').length;
    const inProgress = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date();
    const overdue = goals.filter(
      (g) => g.status === 'En cours' && new Date(g.deadline) < now
    ).length;

    const byCategory = { Dev: 0, Perso: 0, Travail: 0 } as Record<string, number>;
    goals.forEach((g) => {
      if (g.status === 'En cours') byCategory[g.category]++;
    });

    const byPriority = { Haute: 0, Moyenne: 0, Basse: 0 } as Record<string, number>;
    goals.forEach((g) => {
      if (g.status === 'En cours') byPriority[g.priority]++;
    });

    return { total, completed, inProgress, rate, overdue, byCategory, byPriority };
  }, [goals]);

  return (
    <div className="dashboard">
      <div className="dashboard__greeting">
        <h1>Tableau de bord</h1>
        <p className="dashboard__subtitle">Vue d'ensemble de vos objectifs</p>
      </div>

      <div className="stats-grid">
        <StatsCard
          label="Total objectifs"
          value={stats.total}
          icon={<TargetIcon size={24} />}
          color="purple"
        />
        <StatsCard
          label="En cours"
          value={stats.inProgress}
          icon={<ClockIcon size={24} />}
          color="blue"
        />
        <StatsCard
          label="Terminés"
          value={stats.completed}
          icon={<TrophyIcon size={24} />}
          color="green"
        />
        <StatsCard
          label="En retard"
          value={stats.overdue}
          icon={<AlertIcon size={24} />}
          color="orange"
        />
      </div>

      <div className="dashboard__section">
        <h2 className="section-title">Taux de complétion</h2>
        <div className="dashboard__progress-card">
          <ProgressBar
            value={stats.rate}
            label="Objectifs terminés"
            size="lg"
          />
          <p className="dashboard__progress-text">
            {stats.completed} sur {stats.total} objectifs complétés
          </p>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="dashboard__section">
          <h2 className="section-title">Répartition par catégorie</h2>
          <div className="category-grid">
            {(Object.entries(stats.byCategory) as [string, number][]).map(([cat, count]) => (
              <div key={cat} className={`category-card category-card--${cat.toLowerCase()}`}>
                <span className="category-card__label">{cat}</span>
                <span className="category-card__count">{count}</span>
                <span className="category-card__sub">en cours</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.total > 0 && (
        <div className="dashboard__section">
          <h2 className="section-title">Répartition par priorité</h2>
          <div className="priority-grid">
            <div className="priority-bar priority-bar--high">
              <span className="priority-bar__label">Haute</span>
              <div className="priority-bar__track">
                <div
                  className="priority-bar__fill priority-bar__fill--high"
                  style={{ width: `${stats.total > 0 ? (stats.byPriority.Haute / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="priority-bar__count">{stats.byPriority.Haute}</span>
            </div>
            <div className="priority-bar priority-bar--medium">
              <span className="priority-bar__label">Moyenne</span>
              <div className="priority-bar__track">
                <div
                  className="priority-bar__fill priority-bar__fill--medium"
                  style={{ width: `${stats.total > 0 ? (stats.byPriority.Moyenne / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="priority-bar__count">{stats.byPriority.Moyenne}</span>
            </div>
            <div className="priority-bar priority-bar--low">
              <span className="priority-bar__label">Basse</span>
              <div className="priority-bar__track">
                <div
                  className="priority-bar__fill priority-bar__fill--low"
                  style={{ width: `${stats.total > 0 ? (stats.byPriority.Basse / stats.total) * 100 : 0}%` }}
                />
              </div>
              <span className="priority-bar__count">{stats.byPriority.Basse}</span>
            </div>
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="dashboard__empty">
          <TargetIcon size={64} />
          <h2>Aucun objectif pour le moment</h2>
          <p>Commencez par créer votre premier objectif dans la section &laquo; Objectifs &raquo;.</p>
        </div>
      )}
    </div>
  );
}
