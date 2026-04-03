// app/prototypes/undercity-monitor/lib/types.ts

export type ZoneId = 'guildHall' | 'forge' | 'scriptorium' | 'apothecary' | 'enchanting' | 'summonStone';

export type RolePuckType = 'tank' | 'healer' | 'dps' | 'crafter' | 'strategist';

export type AgentState = 'idle' | 'working' | 'briefing' | 'waiting' | 'compacting';

export interface Agent {
  id: string;
  name: string;
  wowName: string;
  title: string;
  role: string;
  rolePuck: RolePuckType;
  state: AgentState;
  zone: ZoneId;
  activity: string;
  contextHealth: number; // 0-1
  isCompacting: boolean;
  waitingForInput: boolean;
  currentTool: string | null;
}

export interface QuestObjective {
  text: string;
  complete: boolean;
}

export interface Quest {
  id: string;
  title: string;
  objectives: QuestObjective[];
  assignedAgent: string;
  progress: number;
  maxProgress: number;
  complete: boolean;
}

export interface RaidBriefing {
  active: boolean;
  topic: string | null;
  participants: string[];
}

export interface SessionState {
  sessionId: string;
  sessionName: string;
  timestamp: string;
  agents: Agent[];
  quests: Quest[];
  raidBriefing: RaidBriefing;
}

export interface ThemeConfig {
  id: string;
  name: string;
  canalColor: number;        // hex
  canalEmissive: number;
  groundColor: number;
  stoneColor: number;
  ambientLightColor: number;
  ambientLightIntensity: number;
}
