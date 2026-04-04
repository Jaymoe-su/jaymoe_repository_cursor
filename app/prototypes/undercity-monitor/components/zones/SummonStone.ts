// app/prototypes/undercity-monitor/components/zones/SummonStone.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let portalRings: THREE.Mesh[] = [];
let stoneLight: THREE.PointLight;
let motes: THREE.Points;

export function createSummonStone(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SummonStone';
  group.position.set(0, 0, 14); // South entrance

  // Flagstone platform
  const platGeo = new THREE.CylinderGeometry(3, 3, 0.15, 16);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.075;
  plat.receiveShadow = true;
  group.add(plat);

  // Stone pillar (tapered cylinder, dark grey-blue)
  const pillarGeo = new THREE.CylinderGeometry(0.5, 0.6, 2, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneBase,
    roughness: 0.8,
    metalness: 0.05,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.15;
  pillar.castShadow = true;
  group.add(pillar);

  // Rune lines on pillar (emissive torus segments wrapping around)
  for (let i = 0; i < 5; i++) {
    const runeGeo = new THREE.TorusGeometry(0.55 - i * 0.01, 0.03, 4, 12, Math.PI * 1.5);
    const runeMat = new THREE.MeshStandardMaterial({
      color: WOW.runeBlue,
      emissive: WOW.runeBlue,
      emissiveIntensity: 0.5 + Math.random() * 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.y = 0.5 + i * 0.35;
    rune.rotation.y = i * 0.8; // spiral offset
    group.add(rune);
  }

  // Pillar cap
  const capGeo = new THREE.CylinderGeometry(0.55, 0.5, 0.15, 8);
  const capMat = new THREE.MeshStandardMaterial({ color: WOW.stoneLight });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 2.2;
  group.add(cap);

  // Portal disc — concentric rings above the stone
  const ringRadii = [1.2, 0.85, 0.5];
  const ringWidths = [0.06, 0.08, 0.1];
  portalRings = ringRadii.map((radius, i) => {
    const geo = new THREE.TorusGeometry(radius, ringWidths[i], 8, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: i === 2 ? WOW.portalCenter : WOW.portalMid,
      emissive: i === 2 ? WOW.portalCenter : WOW.portalEdge,
      emissiveIntensity: 0.6 + i * 0.2,
      transparent: true,
      opacity: 0.6 + i * 0.1,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.y = 3.5;
    ring.rotation.x = Math.PI / 2; // face upward (vertical disc)
    group.add(ring);
    return ring;
  });

  // Portal core glow (bright center)
  const coreGeo = new THREE.SphereGeometry(0.25, 12, 8);
  const coreMat = new THREE.MeshStandardMaterial({
    color: WOW.portalCenter,
    emissive: WOW.portalCenter,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.5,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 3.5;
  group.add(core);

  // Particle motes drifting from stone to portal
  const moteCount = 30;
  const moteGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1.5;
    positions[i * 3 + 1] = 2 + Math.random() * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: WOW.runeWhite,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  motes = new THREE.Points(moteGeo, moteMat);
  group.add(motes);

  // Blue-purple PointLight
  stoneLight = new THREE.PointLight(WOW.summonBlue, 1.5, 15, 2);
  stoneLight.position.set(0, 3.5, 0);
  stoneLight.castShadow = true;
  stoneLight.shadow.mapSize.set(256, 256);
  group.add(stoneLight);

  return group;
}

export function updateSummonStone(delta: number, elapsed: number): void {
  // Rotate portal rings at different speeds
  portalRings.forEach((ring, i) => {
    ring.rotation.z += delta * (0.3 + i * 0.2) * (i % 2 === 0 ? 1 : -1);
  });

  // Pulse stone light
  stoneLight.intensity = 1.3 + Math.sin(elapsed * 1.5) * 0.3;

  // Drift motes upward, reset when they reach the portal
  if (motes) {
    const pos = motes.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + delta * (0.3 + Math.random() * 0.2);
      if (y > 4) y = 2 + Math.random() * 0.5;
      pos.setY(i, y);
      // Slight horizontal drift
      pos.setX(i, pos.getX(i) + Math.sin(elapsed + i) * delta * 0.1);
    }
    (pos as THREE.BufferAttribute).needsUpdate = true;
  }
}
