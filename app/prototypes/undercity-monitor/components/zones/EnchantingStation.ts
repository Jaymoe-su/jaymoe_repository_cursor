// app/prototypes/undercity-monitor/components/zones/EnchantingStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let enchantLight: THREE.PointLight;
let runeRing: THREE.Mesh;

export function createEnchantingStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'EnchantingStation';
  group.position.set(-10, 0, -10); // NW quadrant

  // Platform
  const platGeo = new THREE.CylinderGeometry(4, 4, 0.3, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.15;
  plat.receiveShadow = true;
  group.add(plat);

  // Altar pedestal
  const altarGeo = new THREE.CylinderGeometry(1, 1.2, 0.8, 8);
  const altarMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneDark,
    roughness: 0.7,
    metalness: 0.2,
  });
  const altar = new THREE.Mesh(altarGeo, altarMat);
  altar.position.y = 0.7;
  altar.castShadow = true;
  group.add(altar);

  // Runic disc on altar surface (emissive purple ring)
  const runeGeo = new THREE.RingGeometry(0.4, 0.9, 24);
  const runeMat = new THREE.MeshStandardMaterial({
    color: WOW.enchantingPurple,
    emissive: WOW.enchantingPurple,
    emissiveIntensity: 0.6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });
  runeRing = new THREE.Mesh(runeGeo, runeMat);
  runeRing.rotation.x = -Math.PI / 2;
  runeRing.position.y = 1.12;
  group.add(runeRing);

  // Purple candles
  const purpleFlameMat = new THREE.MeshStandardMaterial({
    color: WOW.enchantingPurple,
    emissive: WOW.enchantingPurple,
    emissiveIntensity: 1.5,
  });
  [[-1.5, -1.5], [-1.5, 1.5], [1.5, -1.5], [1.5, 1.5]].forEach(([x, z]) => {
    const candleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    const candle = new THREE.Mesh(candleGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    candle.position.set(x, 0.45, z);
    group.add(candle);
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), purpleFlameMat);
    flame.position.set(x, 0.65, z);
    group.add(flame);
  });

  // Purple PointLight
  enchantLight = new THREE.PointLight(WOW.enchantingPurple, 1.5, 12, 2);
  enchantLight.position.set(0, 3, 0);
  enchantLight.castShadow = true;
  enchantLight.shadow.mapSize.set(256, 256);
  group.add(enchantLight);

  return group;
}

export function updateEnchantingStation(delta: number, elapsed: number): void {
  // Slow pulse (2s sine)
  enchantLight.intensity = 1.2 + Math.sin(elapsed * Math.PI) * 0.4;
  // Rotate rune ring
  if (runeRing) runeRing.rotation.z += delta * 0.3;
}
