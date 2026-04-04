// app/prototypes/undercity-monitor/components/AgentSprite.ts

import * as THREE from 'three';
import type { Agent, ZoneId, RolePuckType } from '../lib/types';

// Zone world positions (isometric coordinates)
const ZONE_POSITIONS: Record<ZoneId, THREE.Vector3[]> = {
  guildHall: [
    new THREE.Vector3(-2.5, 0, -2.5),
    new THREE.Vector3(2.5, 0, -2.5),
    new THREE.Vector3(-2.5, 0, 2.5),
    new THREE.Vector3(2.5, 0, 2.5),
    new THREE.Vector3(0, 0, -3.5),
    new THREE.Vector3(0, 0, 3.5),
    new THREE.Vector3(-3.5, 0, 0),
  ],
  forge: [
    new THREE.Vector3(9, 0, -9),
    new THREE.Vector3(11, 0, -10),
    new THREE.Vector3(10, 0, -11.5),
  ],
  scriptorium: [
    new THREE.Vector3(9, 0, 9),
    new THREE.Vector3(11, 0, 10),
    new THREE.Vector3(10, 0, 11.5),
  ],
  apothecary: [
    new THREE.Vector3(-9, 0, 9),
    new THREE.Vector3(-11, 0, 10),
    new THREE.Vector3(-10, 0, 11.5),
  ],
  enchanting: [
    new THREE.Vector3(-9, 0, -9),
    new THREE.Vector3(-11, 0, -10),
    new THREE.Vector3(-10, 0, -11.5),
  ],
  summonStone: [
    new THREE.Vector3(-2, 0, 13),
    new THREE.Vector3(2, 0, 13),
    new THREE.Vector3(-3, 0, 15),
    new THREE.Vector3(3, 0, 15),
  ],
};

// Track slot usage per zone
const zoneSlotCounters: Record<ZoneId, number> = {
  guildHall: 0, forge: 0, scriptorium: 0,
  apothecary: 0, enchanting: 0, summonStone: 0,
};

const PUCK_COLORS: Record<RolePuckType, string> = {
  tank: '#408CC8',
  healer: '#33A640',
  dps: '#BF2626',
  crafter: '#CCA626',
  strategist: '#8C40BF',
};

function getHealthColor(health: number): string {
  if (health > 0.6) return '#2ECC40';
  if (health > 0.3) return '#FF8C00';
  return '#CC0000';
}

