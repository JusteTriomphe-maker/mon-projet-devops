import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { resourcesService } from '../services/resources';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, TrashIcon } from '../components/Icons';
import type { Resource, ResourceInput, ResourceType, ResourceStatus } from '../types';

const TYPE_LABELS: Record<ResourceType, string> = { article: '📄 Article', video: '🎥 Vidéo', book: '📚 Livre', podcast: '🎙️ Podcast', other: '🔗 Autre' };
const STATUSES: ResourceStatus[] = ['à lire', 'en cours', 'terminé'];
const STATUS_COLORS: Record<ResourceStatus, string> = { 'à lire': 'blue', 'en cours': 'orange', 'terminé': 'green' };

function ResourceForm({ onSubmit, onCancel }: { onSubmit: (input: ResourceInput) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('article');
  const [status, setStatus] = useState<ResourceStatus>('à lire');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await onSubmit({
      title: title.trim(),
      url: url.trim(),
      type,
      status,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      notes: notes.trim(),
    });
    setLoading(false);
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de la ressource" maxLength={120} autoFocus />
      </div>
      <div className="form-group">
        <label>URL (optionnel)</label>
        <input type="url" className="form-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Type</label>
          <select className="form-input" value={type} onChange={(e) => setType(e.target.value as ResourceType)}>
            {(Object.keys(TYPE_LABELS) as ResourceType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Statut</label>
          <select className="form-input" value={status} onChange={(e) => setStatus(e.target.value as ResourceStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Tags (séparés par des virgules)</label>
        <input type="text" className="form-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="react, typescript, web..." />
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea className="form-input form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Vos notes..." rows={3} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary" disabled={loading || !title.trim()}>
          {loading ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

export function ResourcesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ResourceStatus | 'Toutes'>('Toutes');
  const [filterType, setFilterType] = useState<ResourceType | 'Tous'>('Tous');

  const load = useCallback(async () => {
    if (!user) return;
    const data = await resourcesService.getAll(user.id);
    setResources(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return resources
      .filter((r) => filterStatus === 'Toutes' || r.status === filterStatus)
      .filter((r) => filterType === 'Tous' || r.type === filterType);
  }, [resources, filterStatus, filterType]);

  const handleCreate = async (input: ResourceInput) => {
    if (!user) return;
    await resourcesService.create(user.id, input);
    await load();
    setShowCreate(false);
    toast('Ressource ajoutée 📚');
  };

  const handleStatusChange = async (r: Resource, status: ResourceStatus) => {
    if (!user) return;
    setResources((prev) => prev.map((x) => x.id === r.id ? { ...x, status } : x));
    await resourcesService.updateStatus(user.id, r.id, status);
  };

  const handleDelete = useCallback(async () => {
    if (!user || !deletingId) return;
    setResources((prev) => prev.filter((r) => r.id !== deletingId));
    await resourcesService.remove(user.id, deletingId);
    setDeletingId(null);
    toast('Ressource supprimée');
  }, [user, deletingId, toast]);

  return (
    <div className="service-page">
      <div className="service-page__header">
        <div>
          <h1>Bibliothèque</h1>
          <p className="service-page__subtitle">{resources.length} ressource{resources.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} /> Ajouter
        </button>
      </div>

      <div className="filters-bar">
        <div className="filters-bar__group">
          <label>Type</label>
          <select className="form-input form-input--sm" value={filterType} onChange={(e) => setFilterType(e.target.value as ResourceType | 'Tous')}>
            <option value="Tous">Tous</option>
            {(Object.keys(TYPE_LABELS) as ResourceType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </select>
        </div>
        <div className="filters-bar__group">
          <label>Statut</label>
          <select className="form-input form-input--sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as ResourceStatus | 'Toutes')}>
            <option value="Toutes">Tous</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="service-page__loading"><div className="loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="service-page__empty">
          <span className="service-page__empty-icon">📚</span>
          <h3>Aucune ressource</h3>
          <p>Ajoutez des articles, vidéos, livres à votre bibliothèque.</p>
          <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
            <PlusIcon size={18} /> Première ressource
          </button>
        </div>
      ) : (
        <div className="resources-grid">
          {filtered.map((r) => (
            <div key={r.id} className="resource-card">
              <div className="resource-card__header">
                <span className="resource-card__type">{TYPE_LABELS[r.type]}</span>
                <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => setDeletingId(r.id)}>
                  <TrashIcon size={16} />
                </button>
              </div>
              <h3 className="resource-card__title">
                {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a> : r.title}
              </h3>
              {r.notes && <p className="resource-card__notes">{r.notes}</p>}
              {r.tags.length > 0 && (
                <div className="resource-card__tags">
                  {r.tags.map((tag) => <span key={tag} className="resource-tag">{tag}</span>)}
                </div>
              )}
              <div className="resource-card__footer">
                <select
                  className={`resource-status resource-status--${STATUS_COLORS[r.status]}`}
                  value={r.status}
                  onChange={(e) => handleStatusChange(r, e.target.value as ResourceStatus)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Nouvelle ressource</h2></div>
            <div className="modal-body">
              <ResourceForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer la ressource"
        message="Voulez-vous vraiment supprimer cette ressource ?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
