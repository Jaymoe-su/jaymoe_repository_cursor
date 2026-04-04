// app/prototypes/undercity-monitor/components/zones/GuildHall.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

const torchLights: THREE.PointLight[] = [];

export function createGuildHall(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GuildHall';

  // Circular stone platform
  const platformGeo = new THREE.CylinderGeometry(6, 6.2, 0.5, 32);
  const platformMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneBase,
    roughness: 0.85,
    metalness: 0.05,
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = 0.25;
  platform.receiveShadow = true;
  group.add(platform);

  // Stone border wall around platform
  const borderGeo = new THREE.TorusGeometry(6, 0.25, 6, 32);
  const borderMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.9 });
  const border = new THREE.Mesh(borderGeo, borderMat);
  border.rotation.x = -Math.PI / 2;
  border.position.y = 0.65;
  group.add(border);

  // Stone pillars around platform edge (8 pillars)
  const pillarGeo = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 8);
  const pillarMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.85 });
  const pillarCapGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.15, 8);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * 5.5;
    const z = Math.sin(angle) * 5.5;
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(x, 1.5, z);
    pillar.castShadow = true;
    group.add(pillar);
    const cap = new THREE.Mesh(pillarCapGeo, pillarMat);
    cap.position.set(x, 2.8, z);
    group.add(cap);
  }

  // Round table in center — more detailed
  const tableLegGeo = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 8);
  const tableLegMat = new THREE.MeshStandardMaterial({ color: 0x2A1F0E, roughness: 0.7 });
  const tableTopGeo = new THREE.CylinderGeometry(2, 2, 0.15, 16);
  const tableTopMat = new THREE.MeshStandardMaterial({
    color: 0x3A2810,
    roughness: 0.6,
    metalness: 0.1,
  });
  const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
  tableTop.position.y = 0.85;
  tableTop.castShadow = true;
  group.add(tableTop);

  // Table pedestal
  const pedestalGeo = new THREE.CylinderGeometry(0.4, 0.6, 0.35, 8);
  const pedestal = new THREE.Mesh(pedestalGeo, tableLegMat);
  pedestal.position.y = 0.6;
  group.add(pedestal);

  // Items on table — map scroll, goblet
  const scrollGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.8, 6);
  const scrollMat = new THREE.MeshStandardMaterial({ color: WOW.parchment });
  const scroll = new THREE.Mesh(scrollGeo, scrollMat);
  scroll.rotation.z = Math.PI / 2;
  scroll.position.set(0.5, 0.98, 0);
  group.add(scroll);

  const gobletGeo = new THREE.CylinderGeometry(0.06, 0.04, 0.12, 6);
  const gobletMat = new THREE.MeshStandardMaterial({ color: WOW.goldChrome, metalness: 0.6, roughness: 0.3 });
  const goblet = new THREE.Mesh(gobletGeo, gobletMat);
  goblet.position.set(-0.4, 0.98, 0.3);
  group.add(goblet);

  // Horde banners — taller, with pole + banner cloth
  const bannerClothGeo = new THREE.BoxGeometry(0.6, 1.5, 0.05);
  const bannerClothMat = new THREE.MeshStandardMaterial({
    color: WOW.hordeBanner,
    emissive: WOW.hordeBanner,
    emissiveIntensity: 0.1,
  });
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.5, 6);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A });

  [
    [0, 0, -5.5], [0, 0, 5.5], [5.5, 0, 0], [-5.5, 0, 0],
  ].forEach(([x, _y, z]) => {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(x, 2, z);
    group.add(pole);
    const cloth = new THREE.Mesh(bannerClothGeo, bannerClothMat);
    cloth.position.set(x + 0.35, 2.8, z);
    group.add(cloth);
  });

  // Torch PointLights (4 around the platform)
  const torchPositions = [
    new THREE.Vector3(4.5, 2.5, 0),
    new THREE.Vector3(-4.5, 2.5, 0),
    new THREE.Vector3(0, 2.5, 4.5),
    new THREE.Vector3(0, 2.5, -4.5),
  ];
  torchPositions.forEach(pos => {
    const light = new THREE.PointLight(WOW.guildHallTorch, 2.0, 14, 2);
    light.position.copy(pos);
    light.castShadow = true;
    light.shadow.mapSize.set(256, 256);
    group.add(light);
    torchLights.push(light);

    // Torch post
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.copy(pos);
    post.position.y = 1.5;
    group.add(post);

    // Torch head (emissive)
    const headGeo = new THREE.SphereGeometry(0.12, 8, 6);
    const headMat = new THREE.MeshStandardMaterial({
      color: WOW.forgeOrange,
      emissive: WOW.forgeOrange,
      emissiveIntensity: 2.0,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.copy(pos);
    head.position.y = pos.y + 0.1;
    group.add(head);
  });

  return group;
}

export function updateGuildHall(delta: number, elapsed: number): void {
  // Flicker torch lights
  torchLights.forEach((light, i) => {
    light.intensity = 1.8 + Math.sin(elapsed * 6 + i * 1.7) * 0.3 + Math.random() * 0.15;
  });
}
