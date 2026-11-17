import { MoleculeDefinition } from '../components/3d/MoleculeViewer3D';

// Helper to calculate benzene ring coordinates
const ring = (radius = 1.4, cx = 0, cy = 0) => {
  const coords: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    coords.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      z: 0,
    });
  }
  return coords;
};

// 1. FAHÉJALDEHID (C9H8O)
const ringCinnam = ring(1.3, -1.2, 0);
const ringCinnamH = ring(2.25, -1.2, 0);
export const CINNAMALDEHYDE_MOLECULE: MoleculeDefinition = {
  name: 'Fahéjaldehid',
  formula: 'C₉H₈O',
  atoms: [
    // Benzene carbons (0-5)
    { element: 'C', ...ringCinnam[0] },
    { element: 'C', ...ringCinnam[1] },
    { element: 'C', ...ringCinnam[2] },
    { element: 'C', ...ringCinnam[3] },
    { element: 'C', ...ringCinnam[4] },
    { element: 'C', ...ringCinnam[5] },
    // Side chain: -CH=CH-CH=O (6, 7, 8)
    { element: 'C', x: 1.4, y: 0.0, z: 0 },
    { element: 'C', x: 2.5, y: 0.85, z: 0 },
    { element: 'C', x: 3.8, y: 0.2, z: 0 },
    // Carbonyl Oxygen (9)
    { element: 'O', x: 4.85, y: 0.95, z: 0 },
    // Ring Hydrogens on C1..C5 (10-14)
    { element: 'H', ...ringCinnamH[1] },
    { element: 'H', ...ringCinnamH[2] },
    { element: 'H', ...ringCinnamH[3] },
    { element: 'H', ...ringCinnamH[4] },
    { element: 'H', ...ringCinnamH[5] },
    // Side chain Hydrogens (15, 16, 17)
    { element: 'H', x: 1.55, y: -1.0, z: 0 },
    { element: 'H', x: 2.35, y: 1.85, z: 0 },
    { element: 'H', x: 3.9, y: -0.85, z: 0 },
  ],
  bonds: [
    // Benzene ring
    { atom1: 0, atom2: 1, isDouble: true },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3, isDouble: true },
    { atom1: 3, atom2: 4 },
    { atom1: 4, atom2: 5, isDouble: true },
    { atom1: 5, atom2: 0 },
    // Ring H (C1..C5)
    { atom1: 1, atom2: 10 },
    { atom1: 2, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 4, atom2: 13 },
    { atom1: 5, atom2: 14 },
    // Side chain connection
    { atom1: 0, atom2: 6 },
    { atom1: 6, atom2: 7, isDouble: true },
    { atom1: 7, atom2: 8 },
    { atom1: 8, atom2: 9, isDouble: true },
    // Side chain H
    { atom1: 6, atom2: 15 },
    { atom1: 7, atom2: 16 },
    { atom1: 8, atom2: 17 },
  ],
  functionalGroups: [
    { id: 'cinn_double', type: 'double_bond', atomIndices: [6, 7, 15, 16] },
    { id: 'cinn_ald', type: 'aldehyde', atomIndices: [8, 9, 17] },
  ],
};

