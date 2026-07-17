import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserIcon } from '../components/Icons';

export function ProfilePage() {
  const { user, updateName } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;
    setLoading(true);
    const err = await updateName(name.trim());
    if (err) {
      toast(err, 'error');
    } else {
      toast('Nom mis à jour avec succès');
    }
    setLoading(false);
  }

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1>Profil</h1>
        <p className="profile-page__subtitle">Gérez vos informations personnelles</p>
      </div>

      <div className="profile-card">
        <div className="profile-card__avatar">
          <UserIcon size={40} />
        </div>
        <div className="profile-card__info">
          <p className="profile-card__name">{user?.name || '—'}</p>
          <p className="profile-card__email">{user?.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <h2 className="section-title">Modifier le nom</h2>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="profile-name">Nom complet</label>
            <input
              id="profile-name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              maxLength={60}
            />
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || !name.trim() || name.trim() === user?.name}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
