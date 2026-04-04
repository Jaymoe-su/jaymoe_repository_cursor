// app/prototypes/undercity-monitor/components/zones/GuildHall.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

const torchLights: THREE.PointLight[] = [];

export function createGuildHall(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'GuildHall';

  // Circular stone platform
  const platformGeo = new THREE.CylinderGeometry(6, 6, 0.4, 32);
  const platformMat = new THREE.MeshStandardMaterial({
    color: WOW.stoneBase,
    roughness: 0.85,
    metalness: 0.05,
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = 0.2;
  platform.receiveShadow = true;
  group.add(platform);

  // Round table in center
  const tableGeo = new THREE.CylinderGeometry(2, 2, 0.3, 16);
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0x2A1F0E,
    roughness: 0.7,
    metalness: 0.1,
  });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.y = 0.7;
  table.castShadow = true;
  group.add(table);

  // Horde banners (tall thin red boxes at N and S)
  const bannerGeo = new THREE.BoxGeometry(0.3, 2, 0.05);
  const bannerMat = new THREE.MeshStandardMaterial({ color: WOW.hordeBanner });
  const bannerN = new THREE.Mesh(bannerGeo, bannerMat);
  bannerN.position.set(0, 1.5, -5);
  group.add(bannerN);
  const bannerS = new THREE.Mesh(bannerGeo, bannerMat);
  bannerS.position.set(0, 1.5, 5);
  group.add(bannerS);

  // Torch PointLights (4 around the platform)
  const torchPositions = [
    new THREE.Vector3(4, 2, 0),
    new THREE.Vector3(-4, 2, 0),
    new THREE.Vector3(0, 2, 4),
    new THREE.Vector3(0, 2, -4),
  ];
  torchPositions.forEach(pos => {
    const light = new THREE.PointLight(WOW.guildHallTorch, 1.2, 12, 2);
    light.position.copy(pos);
    light.castShadow = true;
    light.shadow.mapSize.set(256, 256);
    group.add(light);
    torchLights.push(light);

    // Torch post (small cylinder)
    const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 2, 6);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A });
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.copy(pos);
    post.position.y = 1;
    group.add(post);
  });

  return group;
}

export function updateGuildHall(delta: number, elapsed: number): void {
  // Flicker torch lights
  torchLights.forEach((light, i) => {
    light.intensity = 1.0 + Math.sin(elapsed * 5 + i * 1.7) * 0.2 + Math.random() * 0.1;
  });
}
