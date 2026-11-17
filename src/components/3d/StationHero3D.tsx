import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

interface StationHero3DProps {
  lowGraphics?: boolean;
  storyMode?: boolean;
}

function createHologramConsoleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#030b1a';
    ctx.fillRect(0, 0, 512, 256);

    ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
    ctx.lineWidth = 3;
    ctx.strokeRect(8, 8, 496, 240);

    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('STATION OS // 2126.12.16', 24, 42);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('ALERT: 5 LAB SECTORS LOCKED', 24, 76);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '15px monospace';
    ctx.fillText('> HOLOGRAM CORE: STANDBY', 24, 114);
    ctx.fillText('> ENCRYPTION: 5 QUANTUM SEALS', 24, 142);
    ctx.fillText('> EXT TEMP: -18.4 C [SNOWING]', 24, 170);

    ctx.fillStyle = '#facc15';
    ctx.fillText('AWAITING RESEARCH TEAM...', 24, 214);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const StationHero3D: React.FC<StationHero3DProps> = ({
  lowGraphics = false,
  storyMode = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const storyModeRef = useRef(storyMode);

  useEffect(() => {
    storyModeRef.current = storyMode;
  }, [storyMode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 1.5, 8.2);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: false,
      benchY: -2.0,
    });

    // Sci-fi blue, turquoise, purple & warm Christmas accent lighting
    const hemi = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.35);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xe0f2fe, 2.0);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const violetLight = new THREE.PointLight(0xa855f7, 3.0, 18);
    violetLight.position.set(-4.5, 2.5, 1.5);
    scene.add(violetLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2.8, 16);
    cyanLight.position.set(4.5, 2.2, 2.0);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xeab308, 1.9, 14);
    goldLight.position.set(0, 2.4, 3.5);
    scene.add(goldLight);

    const crimsonLight = new THREE.PointLight(0xe11d48, 1.6, 12);
    crimsonLight.position.set(-2.2, -0.8, 3.2);
    scene.add(crimsonLight);

    const disposables: { dispose: () => void }[] = [];

    // --- STATION FLOOR DECK & HOLOGRAPHIC RADAR GRID ---
    const floorGeom = new THREE.CircleGeometry(11, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070d1e,
      metalness: 0.78,
      roughness: 0.28,
    });
    const floorMesh = new THREE.Mesh(floorGeom, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.9;
    scene.add(floorMesh);
    disposables.push(floorGeom, floorMat);

    const gridHelper = new THREE.GridHelper(18, 24, 0x06b6d4, 0x312e81);
    gridHelper.position.y = -1.88;
    scene.add(gridHelper);

    // --- OBSERVATION GLASS BAY ARCHES ---
    const archMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.88,
      roughness: 0.25,
    });
    const ribGeom = new THREE.BoxGeometry(0.28, 6.2, 0.42);
    disposables.push(archMat, ribGeom);

    [-6.0, -2.8, 2.8, 6.0].forEach((xPos, idx) => {
      const rib = new THREE.Mesh(ribGeom, archMat);
      rib.position.set(xPos, 1.1, idx === 0 || idx === 3 ? -1.4 : -2.6);
      rib.rotation.z = xPos < 0 ? -0.14 : 0.14;
      scene.add(rib);
    });

    // --- ANIMATED CHRISTMAS LIGHT STRINGS ON OBSERVATION ARCH ---
    const christmasLights: { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; phase: number }[] = [];
    const bulbGeom = new THREE.SphereGeometry(0.065, 10, 10);
    disposables.push(bulbGeom);
    const palette = [0x22d3ee, 0xfacc15, 0xf43f5e, 0xc084fc];
    const bulbCount = lowGraphics ? 14 : 24;

    for (let i = 0; i < bulbCount; i++) {
      const t = i / (bulbCount - 1);
      const x = -5.6 + t * 11.2;
      const sag = Math.sin(t * Math.PI) * 0.65;
      const y = 3.6 - sag;
      const z = -2.25;
      const color = palette[i % palette.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.5,
        roughness: 0.2,
      });
      const bulb = new THREE.Mesh(bulbGeom, mat);
      bulb.position.set(x, y, z);
      scene.add(bulb);
      christmasLights.push({ mesh: bulb, mat, phase: i * 0.55 });
      disposables.push(mat);
    }

    // --- CENTRAL HOLOGRAPHIC COMPUTER & CYBER-CHRISTMAS CORE ---
    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, -0.1, 0);
    scene.add(coreGroup);

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.88,
      roughness: 0.22,
    });
    const cyanEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });
    const violetEmissiveMat = new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x9333ea,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xfb7185,
      emissive: 0xe11d48,
      emissiveIntensity: 1.25,
      roughness: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.55,
      metalness: 0.8,
      roughness: 0.15,
    });
    disposables.push(baseMat, cyanEmissiveMat, violetEmissiveMat, crimsonMat, goldMat);

    // Multi-tiered computer dais
    const pedGeom1 = new THREE.CylinderGeometry(2.3, 2.75, 0.28, 32);
    const ped1 = new THREE.Mesh(pedGeom1, baseMat);
    ped1.position.y = -1.66;

    const pedGeom2 = new THREE.CylinderGeometry(1.55, 1.95, 0.26, 32);
    const ped2 = new THREE.Mesh(pedGeom2, baseMat);
    ped2.position.y = -1.4;

    const pedRingGeom = new THREE.TorusGeometry(1.6, 0.035, 10, 48);
    const pedRing = new THREE.Mesh(pedRingGeom, cyanEmissiveMat);
    pedRing.rotation.x = Math.PI / 2;
    pedRing.position.y = -1.26;
    coreGroup.add(ped1, ped2, pedRing);
    disposables.push(pedGeom1, pedGeom2, pedRingGeom);

    // 3 Angled Holographic Computer Monitor Terminals around the central pedestal
    const screenTex = createHologramConsoleTexture();
    const screenGeom = new THREE.PlaneGeometry(1.35, 0.72);
    const screenMat = new THREE.MeshBasicMaterial({
      map: screenTex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
    });
    const consoleBodyGeom = new THREE.BoxGeometry(1.45, 0.82, 0.08);
    disposables.push(screenTex, screenGeom, screenMat, consoleBodyGeom);

    [-1.6, 0, 1.6].forEach((xOffset, idx) => {
      const terminalGroup = new THREE.Group();
      const angleY = idx === 0 ? 0.42 : idx === 2 ? -0.42 : 0;
      const zOffset = idx === 1 ? 2.15 : 1.75;
      terminalGroup.position.set(xOffset, -1.05, zOffset);
      terminalGroup.rotation.set(-0.48, angleY, 0);

      const frame = new THREE.Mesh(consoleBodyGeom, baseMat);
      const pane = new THREE.Mesh(screenGeom, screenMat);
      pane.position.z = 0.05;
      terminalGroup.add(frame, pane);
      coreGroup.add(terminalGroup);
    });

    // Central Holographic Cyber-Christmas Tree / Quantum Lattice Spire
    const treeLevels = [
      { y: -0.65, r: 0.95, h: 0.75, mat: cyanEmissiveMat },
      { y: -0.05, r: 0.72, h: 0.68, mat: violetEmissiveMat },
      { y: 0.5, r: 0.48, h: 0.62, mat: cyanEmissiveMat },
    ];
    treeLevels.forEach((lvl) => {
      const coneGeom = new THREE.ConeGeometry(lvl.r, lvl.h, 6, 1, true);
      const wireMat = new THREE.MeshStandardMaterial({
        color: lvl.mat.color,
        emissive: lvl.mat.emissive,
        emissiveIntensity: 0.9,
        wireframe: true,
        transparent: true,
        opacity: 0.72,
      });
      const tier = new THREE.Mesh(coneGeom, wireMat);
      tier.position.y = lvl.y;
      coreGroup.add(tier);
      disposables.push(coneGeom, wireMat);
    });

    // Top Glowing Star / Golden Core
    const starGeom = new THREE.OctahedronGeometry(0.32, 0);
    const starMesh = new THREE.Mesh(starGeom, goldMat);
    starMesh.position.y = 1.12;
    coreGroup.add(starMesh);
    disposables.push(starGeom);

    // Rotating Gyroscopic Hologram Rings
    const ring1Geom = new THREE.TorusGeometry(1.95, 0.03, 12, lowGraphics ? 36 : 64);
    const ring1 = new THREE.Mesh(ring1Geom, cyanEmissiveMat);
    ring1.position.y = 0.1;

    const ring2Geom = new THREE.TorusGeometry(2.42, 0.024, 12, lowGraphics ? 36 : 64);
    const ring2 = new THREE.Mesh(ring2Geom, violetEmissiveMat);
    ring2.position.y = 0.1;

    const ring3Geom = new THREE.TorusGeometry(2.85, 0.02, 12, lowGraphics ? 36 : 64);
    const ring3 = new THREE.Mesh(ring3Geom, crimsonMat);
    ring3.position.y = 0.1;
    coreGroup.add(ring1, ring2, ring3);
    disposables.push(ring1Geom, ring2Geom, ring3Geom);

    // 5 Orbiting Seal Nodes
    const sealNodes: THREE.Mesh[] = [];
    const sealColors = [0x06b6d4, 0xf59e0b, 0xeab308, 0x38bdf8, 0xa855f7];
    const sealGeom = new THREE.IcosahedronGeometry(0.18, 0);
    disposables.push(sealGeom);

    for (let i = 0; i < 5; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: sealColors[i],
        emissive: sealColors[i],
        emissiveIntensity: 1.4,
        metalness: 0.4,
        roughness: 0.2,
      });
      disposables.push(mat);
      const node = new THREE.Mesh(sealGeom, mat);
      coreGroup.add(node);
      sealNodes.push(node);
    }

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      backdrop.update(delta, elapsed);

      // Gentle holographic core & Christmas lights shimmer
      cyanEmissiveMat.emissiveIntensity = 1.15 + Math.sin(elapsed * 2.8) * 0.45;
      starMesh.rotation.y -= delta * 0.9;
      starMesh.position.y = 1.12 + Math.sin(elapsed * 2.0) * 0.07;

      christmasLights.forEach((b) => {
        b.mat.emissiveIntensity = 0.8 + Math.max(0, Math.sin(elapsed * 2.5 + b.phase)) * 1.4;
      });

      ring1.rotation.x = Math.PI / 3 + Math.sin(elapsed * 0.6) * 0.25;
      ring1.rotation.y += delta * 0.52;

      ring2.rotation.y -= delta * 0.38;
      ring2.rotation.z = Math.cos(elapsed * 0.5) * 0.38;

      ring3.rotation.x = -Math.PI / 4;
      ring3.rotation.z += delta * 0.28;

      sealNodes.forEach((node, idx) => {
        const angle = elapsed * 0.5 + (idx * Math.PI * 2) / 5;
        node.position.set(
          Math.cos(angle) * 2.55,
          0.1 + Math.sin(elapsed * 1.4 + idx) * 0.35,
          Math.sin(angle) * 2.55
        );
        node.rotation.x += delta;
        node.rotation.y += delta * 0.8;
      });

      // Slow cinematic camera drift
      const targetZ = storyModeRef.current ? 6.4 : 8.2;
      const targetY = storyModeRef.current ? 1.15 : 1.55;
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 2.5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.5, delta);
      camera.position.x = Math.sin(elapsed * 0.22) * 0.95;
      camera.lookAt(0, 0.1, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      backdrop.dispose();
      envTex.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
