import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

interface DensityScale3DProps {
  selectedCoin: 'A' | 'B' | 'C' | null;
  coinLocation: 'tray' | 'scale' | 'cylinder';
  coinMasses: Record<'A' | 'B' | 'C', number>;
  onSelectCoin?: (coin: 'A' | 'B' | 'C') => void;
  lowGraphics?: boolean;
}

export const DensityScale3D: React.FC<DensityScale3DProps> = ({
  selectedCoin,
  coinLocation,
  coinMasses,
  onSelectCoin,
  lowGraphics = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const selectedCoinRef = useRef(selectedCoin);
  const coinLocationRef = useRef(coinLocation);
  const coinMassesRef = useRef(coinMasses);
  const onSelectCoinRef = useRef(onSelectCoin);
  const updateLcdRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    onSelectCoinRef.current = onSelectCoin;
  }, [onSelectCoin]);

  useEffect(() => {
    selectedCoinRef.current = selectedCoin;
    coinLocationRef.current = coinLocation;
    coinMassesRef.current = coinMasses;
    if (updateLcdRef.current) {
      if (coinLocation === 'scale' && selectedCoin) {
        updateLcdRef.current(`${coinMasses[selectedCoin].toFixed(1)} g`);
      } else {
        updateLcdRef.current('0.00 g');
      }
    }
  }, [selectedCoin, coinLocation, coinMasses]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 350;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 1.75, 6.2);
    camera.lookAt(0, -0.15, 0);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: true,
      benchY: -1.45,
    });

    const hemiLight = new THREE.HemisphereLight(0xfef9c3, 0x0f172a, 1.35);
    scene.add(hemiLight);

    const goldKey = new THREE.DirectionalLight(0xfef08a, 2.2);
    goldKey.position.set(4, 7, 5);
    scene.add(goldKey);

    const cyanFill = new THREE.PointLight(0x06b6d4, 2.0, 12);
    cyanFill.position.set(-3, 2, 2);
    scene.add(cyanFill);

    // --- 1. DIGITAL ANALYTICAL BALANCE (LEFT) ---
    const scaleGroup = new THREE.Group();
    scaleGroup.position.set(-1.55, -1.05, -0.15);
    scene.add(scaleGroup);

    const bodyGeom = new THREE.BoxGeometry(2.0, 0.45, 1.85);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.25,
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    scaleGroup.add(bodyMesh);

    const plateGeom = new THREE.CylinderGeometry(0.72, 0.72, 0.08, 32);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.15,
    });
    const plateMesh = new THREE.Mesh(plateGeom, plateMat);
    plateMesh.position.y = 0.28;
    scaleGroup.add(plateMesh);

    // Dynamic LCD display on front of balance
    const lcdCanvas = document.createElement('canvas');
    lcdCanvas.width = 256;
    lcdCanvas.height = 96;
    const lcdCtx = lcdCanvas.getContext('2d');
    const lcdTex = new THREE.CanvasTexture(lcdCanvas);
    lcdTex.colorSpace = THREE.SRGBColorSpace;

    const drawLcd = (text: string) => {
      if (!lcdCtx) return;
      lcdCtx.fillStyle = '#030b1a';
      lcdCtx.fillRect(0, 0, 256, 96);
      lcdCtx.strokeStyle = '#eab308';
      lcdCtx.lineWidth = 6;
      lcdCtx.strokeRect(4, 4, 248, 88);
      lcdCtx.fillStyle = '#fde047';
      lcdCtx.font = 'bold 44px monospace';
      lcdCtx.textAlign = 'center';
      lcdCtx.textBaseline = 'middle';
      lcdCtx.fillText(text, 128, 50);
      lcdTex.needsUpdate = true;
    };
    updateLcdRef.current = drawLcd;
    drawLcd(
      coinLocationRef.current === 'scale' && selectedCoinRef.current
        ? `${coinMassesRef.current[selectedCoinRef.current].toFixed(1)} g`
        : '0.00 g'
    );

    const lcdGeom = new THREE.PlaneGeometry(1.15, 0.38);
    const lcdMat = new THREE.MeshBasicMaterial({ map: lcdTex });
    const lcdMesh = new THREE.Mesh(lcdGeom, lcdMat);
    lcdMesh.position.set(0, 0.02, 0.94);
    scaleGroup.add(lcdMesh);

    // --- 2. GRADUATED CYLINDER (RIGHT) ---
    const cylGroup = new THREE.Group();
    cylGroup.position.set(1.55, -1.05, -0.15);
    scene.add(cylGroup);

    const cylBaseGeom = new THREE.CylinderGeometry(0.68, 0.78, 0.18, 24);
    const cylBaseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.65,
      roughness: 0.25,
    });
    const cylBaseMesh = new THREE.Mesh(cylBaseGeom, cylBaseMat);
    cylBaseMesh.position.y = -0.15;
    cylGroup.add(cylBaseMesh);

    const glassTubeGeom = new THREE.CylinderGeometry(0.48, 0.48, 2.5, 24, 1, true);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.45,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.5,
      depthWrite: false,
    });
    const glassTubeMesh = new THREE.Mesh(glassTubeGeom, glassMat);
    glassTubeMesh.position.y = 1.15;
    glassTubeMesh.renderOrder = 2;
    cylGroup.add(glassTubeMesh);

    // Tick scale texture overlay
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = 128;
    scaleCanvas.height = 256;
    const sCtx = scaleCanvas.getContext('2d');
    if (sCtx) {
      sCtx.clearRect(0, 0, 128, 256);
      sCtx.strokeStyle = '#67e8f9';
      sCtx.fillStyle = '#a5f3fc';
      sCtx.font = 'bold 20px monospace';
      for (let i = 0; i < 6; i++) {
        const y = 30 + i * 38;
        sCtx.lineWidth = 3;
        sCtx.beginPath();
        sCtx.moveTo(20, y);
        sCtx.lineTo(52, y);
        sCtx.stroke();
        sCtx.fillText(`${50 - i * 5}`, 60, y + 6);
      }
    }
    const scaleTex = new THREE.CanvasTexture(scaleCanvas);
    scaleTex.colorSpace = THREE.SRGBColorSpace;
    const scalePlaneGeom = new THREE.PlaneGeometry(0.6, 2.0);
    const scalePlaneMat = new THREE.MeshBasicMaterial({
      map: scaleTex,
      transparent: true,
      depthWrite: false,
    });
    const scalePlane = new THREE.Mesh(scalePlaneGeom, scalePlaneMat);
    scalePlane.position.set(0, 1.1, 0.5);
    scalePlane.renderOrder = 3;
    cylGroup.add(scalePlane);

    const waterGeom = new THREE.CylinderGeometry(0.44, 0.44, 1.4, 20);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
    });
    const waterMesh = new THREE.Mesh(waterGeom, waterMat);
    waterMesh.position.y = 0.65;
    waterMesh.renderOrder = 1;
    cylGroup.add(waterMesh);

    // --- 3. THREE DISTINCT 3D GOLD COINS (A, B, C) ---
    const coinGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.12, 32);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.94,
      roughness: 0.16,
      emissive: 0x854d0e,
      emissiveIntensity: 0.18,
    });

    const trayPositions: Record<'A' | 'B' | 'C', THREE.Vector3> = {
      A: new THREE.Vector3(-0.75, -1.24, 1.15),
      B: new THREE.Vector3(0.0, -1.24, 1.15),
      C: new THREE.Vector3(0.75, -1.24, 1.15),
    };

    const coinMeshes: Record<'A' | 'B' | 'C', THREE.Mesh> = {} as Record<'A' | 'B' | 'C', THREE.Mesh>;
    const hitTargets: THREE.Object3D[] = [];

    (['A', 'B', 'C'] as const).forEach((id) => {
      const m = new THREE.Mesh(coinGeom, coinMat);
      m.position.copy(trayPositions[id]);
      m.userData.coinId = id;
      scene.add(m);
      coinMeshes[id] = m;
      hitTargets.push(m);
    });

    // Raycaster for direct coin clicks
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);
      if (intersects.length > 0 && onSelectCoinRef.current) {
        const coinId = intersects[0].object.userData.coinId as 'A' | 'B' | 'C' | undefined;
        if (coinId) {
          onSelectCoinRef.current(coinId);
        }
      }
    };
    domEl.addEventListener('pointerdown', handlePointerDown);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 520;
      const nh = container.clientHeight || 350;
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

      const sel = selectedCoinRef.current;
      const loc = coinLocationRef.current;

      // Animate water meniscus height smoothly
      const targetWaterScaleY = loc === 'cylinder' && sel ? 1.24 : 1.0;
      const targetWaterPosY = loc === 'cylinder' && sel ? 0.82 : 0.65;
      waterMesh.scale.y = THREE.MathUtils.damp(waterMesh.scale.y, targetWaterScaleY, 6, delta);
      waterMesh.position.y = THREE.MathUtils.damp(waterMesh.position.y, targetWaterPosY, 6, delta);

      // Animate each coin to its target position
      (['A', 'B', 'C'] as const).forEach((id) => {
        const mesh = coinMeshes[id];
        let targetPos = trayPositions[id];
        let targetRotX = 0;

        if (sel === id) {
          if (loc === 'scale') {
            targetPos = new THREE.Vector3(-1.55, -0.66, -0.15);
          } else if (loc === 'cylinder') {
            targetPos = new THREE.Vector3(1.55, -0.82, -0.15);
            targetRotX = 0.45;
          }
        }

        mesh.position.x = THREE.MathUtils.damp(mesh.position.x, targetPos.x, 8, delta);
        mesh.position.y = THREE.MathUtils.damp(mesh.position.y, targetPos.y, 8, delta);
        mesh.position.z = THREE.MathUtils.damp(mesh.position.z, targetPos.z, 8, delta);
        mesh.rotation.x = THREE.MathUtils.damp(mesh.rotation.x, targetRotX, 8, delta);
        if (sel === id) {
          mesh.rotation.y += delta * 0.8;
        }
      });

      camera.position.x = Math.sin(elapsed * 0.3) * 0.18;
      camera.lookAt(0, -0.1, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      domEl.removeEventListener('pointerdown', handlePointerDown);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      backdrop.dispose();
      envTex.dispose();
      bodyGeom.dispose();
      plateGeom.dispose();
      lcdGeom.dispose();
      cylBaseGeom.dispose();
      glassTubeGeom.dispose();
      scalePlaneGeom.dispose();
      waterGeom.dispose();
      coinGeom.dispose();
      bodyMat.dispose();
      plateMat.dispose();
      lcdTex.dispose();
      lcdMat.dispose();
      cylBaseMat.dispose();
      glassMat.dispose();
      scaleTex.dispose();
      scalePlaneMat.dispose();
      waterMat.dispose();
      coinMat.dispose();
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#040712] border border-amber-500/40 neon-box-gold">
      <div
        ref={mountRef}
        className="w-full h-[320px] sm:h-[360px] cursor-pointer"
      />

      <div className="absolute top-3 left-3 bg-[#070d1f]/90 px-3 py-1 rounded-lg border border-amber-500/40 text-[11px] font-mono-tech text-amber-300">
        Analitikai mérleg
      </div>
      <div className="absolute top-3 right-3 bg-[#070d1f]/90 px-3 py-1 rounded-lg border border-cyan-500/40 text-[11px] font-mono-tech text-cyan-300">
        Mérőhenger (40,0 cm³)
      </div>
    </div>
  );
};
