import type { User, Goal, GoalInput } from '../types';

const USERS_KEY = 'smartgoaltracker_users';
const GOALS_KEY = 'smartgoaltracker_goals';
const SESSION_KEY = 'smartgoaltracker_session';

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function getFromStorage<T>(key: string): T[] {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const authService = {
  async register(email: string, password: string, name: string): Promise<{ user: User; error: string | null }> {
    const users = getFromStorage<User & { password: string }>(USERS_KEY);
    const exists = users.find((u) => u.email === email);
    if (exists) {
      return { user: null as unknown as User, error: 'Un compte avec cet email existe déjà.' };
    }
    const newUser: User & { password: string } = {
      id: generateId(),
      email,
      name,
      password,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveToStorage(USERS_KEY, users);
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    return { user: userWithoutPassword, error: null };
  },

  async login(email: string, password: string): Promise<{ user: User; error: string | null }> {
    const users = getFromStorage<User & { password: string }>(USERS_KEY);
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return { user: null as unknown as User, error: 'Email ou mot de passe incorrect.' };
    }
    const { password: _, ...userWithoutPassword } = found;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    return { user: userWithoutPassword, error: null };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};

export const goalsService = {
  async getAll(userId: string): Promise<Goal[]> {
    const goals = getFromStorage<Goal>(GOALS_KEY);
    return goals.filter((g) => g.userId === userId);
  },

  async create(userId: string, input: GoalInput): Promise<Goal> {
    const goals = getFromStorage<Goal>(GOALS_KEY);
    const now = new Date().toISOString();
    const newGoal: Goal = {
      ...input,
      id: generateId(),
      userId,
      status: 'En cours',
      createdAt: now,
      updatedAt: now,
    };
    goals.push(newGoal);
    saveToStorage(GOALS_KEY, goals);
    return newGoal;
  },

  async update(id: string, updates: Partial<GoalInput> & { status?: Goal['status'] }): Promise<Goal> {
    const goals = getFromStorage<Goal>(GOALS_KEY);
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Objectif non trouvé.');
    goals[index] = { ...goals[index], ...updates, updatedAt: new Date().toISOString() };
    saveToStorage(GOALS_KEY, goals);
    return goals[index];
  },

  async remove(id: string): Promise<void> {
    const goals = getFromStorage<Goal>(GOALS_KEY);
    saveToStorage(GOALS_KEY, goals.filter((g) => g.id !== id));
  },

  async toggleComplete(id: string): Promise<Goal> {
    const goals = getFromStorage<Goal>(GOALS_KEY);
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) throw new Error('Objectif non trouvé.');
    goals[index] = {
      ...goals[index],
      status: goals[index].status === 'Terminé' ? 'En cours' : 'Terminé',
      updatedAt: new Date().toISOString(),
    };
    saveToStorage(GOALS_KEY, goals);
    return goals[index];
  },
};
