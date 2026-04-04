// app/prototypes/undercity-monitor/lib/statePoller.ts

import type { SessionState } from './types';
import { startMockAnimator } from './mockAnimator';

const ACTIVE_INTERVAL = 2000;  // 2s when data is changing
const IDLE_INTERVAL = 5000;    // 5s when nothing's changed
const IDLE_THRESHOLD = 3;      // consecutive unchanged polls before backing off

export class StatePoller {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(sessions: SessionState[]) => void> = new Set();
  private lastSessions: SessionState[] = [];
  private lastJson = '';
  private unchangedCount = 0;
  private currentInterval = ACTIVE_INTERVAL;
  private useMock = false;
  private stopMockAnimator: (() => void) | null = null;

  start() {
    if (this.intervalId || this.useMock) return;
    this.poll();
    this.scheduleNext();

    // Pause when tab is hidden, resume when visible
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.stopMockAnimator) {
      this.stopMockAnimator();
      this.stopMockAnimator = null;
    }
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  subscribe(listener: (sessions: SessionState[]) => void): () => void {
    this.listeners.add(listener);
    if (this.lastSessions.length > 0) {
      listener(this.lastSessions);
    }
    return () => this.listeners.delete(listener);
  }

  private onVisibility = () => {
    if (this.useMock) return; // Mock animator runs regardless
    if (document.visibilityState === 'visible') {
      this.poll();
      this.scheduleNext();
    } else {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  };

  private scheduleNext() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.poll(), this.currentInterval);
  }

  private startMockMode() {
    // Stop polling, switch to mock animator
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.useMock = true;
    this.stopMockAnimator = startMockAnimator((sessions) => {
      this.lastSessions = sessions;
      this.listeners.forEach(fn => fn(sessions));
    });
  }

  private async poll() {
    try {
      const res = await fetch('/api/undercity/sessions');
      if (!res.ok) {
        // API not available — fall back to mock mode
        this.startMockMode();
        return;
      }
      const sessions: SessionState[] = await res.json();
      const json = JSON.stringify(sessions);

      if (json === this.lastJson) {
        this.unchangedCount++;
        if (this.unchangedCount >= IDLE_THRESHOLD && this.currentInterval !== IDLE_INTERVAL) {
          this.currentInterval = IDLE_INTERVAL;
          this.scheduleNext();
        }
      } else {
        this.unchangedCount = 0;
        if (this.currentInterval !== ACTIVE_INTERVAL) {
          this.currentInterval = ACTIVE_INTERVAL;
          this.scheduleNext();
        }
        this.lastJson = json;
        this.lastSessions = sessions;
        this.listeners.forEach(fn => fn(sessions));
      }
    } catch {
      // Network error — fall back to mock mode
      this.startMockMode();
    }
  }
}
