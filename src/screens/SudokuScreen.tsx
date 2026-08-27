import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '../components/ScreenContainer';
import { gameApi } from '../services/gameApi';
import { CellPosition, HistoryStep, Puzzle } from '../types/games.types';
import { showGameToast } from '../utils/toast';
import { ExitModal, GuideModal, SuccessModal } from '../components/GameModals';

export const SudokuScreen: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userBoard, setUserBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [history, setHistory] = useState<HistoryStep[]>([]);
  const [redoStack, setRedoStack] = useState<HistoryStep[]>([]);
  const [timer, setTimer] = useState<number>(0);

  // Modal Visibility States
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [gameResult, setGameResult] = useState<{ xpEarned: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initGame();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const initGame = async () => {
    try {
      setLoading(true);
      setShowSuccessModal(false);
      setTimer(0);
      setHistory([]);
      setRedoStack([]);
      setSelectedCell(null);

      const puzzleData = await gameApi.getPuzzle('sudoku', 'EASY', 6);
      setPuzzle(puzzleData.puzzle);
      setUserBoard(puzzleData.puzzle.board.map((row) => [...row]));

      // Pass as a single object payload matching StartGamePayload interface
      const sessionData = await gameApi.startGame({
        gameId: 'sudoku',
        puzzleId: puzzleData.puzzle._id,
      });
      setSessionId(sessionData.sessionId);

      startTimer();
    } catch (error: any) {
      showGameToast(
        'Initialization Failed',
        error.response?.data?.message || 'Failed to initialize game session.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkAndAutoSubmit = (currentBoard: number[][]) => {
    const isFull = currentBoard.every((row) => row.every((val) => val !== 0));
    if (isFull && !submitting) {
      handleSubmit(currentBoard);
    }
  };

  const handleCellPress = (row: number, col: number) => {
    if (!puzzle || puzzle.board[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || !puzzle) return;
    const { row, col } = selectedCell;

    const previousValue = userBoard[row][col];
    if (previousValue === num) return;

    const newBoard = userBoard.map((r) => [...r]);
    newBoard[row][col] = num;

    setUserBoard(newBoard);
    setHistory((prev) => [...prev, { row, col, previousValue, newValue: num }]);
    setRedoStack([]);

    checkAndAutoSubmit(newBoard);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastMove = history[history.length - 1];

    const newBoard = userBoard.map((r) => [...r]);
    newBoard[lastMove.row][lastMove.col] = lastMove.previousValue;

    setUserBoard(newBoard);
    setRedoStack((prev) => [...prev, lastMove]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextMove = redoStack[redoStack.length - 1];

    const newBoard = userBoard.map((r) => [...r]);
    newBoard[nextMove.row][nextMove.col] = nextMove.newValue;

    setUserBoard(newBoard);
    setHistory((prev) => [...prev, nextMove]);
    setRedoStack((prev) => prev.slice(0, -1));

    checkAndAutoSubmit(newBoard);
  };

  const handleClearCell = () => {
    if (!selectedCell || !puzzle) return;
    const { row, col } = selectedCell;
    if (puzzle.board[row][col] !== 0) return;

    const previousValue = userBoard[row][col];
    if (previousValue === 0) return;

    const newBoard = userBoard.map((r) => [...r]);
    newBoard[row][col] = 0;

    setUserBoard(newBoard);
    setHistory((prev) => [...prev, { row, col, previousValue, newValue: 0 }]);
  };

  const handleHintPress = () => {
    showGameToast('Hint System', 'Hint feature coming soon!', 'info');
  };

  const handleSubmit = async (boardToSubmit = userBoard) => {
    if (!sessionId) return;

    try {
      setSubmitting(true);
      stopTimer();

      const result = await gameApi.submitGame({
        sessionId,
        userBoard: boardToSubmit,
        clientTimeElapsed: timer,
      });

      setGameResult({ xpEarned: result.xpEarned });
      setShowSuccessModal(true);
    } catch (error: any) {
      startTimer();
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#B5F23D" />
        <Text className="mt-4 font-rajdhani-bold text-sm text-accentGreen">
          INITIALIZING MATRIX GRID...
        </Text>
      </ScreenContainer>
    );
  }

  const handleOpenGuide = () => {
    stopTimer();
    setShowGuideModal(true);
  };

  const handleCloseGuide = () => {
    setShowGuideModal(false);
    startTimer();
  };

  return (
    <ScreenContainer className="flex-1 bg-[#121212] px-4 pt-2">
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* TOP HEADER / BAR */}
      <View className="mb-6 flex-row items-center justify-between">
        {/* BACK / EXIT BUTTON */}
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
        >
          <Text className="font-orbitron-black text-lg text-text-main">←</Text>
        </TouchableOpacity>

        {/* TIMER PILL */}
        <View className="flex-row items-center rounded-full border border-cardBorder bg-card px-4 py-1.5">
          <Text className="mr-1 text-xs">⏱</Text>
          <Text className="font-orbitron text-xs font-bold text-accentGreen">
            {formatTime(timer)}
          </Text>
        </View>

        {/* HEADER ACTIONS: HINT & INFO / GUIDE */}
        <View className="flex-row items-center gap-2">
          {/* HINT ICON BUTTON */}
          <TouchableOpacity
            onPress={handleHintPress}
            className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
          >
            <Text className="text-base">💡</Text>
          </TouchableOpacity>

          {/* INFO / GUIDE ICON BUTTON */}
          <TouchableOpacity
            onPress={handleOpenGuide}
            className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
          >
            <Text className="font-orbitron-bold text-sm text-accentGreen">ⓘ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN 6x6 SUDOKU GRID */}
      <View className="my-auto items-center justify-center">
        <View className="overflow-hidden rounded-2xl border-2 border-accentGreen/50 bg-[#121212]">
          {userBoard.map((row, rIdx) => (
            <View key={`row-${rIdx}`} className="flex-row">
              {row.map((cellValue, cIdx) => {
                const isInitial = puzzle?.board[rIdx][cIdx] !== 0;
                const isSelected =
                  selectedCell?.row === rIdx && selectedCell?.col === cIdx;

                // Check if the current cell conflicts with row, column, or sub-grid
                const hasConflict = isCellInvalid(rIdx, cIdx, userBoard);

                const borderBottom = rIdx === 1 || rIdx === 3 ? 'border-b-2' : 'border-b';
                const borderRight = cIdx === 2 ? 'border-r-2' : 'border-r';

                // Background styling priority: Invalid (Red) > Selected (Lime) > Default (Transparent)
                const backgroundStyle = hasConflict
                  ? 'bg-red-500/30'
                  : isSelected
                    ? 'bg-lime-500/30'
                    : 'bg-transparent';

                // Text color priority: Initial Clue (Muted) > Invalid (Red) > Selected (Green) > Standard (White)
                const textColor = isInitial
                  ? 'text-text-muted'
                  : hasConflict
                    ? 'text-red-400'
                    : isSelected
                      ? 'text-accentGreen'
                      : 'text-text-main';

                return (
                  <TouchableOpacity
                    key={`cell-${rIdx}-${cIdx}`}
                    onPress={() => handleCellPress(rIdx, cIdx)}
                    activeOpacity={isInitial ? 1 : 0.7}
                    className={`h-14 w-14 items-center justify-center border-green-800 ${borderBottom} ${borderRight} ${backgroundStyle}`}
                  >
                    <Text className={`font-orbitron-black text-xl ${textColor}`}>
                      {cellValue !== 0 ? cellValue : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {submitting && (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#B5F23D" />
            <Text className="font-rajdhani-bold text-xs text-accentGreen">
              VERIFYING MATRIX SOLUTION...
            </Text>
          </View>
        )}
      </View>

      {/* BOTTOM CONTROLS & NUMPAD */}
      <View className="mb-6 gap-6">
        <View className="flex-row items-center justify-center gap-3">
          <TouchableOpacity
            onPress={handleUndo}
            disabled={history.length === 0}
            className={`h-12 w-14 items-center justify-center rounded-xl border border-cardBorder bg-card ${history.length === 0 ? 'opacity-40' : ''
              }`}
          >
            <Text className="text-base text-text-main">↶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCell}
            disabled={!selectedCell}
            className={`h-12 flex-row items-center justify-center gap-1.5 rounded-xl border border-cardBorder bg-card px-6 ${!selectedCell ? 'opacity-40' : ''
              }`}
          >
            <Text className="text-xs">≡</Text>
            <Text className="font-orbitron-black text-xs text-text-main">
              CLEAR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRedo}
            disabled={redoStack.length === 0}
            className={`h-12 w-14 items-center justify-center rounded-xl border border-cardBorder bg-card ${redoStack.length === 0 ? 'opacity-40' : ''
              }`}
          >
            <Text className="text-base text-text-main">↷</Text>
          </TouchableOpacity>
        </View>

        <View className="items-center">
          <View className="w-64 flex-row flex-wrap justify-between gap-y-3">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TouchableOpacity
                key={`num-${num}`}
                onPress={() => handleNumberInput(num)}
                className="h-14 w-[30%] items-center justify-center rounded-2xl border-2 border-accentGreen/50 bg-[#121212] active:bg-accentGreen/20"
              >
                <Text className="font-orbitron-black text-2xl text-text-main">
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* MODAL COMPONENTS */}
      <ExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={async () => {
          setShowExitModal(false);
          if (sessionId) {
            try {
              await gameApi.abandonGame(sessionId, timer);
            } catch (error) {
              console.error('Failed to log abandoned session:', error);
            }
          }
          router.back();
        }}
      />

      <GuideModal
        gameId="Sudoku"
        visible={showGuideModal}
        onClose={handleCloseGuide}
      />

      <SuccessModal
        visible={showSuccessModal}
        gameId="Sudoku"
        timeFormatted={formatTime(timer)}
        xpEarned={gameResult?.xpEarned || 0}
        onPlayAgain={initGame}
        onExit={() => {
          setShowSuccessModal(false);
          router.back();
        }}
      />
    </ScreenContainer>
  );
};


const isCellInvalid = (row: number, col: number, board: number[][]): boolean => {
  const value = board[row][col];
  if (value === 0) return false; // Empty cells are not invalid

  for (let c = 0; c < 6; c++) {
    if (c !== col && board[row][c] === value) return true;
  }

  for (let r = 0; r < 6; r++) {
    if (r !== row && board[r][col] === value) return true;
  }

  const startRow = Math.floor(row / 2) * 2;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = startRow; r < startRow + 2; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return true;
    }
  }

  return false;
};

const SUDOKU_RULES = [
  'Fill the grid so every row contains numbers 1 to 6 without duplicates.',
  'Every column must contain numbers 1 to 6 with no repeats.',
  'Each 2x3 box must contain digits 1 through 6.',
];