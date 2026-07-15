import { useAuth } from '../contexts/AuthContext';
import type { Page } from '../types';
import { TargetIcon, DashboardIcon, ListIcon, LogoutIcon, MenuIcon, CloseIcon } from './Icons';
import { useState } from 'react';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Tableau de bord', icon: <DashboardIcon size={18} /> },
    { page: 'goals', label: 'Objectifs', icon: <ListIcon size={18} /> },
  ];

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="header">
      <div className="header__inner">
        <div className="header__brand" onClick={() => handleNav('dashboard')}>
          <TargetIcon size={28} className="header__logo-icon" />
          <span className="header__title">SmartGoalTracker</span>
        </div>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.page}
              className={`header__nav-btn ${currentPage === item.page ? 'header__nav-btn--active' : ''}`}
              onClick={() => handleNav(item.page)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header__right">
          <span className="header__user">{user?.name}</span>
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
