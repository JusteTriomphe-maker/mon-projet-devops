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

export type Page = 'login' | 'register' | 'dashboard' | 'goals';
