import React, { useState, useEffect } from 'react';
import { GameState, LabId, TeamData, FinaleProgress } from './types';
import {
  loadSavedGame,
  saveGame,
  clearSavedGame,
  createInitialGameState,
  hasSavedProgress,
} from './utils/storage';
import { soundManager } from './utils/audio';

// 3D Station Hero Background
import { StationHero3D } from './components/3d/StationHero3D';

// HUD & Modals
import { NavbarHUD } from './components/NavbarHUD';
import { SealsModal } from './components/SealsModal';
import { DiaryModal } from './components/DiaryModal';
import { HintModal } from './components/HintModal';
import { TutorialModal } from './components/screens/TutorialModal';

// Screens
import { IntroScreen, SavedSessionSummary } from './components/screens/IntroScreen';
import { StoryScreen } from './components/screens/StoryScreen';
import { RegistrationScreen } from './components/screens/RegistrationScreen';
import { HubScreen } from './components/screens/HubScreen';
import { Lab1Colors } from './components/labs/Lab1Colors';
import { Lab2Aromas } from './components/labs/Lab2Aromas';
import { Lab3Gold } from './components/labs/Lab3Gold';
import { Lab4Snow } from './components/labs/Lab4Snow';
import { Lab5Molecules } from './components/labs/Lab5Molecules';
import { GrandFinale } from './components/labs/GrandFinale';
import { VictoryScreen } from './components/screens/VictoryScreen';

const LAB_KEYS: LabId[] = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5'];

