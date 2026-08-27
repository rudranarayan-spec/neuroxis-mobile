/**
 * ShikakuScreen — premium, fully-responsive rebuild.
 *
 * Requires (if not already present in the project):
 *   npx expo install expo-haptics
 *
 * Key fixes vs. the previous version:
 *  1. Drag-to-select is now driven by a single PanResponder on the grid
 *     container instead of per-cell onMouseDown/onTouchStart handlers.
 *     RN does not fire per-cell touch-move events like the DOM does, so the
 *     old "web-only" mouse handlers were the only thing that ever actually
 *     worked — native drag was broken. PanResponder tracks the finger
 *     continuously and works identically on iOS, Android and web.
 *  2. Overlapping a new rectangle with an existing one no longer silently
 *     deletes the existing region. It's rejected with feedback instead.
 *  3. Live rule validation: a region is colored green only when it contains
 *     exactly one number equal to its own area — same as the real Shikaku
 *     rule — so users get instant feedback instead of a black-box
 *     "auto submit on full coverage" behaviour.
 *  4. Tap an existing region to delete it (fast correction, no need to hunt
 *     for the undo button for a single mistake).
 *  5. Haptic feedback, a live "regions solved" progress pill, and a rules
 *     hint so first-time players understand the interaction immediately.
 *  6. useWindowDimensions instead of a one-time Dimensions.get() read, so
 *     the board re-flows correctly on rotation / foldables / web resize.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  PanResponder,
  GestureResponderEvent,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../components/ScreenContainer';
import { gameApi } from '../services/gameApi';
import { Puzzle, ShikakuRect } from '../types/games.types';
import { showGameToast } from '../utils/toast';
import { ExitModal, GuideModal, SuccessModal } from '../components/GameModals';

// ────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────

const GRID_PADDING = 32;
const MAX_BOARD_SIZE = 420;

const REGION_COLORS = [
  { bg: 'rgba(59, 130, 246, 0.45)', border: '#3B82F6' },
  { bg: 'rgba(168, 85, 247, 0.45)', border: '#A855F7' },
  { bg: 'rgba(236, 72, 153, 0.45)', border: '#EC4899' },
  { bg: 'rgba(245, 158, 11, 0.45)', border: '#F59E0B' },
  { bg: 'rgba(16, 185, 129, 0.45)', border: '#10B981' },
  { bg: 'rgba(6, 182, 212, 0.45)', border: '#06B6D4' },
];

const INVALID_COLOR = { bg: 'rgba(239, 68, 68, 0.30)', border: '#EF4444' };
const DRAG_COLOR = { bg: 'rgba(181, 242, 61, 0.25)', border: '#B5F23D' };

type Cell = { row: number; col: number };

interface RectHistoryStep {
  previousRects: ShikakuRect[];
  nextRects: ShikakuRect[];
}

// ────────────────────────────────────────────────────────────────────────
// Pure helpers (kept outside the component — no need to recreate per render)
// ────────────────────────────────────────────────────────────────────────

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const rectArea = (rect: ShikakuRect) =>
  (rect.r2 - rect.r1 + 1) * (rect.c2 - rect.c1 + 1);

const rectsOverlap = (a: ShikakuRect, b: ShikakuRect) =>
  a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1;

const cellInsideRect = (cell: Cell, rect: ShikakuRect) =>
  cell.row >= rect.r1 && cell.row <= rect.r2 && cell.col >= rect.c1 && cell.col <= rect.c2;

const normalizeRect = (a: Cell, b: Cell): ShikakuRect => ({
  r1: Math.min(a.row, b.row),
  c1: Math.min(a.col, b.col),
  r2: Math.max(a.row, b.row),
  c2: Math.max(a.col, b.col),
});

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export const ShikakuScreen: React.FC = () => {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [rects, setRects] = useState<ShikakuRect[]>([]);
  const [selectionStart, setSelectionStart] = useState<Cell | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<Cell | null>(null);

  const [history, setHistory] = useState<RectHistoryStep[]>([]);
  const [redoStack, setRedoStack] = useState<RectHistoryStep[]>([]);
  const [timer, setTimer] = useState(0);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ xpEarned: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gridContainerRef = useRef<View>(null);
  const startCellRef = useRef<Cell | null>(null);

  const boardSize = Math.min(windowWidth - GRID_PADDING, MAX_BOARD_SIZE);
  const gridSize = puzzle?.gridSize ?? 1;
  const cellSize = boardSize / gridSize;

  // ── Lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    initGame();
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const initGame = async () => {
    try {
      setLoading(true);
      setShowSuccessModal(false);
      setTimer(0);
      setRects([]);
      setHistory([]);
      setRedoStack([]);
      setSelectionStart(null);
      setSelectionCurrent(null);

      const puzzleData = await gameApi.getPuzzle('shikaku', 'EASY', 5);
      setPuzzle(puzzleData.puzzle);

      const sessionData = await gameApi.startGame('shikaku', puzzleData.puzzle._id);
      setSessionId(sessionData.sessionId);

      startTimer();
    } catch (error: any) {
      showGameToast(
        'Initialization Failed',
        error?.response?.data?.message || 'Failed to initialize game session.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Rule validation ──────────────────────────────────────────────────

  const getRectClueNumbers = useCallback(
    (rect: ShikakuRect): number[] => {
      if (!puzzle) return [];
      const found: number[] = [];
      for (let r = rect.r1; r <= rect.r2; r++) {
        for (let c = rect.c1; c <= rect.c2; c++) {
          const value = puzzle.board[r][c];
          if (value !== 0) found.push(value);
        }
      }
      return found;
    },
    [puzzle]
  );

  const isRectValid = useCallback(
    (rect: ShikakuRect): boolean => {
      const clues = getRectClueNumbers(rect);
      return clues.length === 1 && clues[0] === rectArea(rect);
    },
    [getRectClueNumbers]
  );

  const totalClues = useMemo(() => {
    if (!puzzle) return 0;
    return puzzle.board.reduce(
      (sum, row) => sum + row.filter((v) => v !== 0).length,
      0
    );
  }, [puzzle]);

  const validRegionCount = useMemo(
    () => rects.filter(isRectValid).length,
    [rects, isRectValid]
  );

  const isPuzzleComplete = useCallback(
    (candidateRects: ShikakuRect[]): boolean => {
      if (!puzzle) return false;
      const gridArea = puzzle.gridSize * puzzle.gridSize;
      const covered = candidateRects.reduce((sum, r) => sum + rectArea(r), 0);
      if (covered !== gridArea) return false;
      return candidateRects.every(isRectValid);
    },
    [puzzle, isRectValid]
  );

  // ── History helpers ──────────────────────────────────────────────────

  const applyRectChange = useCallback(
    (nextRects: ShikakuRect[]) => {
      setHistory((prev) => [...prev, { previousRects: rects, nextRects }]);
      setRedoStack([]);
      setRects(nextRects);
    },
    [rects]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastStep = history[history.length - 1];
    setRects(lastStep.previousRects);
    setRedoStack((prev) => [...prev, lastStep]);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextStep = redoStack[redoStack.length - 1];
    setRects(nextStep.nextRects);
    setHistory((prev) => [...prev, nextStep]);
    setRedoStack((prev) => prev.slice(0, -1));
  };

  const handleClearAll = () => {
    if (rects.length === 0) return;
    applyRectChange([]);
  };

  // ── Gesture handling ─────────────────────────────────────────────────

  const getCellFromEvent = useCallback(
    (evt: GestureResponderEvent): Cell => {
      // locationX/locationY are reported by RN relative to whichever view
      // owns the current gesture (our grid container, since every cell and
      // rect overlay below has pointerEvents="none"). This avoids mixing
      // window-relative pageX/pageY with a separately-measured offset,
      // which is what caused the vertical drift into the row below.
      const { locationX, locationY } = evt.nativeEvent;
      const col = clamp(Math.floor(locationX / cellSize), 0, gridSize - 1);
      const row = clamp(Math.floor(locationY / cellSize), 0, gridSize - 1);
      return { row, col };
    },
    [cellSize, gridSize]
  );

  const handleGestureEnd = useCallback(
    (start: Cell, end: Cell) => {
      const isTap = start.row === end.row && start.col === end.col;

      // Tapping (no drag) on top of an existing region deletes it —
      // fast single-mistake correction without reaching for Undo.
      if (isTap) {
        const existing = rects.find((r) => cellInsideRect(start, r));
        if (existing) {
          applyRectChange(rects.filter((r) => r !== existing));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
          return;
        }
      }

      const newRect = normalizeRect(start, end);
      const overlapsExisting = rects.some((r) => rectsOverlap(r, newRect));

      if (overlapsExisting) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
        showGameToast('Overlapping Region', 'That space is already covered by another region.', 'error');
        return;
      }

      const nextRects = [...rects, newRect];
      applyRectChange(nextRects);

      if (isRectValid(newRect)) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => { });
      }

      if (isPuzzleComplete(nextRects) && !submitting) {
        handleSubmit(nextRects);
      }
    },
    [rects, applyRectChange, isRectValid, isPuzzleComplete, submitting]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !submitting && !!puzzle,
        onMoveShouldSetPanResponder: () => !submitting && !!puzzle,
        onPanResponderGrant: (evt) => {
          const cell = getCellFromEvent(evt);
          startCellRef.current = cell;
          setSelectionStart(cell);
          setSelectionCurrent(cell);
        },
        onPanResponderMove: (evt) => {
          setSelectionCurrent(getCellFromEvent(evt));
        },
        onPanResponderRelease: (evt) => {
          const start = startCellRef.current;
          const end = getCellFromEvent(evt);
          setSelectionStart(null);
          setSelectionCurrent(null);
          startCellRef.current = null;
          if (start) handleGestureEnd(start, end);
        },
        onPanResponderTerminate: () => {
          setSelectionStart(null);
          setSelectionCurrent(null);
          startCellRef.current = null;
        },
      }),
    [submitting, puzzle, getCellFromEvent, handleGestureEnd]
  );

  // ── Submission ───────────────────────────────────────────────────────

  const handleSubmit = async (rectsToSubmit: ShikakuRect[] = rects) => {
    if (!sessionId) return;
    try {
      setSubmitting(true);
      stopTimer();
      const result = await gameApi.submitGame({
        sessionId,
        rects: rectsToSubmit,
        clientTimeElapsed: timer,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      setGameResult({ xpEarned: result.xpEarned });
      setShowSuccessModal(true);
    } catch (error: any) {
      startTimer();
      showGameToast('Submission Failed', 'Could not verify your solution. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Render ───────────────────────────────────────────────────────────

  if (loading || !puzzle) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-[#121212]">
        <ActivityIndicator size="large" color="#B5F23D" />
        <Text className="mt-4 font-rajdhani-bold text-sm text-accentGreen">
          INITIALIZING SHIKAKU GRID...
        </Text>
      </ScreenContainer>
    );
  }

  const dragBox =
    selectionStart && selectionCurrent ? normalizeRect(selectionStart, selectionCurrent) : null;
  const dragBoxIsTap =
    dragBox && dragBox.r1 === dragBox.r2 && dragBox.c1 === dragBox.c2;

  return (
    <ScreenContainer className="flex-1 bg-[#121212] px-4 pt-2">
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* TOP HEADER */}
      <View className="mb-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => setShowExitModal(true)}
          className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
        >
          <Text className="font-orbitron-black text-lg text-text-main">←</Text>
        </TouchableOpacity>

        <View className="flex-row items-center rounded-full border border-cardBorder bg-card px-4 py-1.5">
          <Text className="mr-1 text-xs">⏱</Text>
          <Text className="font-orbitron text-xs font-bold text-accentGreen">
            {formatTime(timer)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            stopTimer();
            setShowGuideModal(true);
          }}
          className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
        >
          <Text className="font-orbitron-bold text-sm text-accentGreen">ⓘ</Text>
        </TouchableOpacity>
      </View>

      {/* PROGRESS PILL */}
      <View className="mb-2 items-center">
        <View className="flex-row items-center rounded-full border border-cardBorder bg-card px-4 py-1.5">
          <Text className="font-rajdhani-bold text-xs text-text-main">
            Regions solved{' '}
          </Text>
          <Text className="font-orbitron-black text-xs text-accentGreen">
            {validRegionCount}/{totalClues}
          </Text>
        </View>
      </View>

      {/* INTERACTIVE SHIKAKU BOARD */}
      <View className="my-auto items-center justify-center">
        <View
          ref={gridContainerRef}
          {...panResponder.panHandlers}
          style={{ width: boardSize, height: boardSize }}
          className="relative overflow-hidden rounded-2xl border-2 border-accentGreen/50 bg-[#121212]"
        >
          {/* BASE GRID CELLS (display only — all interaction is via PanResponder) */}
          {puzzle.board.map((row, rIdx) => (
            <View key={`row-${rIdx}`} className="flex-row" pointerEvents="none">
              {row.map((cellValue, cIdx) => (
                <View
                  key={`cell-${rIdx}-${cIdx}`}
                  style={{ width: cellSize, height: cellSize }}
                  className="items-center justify-center border-r border-b border-green-900/40"
                >
                  {cellValue !== 0 && (
                    <Text className="font-orbitron-black text-2xl text-accentGreen">
                      {cellValue}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* COMMITTED REGIONS */}
          {rects.map((rect, idx) => {
            const valid = isRectValid(rect);
            const color = valid ? REGION_COLORS[idx % REGION_COLORS.length] : INVALID_COLOR;
            return (
              <View
                key={`rect-${rect.r1}-${rect.c1}-${rect.r2}-${rect.c2}`}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: rect.r1 * cellSize,
                  left: rect.c1 * cellSize,
                  width: (rect.c2 - rect.c1 + 1) * cellSize,
                  height: (rect.r2 - rect.r1 + 1) * cellSize,
                  backgroundColor: color.bg,
                  borderColor: color.border,
                  borderWidth: 2,
                  borderRadius: 12,
                  alignItems: 'flex-end',
                  padding: 3,
                  zIndex: 20,
                }}
              >
                {!valid && (
                  <View className="h-4 w-4 items-center justify-center rounded-full bg-red-500">
                    <Text className="text-[10px] font-bold text-white">!</Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* LIVE DRAG HIGHLIGHT */}
          {dragBox && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: dragBox.r1 * cellSize,
                left: dragBox.c1 * cellSize,
                width: (dragBox.c2 - dragBox.c1 + 1) * cellSize,
                height: (dragBox.r2 - dragBox.r1 + 1) * cellSize,
                backgroundColor: dragBoxIsTap ? 'transparent' : DRAG_COLOR.bg,
                borderColor: DRAG_COLOR.border,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderRadius: 12,
                zIndex: 30,
              }}
            />
          )}
        </View>

        {submitting && (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color="#B5F23D" />
            <Text className="font-rajdhani-bold text-xs text-accentGreen">
              VERIFYING SHIKAKU REGIONS...
            </Text>
          </View>
        )}

        {!submitting && (
          <Text className="mt-4 max-w-[300px] text-center font-rajdhani text-[11px] text-text-main/60">
            Drag from one cell to another to draw a region. Each region must contain exactly
            one number equal to its total number of cells. Tap a region to remove it.
          </Text>
        )}
      </View>

      {/* BOTTOM CONTROL TOOLBAR */}
      <View className="mb-8 flex-row items-center justify-center gap-3">
        <TouchableOpacity
          onPress={handleUndo}
          disabled={history.length === 0}
          className={`h-12 w-14 items-center justify-center rounded-xl border border-cardBorder bg-card ${history.length === 0 ? 'opacity-40' : ''
            }`}
        >
          <Text className="text-base text-text-main">↶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleClearAll}
          disabled={rects.length === 0}
          className={`h-12 flex-row items-center justify-center gap-1.5 rounded-xl border border-cardBorder bg-card px-6 ${rects.length === 0 ? 'opacity-40' : ''
            }`}
        >
          <Text className="text-xs">≡</Text>
          <Text className="font-orbitron-black text-xs text-text-main">CLEAR GRID</Text>
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

      {/* MODAL DIALOGS */}
      <ExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={async () => {
          setShowExitModal(false);
          if (sessionId) {
            try {
              await gameApi.abandonGame(sessionId, timer);
            } catch (err) {
              console.error(err);
            }
          }
          router.back();
        }}
      />

      <GuideModal
        visible={showGuideModal}
        gameId="shikaku"
        onClose={() => {
          setShowGuideModal(false);
          startTimer();
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        timeFormatted={formatTime(timer)}
        gameId="shikaku"
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


const SHIKAKU_RULES = [
  'Divide the grid into rectangular and square regions.',
  'Each region must contain exactly one number.',
  'The area of each region (cells count) must equal the number inside it.',
];