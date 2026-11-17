import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
} from '../../utils/threeHelpers';

export type FinaleStagePhase = 'vault' | 'hologram' | 'celebration';

interface FinaleHologram3DProps {
  unlockedSealsCount: number;
  phase: FinaleStagePhase;
  lowGraphics?: boolean;
  replayTrigger?: number;
  transparentBackdrop?: boolean;
  heightClassName?: string;
}

function createSnowflakeSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.45, 'rgba(207, 250, 254, 0.85)');
    grad.addColorStop(1, 'rgba(207, 250, 254, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMottoBannerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 176;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 1024, 176);

    const bgGrad = ctx.createLinearGradient(0, 0, 1024, 0);
    bgGrad.addColorStop(0, 'rgba(6, 182, 212, 0.0)');
    bgGrad.addColorStop(0.15, 'rgba(6, 182, 212, 0.18)');
    bgGrad.addColorStop(0.5, 'rgba(8, 51, 68, 0.42)');
    bgGrad.addColorStop(0.85, 'rgba(6, 182, 212, 0.18)');
    bgGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(40, 28, 944, 120);

    const lineGrad = ctx.createLinearGradient(80, 0, 944, 0);
    lineGrad.addColorStop(0, 'rgba(34, 211, 238, 0.0)');
    lineGrad.addColorStop(0.2, 'rgba(34, 211, 238, 0.85)');
    lineGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.95)');
    lineGrad.addColorStop(0.8, 'rgba(34, 211, 238, 0.85)');
    lineGrad.addColorStop(1, 'rgba(34, 211, 238, 0.0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(80, 30, 864, 2.5);
    ctx.fillRect(80, 145, 864, 2.5);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(34, 211, 238, 0.95)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#e0f2fe';
    ctx.font = '900 56px "Orbitron", "Chakra Petch", sans-serif';
    ctx.fillText('NON RECUSO LABOREM', 512, 88);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createMissingPortraitFallbackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#071124';
    ctx.fillRect(0, 0, 512, 720);
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 472, 680);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const HOLOGRAM_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Semi-transparent bluish-turquoise hologram shader preserving original portrait facial features
const PORTRAIT_HOLOGRAM_FRAGMENT = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uReveal;
  varying vec2 vUv;

  void main() {
    if (uReveal <= 0.005) discard;

    vec4 tex = texture2D(uTexture, vUv);
    float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));

    // Preserve natural facial tones & hand details while dissolving dark black background cleanly
    float detailCurve = pow(clamp((luma - 0.04) / 0.92, 0.0, 1.0), 0.88);
    float silhouetteMask = smoothstep(0.03, 0.22, luma);

    // Soft edge vignette so rectangular borders melt seamlessly into the snowy background
    float edgeX = smoothstep(0.0, 0.09, vUv.x) * smoothstep(1.0, 0.91, vUv.x);
    float edgeY = smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float edgeMask = edgeX * edgeY;

    // Subtle holographic scanlines & ascending light sweep
    float scanline = 0.92 + 0.08 * sin(vUv.y * 230.0 - uTime * 3.2);
    float sweepPos = fract(uTime * 0.17);
    float sweepBand = smoothstep(0.075, 0.0, abs(vUv.y - sweepPos)) * 0.14;

    // Gentle light flicker
    float flicker = 0.96 + 0.04 * sin(uTime * 9.5) * cos(uTime * 3.1);

    // Bottom-to-top materialization beam
    float revealEdge = smoothstep(uReveal - 0.14, uReveal + 0.02, vUv.y);
    float revealMask = 1.0 - revealEdge;
    float revealLine = smoothstep(0.05, 0.0, abs(vUv.y - uReveal)) * step(uReveal, 0.98) * 0.6;

    // Dignified bluish-turquoise palette
    vec3 deepCyan = vec3(0.05, 0.44, 0.72);
    vec3 midTurquoise = vec3(0.26, 0.86, 0.98);
    vec3 iceHighlight = vec3(0.86, 0.98, 1.0);

    vec3 holoColor = mix(deepCyan, midTurquoise, smoothstep(0.08, 0.60, detailCurve));
    holoColor = mix(holoColor, iceHighlight, smoothstep(0.58, 0.96, detailCurve));
    holoColor = holoColor * scanline * flicker + vec3(0.35, 0.95, 1.0) * (sweepBand + revealLine);

    // Semi-transparent hologram so snowy school facade remains softly visible behind
    float alpha = (0.12 + 0.74 * detailCurve) * silhouetteMask * edgeMask * revealMask * smoothstep(0.0, 0.2, uReveal);
    alpha = clamp(alpha + revealLine * edgeMask * 0.4, 0.0, 0.86);

    if (alpha < 0.01) discard;
    gl_FragColor = vec4(holoColor, alpha);
  }