function createNameplateTexture(agent: Agent): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Clear with transparency
  ctx.clearRect(0, 0, 512, 256);

  const cx = 256;

  // Status icon (top)
  const statusIcon = agent.waitingForInput ? '❓' : agent.isCompacting ? '🧪' : '';
  if (statusIcon) {
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusIcon, cx, 30);
  }

  // Role puck circle
  const puckColor = PUCK_COLORS[agent.rolePuck] || '#888888';
  ctx.beginPath();
  ctx.arc(cx, 65, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#1A1A22';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = puckColor;
  ctx.stroke();

  // Puck inner glow ring
  ctx.beginPath();
  ctx.arc(cx, 65, 22, 0, Math.PI * 2);
  ctx.strokeStyle = puckColor;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  // Initial letter in puck
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#EBC880';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(agent.wowName.charAt(0), cx, 67);

  // Name — bigger
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'center';
  ctx.fillText(agent.wowName, cx, 98);

  // Guild title
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#B87AFF';
  ctx.fillText(`<${agent.title}>`, cx, 120);

  // Health bar background
  const barX = 156;
  const barW = 200;
  const barH = 12;
  const barY = 145;

  ctx.fillStyle = '#1A0A0A';
  ctx.fillRect(barX, barY, barW, barH);

  // Health bar border
  ctx.strokeStyle = '#4A3A2A';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(barX, barY, barW, barH);

  // Health bar fill
  const healthW = Math.max(2, (barW - 4) * agent.contextHealth);
  ctx.fillStyle = getHealthColor(agent.contextHealth);
  ctx.fillRect(barX + 2, barY + 2, healthW, barH - 4);

  // Health percentage
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.round(agent.contextHealth * 100)}%`, cx, barY + barH - 2);

  // Activity text — bigger
  ctx.font = 'italic 13px sans-serif';
  ctx.fillStyle = '#8B7B5B';
  const activity = agent.activity.length > 40 ? agent.activity.slice(0, 38) + '...' : agent.activity;
  ctx.fillText(activity, cx, 170);

  // State indicator text
  if (agent.state === 'compacting') {
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#FF4444';
    ctx.fillText('COMPACTING', cx, 192);
  } else if (agent.state === 'waiting') {
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#FFAA00';
    ctx.fillText('WAITING', cx, 192);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export class AgentSpriteManager {
  private sprites: Map<string, {
    sprite: THREE.Sprite;
    currentPos: THREE.Vector3;
    targetPos: THREE.Vector3;
    glowSprite: THREE.Sprite;
    lastState: string;
    lastHealth: number;
  }> = new Map();
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  update(agents: Agent[], delta: number): void {
    // Reset slot counters
    Object.keys(zoneSlotCounters).forEach(k => {
      zoneSlotCounters[k as ZoneId] = 0;
    });

    const activeIds = new Set(agents.map(a => a.id));

    // Remove sprites for agents no longer present
    for (const [id, data] of this.sprites) {
      if (!activeIds.has(id)) {
        this.scene.remove(data.sprite);
        this.scene.remove(data.glowSprite);
        data.sprite.material.map?.dispose();
        (data.sprite.material as THREE.SpriteMaterial).dispose();
        (data.glowSprite.material as THREE.SpriteMaterial).dispose();
        this.sprites.delete(id);
      }
    }

    const elapsed = performance.now() / 1000;

    // Create or update sprites
    agents.forEach(agent => {
      const slotIdx = zoneSlotCounters[agent.zone]++;
      const slots = ZONE_POSITIONS[agent.zone];
      const targetPos = slots[slotIdx % slots.length].clone();
      targetPos.y = 2.5; // Float above ground

      let entry = this.sprites.get(agent.id);

      if (!entry) {
        // Create main sprite
        const texture = createNameplateTexture(agent);
        const mat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(5, 2.5, 1);
        sprite.position.copy(targetPos);
        this.scene.add(sprite);

        // Create glow sprite (behind main sprite)
        const glowMat = new THREE.SpriteMaterial({
          color: 0xFFD700,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthTest: false,
        });
        const glowSprite = new THREE.Sprite(glowMat);
        glowSprite.scale.set(6, 3, 1);
        glowSprite.position.copy(targetPos);
        this.scene.add(glowSprite);

        entry = {
          sprite,
          currentPos: targetPos.clone(),
          targetPos,
          glowSprite,
          lastState: agent.state,
          lastHealth: agent.contextHealth,
        };
        this.sprites.set(agent.id, entry);
      } else {
        // Update target position and texture
        entry.targetPos.copy(targetPos);
        // Regenerate texture
        const oldTex = (entry.sprite.material as THREE.SpriteMaterial).map;
        oldTex?.dispose();
        (entry.sprite.material as THREE.SpriteMaterial).map = createNameplateTexture(agent);
        entry.lastState = agent.state;
        entry.lastHealth = agent.contextHealth;
      }

      // Lerp position
      entry.currentPos.lerp(entry.targetPos, Math.min(1, delta * 2.5));
      entry.sprite.position.copy(entry.currentPos);
      entry.glowSprite.position.copy(entry.currentPos);

      // Glow effects
      const glowMat = entry.glowSprite.material as THREE.SpriteMaterial;

      if (agent.state === 'waiting' || agent.waitingForInput) {
        // Gold pulse for waiting agents
        glowMat.color.setHex(0xFFD700);
        glowMat.opacity = 0.15 + Math.sin(elapsed * 3) * 0.1;
      } else if (agent.contextHealth < 0.25) {
        // Red pulse for critically low health
        glowMat.color.setHex(0xFF0000);
        glowMat.opacity = 0.2 + Math.sin(elapsed * 5) * 0.15;
      } else if (agent.isCompacting) {
        // Blue pulse for compacting
        glowMat.color.setHex(0x4488FF);
        glowMat.opacity = 0.25 + Math.sin(elapsed * 4) * 0.15;
      } else {
        glowMat.opacity = 0;
      }

      // Subtle floating bob
      entry.sprite.position.y += Math.sin(elapsed * 1.5 + agents.indexOf(agent) * 1.2) * 0.05;
      entry.glowSprite.position.y = entry.sprite.position.y;
    });
  }

  dispose(): void {
    for (const [, data] of this.sprites) {
      this.scene.remove(data.sprite);
      this.scene.remove(data.glowSprite);
      data.sprite.material.map?.dispose();
      (data.sprite.material as THREE.SpriteMaterial).dispose();
      (data.glowSprite.material as THREE.SpriteMaterial).dispose();
    }
    this.sprites.clear();
  }
}
