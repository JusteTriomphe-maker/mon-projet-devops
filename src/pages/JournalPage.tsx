import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { journalService } from '../services/journal';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, TrashIcon, EditIcon } from '../components/Icons';
import type { JournalEntry, JournalInput } from '../types';

const MOODS: { value: JournalEntry['mood']; label: string; emoji: string }[] = [
  { value: 'great', label: 'Super', emoji: '😄' },
  { value: 'good', label: 'Bien', emoji: '🙂' },
  { value: 'neutral', label: 'Neutre', emoji: '😐' },
  { value: 'bad', label: 'Mauvais', emoji: '😕' },
  { value: 'terrible', label: 'Terrible', emoji: '😞' },
];

function getMoodEmoji(mood: JournalEntry['mood']) {
  return MOODS.find((m) => m.value === mood)?.emoji ?? '😐';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface EntryFormProps {
  onSubmit: (input: JournalInput) => Promise<void>;
  onCancel: () => void;
  initial?: JournalEntry | null;
}

function EntryForm({ onSubmit, onCancel, initial }: EntryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [mood, setMood] = useState<JournalEntry['mood']>(initial?.mood ?? 'neutral');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    await onSubmit({ title: title.trim(), content: content.trim(), mood });
    setLoading(false);
  }

  return (
    <form className="journal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Humeur</label>
        <div className="mood-picker">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              className={`mood-btn ${mood === m.value ? 'mood-btn--active' : ''}`}
              onClick={() => setMood(m.value)}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="journal-title">Titre</label>
        <input
          id="journal-title"
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de l'entrée..."
          maxLength={100}
          autoFocus
        />
      </div>
      <div className="form-group">
        <label htmlFor="journal-content">Contenu</label>
        <textarea
          id="journal-content"
          className="form-input form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrivez vos pensées..."
          rows={6}
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary" disabled={loading || !title.trim() || !content.trim()}>
          {loading ? 'Enregistrement...' : initial ? 'Modifier' : 'Écrire'}
        </button>
      </div>
    </form>
  );
}

export function JournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const data = await journalService.getAll(user.id);
    setEntries(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (input: JournalInput) => {
    if (!user) return;
    await journalService.create(user.id, input);
    await load();
    setShowCreate(false);
    toast('Entrée ajoutée 📓');
  };

  const handleUpdate = async (input: JournalInput) => {
    if (!user || !editing) return;
    await journalService.update(user.id, editing.id, input);
    await load();
    setEditing(null);
    toast('Entrée modifiée');
  };

  const handleDelete = useCallback(async () => {
    if (!user || !deletingId) return;
    setEntries((prev) => prev.filter((e) => e.id !== deletingId));
    await journalService.remove(user.id, deletingId);
    setDeletingId(null);
    toast('Entrée supprimée');
  }, [user, deletingId, toast]);

  return (
    <div className="service-page">
      <div className="service-page__header">
        <div>
          <h1>Journal</h1>
          <p className="service-page__subtitle">{entries.length} entrée{entries.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} /> Nouvelle entrée
        </button>
      </div>

      {loading ? (
        <div className="service-page__loading"><div className="loading-spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="service-page__empty">
          <span className="service-page__empty-icon">📓</span>
          <h3>Aucune entrée pour le moment</h3>
          <p>Commencez à écrire vos pensées du jour.</p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={18} /> Première entrée
          </button>
        </div>
      ) : (
        <div className="journal-list">
          {entries.map((entry) => (
            <div key={entry.id} className="journal-card">
              <div className="journal-card__header">
                <div className="journal-card__meta">
                  <span className="journal-card__mood">{getMoodEmoji(entry.mood)}</span>
                  <div>
                    <h3 className="journal-card__title">{entry.title}</h3>
                    <span className="journal-card__date">{formatDate(entry.createdAt)}</span>
                  </div>
                </div>
                <div className="journal-card__actions">
                  <button className="icon-btn icon-btn--sm" onClick={() => setEditing(entry)} title="Modifier">
                    <EditIcon size={16} />
                  </button>
                  <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => setDeletingId(entry.id)} title="Supprimer">
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
              <p className="journal-card__content">{entry.content}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvelle entrée">
        <EntryForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Modifier l'entrée">
        {editing && <EntryForm onSubmit={handleUpdate} onCancel={() => setEditing(null)} initial={editing} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer l'entrée"
        message="Voulez-vous vraiment supprimer cette entrée ? Cette action est irréversible."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
