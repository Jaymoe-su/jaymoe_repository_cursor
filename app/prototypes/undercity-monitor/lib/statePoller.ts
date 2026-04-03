// app/prototypes/undercity-monitor/lib/statePoller.ts

import type { SessionState } from './types';

const POLL_INTERVAL = 500; // ms

export class StatePoller {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(sessions: SessionState[]) => void> = new Set();
  private lastSessions: SessionState[] = [];

  start() {
    if (this.intervalId) return;
    this.poll(); // immediate first poll
    this.intervalId = setInterval(() => this.poll(), POLL_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(listener: (sessions: SessionState[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately emit last known state
    if (this.lastSessions.length > 0) {
      listener(this.lastSessions);
    }
    return () => this.listeners.delete(listener);
  }

  private async poll() {
    try {
      const res = await fetch('/api/undercity/sessions');
      if (!res.ok) return;
      const sessions: SessionState[] = await res.json();
      this.lastSessions = sessions;
      this.listeners.forEach(fn => fn(sessions));
    } catch {
      // Silently retry on next interval
    }
  }
}
