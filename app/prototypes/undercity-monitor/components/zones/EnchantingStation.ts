// app/prototypes/undercity-monitor/components/zones/EnchantingStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let enchantLight: THREE.PointLight;
let outerRuneRing: THREE.Mesh;
let innerRuneRing: THREE.Mesh;
const crystals: THREE.Mesh[] = [];

export function createEnchantingStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'EnchantingStation';
  group.position.set(-10, 0, -10); // NW quadrant

  // Platform with border
  const platGeo = new THREE.CylinderGeometry(4, 4.2, 0.4, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.2;
  plat.receiveShadow = true;
  group.add(plat);

  const borderGeo = new THREE.TorusGeometry(4, 0.2, 6, 8);
  const borderMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.9 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.55;
  group.add(border);

  // Altar pedestal — taller, more imposing
  const altarGeo = new THREE.CylinderGeometry(1, 1.3, 1.0, 8);
  const altarMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneDark,
    roughness: 0.7,
    metalness: 0.2,
  });
  const altar = new THREE.Mesh(altarGeo, altarMat);
  altar.position.y = 0.8;
  altar.castShadow = true;
  group.add(altar);

  // Double rune rings on altar surface
  const outerRuneGeo = new THREE.RingGeometry(0.5, 1.0, 32);
  const runeMat = new THREE.MeshStandardMaterial({
    color: WOW.enchantingPurple,
    emissive: WOW.enchantingPurple,
    emissiveIntensity: 1.5,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  outerRuneRing = new THREE.Mesh(outerRuneGeo, runeMat);
  outerRuneRing.rotation.x = -Math.PI / 2;
  outerRuneRing.position.y = 1.32;
  group.add(outerRuneRing);

  const innerRuneGeo = new THREE.RingGeometry(0.15, 0.4, 24);
  const innerRuneMat = new THREE.MeshStandardMaterial({
    color: WOW.runePurple,
    emissive: WOW.runePurple,
    emissiveIntensity: 2.0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  innerRuneRing = new THREE.Mesh(innerRuneGeo, innerRuneMat);
  innerRuneRing.rotation.x = -Math.PI / 2;
  innerRuneRing.position.y = 1.34;
  group.add(innerRuneRing);

  // Crystal formations around the altar
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x8844CC,
    emissive: WOW.enchantingPurple,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.7,
  });

  const crystalPositions = [
    [2, 0, 0], [-2, 0, 0], [0, 0, 2], [0, 0, -2],
    [1.5, 0, 1.5], [-1.5, 0, -1.5], [1.5, 0, -1.5], [-1.5, 0, 1.5],
  ];
  crystalPositions.forEach(([cx, _cy, cz], i) => {
    const height = 0.6 + Math.random() * 0.8;
    const radius = 0.08 + Math.random() * 0.06;
    const crystalGeo = new THREE.ConeGeometry(radius, height, 5);
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.set(cx, 0.4 + height / 2, cz);
    crystal.rotation.x = (Math.random() - 0.5) * 0.3;
    crystal.rotation.z = (Math.random() - 0.5) * 0.3;
    group.add(crystal);
    crystals.push(crystal);

    // Some crystals get a secondary smaller crystal beside them
    if (i % 3 === 0) {
      const smallHeight = height * 0.5;
      const smallGeo = new THREE.ConeGeometry(radius * 0.6, smallHeight, 5);
      const small = new THREE.Mesh(smallGeo, crystalMat);
      small.position.set(cx + 0.15, 0.4 + smallHeight / 2, cz + 0.1);
      small.rotation.z = 0.3;
      group.add(small);
    }
  });

  // Purple candles at corners
  const purpleFlameMat = new THREE.MeshStandardMaterial({
    color: WOW.enchantingPurple,
    emissive: WOW.enchantingPurple,
    emissiveIntensity: 3.0,
  });
  [[-2.5, -2.5], [-2.5, 2.5], [2.5, -2.5], [2.5, 2.5]].forEach(([x, z]) => {
    const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 6);
    const candle = new THREE.Mesh(candleGeo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
    candle.position.set(x, 0.55, z);
    group.add(candle);

    const flameGeo = new THREE.SphereGeometry(0.06, 6, 4);
    const flame = new THREE.Mesh(flameGeo, purpleFlameMat);
    flame.position.set(x, 0.78, z);
    group.add(flame);

    // Small light per candle
    const candleLight = new THREE.PointLight(WOW.enchantingPurple, 1.2, 6, 2);
    candleLight.position.set(x, 1.0, z);
    group.add(candleLight);
  });

  // Purple PointLight — brighter
  enchantLight = new THREE.PointLight(WOW.enchantingPurple, 4.0, 18, 2);
  enchantLight.position.set(0, 3.5, 0);
  enchantLight.castShadow = true;
  enchantLight.shadow.mapSize.set(256, 256);
  group.add(enchantLight);

  return group;
}

export function updateEnchantingStation(delta: number, elapsed: number): void {
  // Slow pulse
  enchantLight.intensity = 3.5 + Math.sin(elapsed * Math.PI) * 0.8;

  // Rotate rune rings in opposite directions
  if (outerRuneRing) outerRuneRing.rotation.z += delta * 0.3;
  if (innerRuneRing) innerRuneRing.rotation.z -= delta * 0.5;

  // Pulse crystal emissive
  crystals.forEach((crystal, i) => {
    const mat = crystal.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.8 + Math.sin(elapsed * 2 + i * 0.8) * 0.5;
  });
}
