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
import type { BuyIn } from '../../types';

function docToBuyIn(snap: QueryDocumentSnapshot): BuyIn {
  const data = snap.data();
  return {
    id: snap.id,
    playerId: data.playerId,
    amount: data.amount,
    timestamp: (data.timestamp as Timestamp).toDate(),
  };
}

export function subscribeToBuyIns(
  sessionId: string,
  onData: (buyins: BuyIn[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(
    collection(db, 'sessions', sessionId, 'buyins'),
    orderBy('timestamp', 'asc')
  );
  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map(docToBuyIn)),
    onError
  );
}

export async function addBuyIn(
  sessionId: string,
  playerId: string,
  amount: number
): Promise<void> {
  await addDoc(collection(db, 'sessions', sessionId, 'buyins'), {
    playerId,
    amount,
    timestamp: Timestamp.now(),
  });
}

export async function deleteBuyIn(
  sessionId: string,
  buyInId: string
): Promise<void> {
  await deleteDoc(doc(db, 'sessions', sessionId, 'buyins', buyInId));
}
