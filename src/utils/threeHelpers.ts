import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function detectSoftwareGl(): boolean {
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
}

export function createStudioRenderer(
  width: number,
  height: number,
  lowGraphics: boolean,
  isSoftwareGl: boolean
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl && !lowGraphics,
    alpha: true,
    powerPreference: lowGraphics ? 'low-power' : 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(
    isSoftwareGl || lowGraphics ? 1 : Math.min(window.devicePixelRatio, 2)
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !isSoftwareGl && !lowGraphics;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  return renderer;
}

export function applyStudioEnvironment(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer
): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmremGenerator.dispose();
  return envTex;
}

export interface LabBackdropHandle {
  update: (delta: number, elapsed: number) => void;
  dispose: () => void;
}

/**
 * Builds a futuristic 2077 Christmas research lab backdrop:
 * - Dark graphite/navy bench and lab deck with cyan trim
 * - Panoramic glass wall looking out at a snowy 2077 cityscape
 * - Restrained gold & Christmas crimson station beacons
 * - Falling exterior snow particles
 */
export function createSnowyLabBackdrop(
  scene: THREE.Scene,
  lowGraphics: boolean,
  isSoftwareGl: boolean,
  options: { includeBench?: boolean; benchY?: number } = {}
): LabBackdropHandle {
  const { includeBench = true, benchY = -1.45 } = options;
  const disposables: { dispose: () => void }[] = [];
  const backdropGroup = new THREE.Group();
  scene.add(backdropGroup);

  scene.fog = new THREE.FogExp2(0x050816, 0.042);

  // 1. Lab Bench / Deck Platform
  if (includeBench) {
    const benchGeom = new THREE.BoxGeometry(8.5, 0.3, 4.0);
    const benchMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.72,
      roughness: 0.28,
    });
    const bench = new THREE.Mesh(benchGeom, benchMat);
    bench.position.set(0, benchY, 0);
    bench.receiveShadow = true;
    backdropGroup.add(bench);

    // Glowing turquoise/cyan front edge trim
    const trimGeom = new THREE.BoxGeometry(8.52, 0.04, 0.05);
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.4,
      roughness: 0.2,
    });
    const frontTrim = new THREE.Mesh(trimGeom, trimMat);
    frontTrim.position.set(0, benchY + 0.14, 2.0);
    backdropGroup.add(frontTrim);

    disposables.push(benchGeom, benchMat, trimGeom, trimMat);
  }

  // 2. Futuristic Glass Bulkhead Window Frame behind bench
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b4b, // deep space violet-graphite
    metalness: 0.85,
    roughness: 0.25,
  });
  const pillarGeom = new THREE.BoxGeometry(0.32, 6.0, 0.35);
  const leftPillar = new THREE.Mesh(pillarGeom, frameMat);
  leftPillar.position.set(-4.3, 0.8, -2.5);
  const rightPillar = new THREE.Mesh(pillarGeom, frameMat);
  rightPillar.position.set(4.3, 0.8, -2.5);

  const lintelGeom = new THREE.BoxGeometry(9.2, 0.35, 0.4);
  const topLintel = new THREE.Mesh(lintelGeom, frameMat);
  topLintel.position.set(0, 3.6, -2.5);
  backdropGroup.add(leftPillar, rightPillar, topLintel);

  // Subtle glass pane across back window
  const glassPaneGeom = new THREE.PlaneGeometry(8.3, 5.2);
  const glassPaneMat = new THREE.MeshPhysicalMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.1,
    roughness: 0.08,
    metalness: 0.1,
    depthWrite: false,
  });
  const glassPane = new THREE.Mesh(glassPaneGeom, glassPaneMat);
  glassPane.position.set(0, 1.0, -2.45);
  backdropGroup.add(glassPane);

  // Restrained Christmas Gold & Crimson LED Beacon Strips on pillars
  const goldBeaconGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
  const goldBeaconMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 1.6,
  });
  const crimsonBeaconMat = new THREE.MeshStandardMaterial({
    color: 0xf43f5e,
    emissive: 0xe11d48,
    emissiveIntensity: 1.5,
  });

  const beaconL1 = new THREE.Mesh(goldBeaconGeom, goldBeaconMat);
  beaconL1.position.set(-4.1, 2.2, -2.3);
  const beaconL2 = new THREE.Mesh(goldBeaconGeom, crimsonBeaconMat);
  beaconL2.position.set(-4.1, 1.5, -2.3);
  const beaconR1 = new THREE.Mesh(goldBeaconGeom, crimsonBeaconMat);
  beaconR1.position.set(4.1, 2.2, -2.3);
  const beaconR2 = new THREE.Mesh(goldBeaconGeom, goldBeaconMat);
  beaconR2.position.set(4.1, 1.5, -2.3);
  backdropGroup.add(beaconL1, beaconL2, beaconR1, beaconR2);

  disposables.push(
    frameMat,
    pillarGeom,
    lintelGeom,
    glassPaneGeom,
    glassPaneMat,
    goldBeaconGeom,
    goldBeaconMat,
    crimsonBeaconMat
  );

  // 3. Snowy 2077 Futuristic Cityscape Silhouettes outside the window
  const towerPositions = [
    { x: -5.5, w: 1.4, h: 6.5, z: -8.0, color: 0x06b6d4 },
    { x: -3.2, w: 1.2, h: 8.2, z: -10.5, color: 0xa855f7 },
    { x: -1.1, w: 1.6, h: 5.8, z: -9.0, color: 0x06b6d4 },
    { x: 1.5, w: 1.3, h: 8.8, z: -11.0, color: 0xeab308 },
    { x: 3.6, w: 1.5, h: 6.4, z: -8.5, color: 0xe11d48 },
    { x: 5.8, w: 1.4, h: 7.2, z: -9.5, color: 0x38bdf8 },
  ];

  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x090d1a,
    roughness: 0.7,
    metalness: 0.3,
  });
  disposables.push(towerMat);

  towerPositions.forEach((tp) => {
    const tGeom = new THREE.BoxGeometry(tp.w, tp.h, tp.w);
    const tower = new THREE.Mesh(tGeom, towerMat);
    tower.position.set(tp.x, tp.h / 2 - 2.8, tp.z);
    backdropGroup.add(tower);

    // Glowing roof trim / spire beacon
    const spireGeom = new THREE.BoxGeometry(tp.w * 0.65, 0.08, tp.w * 0.65);
    const spireMat = new THREE.MeshBasicMaterial({ color: tp.color });
    const spire = new THREE.Mesh(spireGeom, spireMat);
    spire.position.set(tp.x, tp.h - 2.8 + 0.05, tp.z);
    backdropGroup.add(spire);

    disposables.push(tGeom, spireGeom, spireMat);
  });

  // 4. Exterior Falling Snow Particles beyond the glass
  const snowCount = lowGraphics || isSoftwareGl ? 60 : 150;
  const snowGeom = new THREE.BufferGeometry();
  const snowPositions = new Float32Array(snowCount * 3);
  const snowSpeeds = new Float32Array(snowCount);

  for (let i = 0; i < snowCount; i++) {
    snowPositions[i * 3] = (Math.random() - 0.5) * 14;
    snowPositions[i * 3 + 1] = Math.random() * 8 - 2;
    snowPositions[i * 3 + 2] = -3.2 - Math.random() * 6;
    snowSpeeds[i] = 0.6 + Math.random() * 0.9;
  }
  snowGeom.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

  const snowMat = new THREE.PointsMaterial({
    color: 0xe0f2fe,
    size: 0.09,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  });
  const snowPoints = new THREE.Points(snowGeom, snowMat);
  backdropGroup.add(snowPoints);
  disposables.push(snowGeom, snowMat);

  return {
    update: (delta: number, elapsed: number) => {
      // Gentle beacon pulse
      goldBeaconMat.emissiveIntensity = 1.2 + Math.sin(elapsed * 2.2) * 0.45;
      crimsonBeaconMat.emissiveIntensity = 1.2 + Math.cos(elapsed * 2.2) * 0.45;

      // Update falling snow
      const posAttr = snowGeom.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        arr[i * 3 + 1] -= snowSpeeds[i] * delta;
        arr[i * 3] += Math.sin(elapsed + i) * delta * 0.15;
        if (arr[i * 3 + 1] < -2.5) {
          arr[i * 3 + 1] = 5.5;
          arr[i * 3] = (Math.random() - 0.5) * 14;
        }
      }
      posAttr.needsUpdate = true;
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose());
    },
  };
}
