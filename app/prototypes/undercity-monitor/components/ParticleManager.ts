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
  opacity: number,
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
    opacity,
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
    // Forge sparks — brighter, more numerous
    const forgeSparks = createSystem(
      80, WOW.forgeOrange, 0.18,
      new THREE.Vector3(10, 1, -10),
      new THREE.Vector3(2.5, 0, 2.5),
      0.8,
      (pos, vel, delta) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + vel[i * 3 + 1] * delta * 4;
          let x = pos.getX(i) + vel[i * 3] * delta * 1.5;
          let z = pos.getZ(i) + vel[i * 3 + 2] * delta * 1.5;
          // Gravity
          vel[i * 3 + 1] -= delta * 0.5;
          if (y > 5 || y < 0.5) {
            y = 1 + Math.random() * 0.5;
            x = 10 + (Math.random() - 0.5) * 2;
            z = -10 + (Math.random() - 0.5) * 2;
            vel[i * 3 + 1] = Math.random() * 0.8 + 0.4;
            vel[i * 3] = (Math.random() - 0.5) * 0.6;
            vel[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
          }
          pos.setXYZ(i, x, y, z);
        }
      }
    );
    this.addSystem(forgeSparks);

    // Torch fire particles at guild hall (4 torch positions)
    const torchPositions = [
      new THREE.Vector3(4.5, 2.5, 0),
      new THREE.Vector3(-4.5, 2.5, 0),
      new THREE.Vector3(0, 2.5, 4.5),
      new THREE.Vector3(0, 2.5, -4.5),
    ];
    torchPositions.forEach(tPos => {
      const torchFire = createSystem(
        15, WOW.forgeOrange, 0.12,
        tPos,
        new THREE.Vector3(0.3, 0, 0.3),
        0.7,
        (pos, _vel, delta, elapsed, origin) => {
          for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i) + delta * (0.5 + Math.random() * 0.3);
            let x = pos.getX(i) + Math.sin(elapsed * 6 + i) * delta * 0.15;
            if (y > origin.y + 0.8) {
              y = origin.y + Math.random() * 0.1;
              x = origin.x + (Math.random() - 0.5) * 0.2;
              pos.setZ(i, origin.z + (Math.random() - 0.5) * 0.2);
            }
            pos.setXY(i, x, y);
          }
        }
      );
      this.addSystem(torchFire);
    });

    // Slime canal bubbles — more particles, wider spread
    const slimeBubblesH = createSystem(
      50, WOW.slimeGreen, 0.18,
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(40, 0, 1.5),
      0.85,
      (pos, _vel, delta) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.2;
          if (y > 0.5) {
            y = 0.05;
            pos.setX(i, (Math.random() - 0.5) * 40);
            pos.setZ(i, (Math.random() - 0.5) * 1.5);
          }
          pos.setY(i, y);
        }
      }
    );
    this.addSystem(slimeBubblesH);

    const slimeBubblesV = createSystem(
      50, WOW.slimeGreen, 0.18,
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(1.5, 0, 40),
      0.85,
      (pos, _vel, delta) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.2;
          if (y > 0.5) {
            y = 0.05;
            pos.setX(i, (Math.random() - 0.5) * 1.5);
            pos.setZ(i, (Math.random() - 0.5) * 40);
          }
          pos.setY(i, y);
        }
      }
    );
    this.addSystem(slimeBubblesV);

    // Apothecary steam — more particles
    const apothSteam = createSystem(
      50, WOW.apothecaryGreen, 0.2,
      new THREE.Vector3(-10, 1.5, 10),
      new THREE.Vector3(1.2, 0, 1.2),
      0.5,
      (pos, _vel, delta, elapsed) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.5;
          let x = pos.getX(i) + Math.sin(elapsed + i * 0.5) * delta * 0.2;
          let z = pos.getZ(i) + Math.cos(elapsed * 0.7 + i * 0.3) * delta * 0.15;
          if (y > 4.5) {
            y = 1.5;
            x = -10 + (Math.random() - 0.5);
            z = 10 + (Math.random() - 0.5);
          }
          pos.setXYZ(i, x, y, z);
        }
      }
    );
    this.addSystem(apothSteam);

    // Enchanting arcane motes — more motes, dual orbit
    const enchantMotes = createSystem(
      40, WOW.enchantingPurple, 0.18,
      new THREE.Vector3(-10, 2, -10),
      new THREE.Vector3(3, 1.5, 3),
      0.8,
      (pos, _vel, _delta, elapsed, origin) => {
        for (let i = 0; i < pos.count; i++) {
          const speed = i < 20 ? 0.5 : -0.35;
          const angle = elapsed * speed + i * (Math.PI * 2 / 20);
          const radius = 1.5 + Math.sin(elapsed * 0.3 + i) * 0.8;
          pos.setX(i, origin.x + Math.cos(angle) * radius);
          pos.setZ(i, origin.z + Math.sin(angle) * radius);
          pos.setY(i, origin.y + Math.sin(elapsed * 0.8 + i * 0.7) * 0.7);
        }
      }
    );
    this.addSystem(enchantMotes);

    // Ambient dust motes — floating everywhere, very subtle
    const dustMotes = createSystem(
      120, 0x555566, 0.08,
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(40, 4, 40),
      0.2,
      (pos, _vel, delta, elapsed) => {
        for (let i = 0; i < pos.count; i++) {
          // Very slow drift
          let y = pos.getY(i) + Math.sin(elapsed * 0.2 + i * 0.1) * delta * 0.08;
          let x = pos.getX(i) + Math.sin(elapsed * 0.15 + i * 0.3) * delta * 0.05;
          let z = pos.getZ(i) + Math.cos(elapsed * 0.1 + i * 0.2) * delta * 0.05;

          // Keep within bounds
          if (Math.abs(x) > 22) x = (Math.random() - 0.5) * 40;
          if (Math.abs(z) > 22) z = (Math.random() - 0.5) * 40;
          if (y < 0.5 || y > 5) y = 1 + Math.random() * 3;

          pos.setXYZ(i, x, y, z);
        }
      }
    );
    this.addSystem(dustMotes);

    // Chimney smoke from forge
    const chimneySmoke = createSystem(
      25, 0x444455, 0.15,
      new THREE.Vector3(10, 3, -11),
      new THREE.Vector3(0.5, 0, 0.5),
      0.3,
      (pos, _vel, delta, elapsed) => {
        for (let i = 0; i < pos.count; i++) {
          let y = pos.getY(i) + delta * 0.6;
          let x = pos.getX(i) + Math.sin(elapsed * 0.5 + i) * delta * 0.1;
          if (y > 7) {
            y = 3 + Math.random() * 0.3;
            x = 10 + (Math.random() - 0.5) * 0.4;
            pos.setZ(i, -11 + (Math.random() - 0.5) * 0.4);
          }
          pos.setXY(i, x, y);
        }
      }
    );
    this.addSystem(chimneySmoke);
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
