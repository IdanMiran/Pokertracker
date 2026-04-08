import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Player } from '../../types';

function docToPlayer(snap: QueryDocumentSnapshot): Player {
  const data = snap.data();
  return {
    id: snap.id,
    name: data.name,
    createdAt: (data.createdAt as Timestamp).toDate(),
  };
}

export function subscribeToPlayers(
  onData: (players: Player[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(collection(db, 'players'), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(docToPlayer)),
    onError
  );
}

export async function addPlayer(name: string): Promise<void> {
  await addDoc(collection(db, 'players'), {
    name: name.trim(),
    createdAt: Timestamp.now(),
  });
}

export async function deletePlayer(playerId: string): Promise<void> {
  await deleteDoc(doc(db, 'players', playerId));
}
