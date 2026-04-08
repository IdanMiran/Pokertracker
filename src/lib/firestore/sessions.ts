import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Session } from '../../types';

function docToSession(snap: QueryDocumentSnapshot): Session {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    date: (data.date as Timestamp).toDate(),
    chipToCashRatio: data.chipToCashRatio ?? undefined,
    status: data.status,
  };
}

export function subscribeToSessions(
  onData: (sessions: Session[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'sessions'), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(docToSession)),
    onError
  );
}

export async function createSession(params: {
  name: string;
  date: Date;
  chipToCashRatio?: number;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'sessions'), {
    name: params.name.trim(),
    date: Timestamp.fromDate(params.date),
    chipToCashRatio: params.chipToCashRatio ?? null,
    status: 'active',
  });
  return ref.id;
}

export async function completeSession(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'sessions', sessionId), { status: 'completed' });
}

export async function deleteSession(sessionId: string): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId));
}

export function subscribeToSession(
  sessionId: string,
  onData: (session: Session | null) => void,
  onError: (err: Error) => void
): () => void {
  return onSnapshot(
    doc(db, 'sessions', sessionId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData(docToSession(snap as QueryDocumentSnapshot));
    },
    onError
  );
}
