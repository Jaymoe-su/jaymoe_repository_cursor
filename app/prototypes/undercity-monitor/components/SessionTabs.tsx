// app/prototypes/undercity-monitor/components/SessionTabs.tsx

import type { SessionState } from '../lib/types';
import styles from '../styles.module.css';

interface SessionTabsProps {
  sessions: SessionState[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
}

export function SessionTabs({ sessions, activeSessionId, onSelect }: SessionTabsProps) {
  return (
    <div className={styles.tabBar}>
      {sessions.map((session, i) => {
        const isActive = session.sessionId === activeSessionId;
        const isStale = Date.now() - new Date(session.timestamp).getTime() > 60_000;
        return (
          <button
            key={session.sessionId}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onSelect(session.sessionId)}
          >
            <span className={`${styles.instanceDot} ${isStale ? styles.instanceDotStale : ''}`} />
            Instance {i + 1} — {session.sessionName}
          </button>
        );
      })}
    </div>
  );
}
