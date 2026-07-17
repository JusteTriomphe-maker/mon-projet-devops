import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Habit, HabitInput } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'habits');
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'habits', id);

function map(snap: { id: string; data: () => Record<string, unknown> }): Habit {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.user_id as string,
    name: d.name as string,
    description: d.description as string,
    color: d.color as string,
    completedDates: (d.completed_dates as string[]) ?? [],
    createdAt: d.created_at as string,
  };
}

export const habitsService = {
  async getAll(userId: string): Promise<Habit[]> {
    const q = query(col(userId), orderBy('created_at', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(map);
  },

  async create(userId: string, input: HabitInput): Promise<Habit> {
    const now = new Date().toISOString();
    const docRef = await addDoc(col(userId), {
      user_id: userId,
      name: input.name,
      description: input.description,
      color: input.color,
      completed_dates: [],
      created_at: now,
    });
    const snap = await getDoc(docRef);
    return map({ id: snap.id, data: () => snap.data()! });
  },

  async toggleDate(userId: string, id: string, date: string): Promise<Habit> {
    const snap = await getDoc(ref(userId, id));
    const dates: string[] = (snap.data()!.completed_dates as string[]) ?? [];
    const updated = dates.includes(date) ? dates.filter((d) => d !== date) : [...dates, date];
    await updateDoc(ref(userId, id), { completed_dates: updated });
    const fresh = await getDoc(ref(userId, id));
    return map({ id: fresh.id, data: () => fresh.data()! });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(ref(userId, id));
  },
};
