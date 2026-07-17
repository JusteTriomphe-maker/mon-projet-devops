import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { agendaService } from '../services/agenda';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PlusIcon, TrashIcon } from '../components/Icons';
import type { AgendaEvent, AgendaEventInput, EventColor } from '../types';

const COLORS: { value: EventColor; hex: string }[] = [
  { value: 'purple', hex: '#7c5cfc' },
  { value: 'blue', hex: '#60a5fa' },
  { value: 'green', hex: '#34d399' },
  { value: 'orange', hex: '#fbbf24' },
  { value: 'red', hex: '#f87171' },
];

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function EventForm({ onSubmit, onCancel }: { onSubmit: (input: AgendaEventInput) => Promise<void>; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [color, setColor] = useState<EventColor>('purple');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setLoading(true);
    await onSubmit({ title: title.trim(), description: description.trim(), date, time, color });
    setLoading(false);
  }

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Titre</label>
        <input type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'événement" maxLength={80} autoFocus />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Heure</label>
          <input type="time" className="form-input" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea className="form-input form-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel..." rows={2} />
      </div>
      <div className="form-group">
        <label>Couleur</label>
        <div className="color-picker">
          {COLORS.map((c) => (
            <button key={c.value} type="button" className={`color-dot ${color === c.value ? 'color-dot--active' : ''}`} style={{ background: c.hex }} onClick={() => setColor(c.value)} />
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn--primary" disabled={loading || !title.trim()}>
          {loading ? 'Ajout...' : 'Créer'}
        </button>
      </div>
    </form>
  );
}

function getColorHex(color: EventColor): string {
  return COLORS.find((c) => c.value === color)?.hex ?? '#7c5cfc';
}

export function AgendaPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const load = useCallback(async () => {
    if (!user) return;
    const data = await agendaService.getAll(user.id);
    setEvents(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Monday-based offset
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = Array(startOffset).fill(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, [viewDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, AgendaEvent[]> = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter((e) => e.date >= today).slice(0, 5);
  }, [events]);

  const handleCreate = async (input: AgendaEventInput) => {
    if (!user) return;
    await agendaService.create(user.id, input);
    await load();
    setShowCreate(false);
    toast('Événement créé 📅');
  };

  const handleDelete = useCallback(async () => {
    if (!user || !deletingId) return;
    setEvents((prev) => prev.filter((e) => e.id !== deletingId));
    await agendaService.remove(user.id, deletingId);
    setDeletingId(null);
    toast('Événement supprimé');
  }, [user, deletingId, toast]);

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="service-page">
      <div className="service-page__header">
        <div>
          <h1>Agenda</h1>
          <p className="service-page__subtitle">{events.length} événement{events.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
          <PlusIcon size={18} /> Nouvel événement
        </button>
      </div>

      <div className="agenda-layout">
        <div className="calendar">
          <div className="calendar__nav">
            <button className="btn btn--ghost btn--sm" onClick={prevMonth}>‹</button>
            <span className="calendar__month">{MONTHS_FR[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            <button className="btn btn--ghost btn--sm" onClick={nextMonth}>›</button>
          </div>
          <div className="calendar__grid">
            {DAYS_FR.map((d) => <div key={d} className="calendar__day-label">{d}</div>)}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = day.toISOString().split('T')[0];
              const dayEvents = eventsByDate[dateStr] ?? [];
              const isToday = dateStr === today;
              return (
                <div key={dateStr} className={`calendar__cell ${isToday ? 'calendar__cell--today' : ''}`}>
                  <span className="calendar__date">{day.getDate()}</span>
                  <div className="calendar__dots">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span key={e.id} className="calendar__dot" style={{ background: getColorHex(e.color) }} title={e.title} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="agenda-upcoming">
          <h2 className="section-title">À venir</h2>
          {loading ? (
            <div className="service-page__loading"><div className="loading-spinner" /></div>
          ) : upcomingEvents.length === 0 ? (
            <div className="agenda-upcoming__empty">
              <span>Aucun événement à venir</span>
            </div>
          ) : (
            <div className="agenda-events">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="agenda-event" style={{ borderLeftColor: getColorHex(e.color) }}>
                  <div className="agenda-event__info">
                    <span className="agenda-event__title">{e.title}</span>
                    <span className="agenda-event__meta">
                      {new Date(e.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {e.time && ` · ${e.time}`}
                    </span>
                    {e.description && <span className="agenda-event__desc">{e.description}</span>}
                  </div>
                  <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => setDeletingId(e.id)}>
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h2>Nouvel événement</h2></div>
            <div className="modal-body">
              <EventForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        title="Supprimer l'événement"
        message="Voulez-vous vraiment supprimer cet événement ?"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
