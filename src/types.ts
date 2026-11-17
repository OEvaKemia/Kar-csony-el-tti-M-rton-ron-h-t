export interface PlayerInfo {
  name: string;
  grade: string; // Formatted e.g. "10.E"
  gradeLevel?: string; // "9." | "10." | "11." | "12."
  classLetter?: string; // "A" | "B" | "C" | "D" | "E" | "F"
}

export interface TeamData {
  teamName: string;
  players: PlayerInfo[];
}

export type LabId = 'lab1' | 'lab2' | 'lab3' | 'lab4' | 'lab5';

export interface Hint {
  tier: 1 | 2 | 3;
  penalty: number;
  title: string;
  text: string;
}

export interface LabProgress {
  id: LabId;
  title: string;
  subtitle: string;
  sealName: string;
  sealIcon: string;
  score: number; // max 100
  hintsUnlocked: number[]; // e.g. [1, 2]
  completed: boolean;
  codeEntered?: string;
}

export interface FinaleProgress {
  score: number; // max 100
  hintsUnlocked: number[];
  completed: boolean;
  latinPhraseRevealed: boolean;
  meaningAccepted: boolean;
  locationIdentified: boolean;
  verifiedAtSchool: boolean;
}

export interface GameState {
  team: TeamData;
  activeScreen: 'intro' | 'story' | 'registration' | 'tutorial' | 'hub' | LabId | 'finale' | 'victory';
  labs: Record<LabId, LabProgress>;
  finale: FinaleProgress;
  totalScore: number;
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  soundEnabled: boolean;
  lowGraphicsMode: boolean;
}

export interface DiaryEntry {
  id: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  details: string[];
  formula?: string;
  table?: { headers: string[]; rows: (string | number)[][] };
}
