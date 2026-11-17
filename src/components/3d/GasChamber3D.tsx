import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

interface GasChamber3DProps {
  volume: number; // 4.0 to 10.0 L
  pressure: number; // atm
  temperature: number; // Kelvin
  snowEffectActive?: boolean;
  lowGraphics?: boolean;
}

export const GasChamber3D: React.FC<GasChamber3DProps> = ({
  volume,
  pressure,
  temperature,
  snowEffectActive = false,
  lowGraphics = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef(volume);
  const tempRef = useRef(temperature);
  const pressureRef = useRef(pressure);
  const snowActiveRef = useRef(snowEffectActive);

  useEffect(() => {
    volumeRef.current = volume;
    tempRef.current = temperature;
    pressureRef.current = pressure;
    snowActiveRef.current = snowEffectActive;
  }, [volume, pressure, temperature, snowEffectActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 350;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 1.35, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: true,
      benchY: -1.5,
    });

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x0f172a, 1.4);
    scene.add(hemiLight);

    const cyanKey = new THREE.DirectionalLight(0x38bdf8, 2.2);
    cyanKey.position.set(3, 6, 4);
    scene.add(cyanKey);

    const rimLight = new THREE.PointLight(0x06b6d4, 2.0, 12);
    rimLight.position.set(-3.5, 0.5, 2.5);
    scene.add(rimLight);

    // --- CYLINDER VESSEL ---
    const cylGroup = new THREE.Group();
    cylGroup.position.set(-0.75, 0, 0);
    scene.add(cylGroup);

    const baseGeom = new THREE.CylinderGeometry(1.32, 1.45, 0.25, 32);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.24,
    });
    const baseMesh = new THREE.Mesh(baseGeom, metalMat);
    baseMesh.position.y = -1.35;
    cylGroup.add(baseMesh);

    const baseRingGeom = new THREE.TorusGeometry(1.3, 0.035, 10, 48);
    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.4,
    });
    const baseRing = new THREE.Mesh(baseRingGeom, cyanGlowMat);
    baseRing.rotation.x = Math.PI / 2;
    baseRing.position.y = -1.21;
    cylGroup.add(baseRing);

    const wallGeom = new THREE.CylinderGeometry(1.2, 1.2, 3.0, 32, 1, true);
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.42,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.45,
      depthWrite: false,
    });
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.renderOrder = 2;
    cylGroup.add(wallMesh);

    const topCapRingGeom = new THREE.TorusGeometry(1.22, 0.05, 10, 36);
    const topCapRing = new THREE.Mesh(topCapRingGeom, metalMat);
    topCapRing.rotation.x = Math.PI / 2;
    topCapRing.position.y = 1.5;
    cylGroup.add(topCapRing);

    // --- MOVABLE PISTON ---
    const piston = new THREE.Group();
    piston.position.y = -0.45 + ((volumeRef.current - 4.0) / 6.0) * 1.75;
    cylGroup.add(piston);

    const pistonHeadGeom = new THREE.CylinderGeometry(1.16, 1.16, 0.2, 32);
    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.78,
      roughness: 0.18,
    });
    const pistonHead = new THREE.Mesh(pistonHeadGeom, pistonMat);
    piston.add(pistonHead);

    const pistonSealGeom = new THREE.TorusGeometry(1.17, 0.035, 10, 36);
    const pistonSeal = new THREE.Mesh(pistonSealGeom, cyanGlowMat);
    pistonSeal.rotation.x = Math.PI / 2;
    piston.add(pistonSeal);

    const rodGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.3, 16);
    const rodMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.92,
      roughness: 0.12,
    });
    const rod = new THREE.Mesh(rodGeom, rodMat);
    rod.position.y = 1.15;
    piston.add(rod);

    // --- BOUNCING GAS PARTICLES ---
    const particleCount = lowGraphics || isSoftwareGl ? 28 : 56;
    const pGeom = new THREE.SphereGeometry(0.068, 10, 10);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.9,
      roughness: 0.15,
    });
    const instancedMesh = new THREE.InstancedMesh(pGeom, pMat, particleCount);
    instancedMesh.frustumCulled = false;
    cylGroup.add(instancedMesh);

    const posList: THREE.Vector3[] = [];
    const velList: THREE.Vector3[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < particleCount; i++) {
      posList.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 1.6,
          -1.1 + Math.random() * 0.7,
          (Math.random() - 0.5) * 1.6
        )
      );
      velList.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        )
          .normalize()
          .multiplyScalar(1.6)
      );
    }

    // --- ANALOG PRESSURE GAUGE (RIGHT) ---
    const gaugeGroup = new THREE.Group();
    gaugeGroup.position.set(1.65, 0.35, 0);
    scene.add(gaugeGroup);

    const pipeGeom = new THREE.CylinderGeometry(0.065, 0.065, 1.35, 12);
    const pipe = new THREE.Mesh(pipeGeom, metalMat);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(-0.68, 0, 0);
    gaugeGroup.add(pipe);

    const gaugeStandGeom = new THREE.CylinderGeometry(0.12, 0.25, 1.75, 16);
    const gaugeStand = new THREE.Mesh(gaugeStandGeom, metalMat);
    gaugeStand.position.set(0, -0.88, 0);
    gaugeGroup.add(gaugeStand);

    const dialBackGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.14, 32);
    const dialBack = new THREE.Mesh(dialBackGeom, metalMat);
    dialBack.rotation.x = Math.PI / 2;
    gaugeGroup.add(dialBack);

    const dCanvas = document.createElement('canvas');
    dCanvas.width = 160;
    dCanvas.height = 160;
    const dCtx = dCanvas.getContext('2d');
    if (dCtx) {
      dCtx.fillStyle = '#070d1f';
      dCtx.beginPath();
      dCtx.arc(80, 80, 72, 0, Math.PI * 2);
      dCtx.fill();
      dCtx.strokeStyle = '#22d3ee';
      dCtx.lineWidth = 5;
      dCtx.stroke();

      // Draw exact scale ticks for 0..4 atm across -120deg to +120deg from top
      for (let val = 0; val <= 4; val += 0.5) {
        const angleFromTop = (-120 + (val / 4) * 240) * (Math.PI / 180);
        const sinA = Math.sin(angleFromTop);
        const cosA = Math.cos(angleFromTop);
        const isMajor = Number.isInteger(val);
        const rOuter = 66;
        const rInner = isMajor ? 55 : 60;
        dCtx.strokeStyle = isMajor ? '#38bdf8' : '#0ea5e9';
        dCtx.lineWidth = isMajor ? 3 : 1.5;
        dCtx.beginPath();
        dCtx.moveTo(80 + rInner * sinA, 80 - rInner * cosA);
        dCtx.lineTo(80 + rOuter * sinA, 80 - rOuter * cosA);
        dCtx.stroke();

        if (isMajor) {
          dCtx.fillStyle = '#e0f2fe';
          dCtx.font = 'bold 16px monospace';
          dCtx.textAlign = 'center';
          dCtx.textBaseline = 'middle';
          dCtx.fillText(`${val}`, 80 + 42 * sinA, 80 - 42 * cosA);
        }
      }

      dCtx.fillStyle = '#38bdf8';
      dCtx.font = 'bold 18px monospace';
      dCtx.textAlign = 'center';
      dCtx.textBaseline = 'middle';
      dCtx.fillText('atm', 80, 122);
    }
    const dialTex = new THREE.CanvasTexture(dCanvas);
    dialTex.colorSpace = THREE.SRGBColorSpace;
    const dialFaceGeom = new THREE.PlaneGeometry(1.22, 1.22);
    const dialFaceMat = new THREE.MeshBasicMaterial({ map: dialTex, transparent: true });
    const dialFace = new THREE.Mesh(dialFaceGeom, dialFaceMat);
    dialFace.position.z = 0.08;
    gaugeGroup.add(dialFace);

    const needleGeom = new THREE.BoxGeometry(0.045, 0.52, 0.025);
    needleGeom.translate(0, 0.26, 0);
    const needleMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const needle = new THREE.Mesh(needleGeom, needleMat);
    needle.position.z = 0.09;
    gaugeGroup.add(needle);

    // Celebration indoor snow burst (active only after Lab 4 completion!)
    const celebSnowCount = lowGraphics ? 35 : 80;
    const celebGeom = new THREE.BufferGeometry();
    const celebPos = new Float32Array(celebSnowCount * 3);
    for (let i = 0; i < celebSnowCount; i++) {
      celebPos[i * 3] = (Math.random() - 0.5) * 7;
      celebPos[i * 3 + 1] = Math.random() * 5;
      celebPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    celebGeom.setAttribute('position', new THREE.BufferAttribute(celebPos, 3));
    const celebMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.85,
    });
    const celebSnow = new THREE.Points(celebGeom, celebMat);
    celebSnow.visible = snowActiveRef.current;
    scene.add(celebSnow);

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

      // Smoothly damp piston height & gauge needle
      const targetY = -0.45 + ((volumeRef.current - 4.0) / 6.0) * 1.75;
      piston.position.y = THREE.MathUtils.damp(piston.position.y, targetY, 9, delta);

      // Calibrated 0..4 atm needle: +120 deg at 0 atm, 0 deg at 2 atm, -120 deg at 4 atm
      const clampedRatio = THREE.MathUtils.clamp(pressureRef.current / 4.0, 0, 1);
      const targetAngle = (1 - 2 * clampedRatio) * ((Math.PI * 2) / 3);
      needle.rotation.z = THREE.MathUtils.damp(needle.rotation.z, targetAngle, 8, delta);

      // Bounce gas particles
      const currentPistonY = piston.position.y;
      const speedFactor = (tempRef.current / 300) * 1.55;

      for (let i = 0; i < posList.length; i++) {
        const p = posList[i];
        const v = velList[i];

        p.x += v.x * delta * speedFactor;
        p.y += v.y * delta * speedFactor;
        p.z += v.z * delta * speedFactor;

        const r = Math.sqrt(p.x * p.x + p.z * p.z);
        if (r > 1.0) {
          const nx = p.x / r;
          const nz = p.z / r;
          const dot = v.x * nx + v.z * nz;
          v.x -= 2 * dot * nx;
          v.z -= 2 * dot * nz;
          p.x = nx * 0.98;
          p.z = nz * 0.98;
        }
        if (p.y < -1.18) {
          p.y = -1.18;
          v.y = Math.abs(v.y);
        }
        if (p.y > currentPistonY - 0.14) {
          p.y = currentPistonY - 0.14;
          v.y = -Math.abs(v.y);
        }

        dummy.position.copy(p);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;

      // Celebration snow effect if lab completed
      celebSnow.visible = snowActiveRef.current;
      if (snowActiveRef.current) {
        const attr = celebGeom.attributes.position as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        for (let i = 0; i < celebSnowCount; i++) {
          arr[i * 3 + 1] -= delta * 1.3;
          arr[i * 3] += Math.sin(elapsed + i) * delta * 0.25;
          if (arr[i * 3 + 1] < -1.5) {
            arr[i * 3 + 1] = 3.5;
          }
        }
        attr.needsUpdate = true;
      }

      camera.position.x = Math.sin(elapsed * 0.3) * 0.18;
      camera.lookAt(0, 0.05, 0);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (container.contains(domElRef(renderer))) {
        container.removeChild(renderer.domElement);
      }
      backdrop.dispose();
      envTex.dispose();
      baseGeom.dispose();
      baseRingGeom.dispose();
      wallGeom.dispose();
      topCapRingGeom.dispose();
      pistonHeadGeom.dispose();
      pistonSealGeom.dispose();
      rodGeom.dispose();
      pGeom.dispose();
      pipeGeom.dispose();
      gaugeStandGeom.dispose();
      dialBackGeom.dispose();
      dialFaceGeom.dispose();
      needleGeom.dispose();
      celebGeom.dispose();
      metalMat.dispose();
      cyanGlowMat.dispose();
      wallMat.dispose();
      pistonMat.dispose();
      rodMat.dispose();
      pMat.dispose();
      dialTex.dispose();
      dialFaceMat.dispose();
      needleMat.dispose();
      celebMat.dispose();
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#040712] border border-sky-500/40 neon-box-cyan">
      <div ref={mountRef} className="w-full h-[320px] sm:h-[360px]" />

      {/* Realtime HUD badges (no backdrop-blur over WebGL) */}
      <div className="absolute top-3 left-3 bg-[#070d1f]/90 px-3 py-1.5 rounded-lg border border-sky-500/40 text-xs font-mono-tech flex items-center gap-2">
        <span className="text-slate-400">V =</span>
        <span className="text-sky-300 font-bold">{volume.toFixed(1)} L</span>
      </div>
      <div className="absolute top-3 right-3 bg-[#070d1f]/90 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-xs font-mono-tech flex items-center gap-2">
        <span className="text-slate-400">p =</span>
        <span className="text-cyan-300 font-bold">{pressure.toFixed(2)} atm</span>
      </div>
      <div className="absolute bottom-3 left-3 bg-[#070d1f]/90 px-3 py-1 rounded-lg border border-slate-700 text-[11px] font-mono-tech text-slate-300">
        T = <span className="text-amber-400 font-bold">{temperature} K</span>
      </div>
    </div>
  );
};

function domElRef(renderer: THREE.WebGLRenderer) {
  return renderer.domElement;
}
