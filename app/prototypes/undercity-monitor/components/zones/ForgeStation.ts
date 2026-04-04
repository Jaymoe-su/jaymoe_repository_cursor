// app/prototypes/undercity-monitor/components/zones/ForgeStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let forgeLight: THREE.PointLight;

export function createForgeStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ForgeStation';
  group.position.set(10, 0, -10); // NE quadrant

  // Platform with border wall
  const platGeo = new THREE.CylinderGeometry(4, 4.2, 0.4, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.2;
  plat.receiveShadow = true;
  group.add(plat);

  // Border wall
  const borderGeo = new THREE.TorusGeometry(4, 0.2, 6, 8);
  const borderMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.9 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.55;
  group.add(border);

  // Forge dome (half-sphere brick structure)
  const forgeGeo = new THREE.SphereGeometry(1.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const forgeMat = new THREE.MeshStandardMaterial({
    color: 0x662211,
    roughness: 0.8,
    metalness: 0.1,
  });
  const forge = new THREE.Mesh(forgeGeo, forgeMat);
  forge.position.set(0, 0.4, -1);
  forge.castShadow = true;
  group.add(forge);

  // Chimney stack on dome
  const chimneyGeo = new THREE.CylinderGeometry(0.25, 0.3, 1.5, 8);
  const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x552211, roughness: 0.85 });
  const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
  chimney.position.set(0, 2, -1);
  chimney.castShadow = true;
  group.add(chimney);

  // Fire inside forge (emissive orange)
  const fireGeo = new THREE.BoxGeometry(1.0, 0.6, 0.5);
  const fireMat = new THREE.MeshStandardMaterial({
    color: WOW.forgeOrange,
    emissive: WOW.forgeOrange,
    emissiveIntensity: 2.0,
  });
  const fire = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.6, -0.3);
  group.add(fire);

  // Anvil — more detailed
  const anvilBaseGeo = new THREE.BoxGeometry(0.7, 0.35, 0.5);
  const anvilMat = new THREE.MeshStandardMaterial({
    color: 0x262630,
    roughness: 0.3,
    metalness: 0.8,
  });
  const anvilBase = new THREE.Mesh(anvilBaseGeo, anvilMat);
  anvilBase.position.set(1.4, 0.6, 0);
  anvilBase.castShadow = true;
  group.add(anvilBase);

  // Anvil horn
  const hornGeo = new THREE.ConeGeometry(0.12, 0.4, 6);
  const horn = new THREE.Mesh(hornGeo, anvilMat);
  horn.rotation.z = Math.PI / 2;
  horn.position.set(1.8, 0.75, 0);
  group.add(horn);

  // Anvil stump (wood block)
  const stumpGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.4, 6);
  const stumpMat = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.9 });
  const stump = new THREE.Mesh(stumpGeo, stumpMat);
  stump.position.set(1.4, 0.35, 0);
  group.add(stump);

  // Bellows
  const bellowsGeo = new THREE.BoxGeometry(0.6, 0.3, 0.8);
  const bellowsMat = new THREE.MeshStandardMaterial({ color: 0x5A3818, roughness: 0.7 });
  const bellows = new THREE.Mesh(bellowsGeo, bellowsMat);
  bellows.position.set(-1.5, 0.5, -0.5);
  group.add(bellows);

  // Tool rack (tall thin frame)
  const rackGeo = new THREE.BoxGeometry(0.08, 1.8, 1.2);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x3A2510 });
  const rack = new THREE.Mesh(rackGeo, rackMat);
  rack.position.set(2.5, 1.1, -1);
  group.add(rack);

  // Tools on rack (small colored bars)
  const toolColors = [0x888899, 0x666677, 0x999988];
  toolColors.forEach((color, i) => {
    const toolGeo = new THREE.BoxGeometry(0.04, 0.5, 0.06);
    const toolMat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
    const tool = new THREE.Mesh(toolGeo, toolMat);
    tool.position.set(2.5, 1.0 + i * 0.25, -0.6 + i * 0.3);
    tool.rotation.z = 0.1 * (i - 1);
    group.add(tool);
  });

  // Water quench trough
  const troughGeo = new THREE.BoxGeometry(1.2, 0.3, 0.5);
  const troughMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.85 });
  const trough = new THREE.Mesh(troughGeo, troughMat);
  trough.position.set(-0.5, 0.45, 1.5);
  group.add(trough);

  // Water surface
  const waterGeo = new THREE.PlaneGeometry(1.0, 0.35);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x2244AA,
    transparent: true,
    opacity: 0.5,
    roughness: 0.1,
  });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(-0.5, 0.6, 1.5);
  group.add(water);

  // Orange PointLight — brighter
  forgeLight = new THREE.PointLight(WOW.forgeOrange, 3, 18, 2);
  forgeLight.position.set(0, 3, -1);
  forgeLight.castShadow = true;
  forgeLight.shadow.mapSize.set(256, 256);
  group.add(forgeLight);

  return group;
}

export function updateForgeStation(delta: number, elapsed: number): void {
  // Flickering forge light (noise-like)
  forgeLight.intensity = 2.5 + Math.sin(elapsed * 8) * 0.4 + Math.sin(elapsed * 13) * 0.2 + Math.random() * 0.15;
}
