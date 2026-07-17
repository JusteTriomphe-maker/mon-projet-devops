export type Category = 'Dev' | 'Perso' | 'Travail';

export type Priority = 'Basse' | 'Moyenne' | 'Haute';

export type GoalStatus = 'En cours' | 'Terminé';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  deadline: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export type GoalInput = Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>;

export type SortField = 'priority' | 'deadline' | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface Filters {
  category: Category | 'Toutes';
  status: GoalStatus | 'Toutes';
  sortField: SortField;
  sortOrder: SortOrder;
}

export type Page = 'login' | 'register' | 'dashboard' | 'goals' | 'profile' | 'journal' | 'habits' | 'budget' | 'resources' | 'agenda';

/* ── Journal ── */
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}
export type JournalInput = Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

/* ── Habits ── */
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  completedDates: string[];
  createdAt: string;
}
export type HabitInput = Omit<Habit, 'id' | 'userId' | 'completedDates' | 'createdAt'>;

/* ── Budget ── */
export type TransactionType = 'income' | 'expense';
export type BudgetCategory = 'Alimentation' | 'Transport' | 'Logement' | 'Loisirs' | 'Santé' | 'Éducation' | 'Salaire' | 'Autre';
export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: BudgetCategory;
  description: string;
  date: string;
  createdAt: string;
}
export type TransactionInput = Omit<Transaction, 'id' | 'userId' | 'createdAt'>;

/* ── Resources ── */
export type ResourceType = 'article' | 'video' | 'book' | 'podcast' | 'other';
export type ResourceStatus = 'à lire' | 'en cours' | 'terminé';
export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  type: ResourceType;
  status: ResourceStatus;
  tags: string[];
  notes: string;
  createdAt: string;
}
export type ResourceInput = Omit<Resource, 'id' | 'userId' | 'createdAt'>;

/* ── Agenda ── */
export type EventColor = 'purple' | 'blue' | 'green' | 'orange' | 'red';
export interface AgendaEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color: EventColor;
  createdAt: string;
}
export type AgendaEventInput = Omit<AgendaEvent, 'id' | 'userId' | 'createdAt'>;
