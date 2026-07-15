import { createClient } from '@supabase/supabase-js';
import type { User, Goal, GoalInput } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function mapSupabaseUser(raw: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at: string;
}): User {
  return {
    id: raw.id,
    email: raw.email ?? '',
    name: (raw.user_metadata?.name as string) ?? '',
    createdAt: raw.created_at,
  };
}

function mapGoalRow(row: {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  deadline: string;
  status: string;
  created_at: string;
  updated_at: string;
}): Goal {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category as Goal['category'],
    priority: row.priority as Goal['priority'],
    deadline: row.deadline,
    status: row.status as Goal['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User; error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { user: null as unknown as User, error: error.message };
    }
    if (!data.user) {
      return { user: null as unknown as User, error: 'Inscription échouée.' };
    }
    return { user: mapSupabaseUser(data.user), error: null };
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; error: string | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { user: null as unknown as User, error: error.message };
    }
    return { user: mapSupabaseUser(data.user), error: null };
  },

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return mapSupabaseUser(data.session.user);
  },
};

export const goalsService = {
  async getAll(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapGoalRow);
  },

  async create(userId: string, input: GoalInput): Promise<Goal> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        deadline: input.deadline,
        status: 'En cours',
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw error;
    return mapGoalRow(data);
  },

  async update(
    id: string,
    updates: Partial<GoalInput> & { status?: Goal['status'] },
  ): Promise<Goal> {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.deadline !== undefined) payload.deadline = updates.deadline;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('goals')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapGoalRow(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleComplete(id: string): Promise<Goal> {
    const { data: current, error: fetchError } = await supabase
      .from('goals')
      .select('status')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const newStatus = current.status === 'Terminé' ? 'En cours' : 'Terminé';
    const { data, error } = await supabase
      .from('goals')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapGoalRow(data);
  },
};