// 2. LIMONÉN (C10H16 - PURE HYDROCARBON, 0 OXYGEN!)
export const LIMONENE_MOLECULE: MoleculeDefinition = {
  name: 'Limonén',
  formula: 'C₁₀H₁₆',
  atoms: [
    // Cyclohexene ring (0-5)
    { element: 'C', x: -0.8, y: 1.1, z: 0.3 },
    { element: 'C', x: 0.5, y: 1.2, z: 0.0 }, // C with methyl
    { element: 'C', x: 1.3, y: 0.1, z: -0.4 },
    { element: 'C', x: 0.7, y: -1.2, z: -0.1 },
    { element: 'C', x: -0.7, y: -1.1, z: 0.4 }, // C with isopropenyl
    { element: 'C', x: -1.4, y: 0.0, z: -0.2 },
    // Methyl on ring (6)
    { element: 'C', x: 1.0, y: 2.5, z: 0.2 },
    // Isopropenyl group: C=C and methyl (7, 8, 9)
    { element: 'C', x: -1.5, y: -2.3, z: 0.5 },
    { element: 'C', x: -2.8, y: -2.2, z: 0.2 }, // =CH2
    { element: 'C', x: -0.8, y: -3.5, z: 0.9 }, // -CH3
    // Hydrogens (10-25: 16 H atoms)
    { element: 'H', x: -1.3, y: 1.9, z: 0.6 },
    { element: 'H', x: 2.2, y: 0.2, z: -0.85 },
    { element: 'H', x: 1.2, y: -1.9, z: -0.6 },
    { element: 'H', x: 0.8, y: -1.4, z: 0.8 },
    { element: 'H', x: -0.6, y: -0.9, z: 1.3 },
    { element: 'H', x: -2.2, y: -0.1, z: -0.8 },
    { element: 'H', x: -1.7, y: 0.1, z: 0.7 },
    // Methyl H
    { element: 'H', x: 0.4, y: 3.1, z: 0.8 },
    { element: 'H', x: 2.0, y: 2.5, z: 0.4 },
    { element: 'H', x: 0.9, y: 2.9, z: -0.7 },
    // Isopropenyl H
    { element: 'H', x: -3.3, y: -1.3, z: -0.1 },
    { element: 'H', x: -3.3, y: -3.0, z: 0.3 },
    { element: 'H', x: -1.3, y: -4.3, z: 1.1 },
    { element: 'H', x: 0.1, y: -3.4, z: 0.6 },
    { element: 'H', x: -0.7, y: -3.7, z: 1.8 },
    { element: 'H', x: 1.65, y: -0.05, z: 0.55 },
  ],
  bonds: [
    // Ring
    { atom1: 0, atom2: 1, isDouble: true },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3 },
    { atom1: 3, atom2: 4 },
    { atom1: 4, atom2: 5 },
    { atom1: 5, atom2: 0 },
    // Methyl
    { atom1: 1, atom2: 6 },
    // Isopropenyl
    { atom1: 4, atom2: 7 },
    { atom1: 7, atom2: 8, isDouble: true },
    { atom1: 7, atom2: 9 },
    // H bonds
    { atom1: 0, atom2: 10 },
    { atom1: 2, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
    { atom1: 4, atom2: 14 },
    { atom1: 5, atom2: 15 },
    { atom1: 5, atom2: 16 },
    { atom1: 6, atom2: 17 },
    { atom1: 6, atom2: 18 },
    { atom1: 6, atom2: 19 },
    { atom1: 8, atom2: 20 },
    { atom1: 8, atom2: 21 },
    { atom1: 9, atom2: 22 },
    { atom1: 9, atom2: 23 },
    { atom1: 9, atom2: 24 },
    { atom1: 2, atom2: 25 },
  ],
  functionalGroups: [
    { id: 'lim_double_ring', type: 'double_bond', atomIndices: [0, 1, 10] },
    { id: 'lim_double_side', type: 'double_bond', atomIndices: [7, 8, 20, 21] },
  ],
};

