// app/prototypes/undercity-monitor/components/zones/SummonStone.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let portalRings: THREE.Mesh[] = [];
let portalDisc: THREE.Mesh;
let groundRuneRing: THREE.Mesh;
let stoneLight: THREE.PointLight;
let motes: THREE.Points;

export function createSummonStone(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SummonStone';
  group.position.set(0, 0, 14); // South entrance

  // Flagstone platform
  const platGeo = new THREE.CylinderGeometry(3.5, 3.7, 0.2, 16);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.1;
  plat.receiveShadow = true;
  group.add(plat);

  // Ground rune circle beneath the stone
  const groundRuneGeo = new THREE.RingGeometry(1.5, 2.5, 32);
  const groundRuneMat = new THREE.MeshStandardMaterial({
    color: WOW.runeBlue,
    emissive: WOW.runeBlue,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  groundRuneRing = new THREE.Mesh(groundRuneGeo, groundRuneMat);
  groundRuneRing.rotation.x = -Math.PI / 2;
  groundRuneRing.position.y = 0.22;
  group.add(groundRuneRing);

  // Inner ground rune
  const innerGroundRuneGeo = new THREE.RingGeometry(0.8, 1.2, 24);
  const innerGroundRune = new THREE.Mesh(innerGroundRuneGeo, groundRuneMat);
  innerGroundRune.rotation.x = -Math.PI / 2;
  innerGroundRune.position.y = 0.23;
  group.add(innerGroundRune);

  // Stone pillar (tapered cylinder, dark grey-blue) — taller
  const pillarGeo = new THREE.CylinderGeometry(0.5, 0.65, 2.5, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneBase,
    roughness: 0.8,
    metalness: 0.05,
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 1.35;
  pillar.castShadow = true;
  group.add(pillar);

  // Rune lines on pillar (emissive torus segments wrapping around)
  for (let i = 0; i < 6; i++) {
    const runeGeo = new THREE.TorusGeometry(0.55 - i * 0.008, 0.04, 4, 16, Math.PI * 1.5);
    const runeMat = new THREE.MeshStandardMaterial({
      color: WOW.runeBlue,
      emissive: WOW.runeBlue,
      emissiveIntensity: 0.6 + Math.random() * 0.4,
      transparent: true,
      opacity: 0.8,
    });
    const rune = new THREE.Mesh(runeGeo, runeMat);
    rune.position.y = 0.5 + i * 0.35;
    rune.rotation.y = i * 0.9; // spiral offset
    group.add(rune);
  }

  // Pillar cap
  const capGeo = new THREE.CylinderGeometry(0.55, 0.5, 0.2, 8);
  const capMat = new THREE.MeshStandardMaterial({ color: WOW.stoneLight });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.y = 2.65;
  group.add(cap);

  // Portal disc — filled translucent disc, not just rings
  const discGeo = new THREE.CircleGeometry(1.3, 32);
  const discMat = new THREE.MeshStandardMaterial({
    color: WOW.portalMid,
    emissive: WOW.portalEdge,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  portalDisc = new THREE.Mesh(discGeo, discMat);
  portalDisc.position.y = 3.8;
  portalDisc.rotation.x = Math.PI / 2;
  group.add(portalDisc);

  // Concentric rings on top of the disc
  const ringRadii = [1.3, 0.95, 0.6];
  const ringWidths = [0.07, 0.09, 0.12];
  portalRings = ringRadii.map((radius, i) => {
    const geo = new THREE.TorusGeometry(radius, ringWidths[i], 8, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: i === 2 ? WOW.portalCenter : WOW.portalMid,
      emissive: i === 2 ? WOW.portalCenter : WOW.portalEdge,
      emissiveIntensity: 0.8 + i * 0.3,
      transparent: true,
      opacity: 0.7 + i * 0.1,
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.y = 3.8;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    return ring;
  });

  // Portal core glow (brighter center)
  const coreGeo = new THREE.SphereGeometry(0.3, 12, 8);
  const coreMat = new THREE.MeshStandardMaterial({
    color: WOW.portalCenter,
    emissive: WOW.portalCenter,
    emissiveIntensity: 2.0,
    transparent: true,
    opacity: 0.6,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 3.8;
  group.add(core);

  // Flanking pillars (smaller, at the sides)
  const flankGeo = new THREE.CylinderGeometry(0.2, 0.25, 1.5, 6);
  const flankMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.85 });
  [[-2, 0], [2, 0]].forEach(([x, z]) => {
    const flank = new THREE.Mesh(flankGeo, flankMat);
    flank.position.set(x, 0.85, z);
    flank.castShadow = true;
    group.add(flank);

    // Small rune glow on flanking pillars
    const flankRuneGeo = new THREE.TorusGeometry(0.22, 0.02, 4, 12);
    const flankRuneMat = new THREE.MeshStandardMaterial({
      color: WOW.runeBlue,
      emissive: WOW.runeBlue,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const flankRune = new THREE.Mesh(flankRuneGeo, flankRuneMat);
    flankRune.position.set(x, 1.2, z);
    group.add(flankRune);
  });

  // Particle motes drifting from stone to portal — more motes
  const moteCount = 50;
  const moteGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = 1.5 + Math.random() * 3;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
  }
  moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: WOW.runeWhite,
    size: 0.1,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  motes = new THREE.Points(moteGeo, moteMat);
  group.add(motes);

  // Blue-purple PointLight — brighter
  stoneLight = new THREE.PointLight(WOW.summonBlue, 2.5, 18, 2);
  stoneLight.position.set(0, 3.8, 0);
  stoneLight.castShadow = true;
  stoneLight.shadow.mapSize.set(256, 256);
  group.add(stoneLight);

  return group;
}

export function updateSummonStone(delta: number, elapsed: number): void {
  // Rotate portal rings at different speeds
  portalRings.forEach((ring, i) => {
    ring.rotation.z += delta * (0.4 + i * 0.25) * (i % 2 === 0 ? 1 : -1);
  });

  // Rotate portal disc slowly
  if (portalDisc) {
    portalDisc.rotation.z += delta * 0.15;
    const discMat = portalDisc.material as THREE.MeshStandardMaterial;
    discMat.opacity = 0.3 + Math.sin(elapsed * 1.2) * 0.1;
  }

  // Rotate ground rune
  if (groundRuneRing) {
    groundRuneRing.rotation.z -= delta * 0.2;
    const gMat = groundRuneRing.material as THREE.MeshStandardMaterial;
    gMat.emissiveIntensity = 0.3 + Math.sin(elapsed * 1.5) * 0.15;
  }

  // Pulse stone light
  stoneLight.intensity = 2.0 + Math.sin(elapsed * 1.5) * 0.5;

  // Drift motes upward, reset when they reach the portal
  if (motes) {
    const pos = motes.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + delta * (0.4 + Math.random() * 0.3);
      if (y > 4.5) y = 1.5 + Math.random() * 0.5;
      pos.setY(i, y);
      // Spiral inward as they rise
      const angle = elapsed * 0.5 + i * 0.3;
      const currentX = pos.getX(i);
      const currentZ = pos.getZ(i);
      const dist = Math.sqrt(currentX * currentX + currentZ * currentZ);
      if (dist > 0.1) {
        pos.setX(i, currentX * 0.998 + Math.sin(angle) * delta * 0.05);
        pos.setZ(i, currentZ * 0.998 + Math.cos(angle) * delta * 0.05);
      } else {
        // Reset to outer edge
        const resetAngle = Math.random() * Math.PI * 2;
        pos.setX(i, Math.cos(resetAngle) * (0.8 + Math.random() * 0.7));
        pos.setZ(i, Math.sin(resetAngle) * (0.8 + Math.random() * 0.7));
      }
    }
    (pos as THREE.BufferAttribute).needsUpdate = true;
  }
}