export default function App() {
  // Always read saved data separately and boot on the Intro Screen (never auto-skipping to Hub)
  const [savedSnapshot, setSavedSnapshot] = useState<GameState | null>(() => {
    const loaded = loadSavedGame();
    return hasSavedProgress(loaded) ? loaded : null;
  });

  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState());
  const [sessionActive, setSessionActive] = useState(false);

  const [isSealsOpen, setIsSealsOpen] = useState(false);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [isHintsOpen, setIsHintsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Sync sound manager enabled state with active game preference
  useEffect(() => {
    soundManager.setEnabled(gameState.soundEnabled);
  }, [gameState.soundEnabled]);

  // Persist state to local storage ONLY after an active session has started/resumed
  useEffect(() => {
    if (!sessionActive) return;
    saveGame(gameState);
  }, [gameState, sessionActive]);

  // Game timer: counts elapsed seconds when game has started and before victory
  useEffect(() => {
    if (
      gameState.activeScreen === 'intro' ||
      gameState.activeScreen === 'story' ||
      gameState.activeScreen === 'registration' ||
      gameState.activeScreen === 'victory'
    ) {
      return;
    }

    const interval = setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.activeScreen]);

  // Recompute total score whenever lab scores or finale score change
  const computeTotalScore = (state: GameState): number => {
    const labSum = LAB_KEYS.reduce((acc, key) => acc + state.labs[key].score, 0);
    return labSum + state.finale.score;
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newVal = !gameState.soundEnabled;
    soundManager.setEnabled(newVal);
    soundManager.playClick();
    setGameState((prev) => ({ ...prev, soundEnabled: newVal }));
  };

  // Graphics toggle
  const handleToggleGraphics = () => {
    soundManager.playClick();
    setGameState((prev) => ({ ...prev, lowGraphicsMode: !prev.lowGraphicsMode }));
  };

  // Intro actions: Start Fresh Mission vs Explicitly Continue Saved Mission
  const handleStartNewMission = () => {
    clearSavedGame();
    setSavedSnapshot(null);
    const fresh = createInitialGameState();
    setGameState({
      ...fresh,
      activeScreen: 'story',
    });
    setSessionActive(true);
  };

  const handleContinueMission = () => {
    const restored = savedSnapshot || loadSavedGame();
    const targetScreen =
      restored.activeScreen === 'intro' ||
      restored.activeScreen === 'story' ||
      restored.activeScreen === 'registration'
        ? restored.team.teamName
          ? 'hub'
          : 'registration'
        : restored.activeScreen;

    setGameState({
      ...restored,
      activeScreen: targetScreen,
    });
    setSessionActive(true);
  };

  const handleContinueFromStory = () => {
    setGameState((prev) => ({
      ...prev,
      activeScreen: prev.team.teamName ? 'hub' : 'registration',
    }));
  };

  const handleRegisterTeam = (team: TeamData) => {
    setGameState((prev) => ({
      ...prev,
      team,
      startTime: prev.startTime || Date.now(),
      activeScreen: 'hub',
    }));
  };

  const handleSelectLab = (labId: LabId) => {
    setGameState((prev) => ({ ...prev, activeScreen: labId }));
  };

  const handleNavigateHub = () => {
    setGameState((prev) => ({
      ...prev,
      activeScreen: prev.team.teamName ? 'hub' : 'registration',
    }));
  };

  const handleSelectFinale = () => {
    setGameState((prev) => ({ ...prev, activeScreen: 'finale' }));
  };

  // Lab completion
  const handleCompleteLab = (labId: LabId, code: string) => {
    setGameState((prev) => {
      const updatedLabs = {
        ...prev.labs,
        [labId]: {
          ...prev.labs[labId],
          completed: true,
          codeEntered: code,
        },
      };
      const updatedState = { ...prev, labs: updatedLabs };
      return {
        ...updatedState,
        totalScore: computeTotalScore(updatedState),
      };
    });
  };

  // Update Finale state
  const handleUpdateFinale = (update: Partial<FinaleProgress>) => {
    setGameState((prev) => {
      const updatedFinale = { ...prev.finale, ...update };
      const updatedState = { ...prev, finale: updatedFinale };
      return {
        ...updatedState,
        totalScore: computeTotalScore(updatedState),
      };
    });
  };

  // Final finish
  const handleFinishGame = () => {
    setGameState((prev) => ({
      ...prev,
      endTime: Date.now(),
      activeScreen: 'victory',
      finale: { ...prev.finale, completed: true },
    }));
  };

  // Unlock hint with penalty
  const handleUnlockHint = (tier: 1 | 2 | 3, penalty: number) => {
    const current = gameState.activeScreen;
    if (current === 'finale') {
      setGameState((prev) => {
        if (prev.finale.hintsUnlocked.includes(tier)) return prev;
        const newScore = Math.max(0, prev.finale.score - penalty);
        const updatedFinale = {
          ...prev.finale,
          score: newScore,
          hintsUnlocked: [...prev.finale.hintsUnlocked, tier],
        };
        const updatedState = { ...prev, finale: updatedFinale };
        return {
          ...updatedState,
          totalScore: computeTotalScore(updatedState),
        };
      });
    } else if (current in gameState.labs) {
      const labId = current as LabId;
      setGameState((prev) => {
        if (prev.labs[labId].hintsUnlocked.includes(tier)) return prev;
        const newScore = Math.max(0, prev.labs[labId].score - penalty);
        const updatedLabs = {
          ...prev.labs,
          [labId]: {
            ...prev.labs[labId],
            score: newScore,
            hintsUnlocked: [...prev.labs[labId].hintsUnlocked, tier],
          },
        };
        const updatedState = { ...prev, labs: updatedLabs };
        return {
          ...updatedState,
          totalScore: computeTotalScore(updatedState),
        };
      });
    }
  };

  // Reset entire game from VictoryScreen
  const handleResetGame = () => {
    clearSavedGame();
    setSavedSnapshot(null);
    setSessionActive(false);
    setGameState(createInitialGameState());
    setIsHintsOpen(false);
    setIsDiaryOpen(false);
    setIsSealsOpen(false);
  };

  // Get current active lab score and unlocked hints for hint modal
  const getCurrentLabScore = (): number => {
    if (gameState.activeScreen === 'finale') return gameState.finale.score;
    if (gameState.activeScreen in gameState.labs) {
      return gameState.labs[gameState.activeScreen as LabId].score;
    }
    return 100;
  };

  const getCurrentUnlockedHints = (): number[] => {
    if (gameState.activeScreen === 'finale') return gameState.finale.hintsUnlocked;
    if (gameState.activeScreen in gameState.labs) {
      return gameState.labs[gameState.activeScreen as LabId].hintsUnlocked;
    }
    return [];
  };

  const savedSummary: SavedSessionSummary = savedSnapshot
    ? {
        exists: true,
        teamName: savedSnapshot.team.teamName,
        completedCount: LAB_KEYS.filter((id) => savedSnapshot.labs[id].completed).length,
        totalScore: savedSnapshot.totalScore,
        elapsedSeconds: savedSnapshot.elapsedSeconds,
      }
    : {
        exists: false,
        teamName: '',
        completedCount: 0,
        totalScore: 600,
        elapsedSeconds: 0,
      };

  // StationHero3D runs behind Intro, Story, and Registration.
  // Hub renders its own interactive 3D CommandCenter3D, Labs 1-5/Finale render their own 3D lab scenes, and Victory renders FinaleHologram3D.
  const showStationHeroBg =
    gameState.activeScreen === 'intro' ||
    gameState.activeScreen === 'story' ||
    gameState.activeScreen === 'registration';

  return (
    <div className="relative min-h-screen bg-[#040712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Full-screen 3D Snowy 2077 Station Hero Canvas */}
      {showStationHeroBg && (
        <StationHero3D
          lowGraphics={gameState.lowGraphicsMode}
          storyMode={gameState.activeScreen === 'story'}
        />
      )}

      {/* Top HUD bar (hidden on cinematic intro and story briefing) */}
      {gameState.activeScreen !== 'intro' && gameState.activeScreen !== 'story' && (
        <NavbarHUD
          state={gameState}
          onOpenSeals={() => setIsSealsOpen(true)}
          onOpenDiary={() => setIsDiaryOpen(true)}
          onOpenHints={() => setIsHintsOpen(true)}
          onToggleSound={handleToggleSound}
          onToggleGraphics={handleToggleGraphics}
          onNavigateHub={handleNavigateHub}
        />
      )}

      {/* Main Screen Content */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {gameState.activeScreen === 'intro' && (
          <IntroScreen
            savedSummary={savedSummary}
            onStartNewMission={handleStartNewMission}
            onContinueMission={handleContinueMission}
          />
        )}

        {gameState.activeScreen === 'story' && (
          <StoryScreen onContinue={handleContinueFromStory} />
        )}

        {gameState.activeScreen === 'registration' && (
          <RegistrationScreen
            initialTeam={gameState.team}
            onSubmit={handleRegisterTeam}
            onOpenTutorial={() => setIsTutorialOpen(true)}
          />
        )}

        {gameState.activeScreen === 'hub' && (
          <HubScreen
            state={gameState}
            onSelectLab={handleSelectLab}
            onSelectFinale={handleSelectFinale}
            onOpenSeals={() => setIsSealsOpen(true)}
          />
        )}

        {gameState.activeScreen === 'lab1' && (
          <Lab1Colors
            onComplete={(code) => handleCompleteLab('lab1', code)}
            completed={gameState.labs.lab1.completed}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'lab2' && (
          <Lab2Aromas
            onComplete={(code) => handleCompleteLab('lab2', code)}
            completed={gameState.labs.lab2.completed}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'lab3' && (
          <Lab3Gold
            onComplete={(code) => handleCompleteLab('lab3', code)}
            completed={gameState.labs.lab3.completed}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'lab4' && (
          <Lab4Snow
            onComplete={(code) => handleCompleteLab('lab4', code)}
            completed={gameState.labs.lab4.completed}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'lab5' && (
          <Lab5Molecules
            onComplete={(code) => handleCompleteLab('lab5', code)}
            completed={gameState.labs.lab5.completed}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'finale' && (
          <GrandFinale
            unlockedSealsCount={
              LAB_KEYS.filter((k) => gameState.labs[k].completed).length
            }
            finaleState={gameState.finale}
            onUpdateFinale={handleUpdateFinale}
            onFinishGame={handleFinishGame}
            lowGraphics={gameState.lowGraphicsMode}
          />
        )}

        {gameState.activeScreen === 'victory' && (
          <VictoryScreen state={gameState} onReset={handleResetGame} />
        )}
      </main>

      {/* Modals */}
      <SealsModal
        isOpen={isSealsOpen}
        onClose={() => setIsSealsOpen(false)}
        state={gameState}
      />

      <DiaryModal isOpen={isDiaryOpen} onClose={() => setIsDiaryOpen(false)} />

      <HintModal
        isOpen={isHintsOpen}
        onClose={() => setIsHintsOpen(false)}
        currentScreen={gameState.activeScreen}
        unlockedHints={getCurrentUnlockedHints()}
        currentLabScore={getCurrentLabScore()}
        onUnlockHint={handleUnlockHint}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />

      {/* Global subtle scanline overlay */}
      <div className="fixed inset-0 pointer-events-none z-30 scanline opacity-15" aria-hidden="true" />
    </div>
  );
}
