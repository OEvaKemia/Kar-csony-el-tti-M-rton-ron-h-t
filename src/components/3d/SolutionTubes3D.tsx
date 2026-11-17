import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

interface SolutionTubes3DProps {
  colorA: string;
  colorB: string;
  colorC: string;
  activeTube: 'A' | 'B' | 'C' | null;
  dropTrigger: number; // increments when a drop is dispensed
  dropColor: string;
  sensorFixed?: boolean;
  onSelectTube: (tube: 'A' | 'B' | 'C') => void;
  lowGraphics?: boolean;
}

const TUBE_X: Record<'A' | 'B' | 'C', number> = {
  A: -1.35,
  B: 0.0,
  C: 1.35,
};

export const SolutionTubes3D: React.FC<SolutionTubes3DProps> = ({
  colorA,
  colorB,
  colorC,
  activeTube,
  dropTrigger,
  dropColor,
  sensorFixed = false,
  onSelectTube,
  lowGraphics = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetColorsRef = useRef<Record<'A' | 'B' | 'C', THREE.Color>>({
    A: new THREE.Color(colorA),
    B: new THREE.Color(colorB),
    C: new THREE.Color(colorC),
  });
  const activeTubeRef = useRef<'A' | 'B' | 'C' | null>(activeTube);
  const dropAnimRef = useRef<{ active: boolean; y: number; x: number; color: THREE.Color }>({
    active: false,
    y: 1.4,
    x: 0,
    color: new THREE.Color(dropColor),
  });
  const sensorFixedRef = useRef(sensorFixed);
  const onSelectTubeRef = useRef(onSelectTube);

  useEffect(() => {
    onSelectTubeRef.current = onSelectTube;
  }, [onSelectTube]);

  useEffect(() => {
    targetColorsRef.current.A.set(colorA);
    targetColorsRef.current.B.set(colorB);
    targetColorsRef.current.C.set(colorC);
  }, [colorA, colorB, colorC]);

  useEffect(() => {
    activeTubeRef.current = activeTube;
  }, [activeTube]);

  useEffect(() => {
    sensorFixedRef.current = sensorFixed;
  }, [sensorFixed]);

  useEffect(() => {
    if (dropTrigger > 0 && activeTube) {
      dropAnimRef.current = {
        active: true,
        y: 1.55,
        x: TUBE_X[activeTube],
        color: new THREE.Color(dropColor),
      };
    }
  }, [dropTrigger, activeTube, dropColor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 360;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 1.45, 6.2);
    camera.lookAt(0, 0.1, 0);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: true,
      benchY: -1.45,
    });

    // Three-point + sci-fi lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.3);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl && !lowGraphics;
    scene.add(keyLight);

    const cyanRim = new THREE.PointLight(0x06b6d4, 2.2, 10);
    cyanRim.position.set(-2.5, 1.5, 2.5);
    scene.add(cyanRim);

    const violetFill = new THREE.PointLight(0xa855f7, 1.5, 10);
    violetFill.position.set(2.5, 1.0, 1.5);
    scene.add(violetFill);

    // --- MULTI-PART FUTURISTIC TEST TUBE RACK ---
    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.24,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      roughness: 0.2,
    });

    const basePlateGeom = new THREE.BoxGeometry(4.5, 0.22, 1.6);
    const basePlate = new THREE.Mesh(basePlateGeom, metalMat);
    basePlate.position.y = -1.2;
    basePlate.receiveShadow = true;
    rackGroup.add(basePlate);

    const baseGlowGeom = new THREE.BoxGeometry(4.52, 0.04, 1.62);
    const baseGlow = new THREE.Mesh(baseGlowGeom, trimMat);
    baseGlow.position.y = -1.08;
    rackGroup.add(baseGlow);

    const topPlateGeom = new THREE.BoxGeometry(4.5, 0.14, 1.4);
    const topPlate = new THREE.Mesh(topPlateGeom, metalMat);
    topPlate.position.y = 0.45;
    rackGroup.add(topPlate);

    const postGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.65, 14);
    const postL = new THREE.Mesh(postGeom, metalMat);
    postL.position.set(-2.05, -0.35, 0);
    const postR = new THREE.Mesh(postGeom, metalMat);
    postR.position.set(2.05, -0.35, 0);
    rackGroup.add(postL, postR);

    // --- 3 TEST TUBES + HOLOGRAPHIC LABELS + HIT PROXIES ---
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.48,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.5,
      depthWrite: false,
    });

    const tubeGeom = new THREE.CylinderGeometry(0.34, 0.34, 2.25, lowGraphics ? 14 : 24, 1, true);
    const capGeom = new THREE.SphereGeometry(
      0.34,
      lowGraphics ? 14 : 24,
      8,
      0,
      Math.PI * 2,
      Math.PI / 2,
      Math.PI / 2
    );
    const rimGeom = new THREE.TorusGeometry(0.36, 0.03, 10, 24);
    const liquidGeom = new THREE.CylinderGeometry(0.3, 0.3, 1.35, lowGraphics ? 12 : 20);
    const hitGeom = new THREE.CylinderGeometry(0.55, 0.55, 2.6, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const liquidMeshes: Record<'A' | 'B' | 'C', THREE.Mesh> = {} as Record<'A' | 'B' | 'C', THREE.Mesh>;
    const liquidMats: THREE.MeshStandardMaterial[] = [];
    const hitTargets: THREE.Object3D[] = [];
    const labelTextures: THREE.CanvasTexture[] = [];
    const labelMats: THREE.MeshBasicMaterial[] = [];
    const labelGeom = new THREE.PlaneGeometry(0.55, 0.55);
    const activeHaloGeom = new THREE.TorusGeometry(0.45, 0.03, 10, 28);
    const activeHaloMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.5,
    });
    const activeHalo = new THREE.Mesh(activeHaloGeom, activeHaloMat);
    activeHalo.rotation.x = Math.PI / 2;
    activeHalo.position.set(TUBE_X.A, -1.04, 0);
    scene.add(activeHalo);

    (['A', 'B', 'C'] as const).forEach((id) => {
      const tGroup = new THREE.Group();
      tGroup.position.set(TUBE_X[id], -0.05, 0);

      const glassCyl = new THREE.Mesh(tubeGeom, glassMat);
      glassCyl.position.y = 0.22;
      glassCyl.renderOrder = 2;

      const glassBottom = new THREE.Mesh(capGeom, glassMat);
      glassBottom.position.y = -0.9;
      glassBottom.renderOrder = 2;

      const glassRim = new THREE.Mesh(rimGeom, glassMat);
      glassRim.rotation.x = Math.PI / 2;
      glassRim.position.y = 1.34;

      const lMat = new THREE.MeshStandardMaterial({
        color: targetColorsRef.current[id].clone(),
        roughness: 0.15,
        metalness: 0.05,
        transparent: true,
        opacity: 0.9,
      });
      liquidMats.push(lMat);
      const liquidMesh = new THREE.Mesh(liquidGeom, lMat);
      liquidMesh.position.y = -0.25;
      liquidMesh.renderOrder = 1;
      liquidMeshes[id] = liquidMesh;

      // Label badge on front of rack
      const c = document.createElement('canvas');
      c.width = 128;
      c.height = 128;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#071024';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 6;
        ctx.strokeRect(8, 8, 112, 112);
        ctx.fillStyle = '#67e8f9';
        ctx.font = 'bold 64px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(id, 64, 66);
      }
      const lTex = new THREE.CanvasTexture(c);
      lTex.colorSpace = THREE.SRGBColorSpace;
      labelTextures.push(lTex);
      const lBadgeMat = new THREE.MeshBasicMaterial({ map: lTex });
      labelMats.push(lBadgeMat);
      const labelMesh = new THREE.Mesh(labelGeom, lBadgeMat);
      labelMesh.position.set(0, -1.05, 0.82);

      // Invisible raycast proxy
      const hitMesh = new THREE.Mesh(hitGeom, hitMat);
      hitMesh.userData.tubeId = id;
      hitTargets.push(hitMesh);

      tGroup.add(glassCyl, glassBottom, glassRim, liquidMesh, labelMesh, hitMesh);
      scene.add(tGroup);
    });

    // --- ROBOTIC 3D PIPETTE ARM ---
    const pipetteGroup = new THREE.Group();
    pipetteGroup.position.set(TUBE_X[activeTube || 'A'], 2.1, 0);
    scene.add(pipetteGroup);

    const pipBodyGeom = new THREE.CylinderGeometry(0.14, 0.1, 0.75, 16);
    const pipBody = new THREE.Mesh(pipBodyGeom, metalMat);
    pipBody.position.y = 0.25;

    const pipCollarGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16);
    const pipCollar = new THREE.Mesh(pipCollarGeom, trimMat);
    pipCollar.position.y = 0.1;

    const pipTipGeom = new THREE.ConeGeometry(0.08, 0.45, 16);
    pipTipGeom.rotateX(Math.PI);
    const pipTipMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.7,
      roughness: 0.1,
    });
    const pipTip = new THREE.Mesh(pipTipGeom, pipTipMat);
    pipTip.position.y = -0.32;
    pipetteGroup.add(pipBody, pipCollar, pipTip);

    // Falling droplet
    const dropGeom = new THREE.SphereGeometry(0.08, 12, 12);
    const dropMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.2,
      roughness: 0.1,
    });
    const dropMesh = new THREE.Mesh(dropGeom, dropMat);
    dropMesh.visible = false;
    scene.add(dropMesh);

    // --- RIGHT-SIDE HOLOGRAPHIC pH SENSOR BEACON ---
    const sensorGroup = new THREE.Group();
    sensorGroup.position.set(2.75, -0.5, 0.2);
    scene.add(sensorGroup);
    const sensorBoxGeom = new THREE.BoxGeometry(0.55, 0.85, 0.35);
    const sensorBox = new THREE.Mesh(sensorBoxGeom, metalMat);
    const sensorScreenGeom = new THREE.PlaneGeometry(0.42, 0.55);
    const sensorScreenMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.0,
    });
    const sensorScreen = new THREE.Mesh(sensorScreenGeom, sensorScreenMat);
    sensorScreen.position.z = 0.18;
    sensorGroup.add(sensorBox, sensorScreen);

    // Raycaster for direct 3D tube clicking
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const handlePointerDown = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(hitTargets, false);
      if (intersects.length > 0) {
        const tubeId = intersects[0].object.userData.tubeId as 'A' | 'B' | 'C' | undefined;
        if (tubeId) {
          onSelectTubeRef.current(tubeId);
        }
      }
    };
    domEl.addEventListener('pointerdown', handlePointerDown);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 520;
      const nh = container.clientHeight || 360;
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

      // Smoothly transition liquid colors
      (['A', 'B', 'C'] as const).forEach((id) => {
        const mat = liquidMeshes[id].material as THREE.MeshStandardMaterial;
        mat.color.lerp(targetColorsRef.current[id], Math.min(1, delta * 6));
      });

      // Move pipette arm & active halo smoothly to active tube
      const targetTube = activeTubeRef.current || 'A';
      const targetX = TUBE_X[targetTube];
      pipetteGroup.position.x = THREE.MathUtils.damp(pipetteGroup.position.x, targetX, 8, delta);
      activeHalo.position.x = THREE.MathUtils.damp(activeHalo.position.x, targetX, 10, delta);

      const targetPipY = dropAnimRef.current.active ? 1.85 : 2.15 + Math.sin(elapsed * 2) * 0.04;
      pipetteGroup.position.y = THREE.MathUtils.damp(pipetteGroup.position.y, targetPipY, 9, delta);

      // Droplet fall animation
      if (dropAnimRef.current.active) {
        dropMesh.visible = true;
        dropMesh.position.x = dropAnimRef.current.x;
        dropAnimRef.current.y -= delta * 5.2;
        dropMesh.position.y = dropAnimRef.current.y;
        dropMat.color.copy(dropAnimRef.current.color);
        dropMat.emissive.copy(dropAnimRef.current.color);
        if (dropAnimRef.current.y <= 0.35) {
          dropAnimRef.current.active = false;
          dropMesh.visible = false;
        }
      }

      // pH sensor status glow
      const sCol = sensorFixedRef.current ? 0x22d3ee : 0xf59e0b;
      sensorScreenMat.color.setHex(sCol);
      sensorScreenMat.emissive.setHex(sCol);

      // Subtle camera parallax
      camera.position.x = Math.sin(elapsed * 0.35) * 0.22;
      camera.lookAt(0, 0.05, 0);

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
      basePlateGeom.dispose();
      baseGlowGeom.dispose();
      topPlateGeom.dispose();
      postGeom.dispose();
      tubeGeom.dispose();
      capGeom.dispose();
      rimGeom.dispose();
      liquidGeom.dispose();
      hitGeom.dispose();
      labelGeom.dispose();
      activeHaloGeom.dispose();
      pipBodyGeom.dispose();
      pipCollarGeom.dispose();
      pipTipGeom.dispose();
      dropGeom.dispose();
      sensorBoxGeom.dispose();
      sensorScreenGeom.dispose();
      metalMat.dispose();
      trimMat.dispose();
      glassMat.dispose();
      hitMat.dispose();
      activeHaloMat.dispose();
      pipTipMat.dispose();
      dropMat.dispose();
      sensorScreenMat.dispose();
      liquidMats.forEach((m) => m.dispose());
      labelTextures.forEach((t) => t.dispose());
      labelMats.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#040712] border border-cyan-500/40 neon-box-cyan">
      <div
        ref={mountRef}
        className="w-full h-[320px] sm:h-[380px] cursor-pointer"
      />

      <div className="bg-[#070d1f]/95 border-t border-cyan-500/25 p-3">
        <div className="text-[11px] font-mono-tech text-cyan-300/80 text-center mb-2">
          Kattints a kémcsőre a 3D térben vagy válassz alább a cseppentéshez:
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {(['A', 'B', 'C'] as const).map((tube) => (
            <button
              key={tube}
              onClick={() => onSelectTube(tube)}
              className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-mono-tech font-bold transition-all flex items-center justify-center gap-2 ${
                activeTube === tube
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 neon-box-cyan'
                  : 'bg-[#0b132b] border-slate-700/80 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-200'
              }`}
            >
              <span>Kémcső {tube}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
