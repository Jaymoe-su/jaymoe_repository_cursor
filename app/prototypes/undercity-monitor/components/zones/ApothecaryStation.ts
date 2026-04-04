// app/prototypes/undercity-monitor/components/zones/ApothecaryStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let cauldronLight: THREE.PointLight;
let brewMat: THREE.MeshStandardMaterial;

export function createApothecaryStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ApothecaryStation';
  group.position.set(-10, 0, 10); // SW quadrant

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

  // Cauldron body (open-top cylinder) — slightly larger
  const cauldronGeo = new THREE.CylinderGeometry(1.0, 0.8, 1.1, 16, 1, true);
  const cauldronMat = new THREE.MeshStandardMaterial({
    color: 0x1F1F22,
    roughness: 0.4,
    metalness: 0.7,
    side: THREE.DoubleSide,
  });
  const cauldron = new THREE.Mesh(cauldronGeo, cauldronMat);
  cauldron.position.set(0, 0.9, 0);
  cauldron.castShadow = true;
  group.add(cauldron);

  // Cauldron rim
  const rimGeo = new THREE.TorusGeometry(1.0, 0.06, 8, 16);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x333340, metalness: 0.7, roughness: 0.3 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = -Math.PI / 2;
  rim.position.set(0, 1.45, 0);
  group.add(rim);

  // Tripod legs (3 legs supporting cauldron)
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 4);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x333340, metalness: 0.6 });
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(Math.cos(angle) * 0.6, 0.5, Math.sin(angle) * 0.6);
    leg.rotation.x = Math.sin(angle) * 0.2;
    leg.rotation.z = -Math.cos(angle) * 0.2;
    group.add(leg);
  }

  // Brew surface (glowing green disc inside cauldron)
  const brewGeo = new THREE.CircleGeometry(0.95, 16);
  brewMat = new THREE.MeshStandardMaterial({
    color: WOW.slimeGreenDim,
    emissive: WOW.apothecaryGreen,
    emissiveIntensity: 0.7,
    transparent: true,
    opacity: 0.85,
  });
  const brew = new THREE.Mesh(brewGeo, brewMat);
  brew.rotation.x = -Math.PI / 2;
  brew.position.set(0, 1.3, 0);
  group.add(brew);

  // Fire underneath — bigger, brighter
  const fireGeo = new THREE.BoxGeometry(0.8, 0.4, 0.8);
  const fireMat = new THREE.MeshStandardMaterial({
    color: 0xFF6600,
    emissive: 0xFF4400,
    emissiveIntensity: 1.5,
  });
  const fire = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.25, 0);
  group.add(fire);

  // Potion bottles on shelf
  const shelfGeo = new THREE.BoxGeometry(2.2, 0.08, 0.5);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3A2510 });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(-2.2, 1.2, 0);
  group.add(shelf);

  // Second shelf
  const shelf2 = new THREE.Mesh(shelfGeo, shelfMat);
  shelf2.position.set(-2.2, 1.8, 0);
  group.add(shelf2);

  // More potion bottles on both shelves
  const potionColors = [0xCC1111, 0x2255CC, 0x22CC22, 0xAA22CC, 0xCCAA22, 0xFF6644, 0x44CCCC];
  potionColors.forEach((color, i) => {
    const bottleGeo = new THREE.SphereGeometry(0.1, 8, 6);
    const bottleMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.75,
    });
    const shelfY = i < 4 ? 1.35 : 1.95;
    const idx = i < 4 ? i : i - 4;
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(-2.8 + idx * 0.4, shelfY, 0);
    group.add(bottle);

    // Bottle neck
    const neckGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6);
    const neck = new THREE.Mesh(neckGeo, bottleMat);
    neck.position.set(-2.8 + idx * 0.4, shelfY + 0.12, 0);
    group.add(neck);
  });

  // Hanging herb bundles (from above)
  const herbColors = [0x336633, 0x445533, 0x553344];
  herbColors.forEach((color, i) => {
    const herbGeo = new THREE.ConeGeometry(0.1, 0.4, 6);
    const herbMat = new THREE.MeshStandardMaterial({ color });
    const herb = new THREE.Mesh(herbGeo, herbMat);
    herb.position.set(-1 + i * 1.0, 2.8, 1.5);
    herb.rotation.x = Math.PI; // Hanging upside-down
    group.add(herb);

    // String
    const stringGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 4);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0x886644 });
    const string = new THREE.Mesh(stringGeo, stringMat);
    string.position.set(-1 + i * 1.0, 3.05, 1.5);
    group.add(string);
  });

  // Green PointLight — brighter
  cauldronLight = new THREE.PointLight(WOW.apothecaryGreen, 2.5, 14, 2);
  cauldronLight.position.set(0, 3, 0);
  cauldronLight.castShadow = true;
  cauldronLight.shadow.mapSize.set(256, 256);
  group.add(cauldronLight);

  return group;
}

export function updateApothecaryStation(delta: number, elapsed: number): void {
  // Brew bubbling glow
  if (brewMat) {
    brewMat.emissiveIntensity = 0.6 + Math.sin(elapsed * 2.5) * 0.2;
  }
  cauldronLight.intensity = 2.0 + Math.sin(elapsed * 2.5) * 0.5;
}
