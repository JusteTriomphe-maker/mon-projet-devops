import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import type { User } from '../types';

function mapFirebaseUser(raw: FirebaseUser): User {
  return {
    id: raw.uid,
    email: raw.email ?? '',
    name: raw.displayName ?? '',
    createdAt: raw.metadata.creationTime ?? new Date().toISOString(),
  };
}

export const authService = {
  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ user: User; error: string | null }> {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      return { user: mapFirebaseUser(cred.user), error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Inscription échouée.';
      return { user: null as unknown as User, error: message };
    }
  },

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; error: string | null }> {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return { user: mapFirebaseUser(cred.user), error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connexion échouée.';
      return { user: null as unknown as User, error: message };
    }
  },

  async loginWithGoogle(): Promise<{ user: User | null; error: string | null }> {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      return { user: mapFirebaseUser(cred.user), error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connexion Google échouée.';
      return { user: null, error: message };
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async updateName(name: string): Promise<string | null> {
    try {
      if (!auth.currentUser) return 'Non authentifié.';
      await updateProfile(auth.currentUser, { displayName: name });
      return null;
    } catch (err: unknown) {
      return err instanceof Error ? err.message : 'Mise à jour échouée.';
    }
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },
};
