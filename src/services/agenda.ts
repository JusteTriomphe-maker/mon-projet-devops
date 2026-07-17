import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { AgendaEvent, AgendaEventInput } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'events');
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'events', id);

function map(snap: { id: string; data: () => Record<string, unknown> }): AgendaEvent {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.user_id as string,
    title: d.title as string,
    description: d.description as string,
    date: d.date as string,
    time: d.time as string,
    color: d.color as AgendaEvent['color'],
    createdAt: d.created_at as string,
  };
}

export const agendaService = {
  async getAll(userId: string): Promise<AgendaEvent[]> {
    const q = query(col(userId), orderBy('date', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(map);
  },

  async create(userId: string, input: AgendaEventInput): Promise<void> {
    await addDoc(col(userId), {
      user_id: userId,
      title: input.title,
      description: input.description,
      date: input.date,
      time: input.time,
      color: input.color,
      created_at: new Date().toISOString(),
    });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(ref(userId, id));
  },
};
