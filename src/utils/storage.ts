import { GameState, LabId } from '../types';

const STORAGE_KEY = 'CHRISTMAS_CODE_2126_SAVE_V1';

export const createInitialGameState = (): GameState => ({
  team: {
    teamName: '',
    players: [
      { name: '', grade: '' },
      { name: '', grade: '' },
    ],
  },
  activeScreen: 'intro',
  labs: {
    lab1: {
      id: 'lab1',
      title: 'I. Laboratórium',
      subtitle: 'A Színek Laboratóriuma',
      sealName: 'A Színek Pecsétje',
      sealIcon: '🧪',
      score: 100,
      hintsUnlocked: [],
      completed: false,
    },
    lab2: {
      id: 'lab2',
      title: 'II. Laboratórium',
      subtitle: 'Az Illatmolekulák Titkos Kamrája',
      sealName: 'Az Illatok Pecsétje',
      sealIcon: '🍊',
      score: 100,
      hintsUnlocked: [],
      completed: false,
    },
    lab3: {
      id: 'lab3',
      title: 'III. Laboratórium',
      subtitle: 'A Hamis Arany Rejtélye',
      sealName: 'Az Arany Pecsétje',
      sealIcon: '👑',
      score: 100,
      hintsUnlocked: [],
      completed: false,
    },
    lab4: {
      id: 'lab4',
      title: 'IV. Laboratórium',
      subtitle: 'A Hógolyógyár',
      sealName: 'A Hógolyógyár Pecsétje',
      sealIcon: '❄️',
      score: 100,
      hintsUnlocked: [],
      completed: false,
    },
    lab5: {
      id: 'lab5',
      title: 'V. Laboratórium',
      subtitle: 'A Molekulák Titkos Kódja',
      sealName: 'A Szerkezet Pecsétje',
      sealIcon: '⚛️',
      score: 100,
      hintsUnlocked: [],
      completed: false,
    },
  },
  finale: {
    score: 100,
    hintsUnlocked: [],
    completed: false,
    latinPhraseRevealed: false,
    meaningAccepted: false,
    locationIdentified: false,
    verifiedAtSchool: false,
  },
  totalScore: 600,
  startTime: null,
  endTime: null,
  elapsedSeconds: 0,
  soundEnabled: true,
  lowGraphicsMode: false,
});

export const loadSavedGame = (): GameState => {
  if (typeof window === 'undefined') return createInitialGameState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialGameState();
    const parsed = JSON.parse(raw);
    // Ensure all lab keys exist
    const base = createInitialGameState();
    return {
      ...base,
      ...parsed,
      labs: {
        ...base.labs,
        ...(parsed.labs || {}),
      },
      finale: {
        ...base.finale,
        ...(parsed.finale || {}),
      },
    };
  } catch {
    return createInitialGameState();
  }
};

export const saveGame = (state: GameState): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
};

export const clearSavedGame = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const hasSavedProgress = (state: GameState): boolean => {
  if (state.team.teamName && state.team.teamName.trim().length > 0) return true;
  if (state.elapsedSeconds > 0 || state.startTime !== null) return true;
  if (state.finale.completed || state.finale.latinPhraseRevealed || state.finale.hintsUnlocked.length > 0) {
    return true;
  }
  return (Object.keys(state.labs) as LabId[]).some(
    (id) => state.labs[id].completed || state.labs[id].hintsUnlocked.length > 0 || state.labs[id].score < 100
  );
};

