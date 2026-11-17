import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

interface HoloVault3DProps {
  unlockedSealsCount: number; // 0 to 5
  latinRevealed: boolean;
  lowGraphics?: boolean;
}

export const HoloVault3D: React.FC<HoloVault3DProps> = ({
  unlockedSealsCount,
  latinRevealed,
  lowGraphics = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sealNodesRef = useRef<THREE.Mesh[]>([]);
  const coreMeshRef = useRef<THREE.Mesh | null>(null);
  const unlockedRef = useRef(unlockedSealsCount);
  const latinRef = useRef(latinRevealed);

  useEffect(() => {
    unlockedRef.current = unlockedSealsCount;
    latinRef.current = latinRevealed;
    sealNodesRef.current.forEach((node, i) => {
      const isUnlocked = i < unlockedSealsCount;
      if (node.material instanceof THREE.MeshStandardMaterial) {
        node.material.emissiveIntensity = isUnlocked ? 1.5 : 0.1;
      }
      node.scale.setScalar(isUnlocked ? 1.2 : 0.85);
    });
    if (coreMeshRef.current && coreMeshRef.current.material instanceof THREE.MeshStandardMaterial) {
      coreMeshRef.current.material.emissiveIntensity = latinRevealed ? 1.5 : 0.45;
    }
  }, [unlockedSealsCount, latinRevealed]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 350;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 60);
    camera.position.set(0, 2.3, 5.8);
    camera.lookAt(0, 0.1, 0);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: true,
      benchY: -1.45,
    });

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e1b4b, 1.3);
    scene.add(hemiLight);

    const goldKey = new THREE.PointLight(0xeab308, 2.4, 14);
    goldKey.position.set(0, 2.5, 2.0);
    scene.add(goldKey);

    const cyanFill = new THREE.PointLight(0x06b6d4, 2.0, 12);
    cyanFill.position.set(-3, 1.5, 2);
    scene.add(cyanFill);

    // Pedestal base
    const baseGeom = new THREE.CylinderGeometry(2.3, 2.6, 0.3, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.22,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = -1.15;
    scene.add(base);

    const ringGeom = new THREE.TorusGeometry(2.05, 0.04, 10, lowGraphics ? 32 : 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.4,
    });
    const outerRing = new THREE.Mesh(ringGeom, ringMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = -0.95;
    scene.add(outerRing);

    const colors = [0x06b6d4, 0xf59e0b, 0xeab308, 0x38bdf8, 0xa855f7];
    const sealNodes: THREE.Mesh[] = [];
    const pillarGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.55, 16);
    const sphereGeom = new THREE.OctahedronGeometry(0.24, 0);
    const sealMats: THREE.MeshStandardMaterial[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const x = 1.85 * Math.cos(angle);
      const z = 1.85 * Math.sin(angle);

      const pillar = new THREE.Mesh(pillarGeom, baseMat);
      pillar.position.set(x, -0.82, z);
      scene.add(pillar);

      const sMat = new THREE.MeshStandardMaterial({
        color: colors[i],
        emissive: colors[i],
        emissiveIntensity: i < unlockedRef.current ? 1.5 : 0.1,
        roughness: 0.2,
        metalness: 0.4,
      });
      sealMats.push(sMat);

      const sMesh = new THREE.Mesh(sphereGeom, sMat);
      sMesh.position.set(x, -0.35, z);
      sMesh.scale.setScalar(i < unlockedRef.current ? 1.2 : 0.85);
      scene.add(sMesh);
      sealNodes.push(sMesh);
    }
    sealNodesRef.current = sealNodes;

    // Central Holographic Core Crystal
    const coreGeom = new THREE.OctahedronGeometry(0.75, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: latinRef.current ? 1.5 : 0.45,
      transparent: true,
      opacity: 0.9,
      roughness: 0.12,
      metalness: 0.35,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.scale.set(0.85, 1.35, 0.85);
    coreMesh.position.y = 0.45;
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    const haloGeom = new THREE.TorusGeometry(1.1, 0.025, 10, 48);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 1.4,
    });
    const halo = new THREE.Mesh(haloGeom, haloMat);
    halo.position.y = 0.45;
    scene.add(halo);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 480;
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

      outerRing.rotation.z += delta * 0.25;
      coreMesh.rotation.y += delta * 0.65;
      coreMesh.position.y = 0.45 + Math.sin(elapsed * 2.0) * 0.08;
      halo.rotation.x = Math.PI / 3 + Math.sin(elapsed * 0.8) * 0.25;
      halo.rotation.y -= delta * 0.55;

      sealNodes.forEach((node, idx) => {
        node.rotation.y += delta * 0.9;
        node.position.y = -0.35 + Math.sin(elapsed * 1.8 + idx) * 0.05;
      });

      camera.position.x = Math.sin(elapsed * 0.28) * 0.25;
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
      baseGeom.dispose();
      ringGeom.dispose();
      pillarGeom.dispose();
      sphereGeom.dispose();
      coreGeom.dispose();
      haloGeom.dispose();
      baseMat.dispose();
      ringMat.dispose();
      coreMat.dispose();
      haloMat.dispose();
      sealMats.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#040712] border border-amber-500/40 neon-box-gold">
      <div ref={mountRef} className="w-full h-[320px] sm:h-[360px]" />
      <div className="absolute top-3 left-3 bg-[#070d1f]/90 px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs font-mono-tech text-amber-300">
        Központi Kvantumzár • {unlockedSealsCount}/5 Pecsét aktív
      </div>
    </div>
  );
};
