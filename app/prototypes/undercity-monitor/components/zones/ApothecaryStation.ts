// app/prototypes/undercity-monitor/components/zones/ApothecaryStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let cauldronLight: THREE.PointLight;
let brewMat: THREE.MeshStandardMaterial;

export function createApothecaryStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ApothecaryStation';
  group.position.set(-10, 0, 10); // SW quadrant

  // Platform
  const platGeo = new THREE.CylinderGeometry(4, 4, 0.3, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.15;
  plat.receiveShadow = true;
  group.add(plat);

  // Cauldron body (open-top cylinder)
  const cauldronGeo = new THREE.CylinderGeometry(0.9, 0.7, 1, 12, 1, true);
  const cauldronMat = new THREE.MeshStandardMaterial({
    color: 0x1F1F22,
    roughness: 0.5,
    metalness: 0.6,
    side: THREE.DoubleSide,
  });
  const cauldron = new THREE.Mesh(cauldronGeo, cauldronMat);
  cauldron.position.set(0, 0.85, 0);
  cauldron.castShadow = true;
  group.add(cauldron);

  // Brew surface (glowing green disc inside cauldron)
  const brewGeo = new THREE.CircleGeometry(0.85, 16);
  brewMat = new THREE.MeshStandardMaterial({
    color: WOW.slimeGreenDim,
    emissive: WOW.apothecaryGreen,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.8,
  });
  const brew = new THREE.Mesh(brewGeo, brewMat);
  brew.rotation.x = -Math.PI / 2;
  brew.position.set(0, 1.2, 0);
  group.add(brew);

  // Fire underneath
  const fireGeo = new THREE.BoxGeometry(0.6, 0.3, 0.6);
  const fireMat = new THREE.MeshStandardMaterial({
    color: 0xFF6600,
    emissive: 0xFF4400,
    emissiveIntensity: 1,
  });
  const fire = new THREE.Mesh(fireGeo, fireMat);
  fire.position.set(0, 0.25, 0);
  group.add(fire);

  // Potion bottles (small spheres on a shelf)
  const shelfGeo = new THREE.BoxGeometry(2, 0.08, 0.4);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3A2510 });
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(-2, 1.2, 0);
  group.add(shelf);

  const potionColors = [0xCC1111, 0x2255CC, 0x22CC22, 0xAA22CC, 0xCCAA22];
  potionColors.forEach((color, i) => {
    const bottleGeo = new THREE.SphereGeometry(0.1, 6, 4);
    const bottleMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7,
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.position.set(-2.6 + i * 0.35, 1.35, 0);
    group.add(bottle);
  });

  // Green PointLight
  cauldronLight = new THREE.PointLight(WOW.apothecaryGreen, 1.5, 12, 2);
  cauldronLight.position.set(0, 2.5, 0);
  cauldronLight.castShadow = true;
  cauldronLight.shadow.mapSize.set(256, 256);
  group.add(cauldronLight);

  return group;
}

export function updateApothecaryStation(delta: number, elapsed: number): void {
  // Brew bubbling glow
  if (brewMat) {
    brewMat.emissiveIntensity = 0.4 + Math.sin(elapsed * 2) * 0.15;
  }
  cauldronLight.intensity = 1.3 + Math.sin(elapsed * 2.5) * 0.3;
}
