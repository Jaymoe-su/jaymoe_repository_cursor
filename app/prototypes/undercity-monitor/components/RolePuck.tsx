// app/prototypes/undercity-monitor/components/RolePuck.tsx

import type { RolePuckType } from '../lib/types';

const PUCK_CONFIG: Record<RolePuckType, { color: string; icon: string }> = {
  tank:       { color: '#408CC8', icon: '🛡' },
  healer:     { color: '#33A640', icon: '✚' },
  dps:        { color: '#BF2626', icon: '⚔' },
  crafter:    { color: '#CCA626', icon: '⚗' },
  strategist: { color: '#8C40BF', icon: '👁' },
};

interface RolePuckProps {
  type: RolePuckType;
  size?: number;
}

export function RolePuck({ type, size = 24 }: RolePuckProps) {
  const { color, icon } = PUCK_CONFIG[type];
  const iconSize = size * 0.45;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id={`chrome-${type}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#C0C0C8" />
          <stop offset="50%" stopColor="#808088" />
          <stop offset="100%" stopColor="#4D4D55" />
        </radialGradient>
        <radialGradient id={`fill-${type}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#chrome-${type})`} />
      <circle cx="12" cy="12" r="8" fill={`url(#fill-${type})`} />
      <ellipse cx="10" cy="9" rx="4" ry="3" fill="white" opacity="0.25" />
      <text
        x="12" y="13"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={iconSize}
        fill="white"
      >
        {icon}
      </text>
    </svg>
  );
}
