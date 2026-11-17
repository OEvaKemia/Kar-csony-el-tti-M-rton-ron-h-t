import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  detectSoftwareGl,
  createStudioRenderer,
  applyStudioEnvironment,
  createSnowyLabBackdrop,
} from '../../utils/threeHelpers';

export interface AtomCoord {
  element: 'C' | 'H' | 'O';
  x: number;
  y: number;
  z: number;
}

export interface BondCoord {
  atom1: number;
  atom2: number;
  isDouble?: boolean;
}

export type FunctionalGroupType = 'aldehyde' | 'phenolic_oh' | 'ether' | 'double_bond';

export interface FunctionalGroupRegion {
  id: string;
  type: FunctionalGroupType;
  atomIndices: number[];
}

export interface MoleculeDefinition {
  name: string;
  formula: string;
  atoms: AtomCoord[];
  bonds: BondCoord[];
  functionalGroups?: FunctionalGroupRegion[];
}

interface MoleculeViewer3DProps {
  molecule: MoleculeDefinition;
  displayLabel?: string; // Optional neutral label so name isn't spoiled
  height?: string;
  autoRotate?: boolean;
  lowGraphics?: boolean;
  // Interactive 3D functional group selection (spoiler-free)
  selectableGroups?: FunctionalGroupRegion[];
  selectedGroupId?: string | null;
  identifiedGroupIds?: string[];
  onSelectGroup?: (groupId: string) => void;
  onSelectNeutralAtom?: () => void;
}