// 3. VANILLIN (C8H8O3)
const ringVan = ring(1.3, -0.8, 0);
const ringVanH = ring(2.25, -0.8, 0);
export const VANILLIN_MOLECULE: MoleculeDefinition = {
  name: 'Vanillin',
  formula: 'C₈H₈O₃',
  atoms: [
    // Benzene carbons (0-5)
    { element: 'C', ...ringVan[0] }, // C0 with formyl (-CH=O)
    { element: 'C', ...ringVan[1] }, // C1 (H)
    { element: 'C', ...ringVan[2] }, // C2 with methoxy (-O-CH3)
    { element: 'C', ...ringVan[3] }, // C3 with hydroxy (-OH)
    { element: 'C', ...ringVan[4] }, // C4 (H)
    { element: 'C', ...ringVan[5] }, // C5 (H)
    // Formyl aldehyde C=O (6, 7)
    { element: 'C', x: 1.85, y: 0.0, z: 0 },
    { element: 'O', x: 2.75, y: 0.85, z: 0 },
    // Methoxy group -O-CH3 (8, 9)
    { element: 'O', x: -1.95, y: 2.1, z: 0 },
    { element: 'C', x: -1.25, y: 3.3, z: 0 },
    // Phenolic Hydroxy group -OH (10)
    { element: 'O', x: -3.45, y: 0.0, z: 0 },
    // Hydrogens (11-18: 8 H atoms)
    { element: 'H', x: 2.05, y: -1.0, z: 0 }, // aldehyde H (11)
    { element: 'H', ...ringVanH[5] }, // ring C5 H (12)
    { element: 'H', ...ringVanH[1] }, // ring C1 H (13)
    { element: 'H', ...ringVanH[4] }, // ring C4 H (14)
    { element: 'H', x: -4.0, y: 0.75, z: 0 }, // phenolic OH hydrogen (15)
    { element: 'H', x: -0.25, y: 3.2, z: 0 }, // methyl H (16)
    { element: 'H', x: -1.65, y: 3.9, z: 0.75 }, // methyl H (17)
    { element: 'H', x: -1.65, y: 3.9, z: -0.75 }, // methyl H (18)
  ],
  bonds: [
    { atom1: 0, atom2: 1, isDouble: true },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3, isDouble: true },
    { atom1: 3, atom2: 4 },
    { atom1: 4, atom2: 5, isDouble: true },
    { atom1: 5, atom2: 0 },
    // Formyl
    { atom1: 0, atom2: 6 },
    { atom1: 6, atom2: 7, isDouble: true },
    { atom1: 6, atom2: 11 },
    // Methoxy
    { atom1: 2, atom2: 8 },
    { atom1: 8, atom2: 9 },
    { atom1: 9, atom2: 16 },
    { atom1: 9, atom2: 17 },
    { atom1: 9, atom2: 18 },
    // Hydroxy
    { atom1: 3, atom2: 10 },
    { atom1: 10, atom2: 15 },
    // Ring H
    { atom1: 1, atom2: 13 },
    { atom1: 4, atom2: 14 },
    { atom1: 5, atom2: 12 },
  ],
  functionalGroups: [
    { id: 'van_ald', type: 'aldehyde', atomIndices: [6, 7, 11] },
    { id: 'van_ether', type: 'ether', atomIndices: [2, 8, 9, 16, 17, 18] },
    { id: 'van_oh', type: 'phenolic_oh', atomIndices: [3, 10, 15] },
  ],
};

// 4. EUGENOL (C10H12O2)
const ringEug = ring(1.3, -1.0, 0);
const ringEugH = ring(2.25, -1.0, 0);
export const EUGENOL_MOLECULE: MoleculeDefinition = {
  name: 'Eugenol',
  formula: 'C₁₀H₁₂O₂',
  atoms: [
    // Benzene carbons (0-5)
    { element: 'C', ...ringEug[0] }, // C0 with allyl
    { element: 'C', ...ringEug[1] }, // C1 (H)
    { element: 'C', ...ringEug[2] }, // C2 with methoxy
    { element: 'C', ...ringEug[3] }, // C3 with hydroxy
    { element: 'C', ...ringEug[4] }, // C4 (H)
    { element: 'C', ...ringEug[5] }, // C5 (H)
    // Allyl group -CH2-CH=CH2 (6, 7, 8)
    { element: 'C', x: 1.65, y: 0.0, z: 0 },
    { element: 'C', x: 2.65, y: 0.9, z: 0 },
    { element: 'C', x: 3.95, y: 0.55, z: 0 },
    // Methoxy (9, 10)
    { element: 'O', x: -2.15, y: 2.1, z: 0 },
    { element: 'C', x: -1.45, y: 3.3, z: 0 },
    // Hydroxy (11)
    { element: 'O', x: -3.65, y: 0.0, z: 0 },
    // Hydrogens (12-23: 12 H atoms)
    { element: 'H', x: 1.85, y: -0.65, z: 0.75 }, // CH2 H1 (12)
    { element: 'H', x: 1.85, y: -0.65, z: -0.75 }, // CH2 H2 (13)
    { element: 'H', x: 2.35, y: 1.85, z: 0 }, // =CH H (14)
    { element: 'H', x: 4.35, y: -0.4, z: 0 }, // =CH2 H1 (15)
    { element: 'H', x: 4.65, y: 1.3, z: 0 }, // =CH2 H2 (16)
    { element: 'H', x: -4.2, y: 0.75, z: 0 }, // phenolic OH H (17)
    { element: 'H', ...ringEugH[1] }, // ring C1 H (18)
    { element: 'H', ...ringEugH[4] }, // ring C4 H (19)
    { element: 'H', ...ringEugH[5] }, // ring C5 H (20)
    { element: 'H', x: -0.45, y: 3.2, z: 0 }, // methyl H (21)
    { element: 'H', x: -1.85, y: 3.9, z: 0.75 }, // methyl H (22)
    { element: 'H', x: -1.85, y: 3.9, z: -0.75 }, // methyl H (23)
  ],
  bonds: [
    { atom1: 0, atom2: 1, isDouble: true },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3, isDouble: true },
    { atom1: 3, atom2: 4 },
    { atom1: 4, atom2: 5, isDouble: true },
    { atom1: 5, atom2: 0 },
    // Allyl
    { atom1: 0, atom2: 6 },
    { atom1: 6, atom2: 7 },
    { atom1: 7, atom2: 8, isDouble: true },
    { atom1: 6, atom2: 12 },
    { atom1: 6, atom2: 13 },
    { atom1: 7, atom2: 14 },
    { atom1: 8, atom2: 15 },
    { atom1: 8, atom2: 16 },
    // Methoxy
    { atom1: 2, atom2: 9 },
    { atom1: 9, atom2: 10 },
    { atom1: 10, atom2: 21 },
    { atom1: 10, atom2: 22 },
    { atom1: 10, atom2: 23 },
    // Hydroxy
    { atom1: 3, atom2: 11 },
    { atom1: 11, atom2: 17 },
    // Ring H
    { atom1: 1, atom2: 18 },
    { atom1: 4, atom2: 19 },
    { atom1: 5, atom2: 20 },
  ],
  functionalGroups: [
    { id: 'eug_double', type: 'double_bond', atomIndices: [7, 8, 14, 15, 16] },
    { id: 'eug_ether', type: 'ether', atomIndices: [2, 9, 10, 21, 22, 23] },
    { id: 'eug_oh', type: 'phenolic_oh', atomIndices: [3, 11, 17] },
  ],
};

