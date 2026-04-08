import { useState, useEffect } from 'react';
import type { Session } from '../types';
import { subscribeToSessions } from '../lib/firestore/sessions';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToSessions(
      (data) => { setSessions(data); setLoading(false); },
      () => setLoading(false)
    );
  }, []);

  return { sessions, loading };
}
