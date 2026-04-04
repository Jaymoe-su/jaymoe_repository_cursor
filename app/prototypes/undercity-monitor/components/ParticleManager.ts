// app/prototypes/undercity-monitor/components/ParticleManager.ts

import * as THREE from 'three';
import { WOW } from '../lib/wowPalette';

interface ParticleSystem {
  points: THREE.Points;
  velocities: Float32Array;
  update: (delta: number, elapsed: number) => void;
}

function createSystem(
  count: number,
  color: number,
  size: number,
  origin: THREE.Vector3,
  spread: THREE.Vector3,
  updateFn: (positions: THREE.BufferAttribute, velocities: Float32Array, delta: number, elapsed: number, origin: THREE.Vector3, spread: THREE.Vector3) => void
): ParticleSystem {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = origin.x + (Math.random() - 0.5) * spread.x;
    positions[i * 3 + 1] = origin.y + Math.random() * spread.y;
    positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * spread.z;
    velocities[i * 3] = (Math.random() - 0.5) * 0.5;
    velocities[i * 3 + 1] = Math.random() * 0.5 + 0.2;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);

  return {
    points,
    velocities,
    update(delta, elapsed) {
      const pos = points.geometry.attributes.position as THREE.BufferAttribute;
      updateFn(pos, velocities, delta, elapsed, origin, spread);
      pos.needsUpdate = true;
    },
  };
}

export class ParticleManager {
  private systems: ParticleSystem[] = [];
  private scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.init();
  }

  private init() {
    // Forge sparks — burst upward, fast, fade
    const forgeSparks = createSystem(
      40, WOW.forgeOrange, 0.08,
      new THREE.Vector3(10, 1, -10),
      new THREE.Vector3(2, 0, 2),
      (pos, vel, delta) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + vel[i * 3 + 1] * delta * 3;
          let x = pos.getX(i) + vel[i * 3] * delta;
          let z = pos.getZ(i) + vel[i * 3 + 2] * delta;
          if (y > 4) {
            y = 1 + Math.random() * 0.5;
            x = 10 + (Math.random() - 0.5) * 2;
            z = -10 + (Math.random() - 0.5) * 2;
          }
          pos.setXYZ(i, x, y, z);
        }
      }
    );
    this.addSystem(forgeSparks);

    // Slime canal bubbles — rise slowly from canal surface
    const slimeBubbles = createSystem(
      30, WOW.slimeGreen, 0.06,
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(30, 0, 0.5),
      (pos, _vel, delta) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.15;
          if (y > 0.4) {
            y = 0.05;
            pos.setX(i, (Math.random() - 0.5) * 30);
            pos.setZ(i, (Math.random() - 0.5) * 0.5);
          }
          pos.setY(i, y);
        }
      }
    );
    this.addSystem(slimeBubbles);

    // Apothecary steam — rise from cauldron, drift and fade
    const apothSteam = createSystem(
      25, WOW.apothecaryGreen, 0.1,
      new THREE.Vector3(-10, 1.5, 10),
      new THREE.Vector3(1, 0, 1),
      (pos, _vel, delta, elapsed) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.4;
          let x = pos.getX(i) + Math.sin(elapsed + i) * delta * 0.15;
          if (y > 4) {
            y = 1.5;
            x = -10 + (Math.random() - 0.5);
            pos.setZ(i, 10 + (Math.random() - 0.5));
          }
          pos.setXY(i, x, y);
        }
      }
    );
    this.addSystem(apothSteam);

    // Enchanting arcane motes — orbit altar slowly
    const enchantMotes = createSystem(
      20, WOW.enchantingPurple, 0.07,
      new THREE.Vector3(-10, 2, -10),
      new THREE.Vector3(3, 1, 3),
      (pos, _vel, _delta, elapsed, origin) => {
        for (let i = 0; i < pos.count; i++) {
          const angle = elapsed * 0.5 + i * (Math.PI * 2 / 20);
          const radius = 1.5 + Math.sin(elapsed * 0.3 + i) * 0.5;
          pos.setX(i, origin.x + Math.cos(angle) * radius);
          pos.setZ(i, origin.z + Math.sin(angle) * radius);
          pos.setY(i, origin.y + Math.sin(elapsed + i * 0.7) * 0.5);
        }
      }
    );
    this.addSystem(enchantMotes);
  }

  private addSystem(system: ParticleSystem) {
    this.systems.push(system);
    this.scene.add(system.points);
  }

  update(delta: number, elapsed: number) {
    this.systems.forEach(s => s.update(delta, elapsed));
  }

  dispose() {
    this.systems.forEach(s => {
      this.scene.remove(s.points);
      s.points.geometry.dispose();
      (s.points.material as THREE.PointsMaterial).dispose();
    });
  }
}
