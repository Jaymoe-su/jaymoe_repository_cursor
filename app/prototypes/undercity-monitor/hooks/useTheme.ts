// app/prototypes/undercity-monitor/hooks/useTheme.ts

import { useState, useCallback } from 'react';
import type { ThemeConfig } from '../lib/types';
import { WOW } from '../lib/wowPalette';

const THEMES: ThemeConfig[] = [
  {
    id: 'undercity',
    name: 'Undercity',
    canalColor: WOW.slimeGreenDim,
    canalEmissive: WOW.slimeGreen,
    groundColor: WOW.stoneDark,
    stoneColor: WOW.stoneBase,
    ambientLightColor: 0x1a1a2e,
    ambientLightIntensity: 0.3,
  },
  // Future themes go here
];

export function useTheme() {
  const [activeThemeId, setActiveThemeId] = useState('undercity');
  const activeTheme = THEMES.find(t => t.id === activeThemeId) ?? THEMES[0];
  const selectTheme = useCallback((id: string) => setActiveThemeId(id), []);
  return { themes: THEMES, activeTheme, selectTheme };
}
