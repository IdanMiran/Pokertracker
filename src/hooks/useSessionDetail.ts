import { useState, useEffect } from 'react';
import type { Session, BuyIn, Result } from '../types';
import { subscribeToSession } from '../lib/firestore/sessions';
import { subscribeToBuyIns } from '../lib/firestore/buyins';
import { subscribeToResults } from '../lib/firestore/results';

export function useSessionDetail(sessionId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [buyins, setBuyins] = useState<BuyIn[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let a = false, b = false, c = false;
    const check = () => { if (a && b && c) setLoading(false); };

    const u1 = subscribeToSession(sessionId, (d) => { setSession(d); a = true; check(); }, () => { a = true; check(); });
    const u2 = subscribeToBuyIns(sessionId, (d) => { setBuyins(d); b = true; check(); }, () => { b = true; check(); });
    const u3 = subscribeToResults(sessionId, (d) => { setResults(d); c = true; check(); }, () => { c = true; check(); });

    return () => { u1(); u2(); u3(); };
  }, [sessionId]);

  return { session, buyins, results, loading };
}
