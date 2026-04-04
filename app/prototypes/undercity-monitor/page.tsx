// app/prototypes/undercity-monitor/page.tsx

"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { useSessionState } from './hooks/useSessionState';
import { SessionTabs } from './components/SessionTabs';
import { Sidebar } from './components/Sidebar';
import styles from './styles.module.css';

export default function UndercityMonitor() {
  const { sessions, activeSession, activeSessionId, selectSession } = useSessionState();
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>☜</Link>
      <SessionTabs
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelect={selectSession}
      />
      <div className={styles.main}>
        <div ref={viewportRef} className={styles.viewport}>
          {/* Three.js canvas will be mounted here in Task 4 */}
        </div>
        <Sidebar session={activeSession} />
      </div>
    </div>
  );
}
