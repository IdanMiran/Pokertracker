import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { subscribeToPlayers } from '../lib/firestore/players';

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToPlayers(
      (data) => { setPlayers(data); setLoading(false); },
      () => setLoading(false)
    );
  }, []);

  return { players, loading };
}
