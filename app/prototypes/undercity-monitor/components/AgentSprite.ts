// app/prototypes/undercity-monitor/components/AgentSprite.ts

import * as THREE from 'three';
import type { Agent, ZoneId } from '../lib/types';

// Zone world positions (isometric coordinates)
const ZONE_POSITIONS: Record<ZoneId, THREE.Vector3[]> = {
  guildHall: [
    new THREE.Vector3(-2, 0, -2),
    new THREE.Vector3(2, 0, -2),
    new THREE.Vector3(-2, 0, 2),
    new THREE.Vector3(2, 0, 2),
    new THREE.Vector3(0, 0, -3),
    new THREE.Vector3(0, 0, 3),
    new THREE.Vector3(-3, 0, 0),
  ],
  forge: [
    new THREE.Vector3(9, 0, -9),
    new THREE.Vector3(11, 0, -10),
    new THREE.Vector3(10, 0, -11),
  ],
  scriptorium: [
    new THREE.Vector3(9, 0, 9),
    new THREE.Vector3(11, 0, 10),
    new THREE.Vector3(10, 0, 11),
  ],
  apothecary: [
    new THREE.Vector3(-9, 0, 9),
    new THREE.Vector3(-11, 0, 10),
    new THREE.Vector3(-10, 0, 11),
  ],
  enchanting: [
    new THREE.Vector3(-9, 0, -9),
    new THREE.Vector3(-11, 0, -10),
    new THREE.Vector3(-10, 0, -11),
  ],
  summonStone: [
    new THREE.Vector3(-2, 0, 13),
    new THREE.Vector3(2, 0, 13),
    new THREE.Vector3(-3, 0, 14),
    new THREE.Vector3(3, 0, 14),
  ],
};

// Track slot usage per zone
const zoneSlotCounters: Record<ZoneId, number> = {
  guildHall: 0, forge: 0, scriptorium: 0,
  apothecary: 0, enchanting: 0, summonStone: 0,
};

function getHealthColor(health: number): string {
  if (health > 0.6) return '#2ECC40';
  if (health > 0.3) return '#FF8C00';
  return '#CC0000';
}

function createNameplateTexture(agent: Agent): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Status icon
  const statusIcon = agent.waitingForInput ? '❓' : agent.isCompacting ? '🧪' : '';
  if (statusIcon) {
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(statusIcon, 128, 18);
  }

  // Circle avatar
  ctx.beginPath();
  ctx.arc(128, 42, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#1F2129';
  ctx.fill();
  ctx.strokeStyle = '#C79C6E';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Initial letter
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#EBC880';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(agent.wowName.charAt(0), 128, 43);

  // Name
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.textBaseline = 'top';
  ctx.fillText(agent.wowName, 128, 62);

  // Guild title
  ctx.font = '9px sans-serif';
  ctx.fillStyle = '#B87AFF';
  ctx.fillText(`<${agent.title}>`, 128, 76);

  // Health bar background
  ctx.fillStyle = '#1A0A0A';
  ctx.fillRect(88, 90, 80, 6);
  ctx.strokeStyle = '#3A2A1A';
  ctx.lineWidth = 1;
  ctx.strokeRect(88, 90, 80, 6);

  // Health bar fill
  ctx.fillStyle = getHealthColor(agent.contextHealth);
  ctx.fillRect(89, 91, Math.max(1, 78 * agent.contextHealth), 4);

  // Activity text
  ctx.font = 'italic 8px sans-serif';
  ctx.fillStyle = '#6B5A3A';
  const activity = agent.activity.length > 32 ? agent.activity.slice(0, 30) + '...' : agent.activity;
  ctx.fillText(activity, 128, 102);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

export class AgentSpriteManager {
  private sprites: Map<string, {
    sprite: THREE.Sprite;
    currentPos: THREE.Vector3;
    targetPos: THREE.Vector3;
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
        data.sprite.material.map?.dispose();
        (data.sprite.material as THREE.SpriteMaterial).dispose();
        this.sprites.delete(id);
      }
    }

    // Create or update sprites
    agents.forEach(agent => {
      const slotIdx = zoneSlotCounters[agent.zone]++;
      const slots = ZONE_POSITIONS[agent.zone];
      const targetPos = slots[slotIdx % slots.length].clone();
      targetPos.y = 2; // Float above ground

      let entry = this.sprites.get(agent.id);

      if (!entry) {
        // Create new sprite
        const texture = createNameplateTexture(agent);
        const mat = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(4, 2, 1);
        sprite.position.copy(targetPos);
        this.scene.add(sprite);
        entry = { sprite, currentPos: targetPos.clone(), targetPos };
        this.sprites.set(agent.id, entry);
      } else {
        // Update target position and texture
        entry.targetPos.copy(targetPos);
        // Regenerate texture (agent state may have changed)
        const oldTex = (entry.sprite.material as THREE.SpriteMaterial).map;
        oldTex?.dispose();
        (entry.sprite.material as THREE.SpriteMaterial).map = createNameplateTexture(agent);
      }

      // Lerp position
      entry.currentPos.lerp(entry.targetPos, Math.min(1, delta * 3));
      entry.sprite.position.copy(entry.currentPos);
    });
  }

  dispose(): void {
    for (const [, data] of this.sprites) {
      this.scene.remove(data.sprite);
      data.sprite.material.map?.dispose();
      (data.sprite.material as THREE.SpriteMaterial).dispose();
    }
    this.sprites.clear();
  }
}
