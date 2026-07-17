import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import type { Page } from '../types';
import { TargetIcon, LogoutIcon, MenuIcon, CloseIcon, UserIcon, SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: string }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: '📊' },
  { page: 'goals', label: 'Objectifs', icon: '🎯' },
  { page: 'habits', label: 'Habitudes', icon: '🏋️' },
  { page: 'journal', label: 'Journal', icon: '📓' },
  { page: 'budget', label: 'Budget', icon: '💰' },
  { page: 'resources', label: 'Bibliothèque', icon: '📚' },
  { page: 'agenda', label: 'Agenda', icon: '📅' },
];

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand" onClick={() => handleNav('dashboard')}>
          <TargetIcon size={26} className="header__logo-icon" />
          <span className="header__title">SmartGoalTracker</span>
        </div>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.page}
              className={`header__nav-btn ${currentPage === item.page ? 'header__nav-btn--active' : ''}`}
              onClick={() => handleNav(item.page)}
            >
              <span className="header__nav-emoji">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header__right">
          <span className="header__user">{user?.name}</span>
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
          <button className="icon-btn" onClick={() => handleNav('profile')} title="Profil">
            <UserIcon size={20} />
          </button>
          <button className="icon-btn" onClick={() => logout()} title="Déconnexion">
            <LogoutIcon size={20} />
          </button>
          <button
            className="header__hamburger icon-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
