// app/prototypes/undercity-monitor/components/zones/ForgeStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let forgeLight: THREE.PointLight;

export function createForgeStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ForgeStation';
  group.position.set(10, 0, -10); // NE quadrant

  // Platform
  const platGeo = new THREE.CylinderGeometry(4, 4, 0.3, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.15;
  plat.receiveShadow = true;
  group.add(plat);

  // Forge dome (half-sphere brick structure)
  const forgeGeo = new THREE.SphereGeometry(1.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const forgeMat = new THREE.MeshStandardMaterial({
    color: 0x662211,
    roughness: 0.8,
    metalness: 0.1,
  });
  const forge = new THREE.Mesh(forgeGeo, forgeMat);
  forge.position.set(0, 0.3, -1);
  forge.castShadow = true;
  group.add(forge);

  // Fire inside forge (emissive orange box)
  const fireGeo = new THREE.BoxGeometry(0.8, 0.5, 0.4);
  const fireMat = new THREE.MeshStandardMaterial({
    color: WOW.forgeOrange,
    emissive: WOW.forgeOrange,
    emissiveIntensity: 1.5,
  });
  const fire = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.5, -0.4);
  group.add(fire);

  // Anvil
  const anvilGeo = new THREE.BoxGeometry(0.6, 0.5, 0.4);
  const anvilMat = new THREE.MeshStandardMaterial({
    color: 0x262630,
    roughness: 0.4,
    metalness: 0.7,
  });
  const anvil = new THREE.Mesh(anvilGeo, anvilMat);
  anvil.position.set(1.2, 0.55, 0);
  anvil.castShadow = true;
  group.add(anvil);

  // Anvil stump
  const stumpGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.3, 6);
  const stumpMat = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9 });
  const stump = new THREE.Mesh(stumpGeo, stumpMat);
  stump.position.set(1.2, 0.3, 0);
  group.add(stump);

  // Orange PointLight
  forgeLight = new THREE.PointLight(WOW.forgeOrange, 2, 15, 2);
  forgeLight.position.set(0, 2.5, -1);
  forgeLight.castShadow = true;
  forgeLight.shadow.mapSize.set(256, 256);
  group.add(forgeLight);

  return group;
}

export function updateForgeStation(delta: number, elapsed: number): void {
  // Flickering forge light (noise-like)
  forgeLight.intensity = 1.8 + Math.sin(elapsed * 8) * 0.3 + Math.sin(elapsed * 13) * 0.15 + Math.random() * 0.1;
}
