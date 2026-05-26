// app/prototypes/undercity-monitor/lib/wowPalette.ts

// WoW-accurate color palette — all values from reference_wow_visual_design.md
export const WOW = {
  // UI Chrome
  goldChrome: 0xC79C6E,
  goldBright: 0xEBC880,
  goldDark: 0x80592E,
  parchment: 0xE8D5B5,
  panelBg: 0x1A1A1A,
  brownDark: 0x3E2B15,

  // Undercity
  slimeGreen: 0x4AFF00,
  slimeGreenDim: 0x267F00,
  forsakenPurple: 0x331A40,
  stoneDark: 0x1F2129,
  stoneBase: 0x4A5060,
  stoneLight: 0x626A78,

  // Zone lights
  forgeOrange: 0xFF7A1A,
  scriptoriumAmber: 0xFFCC66,
  apothecaryGreen: 0x4AFF00,
  enchantingPurple: 0x8033BF,
  summonBlue: 0x6688EE,
  guildHallTorch: 0xFF8833,

  // Runes
  runeBlue: 0x668CF2,
  runePurple: 0x8C59E6,
  runeWhite: 0xB3CCff,

  // Portal
  portalCenter: 0xD9E6FF,
  portalMid: 0x7380F2,
  portalEdge: 0x5933BF,

  // Role pucks
  puckTank: 0x408CC8,
  puckHealer: 0x33A640,
  puckDps: 0xBF2626,
  puckCrafter: 0xCCA626,
  puckStrategist: 0x8C40BF,
  puckChrome: 0xBFBFC6,

  // Health bar
  healthGreen: 0x2ECC40,
  healthYellow: 0xFF8C00,
  healthRed: 0xCC0000,

  // Horde
  hordeBanner: 0x8B0000,

  // General
  white: 0xFFFFFF,
  black: 0x0A0A0D,
} as const;

export type WowColorKey = keyof typeof WOW;
