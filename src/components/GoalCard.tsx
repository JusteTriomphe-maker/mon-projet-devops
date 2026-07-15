import type { Goal } from '../types';
import { CheckIcon, TrashIcon, EditIcon, CalendarIcon, FlagIcon } from './Icons';

interface GoalCardProps {
  goal: Goal;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (goal: Goal) => void;
}

const priorityColors: Record<string, string> = {
  Haute: 'priority--high',
  Moyenne: 'priority--medium',
  Basse: 'priority--low',
};

const categoryColors: Record<string, string> = {
  Dev: 'category--dev',
  Perso: 'category--perso',
  Travail: 'category--travail',
};

function formatDeadline(deadline: string): string {
  const d = new Date(deadline);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date() && new Date(deadline).toDateString() !== new Date().toDateString();
}

export function GoalCard({ goal, onToggleComplete, onDelete, onEdit }: GoalCardProps) {
  const completed = goal.status === 'Terminé';
  const overdue = !completed && isOverdue(goal.deadline);

  return (
    <div className={`goal-card ${completed ? 'goal-card--completed' : ''} ${overdue ? 'goal-card--overdue' : ''}`}>
      <div className="goal-card__header">
        <div className="goal-card__badges">
          <span className={`badge ${categoryColors[goal.category]}`}>{goal.category}</span>
          <span className={`badge ${priorityColors[goal.priority]}`}>
            <FlagIcon size={12} />
            {goal.priority}
          </span>
        </div>
        <div className="goal-card__actions">
          <button
            className="icon-btn icon-btn--sm"
            onClick={() => onEdit(goal)}
            title="Modifier"
            aria-label="Modifier l'objectif"
          >
            <EditIcon size={16} />
          </button>
          <button
            className="icon-btn icon-btn--sm icon-btn--danger"
            onClick={() => onDelete(goal.id)}
            title="Supprimer"
            aria-label="Supprimer l'objectif"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>

      <h3 className={`goal-card__title ${completed ? 'goal-card__title--done' : ''}`}>{goal.title}</h3>
      <p className="goal-card__description">{goal.description}</p>

      <div className="goal-card__footer">
        <span className={`goal-card__deadline ${overdue ? 'goal-card__deadline--overdue' : ''}`}>
          <CalendarIcon size={14} />
          {formatDeadline(goal.deadline)}
        </span>
        <button
          className={`goal-card__toggle ${completed ? 'goal-card__toggle--done' : ''}`}
          onClick={() => onToggleComplete(goal.id)}
        >
          <CheckIcon size={16} />
          {completed ? 'Terminé' : 'Marquer terminé'}
        </button>
      </div>
    </div>
  );
}
