// app/prototypes/undercity-monitor/components/RaidRoster.tsx

import type { Agent } from '../lib/types';
import { RolePuck } from './RolePuck';
import styles from '../styles.module.css';

interface RaidRosterProps {
  agents: Agent[];
}

function healthColor(health: number): string {
  if (health > 0.6) return '#2ECC40';
  if (health > 0.3) return '#FF8C00';
  return '#CC0000';
}

export function RaidRoster({ agents }: RaidRosterProps) {
  return (
    <div className={styles.rosterSection}>
      <div className={styles.sidebarHeader}>Raid Roster</div>
      <div className={styles.rosterList}>
        {agents.map(agent => (
          <div key={agent.id} className={styles.rosterEntry}>
            <RolePuck type={agent.rolePuck} size={20} />
            <div className={styles.rosterInfo}>
              <div className={styles.rosterName}>{agent.wowName}</div>
              <div className={styles.rosterTitle}>&lt;{agent.title}&gt;</div>
              <div className={`${styles.rosterActivity} ${agent.waitingForInput ? styles.rosterWaiting : ''} ${agent.isCompacting ? styles.rosterCompacting : ''}`}>
                {agent.activity}
              </div>
            </div>
            <div className={styles.rosterHealthBar}>
              <div
                className={styles.rosterHealthFill}
                style={{
                  width: `${agent.contextHealth * 100}%`,
                  backgroundColor: healthColor(agent.contextHealth),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
