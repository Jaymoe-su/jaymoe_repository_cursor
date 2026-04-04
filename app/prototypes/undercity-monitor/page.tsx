// app/prototypes/undercity-monitor/page.tsx

"use client";

import Link from 'next/link';
import { useRef } from 'react';
import { useSessionState } from './hooks/useSessionState';
import { useTheme } from './hooks/useTheme';
import { SessionTabs } from './components/SessionTabs';
import { Sidebar } from './components/Sidebar';
import { DungeonRenderer } from './components/DungeonRenderer';
import styles from './styles.module.css';

export default function UndercityMonitor() {
  const { sessions, activeSession, activeSessionId, selectSession } = useSessionState();
  const { activeTheme } = useTheme();
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
          <DungeonRenderer containerRef={viewportRef} agents={activeSession?.agents ?? []} />
        </div>
        <Sidebar session={activeSession} />
      </div>
    </div>
  );
}
