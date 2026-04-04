// app/prototypes/undercity-monitor/components/QuestLog.tsx

import type { Quest } from '../lib/types';
import styles from '../styles.module.css';

interface QuestLogProps {
  quests: Quest[];
}

export function QuestLog({ quests }: QuestLogProps) {
  return (
    <div className={styles.questSection}>
      <div className={styles.sidebarHeader}>Quest Log</div>
      <div className={styles.questList}>
        {quests.map(quest => (
          <div key={quest.id} className={`${styles.questEntry} ${quest.complete ? styles.questComplete : ''}`}>
            <div className={styles.questTitle}>
              {quest.title}
              {quest.complete && <span className={styles.questCheck}> ✓</span>}
            </div>
            <div className={styles.questObjectives}>
              {quest.objectives.map((obj, i) => (
                <div key={i} className={`${styles.questObjective} ${obj.complete ? styles.objectiveDone : ''}`}>
                  - {obj.text}{obj.complete ? ' ✓' : ''}
                </div>
              ))}
            </div>
            <div className={styles.questAgent}>Assigned: {quest.assignedAgent}</div>
            <div className={styles.questProgress}>
              <div className={styles.questProgressBar}>
                <div
                  className={styles.questProgressFill}
                  style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                />
              </div>
              <span className={styles.questProgressText}>{quest.progress}/{quest.maxProgress}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
