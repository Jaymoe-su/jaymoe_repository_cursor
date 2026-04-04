// app/prototypes/undercity-monitor/lib/mockAnimator.ts

import type { SessionState, Agent, ZoneId } from './types';
import { MOCK_SESSIONS } from './mockState';

const ZONES: ZoneId[] = ['guildHall', 'forge', 'scriptorium', 'apothecary', 'enchanting', 'summonStone'];

const ACTIVITIES: Record<ZoneId, string[]> = {
  guildHall: [
    'Reviewing the pull', 'Raid briefing in progress', 'Assigning roles',
    'Discussing strategy', 'Checking raid comp', 'Reading Intel reports',
  ],
  forge: [
    'Forging ticket: SIPR Cert Handoff', 'Tempering milestone: MSS Staging',
    'Smelting backlog', 'Hammering blocker', 'Quenching sprint cycle',
    'Inspecting forgework',
  ],
  scriptorium: [
    'Inscribing page: Weekly Status', 'Illuminating scroll',
    'Transcribing lore', 'Binding tome: Architecture Doc',
    'Studying the scrolls', 'Etching runes of knowledge',
  ],
  apothecary: [
    'Transmuting design tokens', 'Distilling components',
    'Brewing mockup: Dashboard', 'Decanting CSS variables',
    'Mixing reagents', 'Brewing in the cauldron',
  ],
  enchanting: [
    'Channeling arcane energy', 'Enchanting the test suite',
    'Weaving integration spells', 'Binding soul fragments',
    'Attuning to the codebase', 'Disenchanting tech debt',
  ],
  summonStone: [
    'Awaiting orders from the War Chief', 'LFG...',
    'Waiting for summon...', 'Standing by at the stone',
  ],
};

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInterval(minMs: number, maxMs: number): number {
  return minMs + Math.random() * (maxMs - minMs);
}

function tickAgent(agent: Agent): boolean {
  let changed = false;
  const roll = Math.random();

  // 25% chance: move to a different zone
  if (roll < 0.25) {
    const otherZones = ZONES.filter(z => z !== agent.zone);
    const newZone = pick(otherZones);
    agent.zone = newZone;
    agent.activity = pick(ACTIVITIES[newZone]);
    agent.state = newZone === 'summonStone' ? 'waiting' : newZone === 'guildHall' ? 'briefing' : 'working';
    agent.waitingForInput = newZone === 'summonStone';
    agent.currentTool = null;
    changed = true;
  }
  // 30% chance: change activity text
  else if (roll < 0.55) {
    agent.activity = pick(ACTIVITIES[agent.zone]);
    changed = true;
  }
  // 20% chance: tick down context health
  else if (roll < 0.75) {
    const drain = 0.02 + Math.random() * 0.05;
    agent.contextHealth = Math.max(0.05, agent.contextHealth - drain);
    changed = true;
  }
  // 15% chance: toggle working/waiting
  else if (roll < 0.90) {
    if (agent.state === 'working') {
      agent.state = 'waiting';
      agent.waitingForInput = true;
      agent.activity = 'Waiting for input...';
    } else if (agent.state === 'waiting' && agent.zone !== 'summonStone') {
      agent.state = 'working';
      agent.waitingForInput = false;
      agent.activity = pick(ACTIVITIES[agent.zone]);
    }
    changed = true;
  }
  // 10% chance: tick quest progress (handled at session level)

  return changed;
}

function tickCompaction(agent: Agent, scheduleRestore: (agent: Agent) => void): boolean {
  if (agent.isCompacting) return false;

  if (agent.contextHealth < 0.2) {
    agent.isCompacting = true;
    agent.state = 'compacting';
    agent.activity = 'Drinking potion...';
    scheduleRestore(agent);
    return true;
  }
  return false;
}

function tickQuests(session: SessionState): boolean {
  if (session.quests.length === 0) return false;

  const incompleteQuests = session.quests.filter(q => !q.complete);
  if (incompleteQuests.length === 0) return false;

  if (Math.random() < 0.3) {
    const quest = pick(incompleteQuests);
    const incompleteObjs = quest.objectives.filter(o => !o.complete);
    if (incompleteObjs.length > 0) {
      const obj = pick(incompleteObjs);
      obj.complete = true;
      quest.progress = quest.objectives.filter(o => o.complete).length;
      if (quest.progress >= quest.maxProgress) {
        quest.complete = true;
      }
      return true;
    }
  }
  return false;
}

export function startMockAnimator(
  callback: (sessions: SessionState[]) => void
): () => void {
  let stopped = false;
  const restoreTimers: ReturnType<typeof setTimeout>[] = [];

  function scheduleRestore(agent: Agent) {
    const timer = setTimeout(() => {
      if (stopped) return;
      agent.isCompacting = false;
      agent.state = 'working';
      agent.contextHealth = 0.65 + Math.random() * 0.15;
      agent.activity = pick(ACTIVITIES[agent.zone]);
      callback([...MOCK_SESSIONS]);
    }, 2000);
    restoreTimers.push(timer);
  }

  function tick() {
    if (stopped) return;

    const session = MOCK_SESSIONS[0]; // Only animate the first session (it has agents)
    if (!session || session.agents.length === 0) {
      scheduleNextTick();
      return;
    }

    // Pick 1-2 random agents to update
    const agentCount = randInt(1, 2);
    let changed = false;

    for (let i = 0; i < agentCount; i++) {
      const agent = pick(session.agents);
      if (!agent.isCompacting) {
        changed = tickAgent(agent) || changed;
        changed = tickCompaction(agent, scheduleRestore) || changed;
      }
    }

    changed = tickQuests(session) || changed;

    if (changed) {
      session.timestamp = new Date().toISOString();
      callback([...MOCK_SESSIONS]);
    }

    scheduleNextTick();
  }

  function scheduleNextTick() {
    if (stopped) return;
    setTimeout(tick, randomInterval(3000, 8000));
  }

  // Emit initial state immediately
  callback([...MOCK_SESSIONS]);

  // Start ticking after a short delay
  setTimeout(tick, randomInterval(2000, 4000));

  return () => {
    stopped = true;
    restoreTimers.forEach(clearTimeout);
  };
}
