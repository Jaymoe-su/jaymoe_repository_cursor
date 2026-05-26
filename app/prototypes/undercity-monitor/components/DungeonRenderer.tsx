// app/prototypes/undercity-monitor/components/DungeonRenderer.tsx

"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { WOW } from '../lib/wowPalette';
import type { Agent } from '../lib/types';
import { createGuildHall, updateGuildHall } from './zones/GuildHall';
import { createForgeStation, updateForgeStation } from './zones/ForgeStation';
import { createScriptoriumStation, updateScriptoriumStation } from './zones/ScriptoriumStation';
import { createApothecaryStation, updateApothecaryStation } from './zones/ApothecaryStation';
import { createEnchantingStation, updateEnchantingStation } from './zones/EnchantingStation';
import { createSummonStone, updateSummonStone } from './zones/SummonStone';
import { AgentSpriteManager } from './AgentSprite';
import { ParticleManager } from './ParticleManager';

interface DungeonRendererProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  agents: Agent[];
}

export function DungeonRenderer({ containerRef, agents }: DungeonRendererProps) {
  const agentsRef = useRef<Agent[]>([]);
  useEffect(() => { agentsRef.current = agents; }, [agents]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(WOW.black);
    scene.fog = new THREE.FogExp2(WOW.black, 0.003);

    // Perspective camera for orbit controls
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(28, 22, 28);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    // Bloom post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.0,   // strength
      0.7,   // radius
      0.25   // threshold — lower to catch more emissive glow
    );
    composer.addPass(bloomPass);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.minDistance = 15;
    controls.maxDistance = 60;
    controls.minPolarAngle = 0.3;           // Don't let them go perfectly top-down
    controls.maxPolarAngle = Math.PI / 2.2; // Don't flip underground
    controls.target.set(0, 0, 0);
    controls.update();

    // Lighting — ambient + hemisphere fill + directional for definition
    const ambient = new THREE.AmbientLight(0x2a2a3e, 0.7);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x2a2a50, 0x151518, 0.6);
    scene.add(hemi);

    // Directional from above for geometry definition
    const dirLight = new THREE.DirectionalLight(0x8888aa, 0.35);
    dirLight.position.set(5, 20, 5);
    scene.add(dirLight);

    // Ground plane — dark stone with procedural texture
    const groundSize = 50;
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize, 64, 64);
    // Displace vertices slightly for stone-like roughness
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Simple procedural height variation
      const noise = Math.sin(x * 2.3) * Math.cos(y * 1.7) * 0.04
                  + Math.sin(x * 5.1 + y * 3.3) * 0.02;
      posAttr.setZ(i, noise);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x252830,
      roughness: 0.9,
      metalness: 0.05,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Stone border walls along ground edge
    const wallMat = new THREE.MeshStandardMaterial({ color: WOW.stoneDark, roughness: 0.85 });
    const wallThickness = 0.6;
    const wallHeight = 0.7;
    const wallHalf = groundSize / 2;
    const wallGeoH = new THREE.BoxGeometry(groundSize + wallThickness * 2, wallHeight, wallThickness);
    const wallGeoV = new THREE.BoxGeometry(wallThickness, wallHeight, groundSize);

    [[0, wallHeight / 2, wallHalf], [0, wallHeight / 2, -wallHalf]].forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wallGeoH, wallMat);
      w.position.set(x, y, z);
      w.receiveShadow = true;
      scene.add(w);
    });
    [[wallHalf, wallHeight / 2, 0], [-wallHalf, wallHeight / 2, 0]].forEach(([x, y, z]) => {
      const w = new THREE.Mesh(wallGeoV, wallMat);
      w.position.set(x, y, z);
      w.receiveShadow = true;
      scene.add(w);
    });

    // Slime canals — wider, brighter
    const canalWidth = 2.0;
    const canalMat = new THREE.MeshStandardMaterial({
      color: WOW.slimeGreenDim,
      emissive: WOW.slimeGreen,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    });

    // Horizontal canal (Z axis)
    const canalH = new THREE.Mesh(new THREE.PlaneGeometry(groundSize, canalWidth), canalMat);
    canalH.rotation.x = -Math.PI / 2;
    canalH.position.y = 0.03;
    scene.add(canalH);

    // Vertical canal (X axis)
    const canalV = new THREE.Mesh(new THREE.PlaneGeometry(canalWidth, groundSize), canalMat);
    canalV.rotation.x = -Math.PI / 2;
    canalV.position.y = 0.03;
    scene.add(canalV);

    // Canal edge glow lights (green point lights along canals)
    const canalLightPositions = [
      [10, 0.5, 0], [-10, 0.5, 0], [0, 0.5, 10], [0, 0.5, -10],
      [18, 0.5, 0], [-18, 0.5, 0], [0, 0.5, 18], [0, 0.5, -18],
    ];
    canalLightPositions.forEach(([x, y, z]) => {
      const light = new THREE.PointLight(WOW.slimeGreen, 1.2, 10, 2);
      light.position.set(x, y, z);
      scene.add(light);
    });

    // Scattered Horde banners around the map
    const bannerGeo = new THREE.BoxGeometry(0.3, 3, 0.05);
    const bannerMat = new THREE.MeshStandardMaterial({
      color: WOW.hordeBanner,
      emissive: WOW.hordeBanner,
      emissiveIntensity: 0.15,
    });
    const bannerPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6);
    const bannerPoleMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A });

    const bannerPositions = [
      [6, 0, -6], [-6, 0, 6], [15, 0, 0], [-15, 0, 0],
      [0, 0, -15], [6, 0, 15], [-17, 0, -5], [17, 0, 5],
    ];
    bannerPositions.forEach(([x, _y, z]) => {
      const pole = new THREE.Mesh(bannerPoleGeo, bannerPoleMat);
      pole.position.set(x, 1.75, z);
      scene.add(pole);
      const banner = new THREE.Mesh(bannerGeo, bannerMat);
      banner.position.set(x + 0.2, 2.5, z);
      scene.add(banner);
    });

    // Stone pillars scattered around (decorative)
    const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 2.5, 8);
    const pillarMat = new THREE.MeshStandardMaterial({ color: WOW.stoneBase, roughness: 0.85 });
    const pillarPositions = [
      [7, 0, 7], [-7, 0, -7], [7, 0, -7], [-7, 0, 7],
      [14, 0, 14], [-14, 0, 14], [14, 0, -14], [-14, 0, -14],
    ];
    pillarPositions.forEach(([x, _y, z]) => {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(x, 1.25, z);
      p.castShadow = true;
      scene.add(p);
      // Pillar cap
      const capGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.15, 8);
      const cap = new THREE.Mesh(capGeo, pillarMat);
      cap.position.set(x, 2.55, z);
      scene.add(cap);
    });

    // Add all zones
    scene.add(createGuildHall());
    scene.add(createForgeStation());
    scene.add(createScriptoriumStation());
    scene.add(createApothecaryStation());
    scene.add(createEnchantingStation());
    scene.add(createSummonStone());

    // Agent sprites
    const agentManager = new AgentSpriteManager(scene);

    // Particle systems
    const particles = new ParticleManager(scene);

    // Render loop
    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      // Update orbit controls
      controls.update();

      // Animate slime canal emissive pulsing
      const pulse = 0.8 + Math.sin(elapsed * 1.5) * 0.2;
      canalMat.emissiveIntensity = pulse;

      // Update all zones
      updateGuildHall(delta, elapsed);
      updateForgeStation(delta, elapsed);
      updateScriptoriumStation(delta, elapsed);
      updateApothecaryStation(delta, elapsed);
      updateEnchantingStation(delta, elapsed);
      updateSummonStone(delta, elapsed);

      // Update agents
      agentManager.update(agentsRef.current, delta);

      // Update particles
      particles.update(delta, elapsed);

      // Render with bloom
      composer.render();
    }
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      agentManager.dispose();
      particles.dispose();
      composer.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerRef]);

  return null; // Renders into the container ref, not the React tree
}
