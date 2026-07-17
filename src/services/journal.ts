import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { JournalEntry, JournalInput } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'journal');
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'journal', id);

function map(snap: { id: string; data: () => Record<string, unknown> }): JournalEntry {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.user_id as string,
    title: d.title as string,
    content: d.content as string,
    mood: d.mood as JournalEntry['mood'],
    goalId: d.goal_id as string | undefined,
    createdAt: d.created_at as string,
    updatedAt: d.updated_at as string,
  };
}

export const journalService = {
  async getAll(userId: string): Promise<JournalEntry[]> {
    const q = query(col(userId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(map);
  },

  async create(userId: string, input: JournalInput): Promise<JournalEntry> {
    const now = new Date().toISOString();
    const docRef = await addDoc(col(userId), {
      user_id: userId,
      title: input.title,
      content: input.content,
      mood: input.mood,
      goal_id: input.goalId ?? null,
      created_at: now,
      updated_at: now,
    });
    const snap = await getDoc(docRef);
    return map({ id: snap.id, data: () => snap.data()! });
  },

  async update(userId: string, id: string, input: Partial<JournalInput>): Promise<void> {
    await updateDoc(ref(userId, id), { ...input, updated_at: new Date().toISOString() });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(ref(userId, id));
  },
};
