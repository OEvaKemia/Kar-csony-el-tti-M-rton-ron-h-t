import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GameState, LabId } from '../../types';
import { LAB_METADATA } from '../../config/gameData';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

export type HubTargetId = LabId | 'finale';

interface CommandCenter3DProps {
  state: GameState;
  selectedTarget: HubTargetId;
  onSelectTarget: (target: HubTargetId) => void;
  onActivateTarget: (target: HubTargetId) => void;
}

const LAB_ORDER: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];

function createDoorCanvasTexture(
  indexLabel: string,
  title: string,
  completed: boolean,
  fragment: string,
  accentHex: string,
  isSelected: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep holographic translucent fill
    const grad = ctx.createLinearGradient(0, 0, 0, 384);
    grad.addColorStop(0, completed ? 'rgba(120, 53, 15, 0.92)' : 'rgba(8, 32, 68, 0.92)');
    grad.addColorStop(0.5, completed ? 'rgba(30, 27, 75, 0.92)' : 'rgba(12, 18, 48, 0.92)');
    grad.addColorStop(1, 'rgba(5, 10, 26, 0.96)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 384);

    // Scanlines
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let y = 0; y < 384; y += 6) {
      ctx.fillRect(0, y, 256, 2);
    }

    // Glowing border
    ctx.strokeStyle = isSelected ? '#fde047' : completed ? '#facc15' : accentHex;
    ctx.lineWidth = isSelected ? 8 : 4;
    ctx.strokeRect(8, 8, 240, 368);

    // Top portal number
    ctx.fillStyle = completed ? '#fde047' : '#22d3ee';
    ctx.font = 'bold 54px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(indexLabel, 128, 84);

    // Divider line
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 108);
    ctx.lineTo(220, 108);
    ctx.stroke();

    // Subtitle wrapped
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 19px sans-serif';
    const words = title.split(' ');
    let line = '';
    let yPos = 148;
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width > 205) {
        ctx.fillText(line, 128, yPos);
        line = w;
        yPos += 26;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 128, yPos);

    // Status pill
    ctx.fillStyle = completed ? 'rgba(234, 179, 8, 0.25)' : 'rgba(6, 182, 212, 0.22)';
    ctx.fillRect(36, 248, 184, 42);
    ctx.strokeStyle = completed ? '#facc15' : '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 248, 184, 42);

    ctx.fillStyle = completed ? '#fef08a' : '#67e8f9';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(completed ? `PECSÉT: ${fragment}` : 'NYITOTT KAPU', 128, 275);

    // Bottom prompt
    ctx.fillStyle = isSelected ? '#fde047' : '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(isSelected ? 'KATTINTS A BELÉPÉSHEZ' : 'KIVÁLASZTÁS', 128, 340);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const CommandCenter3D: React.FC<CommandCenter3DProps> = ({
  state,
  selectedTarget,
  onSelectTarget,
  onActivateTarget,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HubTargetId>(selectedTarget);
  const onSelectRef = useRef(onSelectTarget);
  const onActivateRef = useRef(onActivateTarget);
  const yawOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const lastXRef = useRef(0);
  const doorFramesRef = useRef<{
    targetId: LabId;
    paneMat: THREE.MeshBasicMaterial;
    headerStripMat: THREE.MeshStandardMaterial;
  }[]>([]);

  // Sync callbacks, camera yaw target & redraw door texture selection border cleanly
  useEffect(() => {
    selectedRef.current = selectedTarget;
    if (selectedTarget === 'finale') {
      yawOffsetRef.current = 0;
    } else {
      const idx = LAB_ORDER.indexOf(selectedTarget);
      if (idx >= 0) {
        const portalAngle = ((idx - 2) / 2) * 0.42;
        yawOffsetRef.current = portalAngle;
      }
    }

    doorFramesRef.current.forEach((df) => {
      const idx = LAB_ORDER.indexOf(df.targetId);
      const lab = state.labs[df.targetId];
      const meta = LAB_METADATA[df.targetId];
      const oldTex = df.paneMat.map;
      const newTex = createDoorCanvasTexture(
        `0${idx + 1}`,
        meta.subtitle,
        lab.completed,
        meta.fragment,
        meta.sealColor,
        selectedTarget === df.targetId
      );
      df.paneMat.map = newTex;
      df.paneMat.needsUpdate = true;
      oldTex?.dispose();
    });
  }, [selectedTarget, state.labs]);

  useEffect(() => {
    onSelectRef.current = onSelectTarget;
    onActivateRef.current = onActivateTarget;
  }, [onSelectTarget, onActivateTarget]);

  const completedCount = LAB_ORDER.filter((id) => state.labs[id].completed).length;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;
    const isSoftwareGl = detectSoftwareGl();
    const lowGraphics = state.lowGraphicsMode;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 1.9, 6.2);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: false,
      benchY: -1.65,
    });

    const hemi = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.35);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xe0f2fe, 2.0);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    const violetLight = new THREE.PointLight(0xa855f7, 2.6, 18);
    violetLight.position.set(-4.5, 2.5, 1.5);
    scene.add(violetLight);

    const goldLight = new THREE.PointLight(0xeab308, 2.2, 14);
    goldLight.position.set(0, 2.2, 2.2);
    scene.add(goldLight);

    const disposables: { dispose: () => void }[] = [];

    // Control Room Floor Deck
    const deckGeom = new THREE.CylinderGeometry(7.2, 7.6, 0.25, 48);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x070d1e,
      metalness: 0.78,
      roughness: 0.26,
    });
    const deck = new THREE.Mesh(deckGeom, deckMat);
    deck.position.y = -1.65;
    scene.add(deck);
    disposables.push(deckGeom, deckMat);

    const floorGrid = new THREE.GridHelper(13, 18, 0x06b6d4, 0x312e81);
    floorGrid.position.y = -1.51;
    scene.add(floorGrid);

    // Metallic Frame Material
    const metalFrameMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.88,
      roughness: 0.24,
    });
    const pillarGeom = new THREE.BoxGeometry(0.18, 2.55, 0.24);
    const headerGeom = new THREE.BoxGeometry(1.76, 0.2, 0.28);
    const paneGeom = new THREE.PlaneGeometry(1.36, 2.15);
    const thresholdGeom = new THREE.BoxGeometry(1.76, 0.08, 0.42);
    disposables.push(metalFrameMat, pillarGeom, headerGeom, paneGeom, thresholdGeom);

    // 5 Holographic Airlock Doors arranged in an arc
    const interactiveTargets: { mesh: THREE.Object3D; targetId: HubTargetId }[] = [];
    const doorFrames: {
      targetId: LabId;
      paneMat: THREE.MeshBasicMaterial;
      headerStripMat: THREE.MeshStandardMaterial;
      group: THREE.Group;
    }[] = [];

    const radius = 4.25;
    LAB_ORDER.forEach((labId, idx) => {
      const lab = state.labs[labId];
      const meta = LAB_METADATA[labId];
      const angle = ((idx - 2) / 2) * 0.62; // -0.62 rad to +0.62 rad
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 1.45;

      const doorGroup = new THREE.Group();
      doorGroup.position.set(x, -0.3, z);
      doorGroup.lookAt(0, -0.3, 4.5);
      scene.add(doorGroup);

      // Left & right jambs + top header + floor threshold
      const leftJamb = new THREE.Mesh(pillarGeom, metalFrameMat);
      leftJamb.position.set(-0.78, 0, 0);
      const rightJamb = new THREE.Mesh(pillarGeom, metalFrameMat);
      rightJamb.position.set(0.78, 0, 0);
      const header = new THREE.Mesh(headerGeom, metalFrameMat);
      header.position.set(0, 1.24, 0);
      const threshold = new THREE.Mesh(thresholdGeom, metalFrameMat);
      threshold.position.set(0, -1.22, 0.06);
      doorGroup.add(leftJamb, rightJamb, header, threshold);

      const headerStripMat = new THREE.MeshStandardMaterial({
        color: lab.completed ? 0xfacc15 : 0x22d3ee,
        emissive: lab.completed ? 0xeab308 : 0x06b6d4,
        emissiveIntensity: selectedTarget === labId ? 2.0 : 1.0,
      });
      const stripGeom = new THREE.BoxGeometry(1.42, 0.05, 0.3);
      const headerStrip = new THREE.Mesh(stripGeom, headerStripMat);
      headerStrip.position.set(0, 1.13, 0.02);
      doorGroup.add(headerStrip);
      disposables.push(headerStripMat, stripGeom);

      const tex = createDoorCanvasTexture(
        `0${idx + 1}`,
        meta.subtitle,
        lab.completed,
        meta.fragment,
        meta.sealColor,
        selectedTarget === labId
      );
      const paneMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: 0.94,
        side: THREE.DoubleSide,
      });
      const paneMesh = new THREE.Mesh(paneGeom, paneMat);
      paneMesh.position.set(0, -0.04, 0.02);
      doorGroup.add(paneMesh);
      disposables.push(tex, paneMat);

      interactiveTargets.push({ mesh: paneMesh, targetId: labId });
      doorFrames.push({ targetId: labId, paneMat, headerStripMat, group: doorGroup });
    });
    doorFramesRef.current = doorFrames.map(({ targetId, paneMat, headerStripMat }) => ({
      targetId,
      paneMat,
      headerStripMat,
    }));

    // 6th Central Quantum Vault Console ('finale') in foreground center
    const vaultGroup = new THREE.Group();
    vaultGroup.position.set(0, -0.65, 0.35);
    scene.add(vaultGroup);

    const pedGeom = new THREE.CylinderGeometry(0.85, 1.05, 0.72, 24);
    const pedMesh = new THREE.Mesh(pedGeom, metalFrameMat);
    pedMesh.position.y = -0.54;
    vaultGroup.add(pedMesh);

    const allDone = completedCount === 5;
    const vaultRingMat = new THREE.MeshStandardMaterial({
      color: allDone ? 0xfacc15 : 0xf43f5e,
      emissive: allDone ? 0xeab308 : 0xe11d48,
      emissiveIntensity: allDone ? 1.8 : 1.1,
    });
    const vaultRingGeom = new THREE.TorusGeometry(0.75, 0.035, 10, 48);
    const vaultRing = new THREE.Mesh(vaultRingGeom, vaultRingMat);
    vaultRing.rotation.x = Math.PI / 2;
    vaultRing.position.y = -0.15;
    vaultGroup.add(vaultRing);

    const crystalGeom = new THREE.OctahedronGeometry(0.42, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: allDone ? 0xfacc15 : 0xa855f7,
      emissive: allDone ? 0xeab308 : 0x7e22ce,
      emissiveIntensity: allDone ? 1.6 : 0.9,
      metalness: 0.3,
      roughness: 0.15,
      transparent: true,
      opacity: 0.9,
    });
    const crystal = new THREE.Mesh(crystalGeom, crystalMat);
    crystal.scale.set(0.85, 1.35, 0.85);
    crystal.position.y = 0.55;
    vaultGroup.add(crystal);

    // Hitbox sphere for easy tapping/clicking on central vault
    const hitGeom = new THREE.SphereGeometry(0.88, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const vaultHitbox = new THREE.Mesh(hitGeom, hitMat);
    vaultHitbox.position.y = 0.4;
    vaultGroup.add(vaultHitbox);
    interactiveTargets.push({ mesh: vaultHitbox, targetId: 'finale' });

    disposables.push(pedGeom, vaultRingMat, vaultRingGeom, crystalGeom, crystalMat, hitGeom, hitMat);

    // Raycaster & Pointer Drag/Tap handling
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const canvasEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      lastXRef.current = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      dragDistanceRef.current += Math.abs(dx);
      yawOffsetRef.current = THREE.MathUtils.clamp(yawOffsetRef.current - dx * 0.0035, -0.75, 0.75);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      // Tap / Click detection (small drag movement)
      if (dragDistanceRef.current < 10) {
        const rect = canvasEl.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects(
          interactiveTargets.map((item) => item.mesh),
          false
        );
        if (hits.length > 0) {
          const hitObj = hits[0].object;
          const matched = interactiveTargets.find((item) => item.mesh === hitObj);
          if (matched) {
            if (selectedRef.current === matched.targetId) {
              onActivateRef.current(matched.targetId);
            } else {
              onSelectRef.current(matched.targetId);
            }
          }
        }
      }
    };

    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 800;
      const nh = container.clientHeight || 460;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      backdrop.update(delta, elapsed);

      crystal.rotation.y += delta * 0.85;
      crystal.position.y = 0.55 + Math.sin(elapsed * 2.1) * 0.06;
      vaultRing.rotation.z -= delta * 0.4;

      doorFrames.forEach((df) => {
        const active = selectedRef.current === df.targetId;
        df.headerStripMat.emissiveIntensity = active
          ? 1.9 + Math.sin(elapsed * 4.5) * 0.5
          : 0.9;
      });

      const targetCamX = Math.sin(yawOffsetRef.current) * 1.9;
      const lookX = Math.sin(yawOffsetRef.current) * 3.1;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4.5, delta);
      camera.position.y = 1.65 + Math.sin(elapsed * 0.5) * 0.06;
      camera.position.z = 5.6;
      camera.lookAt(lookX, -0.1, -1.6);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      doorFrames.forEach((df) => {
        df.paneMat.map?.dispose();
      });
      doorFramesRef.current = [];
      backdrop.dispose();
      envTex.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [state.lowGraphicsMode, completedCount]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/45 bg-[#040816] neon-box-cyan">
      <div
        ref={mountRef}
        className="w-full h-[360px] sm:h-[440px] lg:h-[490px] cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top HUD Readout inside 3D viewport */}
      <div className="pointer-events-none absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2">
        <div className="bg-[#060c1f]/90 border border-cyan-500/40 rounded-lg px-3 py-1.5 text-[11px] font-mono-tech text-cyan-300">
          KÖZPONTI IRÁNYÍTÓTEREM • 3D KAPUK ({completedCount}/5 PECSÉT)
        </div>
        <div className="bg-[#060c1f]/90 border border-purple-500/40 rounded-lg px-3 py-1.5 text-[11px] font-mono-tech text-slate-300">
          Húzd a körülnézéshez • Koppints egy 3D kapura a belépéshez
        </div>
      </div>
    </div>
  );
};
