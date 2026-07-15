import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { goalsService } from './services/supabase';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import type { Goal, GoalInput, Page } from './types';
import './App.css';

function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPages />;
  }

  return <AuthenticatedApp />;
}

function AuthPages() {
  const [page, setPage] = useState<'login' | 'register'>('login');

  if (page === 'register') {
    return <RegisterPage onSwitchToLogin={() => setPage('login')} />;
  }
  return <LoginPage onSwitchToRegister={() => setPage('register')} />;
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = useCallback(async () => {
    if (!user) return;
    const data = await goalsService.getAll(user.id);
    setGoals(data);
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreate = useCallback(async (input: GoalInput) => {
    if (!user) return;
    await goalsService.create(user.id, input);
    await loadGoals();
  }, [user, loadGoals]);

  const handleUpdate = useCallback(async (id: string, input: GoalInput) => {
    await goalsService.update(id, input);
    await loadGoals();
  }, [loadGoals]);

  const handleToggleComplete = useCallback(async (id: string) => {
    await goalsService.toggleComplete(id);
    await loadGoals();
  }, [loadGoals]);

  const handleDelete = useCallback(async (id: string) => {
    await goalsService.remove(id);
    await loadGoals();
  }, [loadGoals]);

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {currentPage === 'dashboard' && <DashboardPage goals={goals} />}
        {currentPage === 'goals' && (
          <GoalsPage
            goals={goals}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
