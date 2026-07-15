import { useState, useEffect } from 'react';
import type { Goal, GoalInput, Category, Priority } from '../types';

interface GoalFormProps {
  goal?: Goal | null;
  onSubmit: (input: GoalInput) => void;
  onCancel: () => void;
}

const categories: Category[] = ['Dev', 'Perso', 'Travail'];
const priorities: Priority[] = ['Basse', 'Moyenne', 'Haute'];

function toInputDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toISOString().split('T')[0];
}

export function GoalForm({ goal, onSubmit, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Dev');
  const [priority, setPriority] = useState<Priority>('Moyenne');
  const [deadline, setDeadline] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setCategory(goal.category);
      setPriority(goal.priority);
      setDeadline(toInputDate(goal.deadline));
    } else {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      setDeadline(toInputDate(nextWeek.toISOString()));
    }
  }, [goal]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Le titre est requis.';
    if (!description.trim()) errs.description = 'La description est requise.';
    if (!deadline) errs.deadline = 'La date limite est requise.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      deadline: new Date(deadline).toISOString(),
    });
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="goal-title">Titre</label>
        <input
          id="goal-title"
          type="text"
          className={`form-input ${errors.title ? 'form-input--error' : ''}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Apprendre React"
          maxLength={100}
          autoFocus
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="goal-description">Description</label>
        <textarea
          id="goal-description"
          className={`form-input form-textarea ${errors.description ? 'form-input--error' : ''}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez votre objectif en détail..."
          rows={3}
          maxLength={500}
        />
        {errors.description && <span className="form-error">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="goal-category">Catégorie</label>
          <select
            id="goal-category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="goal-priority">Priorité</label>
          <select
            id="goal-priority"
            className="form-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="goal-deadline">Date limite</label>
        <input
          id="goal-deadline"
          type="date"
          className={`form-input ${errors.deadline ? 'form-input--error' : ''}`}
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        {errors.deadline && <span className="form-error">{errors.deadline}</span>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn--primary">
          {goal ? 'Enregistrer' : 'Créer l\'objectif'}
        </button>
      </div>
    </form>
  );
}
