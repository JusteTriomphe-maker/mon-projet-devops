import { collection, doc, getDocs, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction, TransactionInput } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'transactions');
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'transactions', id);

function map(snap: { id: string; data: () => Record<string, unknown> }): Transaction {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.user_id as string,
    type: d.type as Transaction['type'],
    amount: d.amount as number,
    category: d.category as Transaction['category'],
    description: d.description as string,
    date: d.date as string,
    createdAt: d.created_at as string,
  };
}

export const budgetService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const q = query(col(userId), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(map);
  },

  async create(userId: string, input: TransactionInput): Promise<void> {
    await addDoc(col(userId), {
      user_id: userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description,
      date: input.date,
      created_at: new Date().toISOString(),
    });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(ref(userId, id));
  },
};
