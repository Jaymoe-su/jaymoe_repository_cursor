// app/prototypes/undercity-monitor/hooks/useSessionState.ts

import { useState, useEffect, useRef, useCallback } from 'react';
import type { SessionState } from '../lib/types';
import { StatePoller } from '../lib/statePoller';

export function useSessionState() {
  const [sessions, setSessions] = useState<SessionState[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const pollerRef = useRef<StatePoller | null>(null);

  useEffect(() => {
    const poller = new StatePoller();
    pollerRef.current = poller;

    const unsub = poller.subscribe((newSessions) => {
      setSessions(newSessions);
      // Auto-select first session if none selected
      setActiveSessionId(prev => {
        if (prev && newSessions.some(s => s.sessionId === prev)) return prev;
        return newSessions[0]?.sessionId ?? null;
      });
    });

    poller.start();
    return () => { unsub(); poller.stop(); };
  }, []);

  const activeSession = sessions.find(s => s.sessionId === activeSessionId) ?? null;

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  return { sessions, activeSession, activeSessionId, selectSession };
}
