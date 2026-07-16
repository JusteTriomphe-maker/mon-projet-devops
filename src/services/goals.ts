import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Goal, GoalInput } from '../types';

function goalsCol(userId: string) {
  return collection(db, 'users', userId, 'goals');
}

function goalDoc(userId: string, goalId: string) {
  return doc(db, 'users', userId, 'goals', goalId);
}

function mapGoalDoc(snapshot: { id: string; data: () => Record<string, unknown> }): Goal {
  const d = snapshot.data();
  return {
    id: snapshot.id,
    userId: d.user_id as string,
    title: d.title as string,
    description: d.description as string,
    category: d.category as Goal['category'],
    priority: d.priority as Goal['priority'],
    deadline: d.deadline as string,
    status: d.status as Goal['status'],
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

export const goalsService = {
  async getAll(userId: string): Promise<Goal[]> {
    const q = query(goalsCol(userId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(mapGoalDoc);
  },

  async create(userId: string, input: GoalInput): Promise<Goal> {
    const now = new Date().toISOString();
    const docRef = await addDoc(goalsCol(userId), {
      user_id: userId,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      deadline: input.deadline,
      status: 'En cours',
      created_at: now,
      updated_at: now,
    });
    const snap = await getDoc(docRef);
    return mapGoalDoc({ id: snap.id, data: () => snap.data()! });
  },

  async update(
    userId: string,
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

    await updateDoc(goalDoc(userId, id), payload);
    const snap = await getDoc(goalDoc(userId, id));
    return mapGoalDoc({ id: snap.id, data: () => snap.data()! });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(goalDoc(userId, id));
  },

  async toggleComplete(userId: string, id: string): Promise<Goal> {
    const snap = await getDoc(goalDoc(userId, id));
    const current = snap.data()!;
    const newStatus = current.status === 'Terminé' ? 'En cours' : 'Terminé';
    await updateDoc(goalDoc(userId, id), {
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
    const updated = await getDoc(goalDoc(userId, id));
    return mapGoalDoc({ id: updated.id, data: () => updated.data()! });
  },
};
