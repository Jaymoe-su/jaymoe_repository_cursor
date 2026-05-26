// app/prototypes/undercity-monitor/components/zones/ScriptoriumStation.ts

import * as THREE from 'three';
import { WOW } from '../../lib/wowPalette';

let candleLight: THREE.PointLight;
const candleFlames: THREE.Mesh[] = [];

export function createScriptoriumStation(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ScriptoriumStation';
  group.position.set(10, 0, 10); // SE quadrant

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

  // Writing desk — larger, with drawers
  const deskGeo = new THREE.BoxGeometry(2.2, 0.12, 1.4);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x5A3818, roughness: 0.7 });
  const desk = new THREE.Mesh(deskGeo, deskMat);
  desk.position.set(0, 0.9, 0);
  desk.castShadow = true;
  group.add(desk);

  // Desk legs
  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 4);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3A2510 });
  [[-0.9, -0.6], [-0.9, 0.6], [0.9, -0.6], [0.9, 0.6]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(x, 0.6, z);
    group.add(leg);
  });

  // Parchment stack
  const parchGeo = new THREE.BoxGeometry(0.6, 0.1, 0.45);
  const parchMat = new THREE.MeshStandardMaterial({ color: WOW.parchment });
  const parch = new THREE.Mesh(parchGeo, parchMat);
  parch.position.set(-0.4, 1.01, 0);
  group.add(parch);

  // Ink pot
  const inkGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.08, 8);
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x111133 });
  const ink = new THREE.Mesh(inkGeo, inkMat);
  ink.position.set(0.4, 1.0, 0.3);
  group.add(ink);

  // Quill pen (thin angled cylinder)
  const quillGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.35, 4);
  const quillMat = new THREE.MeshStandardMaterial({ color: 0xEEDDCC });
  const quill = new THREE.Mesh(quillGeo, quillMat);
  quill.position.set(0.4, 1.1, 0.3);
  quill.rotation.z = 0.5;
  group.add(quill);

  // Bookshelves (2 tall rectangles with shelf lines)
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x4A3520, roughness: 0.8 });

  [[-2.5, 0], [2.5, 0]].forEach(([x, z]) => {
    // Main shelf frame
    const frameGeo = new THREE.BoxGeometry(1.2, 2.5, 0.4);
    const frame = new THREE.Mesh(frameGeo, shelfMat);
    frame.position.set(x, 1.6, z);
    frame.castShadow = true;
    group.add(frame);

    // Shelf divisions (horizontal lines)
    for (let i = 0; i < 4; i++) {
      const divGeo = new THREE.BoxGeometry(1.1, 0.03, 0.38);
      const div = new THREE.Mesh(divGeo, shelfMat);
      div.position.set(x, 0.7 + i * 0.55, z);
      group.add(div);

      // Books on each shelf (colored rectangles)
      const bookColors = [0x882222, 0x225588, 0x228855, 0x885522, 0x552288];
      for (let j = 0; j < 3 + Math.floor(Math.random() * 3); j++) {
        const bw = 0.08 + Math.random() * 0.06;
        const bh = 0.25 + Math.random() * 0.2;
        const bookGeo = new THREE.BoxGeometry(bw, bh, 0.15);
        const bookMat = new THREE.MeshStandardMaterial({
          color: bookColors[j % bookColors.length],
        });
        const book = new THREE.Mesh(bookGeo, bookMat);
        book.position.set(x - 0.4 + j * 0.18, 0.7 + i * 0.55 + bh / 2 + 0.02, z);
        group.add(book);
      }
    }
  });

  // Multiple candles
  const flameMat = new THREE.MeshStandardMaterial({
    color: WOW.scriptoriumAmber,
    emissive: WOW.scriptoriumAmber,
    emissiveIntensity: 3.5,
  });

  const candlePositions = [
    [0.7, 0, -0.4], [-0.7, 0, -0.4], [0, 0, 0.5],
  ];
  candlePositions.forEach(([cx, _cy, cz]) => {
    const candleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xFFF8E0 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.set(cx, 1.08, cz);
    group.add(candle);

    const flameGeo = new THREE.SphereGeometry(0.05, 6, 4);
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.set(cx, 1.25, cz);
    group.add(flame);
    candleFlames.push(flame);
  });

  // Amber PointLight — brighter
  candleLight = new THREE.PointLight(WOW.scriptoriumAmber, 4.0, 18, 2);
  candleLight.position.set(0, 2.5, 0);
  candleLight.castShadow = true;
  candleLight.shadow.mapSize.set(256, 256);
  group.add(candleLight);

  return group;
}

export function updateScriptoriumStation(delta: number, elapsed: number): void {
  // Gentle candle flicker
  candleLight.intensity = 3.5 + Math.sin(elapsed * 3.5) * 0.5 + Math.random() * 0.15;

  // Pulse flame emissive
  candleFlames.forEach((flame, i) => {
    const mat = flame.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 3.0 + Math.sin(elapsed * 4 + i * 2) * 0.8;
  });
}
