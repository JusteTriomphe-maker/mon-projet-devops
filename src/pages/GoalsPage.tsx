import { useState, useMemo, useCallback } from 'react';
import type { Goal, GoalInput, Filters } from '../types';
import { GoalCard } from '../components/GoalCard';
import { GoalForm } from '../components/GoalForm';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, FilterIcon, SortIcon, SearchIcon } from '../components/Icons';

interface GoalsPageProps {
  goals: Goal[];
  onCreate: (input: GoalInput) => Promise<void>;
  onUpdate: (id: string, input: GoalInput) => Promise<void>;
  onToggleComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const priorityOrder: Record<string, number> = { Haute: 0, Moyenne: 1, Basse: 2 };

export function GoalsPage({ goals, onCreate, onUpdate, onToggleComplete, onDelete }: GoalsPageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    category: 'Toutes',
    status: 'Toutes',
    sortField: 'deadline',
    sortOrder: 'asc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredGoals = useMemo(() => {
    let result = [...goals];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
      );
    }
    if (filters.category !== 'Toutes') result = result.filter((g) => g.category === filters.category);
    if (filters.status !== 'Toutes') result = result.filter((g) => g.status === filters.status);

    result.sort((a, b) => {
      let cmp = 0;
      if (filters.sortField === 'priority') {
        cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (filters.sortField === 'deadline') {
        cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [goals, filters, search]);

  const handleCreate = useCallback(async (input: GoalInput) => {
    await onCreate(input);
    setShowCreate(false);
  }, [onCreate]);

  const handleUpdate = useCallback(async (input: GoalInput) => {
    if (!editingGoal) return;
    await onUpdate(editingGoal.id, input);
    setEditingGoal(null);
  }, [editingGoal, onUpdate]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingId) return;
    await onDelete(deletingId);
    setDeletingId(null);
  }, [deletingId, onDelete]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'Toutes') count++;
    if (filters.status !== 'Toutes') count++;
    return count;
  }, [filters]);

  const deletingGoal = goals.find((g) => g.id === deletingId);

  return (
    <div className="goals-page">
      <div className="goals-page__header">
        <div>
          <h1>Objectifs</h1>
          <p className="goals-page__subtitle">{goals.length} objectif{goals.length !== 1 ? 's' : ''} au total</p>
        </div>
        <div className="goals-page__actions">
          <button
            className={`btn btn--outline ${showFilters ? 'btn--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon size={16} />
            Filtres
            {activeFilterCount > 0 && <span className="badge-count">{activeFilterCount}</span>}
          </button>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={18} />
            Nouvel objectif
          </button>
        </div>
      </div>

      <div className="goals-page__search">
        <div className="form-input-wrapper">
          <SearchIcon size={18} className="form-input-icon" />
          <input
            type="text"
            className="form-input form-input--icon"
            placeholder="Rechercher un objectif..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showFilters && (
        <div className="filters-bar">
          <div className="filters-bar__group">
            <SortIcon size={16} />
            <label>Trier par</label>
            <select
              className="form-input form-input--sm"
              value={filters.sortField}
              onChange={(e) => setFilters((f) => ({ ...f, sortField: e.target.value as Filters['sortField'] }))}
            >
              <option value="deadline">Date limite</option>
              <option value="priority">Priorité</option>
              <option value="createdAt">Date de création</option>
            </select>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setFilters((f) => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }))}
            >
              {filters.sortOrder === 'asc' ? '↑ Croissant' : '↓ Décroissant'}
            </button>
          </div>
          <div className="filters-bar__group">
            <label>Catégorie</label>
            <select
              className="form-input form-input--sm"
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value as Filters['category'] }))}
            >
              <option value="Toutes">Toutes</option>
              <option value="Dev">Dev</option>
              <option value="Perso">Perso</option>
              <option value="Travail">Travail</option>
            </select>
          </div>
          <div className="filters-bar__group">
            <label>Statut</label>
            <select
              className="form-input form-input--sm"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as Filters['status'] }))}
            >
              <option value="Toutes">Tous</option>
              <option value="En cours">En cours</option>
              <option value="Terminé">Terminé</option>
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setFilters({ category: 'Toutes', status: 'Toutes', sortField: 'deadline', sortOrder: 'asc' })}
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {filteredGoals.length === 0 ? (
        <div className="goals-page__empty">
          <FilterIcon size={48} />
          <h3>Aucun objectif trouvé</h3>
          <p>
            {goals.length === 0
              ? 'Créez votre premier objectif pour commencer.'
              : 'Modifiez vos filtres ou votre recherche.'}
          </p>
          {goals.length === 0 && (
            <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
              <PlusIcon size={18} />
              Créer un objectif
            </button>
          )}
        </div>
      ) : (
        <div className="goals-grid">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggleComplete={onToggleComplete}
              onDelete={setDeletingId}
              onEdit={setEditingGoal}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvel objectif">
        <GoalForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={!!editingGoal} onClose={() => setEditingGoal(null)} title="Modifier l'objectif">
        {editingGoal && (
          <GoalForm goal={editingGoal} onSubmit={handleUpdate} onCancel={() => setEditingGoal(null)} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer l'objectif"
        message={`Voulez-vous vraiment supprimer "${deletingGoal?.title}" ? Cette action est irréversible.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
