// app/prototypes/undercity-monitor/components/DungeonRenderer.tsx

"use client";

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
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
    scene.fog = new THREE.FogExp2(WOW.black, 0.015);

    // Isometric camera
    const aspect = width / height;
    const frustum = 20;
    const camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
      frustum, -frustum,
      0.1, 100
    );
    // Classic isometric angle: 35.264° from horizontal, 45° rotation
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    container.appendChild(renderer.domElement);

    // Ambient light (very dim — zones provide their own light)
    const ambient = new THREE.AmbientLight(0x1a1a2e, 0.3);
    scene.add(ambient);

    // Ground plane — dark stone
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: WOW.stoneDark,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Slime canals — two crossing emissive planes
    const canalMat = new THREE.MeshStandardMaterial({
      color: WOW.slimeGreenDim,
      emissive: WOW.slimeGreen,
      emissiveIntensity: 0.3,
      roughness: 0.3,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
    });

    // Horizontal canal (Z axis)
    const canalH = new THREE.Mesh(new THREE.PlaneGeometry(40, 1.2), canalMat);
    canalH.rotation.x = -Math.PI / 2;
    canalH.position.y = 0.02;
    scene.add(canalH);

    // Vertical canal (X axis)
    const canalV = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 40), canalMat);
    canalV.rotation.x = -Math.PI / 2;
    canalV.position.y = 0.02;
    scene.add(canalV);

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

    // Mouse tracking for subtle camera orbit
    const mouseTarget = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / width - 0.5) * 2;
      mouseTarget.y = (e.clientY / height - 0.5) * 2;
    };
    container.addEventListener('mousemove', onMouseMove);

    // Render loop
    const clock = new THREE.Clock();
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.elapsedTime;

      // Subtle camera orbit following mouse
      const orbitStrength = 0.5;
      camera.position.x = 20 + mouseTarget.x * orbitStrength;
      camera.position.z = 20 + mouseTarget.y * orbitStrength;
      camera.lookAt(0, 0, 0);

      // Animate slime canal emissive pulsing
      const pulse = 0.25 + Math.sin(elapsed * 1.5) * 0.1;
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

      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const a = w / h;
      camera.left = -frustum * a;
      camera.right = frustum * a;
      camera.top = frustum;
      camera.bottom = -frustum;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      agentManager.dispose();
      particles.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerRef]);

  return null; // Renders into the container ref, not the React tree
}
