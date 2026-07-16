import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TargetIcon, MailIcon, LockIcon, GoogleIcon } from '../components/Icons';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    const err = await login(email.trim(), password);
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
          <p className="auth-subtitle">Connectez-vous pour gérer vos objectifs</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <div className="form-input-wrapper">
              <MailIcon size={18} className="form-input-icon" />
              <input
                id="login-email"
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
            <label htmlFor="login-password">Mot de passe</label>
            <div className="form-input-wrapper">
              <LockIcon size={18} className="form-input-icon" />
              <input
                id="login-password"
                type="password"
                className="form-input form-input--icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <button
            type="button"
            className="btn btn--google btn--full"
            onClick={async () => {
              setError('');
              setLoading(true);
              const err = await loginWithGoogle();
              if (err) {
                setError(err);
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            <GoogleIcon size={20} />
            Se connecter avec Google
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <button className="btn-link" onClick={onSwitchToRegister}>
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
