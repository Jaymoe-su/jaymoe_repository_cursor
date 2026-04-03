// app/prototypes/undercity-monitor/lib/professionVerbs.ts

import type { ZoneId } from './types';

// Maps MCP tool prefixes to profession verbs per zone
const ZONE_VERBS: Record<ZoneId, Record<string, string>> = {
  forge: {
    'save_issue': 'Forging ticket',
    'save_milestone': 'Tempering milestone',
    'list_issues': 'Smelting backlog',
    'get_issue': 'Inspecting forgework',
    'save_comment': 'Hammering blocker',
    'list_cycles': 'Quenching sprint',
    default: 'Working the forge',
  },
  scriptorium: {
    'create-pages': 'Inscribing page',
    'update-page': 'Illuminating scroll',
    'query-meeting-notes': 'Transcribing lore',
    'create-database': 'Binding tome',
    'create-comment': 'Etching runes',
    default: 'Studying the scrolls',
  },
  apothecary: {
    'get_design_context': 'Transmuting design',
    'get_screenshot': 'Distilling components',
    'generate_figma_design': 'Brewing mockup',
    'get_variable_defs': 'Decanting tokens',
    'use_figma': 'Brewing in the cauldron',
    default: 'Mixing reagents',
  },
  enchanting: {
    // Reforge tools TBD — use generic verbs
    default: 'Channeling arcane energy',
  },
  guildHall: {
    default: 'Raid briefing in progress',
  },
  summonStone: {
    default: 'Awaiting orders from the War Chief',
  },
};

export function getActivityText(zone: ZoneId, toolName: string | null, rawActivity: string): string {
  const zoneVerbs = ZONE_VERBS[zone];
  if (!toolName) return rawActivity || zoneVerbs.default;

  // Match tool name against zone verb keys (partial match)
  for (const [pattern, verb] of Object.entries(zoneVerbs)) {
    if (pattern !== 'default' && toolName.includes(pattern)) {
      // Extract the object name from rawActivity if present
      const colonIdx = rawActivity.indexOf(':');
      const suffix = colonIdx > -1 ? rawActivity.slice(colonIdx) : '';
      return verb + suffix;
    }
  }

  return rawActivity || zoneVerbs.default;
}
