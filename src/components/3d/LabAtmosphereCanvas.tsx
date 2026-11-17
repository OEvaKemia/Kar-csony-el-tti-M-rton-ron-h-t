import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface LabAtmosphereCanvasProps {
  lowGraphics?: boolean;
}

export const LabAtmosphereCanvas: React.FC<LabAtmosphereCanvasProps> = ({ lowGraphics = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.04);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && !lowGraphics,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl || lowGraphics ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // Ambient & Key Light
    const ambientLight = new THREE.AmbientLight(0x0e2a47, 1.5);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 2, 20);
    cyanLight.position.set(-6, 4, 2);
    scene.add(cyanLight);

    const goldLight = new THREE.PointLight(0xf59e0b, 1.5, 20);
    goldLight.position.set(6, 3, -2);
    scene.add(goldLight);

    // Glowing Holographic Seal Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ringGroup.position.set(0, 0, -4);

    const ringGeom1 = new THREE.TorusGeometry(3.5, 0.03, 8, lowGraphics ? 24 : 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
    ringGroup.add(ring1);

    const ringGeom2 = new THREE.TorusGeometry(2.5, 0.02, 8, lowGraphics ? 24 : 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.25 });
    const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
    ringGroup.add(ring2);

    // Floating Snowflake Particles (Snow outside window / cyber air particles)
    const particleCount = lowGraphics || isSoftwareGl ? 80 : 220;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 14 - 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
      speeds[i] = 0.5 + Math.random() * 0.8;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);
    particleTexture.colorSpace = THREE.SRGBColorSpace;

    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      map: particleTexture,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeom, particleMat);
    scene.add(particles);

    // Floor grid lines
    const gridHelper = new THREE.GridHelper(24, 24, 0x06b6d4, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Window resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();

      ring1.rotation.z += delta * 0.15;
      ring1.rotation.x += delta * 0.08;
      ring2.rotation.z -= delta * 0.2;
      ring2.rotation.y += delta * 0.1;

      // Update falling snowflakes
      const posAttr = particleGeom.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] -= speeds[i] * delta * 1.2;
        // subtle wind oscillation
        arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.8) * delta * 0.2;
        if (arr[i * 3 + 1] < -3) {
          arr[i * 3 + 1] = 11;
          arr[i * 3] = (Math.random() - 0.5) * 20;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      ringGeom1.dispose();
      ringMat1.dispose();
      ringGeom2.dispose();
      ringMat2.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [lowGraphics]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      aria-hidden="true"
    />
  );
};
