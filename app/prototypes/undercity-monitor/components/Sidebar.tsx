// app/prototypes/undercity-monitor/components/Sidebar.tsx

import type { SessionState } from '../lib/types';
import { RaidRoster } from './RaidRoster';
import { QuestLog } from './QuestLog';
import styles from '../styles.module.css';

interface SidebarProps {
  session: SessionState | null;
}

export function Sidebar({ session }: SidebarProps) {
  if (!session) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>No Active Session</div>
      </aside>
    );
  }

  return (
    <aside className={styles.sidebar}>
      <RaidRoster agents={session.agents} />
      <QuestLog quests={session.quests} />
    </aside>
  );
}