export const MoleculeViewer3D: React.FC<MoleculeViewer3DProps> = ({
  molecule,
  displayLabel,
  height = '380px',
  autoRotate = true,
  lowGraphics = false,
  selectableGroups,
  selectedGroupId = null,
  identifiedGroupIds = [],
  onSelectGroup,
  onSelectNeutralAtom,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const previousPointerPosRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.25, y: 0.35 });
  const zoomRef = useRef(1.0);
  const autoRotateRef = useRef(autoRotate);

  const selectableGroupsRef = useRef(selectableGroups);
  const selectedGroupIdRef = useRef(selectedGroupId);
  const identifiedGroupIdsRef = useRef(identifiedGroupIds);
  const onSelectGroupRef = useRef(onSelectGroup);
  const onSelectNeutralAtomRef = useRef(onSelectNeutralAtom);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    selectableGroupsRef.current = selectableGroups;
    selectedGroupIdRef.current = selectedGroupId;
    identifiedGroupIdsRef.current = identifiedGroupIds;
    onSelectGroupRef.current = onSelectGroup;
    onSelectNeutralAtomRef.current = onSelectNeutralAtom;
  }, [selectableGroups, selectedGroupId, identifiedGroupIds, onSelectGroup, onSelectNeutralAtom]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const heightPx = container.clientHeight || 380;
    const isSoftwareGl = detectSoftwareGl();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, width / heightPx, 0.1, 100);
    camera.position.set(0, 0.6, 7.8);
    camera.lookAt(0, 0, 0);

    const renderer = createStudioRenderer(width, heightPx, lowGraphics, isSoftwareGl);
    container.appendChild(renderer.domElement);

    const envTex = applyStudioEnvironment(scene, renderer);
    const backdrop = createSnowyLabBackdrop(scene, lowGraphics, isSoftwareGl, {
      includeBench: true,
      benchY: -2.15,
    });

    // Studio lights
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e1b4b, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 6);
    scene.add(keyLight);

    const cyanFill = new THREE.PointLight(0x06b6d4, 2.0, 14);
    cyanFill.position.set(-4, 1, 3);
    scene.add(cyanFill);

    const violetRim = new THREE.PointLight(0xa855f7, 1.8, 14);
    violetRim.position.set(4, -1, -2);
    scene.add(violetRim);

    // Holographic Projector Emitter Pedestal
    const emitterGroup = new THREE.Group();
    emitterGroup.position.set(0, -1.9, 0);
    scene.add(emitterGroup);

    const pedGeom = new THREE.CylinderGeometry(1.5, 1.75, 0.22, 32);
    const pedMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.22,
    });
    const pedMesh = new THREE.Mesh(pedGeom, pedMat);
    emitterGroup.add(pedMesh);

    const holoRingGeom = new THREE.TorusGeometry(1.4, 0.03, 10, lowGraphics ? 28 : 48);
    const holoRingMat = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.5,
    });
    const holoRing = new THREE.Mesh(holoRingGeom, holoRingMat);
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.y = 0.14;
    emitterGroup.add(holoRing);

    // Molecule Group
    const molGroup = new THREE.Group();
    molGroup.position.y = 0.2;
    scene.add(molGroup);

    const atomSegments = lowGraphics || isSoftwareGl ? 12 : 24;
    const sphereGeomC = new THREE.SphereGeometry(0.38, atomSegments, atomSegments);
    const sphereGeomH = new THREE.SphereGeometry(0.24, atomSegments, atomSegments);
    const sphereGeomO = new THREE.SphereGeometry(0.36, atomSegments, atomSegments);
    const hitSphereGeom = new THREE.SphereGeometry(0.46, 10, 10);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    const bondMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.65,
    });

    // Center of mass
    let cx = 0, cy = 0, cz = 0;
    molecule.atoms.forEach((a) => {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    });
    if (molecule.atoms.length > 0) {
      cx /= molecule.atoms.length;
      cy /= molecule.atoms.length;
      cz /= molecule.atoms.length;
    }

    const atomEntries: {
      index: number;
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      hitMesh: THREE.Mesh;
      baseColor: number;
    }[] = [];

    molecule.atoms.forEach((atom, index) => {
      let geom = sphereGeomC;
      let baseColor = 0x334155;
      let roughness = 0.22;
      let metalness = 0.25;

      if (atom.element === 'H') {
        geom = sphereGeomH;
        baseColor = 0xf8fafc;
        roughness = 0.18;
        metalness = 0.08;
      } else if (atom.element === 'O') {
        geom = sphereGeomO;
        baseColor = 0xf43f5e;
        roughness = 0.2;
        metalness = 0.2;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness,
        metalness,
      });

      const atomMesh = new THREE.Mesh(geom, mat);
      atomMesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
      atomMesh.userData.atomIndex = index;
      molGroup.add(atomMesh);

      const hitMesh = new THREE.Mesh(hitSphereGeom, hitMat);
      hitMesh.position.copy(atomMesh.position);
      hitMesh.userData.atomIndex = index;
      molGroup.add(hitMesh);

      atomEntries.push({ index, mesh: atomMesh, mat, hitMesh, baseColor });
    });

    const bondGeoms: THREE.CylinderGeometry[] = [];
    const createCylinderBetweenPoints = (p1: THREE.Vector3, p2: THREE.Vector3, radius: number) => {
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const geom = new THREE.CylinderGeometry(radius, radius, len, lowGraphics ? 8 : 14);
      bondGeoms.push(geom);
      const mesh = new THREE.Mesh(geom, bondMat);
      mesh.position.copy(new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      return mesh;
    };

    molecule.bonds.forEach((bond) => {
      const a1 = molecule.atoms[bond.atom1];
      const a2 = molecule.atoms[bond.atom2];
      if (!a1 || !a2) return;

      const p1 = new THREE.Vector3(a1.x - cx, a1.y - cy, a1.z - cz);
      const p2 = new THREE.Vector3(a2.x - cx, a2.y - cy, a2.z - cz);

      if (bond.isDouble) {
        const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
        const side = new THREE.Vector3(0, 0, 1).cross(dir).normalize().multiplyScalar(0.08);
        if (side.length() === 0) side.set(0.08, 0, 0);

        const b1 = createCylinderBetweenPoints(p1.clone().add(side), p2.clone().add(side), 0.06);
        const b2 = createCylinderBetweenPoints(p1.clone().sub(side), p2.clone().sub(side), 0.06);
        molGroup.add(b1, b2);
      } else {
        const b = createCylinderBetweenPoints(p1, p2, 0.09);
        molGroup.add(b);
      }
    });

    // Raycaster & Pointer events (drag to rotate, tap/click to select atom group)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const domEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      dragDistanceRef.current = 0;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousPointerPosRef.current.x;
      const deltaY = e.clientY - previousPointerPosRef.current.y;
      dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
      rotationRef.current.y += deltaX * 0.012;
      rotationRef.current.x += deltaY * 0.012;
      previousPointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;

      if (
        dragDistanceRef.current < 8 &&
        selectableGroupsRef.current &&
        onSelectGroupRef.current
      ) {
        const rect = domEl.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects(
          atomEntries.map((a) => a.hitMesh),
          false
        );
        if (hits.length > 0) {
          const atomIndex = hits[0].object.userData.atomIndex as number | undefined;
          if (atomIndex !== undefined) {
            const matchedGroup = selectableGroupsRef.current.find((g) =>
              g.atomIndices.includes(atomIndex)
            );
            if (matchedGroup) {
              onSelectGroupRef.current(matchedGroup.id);
            } else if (onSelectNeutralAtomRef.current) {
              onSelectNeutralAtomRef.current();
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(0.65, Math.min(2.0, zoomRef.current - e.deltaY * 0.001));
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || 480;
      const nh = container.clientHeight || 380;
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

      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.y += delta * 0.35;
      }

      // Highlight selected / identified functional group atoms dynamically
      const groups = selectableGroupsRef.current || [];
      const activeGroup = groups.find((g) => g.id === selectedGroupIdRef.current);
      const identifiedIndices = new Set<number>();
      groups.forEach((g) => {
        if (identifiedGroupIdsRef.current.includes(g.id)) {
          g.atomIndices.forEach((idx) => identifiedIndices.add(idx));
        }
      });

      atomEntries.forEach((entry) => {
        const isSelectedAtom = activeGroup?.atomIndices.includes(entry.index);
        const isIdentifiedAtom = identifiedIndices.has(entry.index);

        if (isSelectedAtom) {
          entry.mat.emissive.setHex(0x22d3ee);
          entry.mat.emissiveIntensity = 1.15 + Math.sin(elapsed * 5.0) * 0.35;
          entry.mesh.scale.setScalar(1.22);
        } else if (isIdentifiedAtom) {
          entry.mat.emissive.setHex(0x10b981);
          entry.mat.emissiveIntensity = 0.85;
          entry.mesh.scale.setScalar(1.1);
        } else {
          entry.mat.emissive.setHex(0x000000);
          entry.mat.emissiveIntensity = 0;
          entry.mesh.scale.setScalar(1.0);
        }
      });

      molGroup.rotation.x = rotationRef.current.x;
      molGroup.rotation.y = rotationRef.current.y;
      molGroup.position.y = 0.25 + Math.sin(elapsed * 1.6) * 0.06;
      camera.position.z = 7.8 / zoomRef.current;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('wheel', onWheel);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
      backdrop.dispose();
      envTex.dispose();
      pedGeom.dispose();
      pedMat.dispose();
      holoRingGeom.dispose();
      holoRingMat.dispose();
      sphereGeomC.dispose();
      sphereGeomH.dispose();
      sphereGeomO.dispose();
      hitSphereGeom.dispose();
      hitMat.dispose();
      atomEntries.forEach((e) => e.mat.dispose());
      bondMat.dispose();
      bondGeoms.forEach((g) => g.dispose());
      renderer.dispose();
    };
  }, [molecule, lowGraphics]);

  const resetView = () => {
    rotationRef.current = { x: 0.25, y: 0.35 };
    zoomRef.current = 1.0;
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-[#040712] border border-cyan-500/40 neon-box-cyan">
      <div
        ref={mountRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Atom Legend Badge */}
      <div className="absolute top-3 left-3 bg-[#070d1f]/90 px-3 py-1.5 rounded-lg border border-cyan-500/35 text-xs flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-300 inline-block" />
          <span className="text-slate-200 font-mono-tech">C</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300 inline-block" />
          <span className="text-slate-200 font-mono-tech">H</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300 inline-block" />
          <span className="text-slate-200 font-mono-tech">O</span>
        </span>
      </div>

      {/* Top right label & reset */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {displayLabel && (
          <span className="text-xs font-mono-tech font-bold bg-[#070d1f]/90 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40">
            {displayLabel}
          </span>
        )}
        <button
          onClick={resetView}
          className="text-xs bg-[#070d1f]/90 hover:bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/40 transition-colors font-mono-tech"
        >
          Alapnézet
        </button>
      </div>

      <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none text-[11px] font-mono-tech text-cyan-300/85">
        {selectableGroups
          ? 'Húzd a forgatáshoz • Koppints az atomcsoportokra a kijelöléshez'
          : 'Húzd a forgatáshoz • Görgess / csippents a nagyításhoz'}
      </div>
    </div>
  );
};