`;

// Progressive horizontal holographic reveal for "NON RECUSO LABOREM"
const MOTTO_BANNER_FRAGMENT = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uTextReveal;
  varying vec2 vUv;

  void main() {
    if (uTextReveal <= 0.01) discard;
    vec4 tex = texture2D(uTexture, vUv);
    if (tex.a < 0.01) discard;

    float cursor = uTextReveal * 1.08;
    float reveal = 1.0 - smoothstep(cursor - 0.08, cursor, vUv.x);
    float beam = smoothstep(0.04, 0.0, abs(vUv.x - cursor)) * step(uTextReveal, 0.97) * 0.85;
    float pulse = 0.92 + 0.08 * sin(uTime * 2.8);

    vec3 col = tex.rgb * pulse + vec3(0.3, 0.95, 1.0) * beam;
    float alpha = tex.a * reveal;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

export const FinaleHologram3D: React.FC<FinaleHologram3DProps> = ({
  unlockedSealsCount,
  phase,
  lowGraphics = false,
  replayTrigger = 0,
  transparentBackdrop = false,
  heightClassName = 'h-[340px] sm:h-[420px] lg:h-[470px]',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<FinaleStagePhase>(phase);
  const unlockedRef = useRef<number>(unlockedSealsCount);
  const transparentRef = useRef<boolean>(transparentBackdrop);
  const transitionAnimRef = useRef({
    holoReveal: phase === 'hologram' ? 1 : 0,
    textReveal: phase === 'hologram' ? 1 : 0,
    stationFade: phase === 'celebration' ? 0 : 1,
    celebrationTimer: 0,
  });

  useEffect(() => {
    phaseRef.current = phase;
    unlockedRef.current = unlockedSealsCount;
    transparentRef.current = transparentBackdrop;
    if (phase === 'celebration') {
      transitionAnimRef.current = {
        holoReveal: 0,
        textReveal: 0,
        stationFade: 0,
        celebrationTimer: 0,
      };
    }
  }, [phase, unlockedSealsCount, replayTrigger, transparentBackdrop]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isMounted = true;
    const width = container.clientWidth || 720;
    const height = container.clientHeight || 440;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    if (!transparentBackdrop) {
      scene.background = new THREE.Color(0x040816);
      scene.fog = new THREE.FogExp2(0x040816, 0.04);
    }

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 80);
    camera.position.set(0, 0.8, 6.4);

    const renderer = createStudioRenderer(width, height, lowGraphics, isSoftwareGl);
    renderer.setClearColor(0x000000, transparentBackdrop ? 0 : 1);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const disposables: { dispose: () => void }[] = [envTex];

    // Lighting rig
    const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 1.3);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xe0f2fe, 1.8);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);

    const cyanHoloLight = new THREE.PointLight(0x22d3ee, 2.8, 14);
    cyanHoloLight.position.set(0, -0.8, 1.8);
    scene.add(cyanHoloLight);

    // --- 1. 2126 FUTURISTIC VAULT BASE (used in GrandFinale before celebration) ---
    const stationGroup = new THREE.Group();
    stationGroup.visible = !transparentBackdrop;
    scene.add(stationGroup);

    const stationMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: 1,
    });
    const stationCyanMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.3,
      transparent: true,
      opacity: 0.85,
    });
    const daisGeom = new THREE.CylinderGeometry(1.75, 2.05, 0.24, 32);
    const daisMesh = new THREE.Mesh(daisGeom, stationMat);
    daisMesh.position.y = -1.65;
    const daisRingGeom = new THREE.TorusGeometry(1.68, 0.035, 10, 48);
    const daisRing = new THREE.Mesh(daisRingGeom, stationCyanMat);
    daisRing.rotation.x = Math.PI / 2;
    daisRing.position.y = -1.5;

    const coreCrystalGeom = new THREE.OctahedronGeometry(0.58, 0);
    const coreCrystalMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: 0xeab308,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.9,
      roughness: 0.15,
      metalness: 0.45,
    });
    const coreCrystal = new THREE.Mesh(coreCrystalGeom, coreCrystalMat);
    coreCrystal.scale.set(0.85, 1.35, 0.85);
    coreCrystal.position.y = 0.05;

    const gridHelper = new THREE.GridHelper(16, 22, 0x06b6d4, 0x1e1b4b);
    gridHelper.position.y = -1.78;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.42;

    stationGroup.add(daisMesh, daisRing, coreCrystal, gridHelper);
    disposables.push(
      stationMat,
      stationCyanMat,
      daisGeom,
      daisRingGeom,
      coreCrystalGeom,
      coreCrystalMat
    );

    // --- 2. FIVE ILLUMINATED HOLOGRAPHIC SEALS ---
    const sealColors = [0x06b6d4, 0xf59e0b, 0xeab308, 0x38bdf8, 0xc084fc];
    const sealGeom = new THREE.OctahedronGeometry(0.2, 0);
    const sealRingGeom = new THREE.TorusGeometry(0.29, 0.018, 8, 28);
    disposables.push(sealGeom, sealRingGeom);

    const sealGroups: THREE.Group[] = [];
    const sealMats: THREE.MeshStandardMaterial[] = [];

    for (let i = 0; i < 5; i++) {
      const grp = new THREE.Group();
      const sMat = new THREE.MeshStandardMaterial({
        color: sealColors[i],
        emissive: sealColors[i],
        emissiveIntensity: i < unlockedRef.current ? 1.5 : 0.15,
        roughness: 0.18,
        metalness: 0.45,
      });
      sealMats.push(sMat);
      disposables.push(sMat);

      const gem = new THREE.Mesh(sealGeom, sMat);
      const haloRing = new THREE.Mesh(sealRingGeom, sMat);
      haloRing.rotation.x = Math.PI / 2.6;
      grp.add(gem, haloRing);
      scene.add(grp);
      sealGroups.push(grp);
    }

    // --- 3. CENTERED FOREGROUND BISHOP MÁRTON ÁRON HOLOGRAM ---
    const unitPlaneGeom = new THREE.PlaneGeometry(1, 1);
    disposables.push(unitPlaneGeom);

    const baseUrl = import.meta.env.BASE_URL || '/';
    const portraitUrl = `${baseUrl}assets/aistudio/image_c8011438.png`;
    const portraitFallback = createMissingPortraitFallbackTexture();
    disposables.push(portraitFallback);

    const hologramGroup = new THREE.Group();
    hologramGroup.position.set(0, 0.05, 0.5);
    scene.add(hologramGroup);

    const emitterRingGeom = new THREE.TorusGeometry(1.05, 0.024, 10, 48);
    const emitterRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
    });
    const emitterRing = new THREE.Mesh(emitterRingGeom, emitterRingMat);
    emitterRing.rotation.x = Math.PI / 2;
    emitterRing.position.set(0, -1.62, 0);
    hologramGroup.add(emitterRing);

    const coneGeom = new THREE.CylinderGeometry(1.15, 0.78, 3.05, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const beamCone = new THREE.Mesh(coneGeom, coneMat);
    beamCone.position.set(0, -0.08, 0);
    hologramGroup.add(beamCone);
    disposables.push(emitterRingGeom, emitterRingMat, coneGeom, coneMat);

    const portraitUniforms = {
      uTexture: { value: portraitFallback as THREE.Texture },
      uTime: { value: 0 },
      uReveal: { value: 0 },
    };
    const portraitMat = new THREE.ShaderMaterial({
      uniforms: portraitUniforms,
      vertexShader: HOLOGRAM_VERTEX_SHADER,
      fragmentShader: PORTRAIT_HOLOGRAM_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const portraitMesh = new THREE.Mesh(unitPlaneGeom, portraitMat);
    const defaultPortraitAspect = 960 / 1394;
    const portraitHeight = 3.2;
    portraitMesh.scale.set(portraitHeight * defaultPortraitAspect, portraitHeight, 1);
    portraitMesh.position.set(0, 0.16, 0.06);
    portraitMesh.renderOrder = 3;
    hologramGroup.add(portraitMesh);
    disposables.push(portraitMat);

    // "NON RECUSO LABOREM" progressive holographic banner
    const mottoTex = createMottoBannerTexture();
    mottoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mottoUniforms = {
      uTexture: { value: mottoTex },
      uTime: { value: 0 },
      uTextReveal: { value: 0 },
    };
    const mottoMat = new THREE.ShaderMaterial({
      uniforms: mottoUniforms,
      vertexShader: HOLOGRAM_VERTEX_SHADER,
      fragmentShader: MOTTO_BANNER_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const mottoMesh = new THREE.Mesh(unitPlaneGeom, mottoMat);
    mottoMesh.scale.set(2.9, 0.5, 1);
    mottoMesh.position.set(0, -1.24, 0.42);
    mottoMesh.renderOrder = 4;
    hologramGroup.add(mottoMesh);
    disposables.push(mottoTex, mottoMat);

    // Load original portrait image preserving exact aspect ratio
    const loader = new THREE.TextureLoader();
    loader.load(portraitUrl, (tex) => {
      if (!isMounted) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (tex.image && tex.image.width && tex.image.height) {
        const naturalAspect = tex.image.width / tex.image.height;
        portraitMesh.scale.set(portraitHeight * naturalAspect, portraitHeight, 1);
      }
      portraitUniforms.uTexture.value = tex;
      disposables.push(tex);
    });

    // --- 4. TWINKLING CHRISTMAS LIGHTS ARC ---
    const christmasLights: { mat: THREE.MeshStandardMaterial; phase: number }[] = [];
    const bulbGeom = new THREE.SphereGeometry(0.055, 10, 10);
    disposables.push(bulbGeom);
    const festivePalette = [0xfacc15, 0xf43f5e, 0x22d3ee, 0xfef08a];
    const bulbCount = lowGraphics ? 14 : 22;

    for (let i = 0; i < bulbCount; i++) {
      const t = i / (bulbCount - 1);
      const bx = -3.9 + t * 7.8;
      const by = 2.45 - Math.sin(t * Math.PI) * 0.42;
      const bz = -0.5 + Math.sin(t * Math.PI) * 0.35;
      const col = festivePalette[i % festivePalette.length];
      const mat = new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.7,
        roughness: 0.2,
      });
      const bulb = new THREE.Mesh(bulbGeom, mat);
      bulb.position.set(bx, by, bz);
      scene.add(bulb);
      christmasLights.push({ mat, phase: i * 0.65 });
      disposables.push(mat);
    }

    // --- 5. GENTLE 3D SNOWFALL ---
    const snowCount = lowGraphics || isSoftwareGl ? 70 : 170;
    const snowGeom = new THREE.BufferGeometry();
    const snowPositions = new Float32Array(snowCount * 3);
    const snowSpeeds = new Float32Array(snowCount);
    const snowDrift = new Float32Array(snowCount);

    for (let i = 0; i < snowCount; i++) {
      snowPositions[i * 3] = (Math.random() - 0.5) * 10.5;
      snowPositions[i * 3 + 1] = Math.random() * 7.0 - 2.0;
      snowPositions[i * 3 + 2] = -1.5 + Math.random() * 4.5;
      snowSpeeds[i] = 0.45 + Math.random() * 0.7;
      snowDrift[i] = Math.random() * Math.PI * 2;
    }
    snowGeom.setAttribute('position', new THREE.BufferAttribute(snowPositions, 3));

    const snowTex = createSnowflakeSpriteTexture();
    const snowMat = new THREE.PointsMaterial({
      color: 0xf0f9ff,
      map: snowTex,
      size: 0.14,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const snowPoints = new THREE.Points(snowGeom, snowMat);
    scene.add(snowPoints);
    disposables.push(snowGeom, snowTex, snowMat);

    // Subtle pointer parallax
    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 720;
      const nh = container.clientHeight || 440;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    const _lookAtTarget = new THREE.Vector3(0, 0.08, 0);
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!isMounted) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      if (!isMounted) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const activePhase = phaseRef.current;
      const anim = transitionAnimRef.current;

      let targetHolo = 0;
      let targetText = 0;
      let targetStation = transparentRef.current ? 0 : 1;

      if (activePhase === 'hologram') {
        targetHolo = 1;
        targetText = 1;
        targetStation = transparentRef.current ? 0 : 0.35;
      } else if (activePhase === 'celebration') {
        anim.celebrationTimer += delta;
        if (anim.celebrationTimer > 0.45) {
          targetHolo = 1;
        }
        if (anim.celebrationTimer > 0.95) {
          targetText = 1;
        }
        targetStation = 0;
      }

      anim.holoReveal = THREE.MathUtils.damp(anim.holoReveal, targetHolo, 1.3, delta);
      anim.textReveal = THREE.MathUtils.damp(anim.textReveal, targetText, 0.95, delta);
      anim.stationFade = THREE.MathUtils.damp(anim.stationFade, targetStation, 1.5, delta);

      portraitUniforms.uTime.value = elapsed;
      portraitUniforms.uReveal.value = anim.holoReveal;

      mottoUniforms.uTime.value = elapsed;
      mottoUniforms.uTextReveal.value = anim.textReveal;

      if (!transparentRef.current) {
        stationGroup.visible = anim.stationFade > 0.02;
        stationMat.opacity = anim.stationFade;
        stationCyanMat.opacity = anim.stationFade * 0.85;
        coreCrystalMat.opacity = anim.stationFade * 0.9;
        (gridHelper.material as THREE.Material).opacity = anim.stationFade * 0.42;
        coreCrystal.rotation.y += delta * 0.75;
        coreCrystal.position.y = 0.05 + Math.sin(elapsed * 2.0) * 0.07;
      }

      // Floating motion for foreground hologram
      hologramGroup.position.y = Math.sin(elapsed * 1.5) * 0.055;
      emitterRingMat.opacity = anim.holoReveal * (0.65 + 0.35 * Math.sin(elapsed * 3.0));
      coneMat.opacity = anim.holoReveal * (0.08 + 0.025 * Math.sin(elapsed * 2.6));
      cyanHoloLight.intensity = 1.0 + anim.holoReveal * 2.2;

      // 5 Seals motion: orbiting center when locked, arcing across upper sky when decoded
      const spreadBlend = anim.holoReveal;
      sealGroups.forEach((grp, idx) => {
        const isUnlocked = idx < unlockedRef.current;
        sealMats[idx].emissiveIntensity = isUnlocked
          ? 1.2 + spreadBlend * 0.95 + Math.sin(elapsed * 2.6 + idx) * 0.25
          : 0.15;

        const orbitAngle = elapsed * 0.45 + (idx * Math.PI * 2) / 5;
        const vx = Math.cos(orbitAngle) * 1.55;
        const vy = -0.35 + Math.sin(elapsed * 1.6 + idx) * 0.06;
        const vz = Math.sin(orbitAngle) * 1.55;

        const arcT = (idx - 2) / 2;
        const cx = arcT * 2.15 + Math.sin(elapsed * 0.8 + idx) * 0.06;
        const cy = 2.05 - Math.abs(arcT) * 0.26 + Math.sin(elapsed * 1.7 + idx * 1.2) * 0.07;
        const cz = 0.05 + Math.cos(elapsed * 0.9 + idx) * 0.1;

        grp.position.set(
          THREE.MathUtils.lerp(vx, cx, spreadBlend),
          THREE.MathUtils.lerp(vy, cy, spreadBlend),
          THREE.MathUtils.lerp(vz, cz, spreadBlend)
        );
        grp.rotation.y += delta * (isUnlocked ? 1.1 : 0.35);
        grp.scale.setScalar(isUnlocked ? 0.92 + spreadBlend * 0.2 : 0.7);
      });

      // Christmas lights twinkle
      const festiveStrength = 0.65 + 1.25 * anim.holoReveal;
      christmasLights.forEach((b) => {
        const twinkle = 0.55 + 0.45 * Math.sin(elapsed * 2.8 + b.phase);
        b.mat.emissiveIntensity = festiveStrength * twinkle;
      });

      // Snowfall update
      const posAttr = snowGeom.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < snowCount; i++) {
        arr[i * 3 + 1] -= snowSpeeds[i] * delta;
        arr[i * 3] += Math.sin(elapsed * 0.9 + snowDrift[i]) * delta * 0.22;
        if (arr[i * 3 + 1] < -2.2) {
          arr[i * 3 + 1] = 4.0;
          arr[i * 3] = (Math.random() - 0.5) * 10.5;
        }
      }
      posAttr.needsUpdate = true;

      // Responsive slow cinematic camera zoom
      const aspect = camera.aspect || 1.5;
      const mobilePullback = aspect < 1.1 ? (1.1 - aspect) * 3.4 : 0;
      const targetCamZ = (activePhase === 'vault' ? 6.4 : 5.55) + mobilePullback;
      const targetCamX = Math.sin(elapsed * 0.22) * 0.14 + pointerX * 0.2;
      const targetCamY = 0.25 + (1 - anim.holoReveal) * 0.4 - pointerY * 0.12;

      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 1.35, delta);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 2.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 1.8, delta);

      _lookAtTarget.set(0, 0.1, 0);
      camera.lookAt(_lookAtTarget);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [lowGraphics, transparentBackdrop]);

  return (
    <div
      className={`relative w-full overflow-hidden ${
        transparentBackdrop
          ? 'bg-transparent'
          : 'rounded-2xl bg-[#040816] border border-cyan-500/40 neon-box-cyan'
      }`}
    >
      <div ref={mountRef} className={`w-full ${heightClassName}`} />
    </div>
  );
};
