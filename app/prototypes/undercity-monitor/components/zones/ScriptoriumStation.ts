// app/prototypes/undercity-monitor/components/zones/ScriptoriumStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let candleLight: THREE.PointLight;

export function createScriptoriumStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ScriptoriumStation';
  group.position.set(10, 0, 10); // SE quadrant

  // Platform
  const platGeo = new THREE.CylinderGeometry(4, 4, 0.3, 8);
  const platMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.9 });
  const plat = new THREE.Mesh(platGeo, platMat);
  plat.position.y = 0.15;
  plat.receiveShadow = true;
  group.add(plat);

  // Writing desk
  const deskGeo = new THREE.BoxGeometry(2, 0.1, 1.2);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x5A3818, roughness: 0.7 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.set(0, 0.9, 0);
  desk.castShadow = true;
  group.add(desk);

  // Desk legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 4);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3A2510 });
  [[-0.8, -0.5], [-0.8, 0.5], [0.8, -0.5], [0.8, 0.5]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.55, z);
    group.add(leg);
  });

  // Parchment stack on desk (thin cream box)
  const parchGeo = new THREE.BoxGeometry(0.5, 0.08, 0.4);
  const parchMat = new THREE.MeshStandardMaterial({ color: 0xE8D5B5 });
  const parch = new THREE.Mesh(parchGeo, parchMat);
  parch.position.set(-0.4, 0.99, 0);
  group.add(parch);

  // Candle
  const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
  const candleMat = new THREE.MeshStandardMaterial({ color: 0xFFF8E0 });
  const candle = new THREE.Mesh(candleGeo, candleMat);
  candle.position.set(0.6, 1.1, -0.3);
  group.add(candle);

  // Candle flame (emissive)
  const flameGeo = new THREE.SphereGeometry(0.04, 6, 4);
  const flameMat = new THREE.MeshStandardMaterial({
    color: WOW.scriptoriumAmber,
    emissive: WOW.scriptoriumAmber,
    emissiveIntensity: 2,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(0.6, 1.27, -0.3);
  group.add(flame);

  // Amber PointLight
  candleLight = new THREE.PointLight(WOW.scriptoriumAmber, 1.0, 10, 2);
  candleLight.position.set(0.6, 2, -0.3);
  candleLight.castShadow = true;
  candleLight.shadow.mapSize.set(256, 256);
  group.add(candleLight);

  return group;
}

export function updateScriptoriumStation(delta: number, elapsed: number): void {
  // Gentle candle flicker
  candleLight.intensity = 0.9 + Math.sin(elapsed * 3) * 0.15;
}
