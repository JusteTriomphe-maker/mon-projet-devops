import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TargetIcon, MailIcon, LockIcon, UserIcon } from '../components/Icons';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const err = await register(email.trim(), password, name.trim());
    if (err) setError(err);
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <TargetIcon size={40} />
          </div>
          <h1 className="auth-title">SmartGoalTracker</h1>
          <p className="auth-subtitle">Créez votre compte pour commencer</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="register-name">Nom complet</label>
            <div className="form-input-wrapper">
              <UserIcon size={18} className="form-input-icon" />
              <input
                id="register-name"
                type="text"
                className="form-input form-input--icon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email</label>
            <div className="form-input-wrapper">
              <MailIcon size={18} className="form-input-icon" />
              <input
                id="register-email"
                type="email"
                className="form-input form-input--icon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Mot de passe</label>
            <div className="form-input-wrapper">
              <LockIcon size={18} className="form-input-icon" />
              <input
                id="register-password"
                type="password"
                className="form-input form-input--icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="register-confirm">Confirmer le mot de passe</label>
            <div className="form-input-wrapper">
              <LockIcon size={18} className="form-input-icon" />
              <input
                id="register-confirm"
                type="password"
                className="form-input form-input--icon"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà un compte ?{' '}
            <button className="btn-link" onClick={onSwitchToLogin}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
