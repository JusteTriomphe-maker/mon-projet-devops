import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import type { Resource, ResourceInput } from '../types';

const col = (uid: string) => collection(db, 'users', uid, 'resources');
const ref = (uid: string, id: string) => doc(db, 'users', uid, 'resources', id);

function map(snap: { id: string; data: () => Record<string, unknown> }): Resource {
  const d = snap.data();
  return {
    id: snap.id,
    userId: d.user_id as string,
    title: d.title as string,
    url: d.url as string,
    type: d.type as Resource['type'],
    status: d.status as Resource['status'],
    tags: (d.tags as string[]) ?? [],
    notes: d.notes as string,
    createdAt: d.created_at as string,
  };
}

export const resourcesService = {
  async getAll(userId: string): Promise<Resource[]> {
    const q = query(col(userId), orderBy('created_at', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(map);
  },

  async create(userId: string, input: ResourceInput): Promise<void> {
    await addDoc(col(userId), {
      user_id: userId,
      title: input.title,
      url: input.url,
      type: input.type,
      status: input.status,
      tags: input.tags,
      notes: input.notes,
      created_at: new Date().toISOString(),
    });
  },

  async updateStatus(userId: string, id: string, status: Resource['status']): Promise<void> {
    await updateDoc(ref(userId, id), { status });
  },

  async remove(userId: string, id: string): Promise<void> {
    await deleteDoc(ref(userId, id));
  },
};
