import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { goalsService } from './services/goals';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProfilePage } from './pages/ProfilePage';
import { JournalPage } from './pages/JournalPage';
import { HabitsPage } from './pages/HabitsPage';
import { BudgetPage } from './pages/BudgetPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { AgendaPage } from './pages/AgendaPage';
import { SkeletonGrid } from './components/SkeletonCard';
import type { Goal, GoalInput, Page } from './types';
import './App.css';

function AuthGate() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user) return <AuthPages />;
  return <AuthenticatedApp />;
}

function AuthPages() {
  const [page, setPage] = useState<'login' | 'register'>('login');
  if (page === 'register') return <RegisterPage onSwitchToLogin={() => setPage('login')} />;
  return <LoginPage onSwitchToRegister={() => setPage('register')} />;
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const data = await goalsService.getAll(user.id);
    setGoals(data);
    setGoalsLoading(false);
  }, [user]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreate = useCallback(async (input: GoalInput) => {
    if (!user) return;
    await goalsService.create(user.id, input);
    await loadGoals();
    toast('Objectif créé 🎯');
  }, [user, loadGoals, toast]);

  const handleUpdate = useCallback(async (id: string, input: GoalInput) => {
    if (!user) return;
    await goalsService.update(user.id, id, input);
    await loadGoals();
    toast('Objectif mis à jour');
  }, [user, loadGoals, toast]);

  const handleToggleComplete = useCallback(async (id: string) => {
    if (!user) return;
    const goal = goals.find((g) => g.id === id);
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, status: g.status === 'Terminé' ? 'En cours' : 'Terminé' } : g));
    try {
      await goalsService.toggleComplete(user.id, id);
      const newStatus = goal?.status === 'Terminé' ? 'En cours' : 'Terminé';
      toast(newStatus === 'Terminé' ? 'Objectif terminé ! 🏆' : 'Objectif remis en cours');
    } catch {
      await loadGoals();
      toast('Une erreur est survenue', 'error');
    }
  }, [user, goals, loadGoals, toast]);

  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    try {
      await goalsService.remove(user.id, id);
      toast('Objectif supprimé');
    } catch {
      await loadGoals();
      toast('Erreur lors de la suppression', 'error');
    }
  }, [user, loadGoals, toast]);

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && (goalsLoading ? <SkeletonGrid /> : <DashboardPage />)}
        {currentPage === 'goals' && (goalsLoading ? <SkeletonGrid /> : (
          <GoalsPage goals={goals} onCreate={handleCreate} onUpdate={handleUpdate} onToggleComplete={handleToggleComplete} onDelete={handleDelete} />
        ))}
        {currentPage === 'journal' && <JournalPage />}
        {currentPage === 'habits' && <HabitsPage />}
        {currentPage === 'budget' && <BudgetPage />}
        {currentPage === 'resources' && <ResourcesPage />}
        {currentPage === 'agenda' && <AgendaPage />}
        {currentPage === 'profile' && <ProfilePage />}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AuthGate />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