// 5. n-BUTÁN (Conformer A - Straight Zig-Zag anti)
export const BUTANE_CONFORMER_A: MoleculeDefinition = {
  name: 'n-Bután (anti-konformáció)',
  formula: 'C₄H₁₀',
  atoms: [
    { element: 'C', x: -2.1, y: 0.6, z: 0 },
    { element: 'C', x: -0.7, y: -0.3, z: 0 },
    { element: 'C', x: 0.7, y: 0.5, z: 0 },
    { element: 'C', x: 2.1, y: -0.4, z: 0 },
    // H
    { element: 'H', x: -2.2, y: 1.3, z: 0.8 },
    { element: 'H', x: -2.2, y: 1.3, z: -0.8 },
    { element: 'H', x: -2.9, y: 0.0, z: 0 },
    { element: 'H', x: -0.7, y: -1.0, z: 0.8 },
    { element: 'H', x: -0.7, y: -1.0, z: -0.8 },
    { element: 'H', x: 0.7, y: 1.2, z: 0.8 },
    { element: 'H', x: 0.7, y: 1.2, z: -0.8 },
    { element: 'H', x: 2.2, y: -1.1, z: 0.8 },
    { element: 'H', x: 2.2, y: -1.1, z: -0.8 },
    { element: 'H', x: 2.9, y: 0.2, z: 0 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3 },
    { atom1: 0, atom2: 4 },
    { atom1: 0, atom2: 5 },
    { atom1: 0, atom2: 6 },
    { atom1: 1, atom2: 7 },
    { atom1: 1, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 3, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
  ],
};

// 6. n-BUTÁN (Conformer B - Gauche rotamer, bent)
export const BUTANE_CONFORMER_B: MoleculeDefinition = {
  name: 'n-Bután (gauche-konformáció)',
  formula: 'C₄H₁₀',
  atoms: [
    { element: 'C', x: -1.6, y: -0.8, z: 0.6 },
    { element: 'C', x: -0.5, y: 0.0, z: 0.0 },
    { element: 'C', x: 0.8, y: -0.5, z: -0.4 },
    { element: 'C', x: 1.2, y: 0.8, z: 0.3 }, // rotated around C2-C3
    // H
    { element: 'H', x: -2.5, y: -0.5, z: 0.2 },
    { element: 'H', x: -1.4, y: -1.8, z: 0.4 },
    { element: 'H', x: -1.7, y: -0.7, z: 1.6 },
    { element: 'H', x: -0.5, y: 1.0, z: -0.3 },
    { element: 'H', x: -0.7, y: 0.0, z: -1.0 },
    { element: 'H', x: 0.9, y: -1.5, z: -0.1 },
    { element: 'H', x: 0.9, y: -0.5, z: -1.5 },
    { element: 'H', x: 2.2, y: 1.1, z: 0.1 },
    { element: 'H', x: 1.1, y: 0.7, z: 1.3 },
    { element: 'H', x: 0.6, y: 1.6, z: -0.1 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3 },
    { atom1: 0, atom2: 4 },
    { atom1: 0, atom2: 5 },
    { atom1: 0, atom2: 6 },
    { atom1: 1, atom2: 7 },
    { atom1: 1, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 3, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
  ],
};

// 7. 2-METILPROPÁN (Orientation A - Isobutane)
export const ISOBUTANE_ORIENTATION_A: MoleculeDefinition = {
  name: '2-Metilpropán (A tájolás)',
  formula: 'C₄H₁₀',
  atoms: [
    { element: 'C', x: 0, y: 0, z: 0 }, // central CH
    { element: 'C', x: 0, y: 1.5, z: 0 }, // methyl 1
    { element: 'C', x: -1.3, y: -0.7, z: 0 }, // methyl 2
    { element: 'C', x: 1.3, y: -0.7, z: 0 }, // methyl 3
    // Central H
    { element: 'H', x: 0, y: 0, z: 1.1 },
    // Methyl 1 H
    { element: 'H', x: 0, y: 2.1, z: 0.9 },
    { element: 'H', x: 0.9, y: 1.8, z: -0.5 },
    { element: 'H', x: -0.9, y: 1.8, z: -0.5 },
    // Methyl 2 H
    { element: 'H', x: -1.9, y: -0.4, z: 0.8 },
    { element: 'H', x: -1.1, y: -1.7, z: 0.2 },
    { element: 'H', x: -1.8, y: -0.7, z: -0.9 },
    // Methyl 3 H
    { element: 'H', x: 1.9, y: -0.4, z: 0.8 },
    { element: 'H', x: 1.8, y: -0.7, z: -0.9 },
    { element: 'H', x: 1.1, y: -1.7, z: 0.2 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 0, atom2: 2 },
    { atom1: 0, atom2: 3 },
    { atom1: 0, atom2: 4 },
    { atom1: 1, atom2: 5 },
    { atom1: 1, atom2: 6 },
    { atom1: 1, atom2: 7 },
    { atom1: 2, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 3, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
  ],
};

// 8. 2-METILPROPÁN (Orientation B - Isobutane rotated)
export const ISOBUTANE_ORIENTATION_B: MoleculeDefinition = {
  name: '2-Metilpropán (B tájolás)',
  formula: 'C₄H₁₀',
  atoms: [
    { element: 'C', x: 0, y: 0, z: 0 },
    { element: 'C', x: 0, y: -1.5, z: 0 },
    { element: 'C', x: 0, y: 0.7, z: 1.3 },
    { element: 'C', x: 0, y: 0.7, z: -1.3 },
    // H
    { element: 'H', x: 1.1, y: 0, z: 0 },
    { element: 'H', x: 0.9, y: -1.8, z: 0.5 },
    { element: 'H', x: -0.9, y: -1.8, z: 0.5 },
    { element: 'H', x: 0, y: -2.1, z: -0.9 },
    { element: 'H', x: 0.8, y: 0.4, z: 1.9 },
    { element: 'H', x: -0.8, y: 0.4, z: 1.9 },
    { element: 'H', x: 0, y: 1.7, z: 1.1 },
    { element: 'H', x: 0.8, y: 0.4, z: -1.9 },
    { element: 'H', x: -0.8, y: 0.4, z: -1.9 },
    { element: 'H', x: 0, y: 1.7, z: -1.1 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 0, atom2: 2 },
    { atom1: 0, atom2: 3 },
    { atom1: 0, atom2: 4 },
    { atom1: 1, atom2: 5 },
    { atom1: 1, atom2: 6 },
    { atom1: 1, atom2: 7 },
    { atom1: 2, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 3, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
  ],
};

// 9. PENTÁN (C5H12 - straight chain)
export const PENTANE_MOLECULE: MoleculeDefinition = {
  name: 'Pentán',
  formula: 'CH₃-CH₂-CH₂-CH₂-CH₃',
  atoms: [
    { element: 'C', x: -2.8, y: -0.4, z: 0 },
    { element: 'C', x: -1.4, y: 0.5, z: 0 },
    { element: 'C', x: 0.0, y: -0.3, z: 0 },
    { element: 'C', x: 1.4, y: 0.5, z: 0 },
    { element: 'C', x: 2.8, y: -0.4, z: 0 },
    // Hydrogens
    { element: 'H', x: -2.9, y: -1.1, z: 0.8 },
    { element: 'H', x: -2.9, y: -1.1, z: -0.8 },
    { element: 'H', x: -3.6, y: 0.2, z: 0 },
    { element: 'H', x: -1.4, y: 1.2, z: 0.8 },
    { element: 'H', x: -1.4, y: 1.2, z: -0.8 },
    { element: 'H', x: 0.0, y: -1.0, z: 0.8 },
    { element: 'H', x: 0.0, y: -1.0, z: -0.8 },
    { element: 'H', x: 1.4, y: 1.2, z: 0.8 },
    { element: 'H', x: 1.4, y: 1.2, z: -0.8 },
    { element: 'H', x: 2.9, y: -1.1, z: 0.8 },
    { element: 'H', x: 2.9, y: -1.1, z: -0.8 },
    { element: 'H', x: 3.6, y: 0.2, z: 0 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 1, atom2: 2 },
    { atom1: 2, atom2: 3 },
    { atom1: 3, atom2: 4 },
    { atom1: 0, atom2: 5 },
    { atom1: 0, atom2: 6 },
    { atom1: 0, atom2: 7 },
    { atom1: 1, atom2: 8 },
    { atom1: 1, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 2, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
    { atom1: 4, atom2: 14 },
    { atom1: 4, atom2: 15 },
    { atom1: 4, atom2: 16 },
  ],
};

// 10. 2-METILBUTÁN (C5H12 - branched)
export const ISOPENTANE_MOLECULE: MoleculeDefinition = {
  name: '2-Metilbután (Izopentán)',
  formula: 'CH₃-CH(CH₃)-CH₂-CH₃',
  atoms: [
    { element: 'C', x: -1.4, y: -0.5, z: 0 },
    { element: 'C', x: 0.0, y: 0.2, z: 0 }, // branched C
    { element: 'C', x: 0.0, y: 1.7, z: 0 }, // branch methyl
    { element: 'C', x: 1.4, y: -0.5, z: 0 },
    { element: 'C', x: 2.7, y: 0.3, z: 0 },
    // H
    { element: 'H', x: -1.5, y: -1.2, z: 0.8 },
    { element: 'H', x: -1.5, y: -1.2, z: -0.8 },
    { element: 'H', x: -2.2, y: 0.1, z: 0 },
    { element: 'H', x: 0.0, y: 0.2, z: -1.1 },
    { element: 'H', x: 0.9, y: 2.1, z: 0.5 },
    { element: 'H', x: -0.9, y: 2.1, z: 0.5 },
    { element: 'H', x: 0.0, y: 2.1, z: -1.0 },
    { element: 'H', x: 1.4, y: -1.2, z: 0.8 },
    { element: 'H', x: 1.4, y: -1.2, z: -0.8 },
    { element: 'H', x: 2.7, y: 1.0, z: 0.8 },
    { element: 'H', x: 2.7, y: 1.0, z: -0.8 },
    { element: 'H', x: 3.5, y: -0.3, z: 0 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 1, atom2: 2 },
    { atom1: 1, atom2: 3 },
    { atom1: 3, atom2: 4 },
    { atom1: 0, atom2: 5 },
    { atom1: 0, atom2: 6 },
    { atom1: 0, atom2: 7 },
    { atom1: 1, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 2, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
    { atom1: 4, atom2: 14 },
    { atom1: 4, atom2: 15 },
    { atom1: 4, atom2: 16 },
  ],
};

// Helper for placing tetrahedral substituents in 3D chemistry
function buildIsooctane(): { atoms: MoleculeDefinition['atoms']; bonds: MoleculeDefinition['bonds'] } {
  const atoms: MoleculeDefinition['atoms'] = [];
  const bonds: MoleculeDefinition['bonds'] = [];

  const cc = 1.54;
  const ch = 1.08;
  const tetSin = Math.sin((109.4712 * Math.PI) / 180); // ~0.9428
  const tetCos = Math.cos((109.4712 * Math.PI) / 180); // -1/3

  // Main 5-carbon zigzag chain (C0=C1, C1=C2, C2=C3, C3=C4, C4=C5) in XY plane
  // Angle between consecutive C-C segments is 109.47 deg -> half-angle 54.735 deg from vertical
  const half = (54.7356 * Math.PI) / 180;
  const dx = cc * Math.sin(half); // ~1.257
  const dy = cc * Math.cos(half); // ~0.889

  // Carbons 0..4 = C1..C5
  const c1 = { x: -2 * dx, y: 0.45 * dy, z: 0 };
  const c2 = { x: -1 * dx, y: -0.55 * dy, z: 0 };
  const c3 = { x: 0, y: 0.45 * dy, z: 0 };
  const c4 = { x: 1 * dx, y: -0.55 * dy, z: 0 };
  const c5 = { x: 2 * dx, y: 0.45 * dy, z: 0 };

  // Two methyl carbons on C2 (downward-left/right out of XY plane along -Y, +-Z)
  const c2OutY = -dy * 1.15;
  const c2OutZ = cc * tetSin * 0.85;
  const c6 = { x: c2.x, y: c2.y + c2OutY, z: c2OutZ };
  const c7 = { x: c2.x, y: c2.y + c2OutY, z: -c2OutZ };

  // One methyl carbon on C4 (pointing out of XY plane along -Y, +Z)
  const c8 = { x: c4.x, y: c4.y - dy * 1.15, z: c2OutZ };

  const carbons = [c1, c2, c3, c4, c5, c6, c7, c8]; // indices 0..7
  carbons.forEach((c) => atoms.push({ element: 'C', ...c }));

  // C-C single bonds (7 bonds)
  bonds.push(
    { atom1: 0, atom2: 1 }, // C1-C2
    { atom1: 1, atom2: 2 }, // C2-C3
    { atom1: 2, atom2: 3 }, // C3-C4
    { atom1: 3, atom2: 4 }, // C4-C5
    { atom1: 1, atom2: 5 }, // C2-C6 (methyl)
    { atom1: 1, atom2: 6 }, // C2-C7 (methyl)
    { atom1: 3, atom2: 7 }  // C4-C8 (methyl)
  );

  // Add 3 hydrogens around a terminal methyl carbon relative to its parent carbon
  const addMethylHydrogens = (cIdx: number, parentIdx: number, phaseOffset = 0) => {
    const c = carbons[cIdx];
    const p = carbons[parentIdx];
    // Axis pointing away from parent bond
    const ax = c.x - p.x;
    const ay = c.y - p.y;
    const az = c.z - p.z;
    const len = Math.hypot(ax, ay, az) || 1;
    const ux = ax / len;
    const uy = ay / len;
    const uz = az / len;

    // Orthogonal basis (v, w) perpendicular to u
    let rx = Math.abs(ux) < 0.8 ? 1 : 0;
    let ry = Math.abs(ux) < 0.8 ? 0 : 1;
    let rz = 0;
    let vx = uy * rz - uz * ry;
    let vy = uz * rx - ux * rz;
    let vz = ux * ry - uy * rx;
    const vLen = Math.hypot(vx, vy, vz) || 1;
    vx /= vLen;
    vy /= vLen;
    vz /= vLen;

    const wx = uy * vz - uz * vy;
    const wy = uz * vx - ux * vz;
    const wz = ux * vy - uy * vx;

    const forward = -tetCos; // +1/3 along bond extension
    const radial = tetSin;

    for (let k = 0; k < 3; k++) {
      const ang = phaseOffset + (k * 2 * Math.PI) / 3;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      const hx = c.x + ch * (ux * forward + radial * (vx * ca + wx * sa));
      const hy = c.y + ch * (uy * forward + radial * (vy * ca + wy * sa));
      const hz = c.z + ch * (uz * forward + radial * (vz * ca + wz * sa));
      const hIdx = atoms.length;
      atoms.push({ element: 'H', x: hx, y: hy, z: hz });
      bonds.push({ atom1: cIdx, atom2: hIdx });
    }
  };

  // Add methyl hydrogens on C1(0), C5(4), C6(5), C7(6), C8(7) -> 15 H atoms
  addMethylHydrogens(0, 1, 0.3);
  addMethylHydrogens(4, 3, 0.3);
  addMethylHydrogens(5, 1, 0.8);
  addMethylHydrogens(6, 1, 1.3);
  addMethylHydrogens(7, 3, 0.8);

  // Add 2 hydrogens on C3 (-CH2-, index 2) pointing upward (+Y) and +-Z
  const h3aIdx = atoms.length;
  atoms.push({ element: 'H', x: c3.x, y: c3.y + ch * 0.65, z: ch * 0.78 });
  bonds.push({ atom1: 2, atom2: h3aIdx });

  const h3bIdx = atoms.length;
  atoms.push({ element: 'H', x: c3.x, y: c3.y + ch * 0.65, z: -ch * 0.78 });
  bonds.push({ atom1: 2, atom2: h3bIdx });

  // Add 1 methine hydrogen on C4 (-CH-, index 3) pointing downward-back (-Y, -Z)
  const h4Idx = atoms.length;
  atoms.push({ element: 'H', x: c4.x, y: c4.y - ch * 0.55, z: -ch * 0.86 });
  bonds.push({ atom1: 3, atom2: h4Idx });

  return { atoms, bonds };
}

// 11. 2,2-DIMETILPROPÁN (Neopentane - central C attached to 4 methyl carbons, exact tetrahedral)
export const NEOPENTANE_MOLECULE: MoleculeDefinition = {
  name: '2,2-Dimetilpropán (Neopentán)',
  formula: 'C(CH₃)₄',
  atoms: [
    { element: 'C', x: 0, y: 0, z: 0 }, // Central quaternary C (0)
    { element: 'C', x: 0, y: 1.54, z: 0 }, // methyl 1 (1)
    { element: 'C', x: 1.45, y: -0.51, z: 0 }, // methyl 2 (2)
    { element: 'C', x: -0.73, y: -0.51, z: 1.26 }, // methyl 3 (3)
    { element: 'C', x: -0.73, y: -0.51, z: -1.26 }, // methyl 4 (4)
    // 12 Hydrogens (3 on each methyl)
    { element: 'H', x: 1.02, y: 1.90, z: 0 },
    { element: 'H', x: -0.51, y: 1.90, z: 0.88 },
    { element: 'H', x: -0.51, y: 1.90, z: -0.88 },
    { element: 'H', x: 1.81, y: -0.15, z: 0.94 },
    { element: 'H', x: 1.81, y: -0.15, z: -0.94 },
    { element: 'H', x: 1.81, y: -1.53, z: 0 },
    { element: 'H', x: -0.35, y: -0.15, z: 2.18 },
    { element: 'H', x: -1.75, y: -0.15, z: 1.26 },
    { element: 'H', x: -0.73, y: -1.59, z: 1.26 },
    { element: 'H', x: -0.35, y: -0.15, z: -2.18 },
    { element: 'H', x: -1.75, y: -0.15, z: -1.26 },
    { element: 'H', x: -0.73, y: -1.59, z: -1.26 },
  ],
  bonds: [
    { atom1: 0, atom2: 1 },
    { atom1: 0, atom2: 2 },
    { atom1: 0, atom2: 3 },
    { atom1: 0, atom2: 4 },
    { atom1: 1, atom2: 5 },
    { atom1: 1, atom2: 6 },
    { atom1: 1, atom2: 7 },
    { atom1: 2, atom2: 8 },
    { atom1: 2, atom2: 9 },
    { atom1: 2, atom2: 10 },
    { atom1: 3, atom2: 11 },
    { atom1: 3, atom2: 12 },
    { atom1: 3, atom2: 13 },
    { atom1: 4, atom2: 14 },
    { atom1: 4, atom2: 15 },
    { atom1: 4, atom2: 16 },
  ],
};

// 12. 2,2,4-TRIMETILPENTÁN (Izooktán - 5-carbon main chain, two methyls on C2, one methyl on C4; C8H18)
const isooctaneData = buildIsooctane();
export const ISOOCTANE_MOLECULE: MoleculeDefinition = {
  name: '2,2,4-Trimetilpentán (Izooktán)',
  formula: 'C₈H₁₈',
  atoms: isooctaneData.atoms,
  bonds: isooctaneData.bonds,
};
