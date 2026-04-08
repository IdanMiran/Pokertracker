import {
  collection,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Result } from '../../types';

function docToResult(snap: QueryDocumentSnapshot): Result {
  const data = snap.data();
  return {
    id: snap.id,
    playerId: data.playerId,
    finalChips: data.finalChips ?? undefined,
    finalCash: data.finalCash,
  };
}

export function subscribeToResults(
  sessionId: string,
  onData: (results: Result[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'sessions', sessionId, 'results'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(docToResult)),
    onError
  );
}

// Upsert: one result per player per session (doc ID = playerId)
export async function setResult(
  sessionId: string,
  playerId: string,
  finalCash: number,
  finalChips?: number
): Promise<void> {
  await setDoc(
    doc(db, 'sessions', sessionId, 'results', playerId),
    {
      playerId,
      finalCash,
      finalChips: finalChips ?? null,
    },
    { merge: true }
  );
}

export async function deleteResult(
  sessionId: string,
  playerId: string
): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId, 'results', playerId));
}
