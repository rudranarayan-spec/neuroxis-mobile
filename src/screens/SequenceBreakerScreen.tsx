import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../components/ScreenContainer';
import { gameApi } from '../services/gameApi';
import { Puzzle } from '../types/games.types';
import { showGameToast } from '../utils/toast';
import { ExitModal, GuideModal, SuccessModal } from '../components/GameModals';

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_SIZE = 3;           // 3 columns × 3 rows = 9 tiles
const GAME_ID = 'sequence-breaker';

const PREVIEW_HOLD_MS = 400;
const PREVIEW_GAP_MS  = 250;
const PREVIEW_END_MS  = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'LOADING' | 'PREVIEW' | 'PLAYING' | 'SUBMITTING' | 'FAILED';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Screen ───────────────────────────────────────────────────────────────────

export const SequenceBreakerScreen: React.FC = () => {
  const router     = useRouter();
  const navigation = useNavigation();
  const { width: winW, height: winH } = useWindowDimensions();

  // ── Game state ────────────────────────────────────────────────────────

  const [phase,          setPhase]          = useState<Phase>('LOADING');
  const [puzzle,         setPuzzle]         = useState<Puzzle | null>(null);
  const [sessionId,      setSessionId]      = useState<string | null>(null);
  const [targetSequence, setTargetSequence] = useState<number[]>([]);
  const [userSequence,   setUserSequence]   = useState<number[]>([]);
  const [activeTile,     setActiveTile]     = useState<number | null>(null);
  const [timer,          setTimer]          = useState(0);

  // ── Modal state ───────────────────────────────────────────────────────

  const [showExitModal,    setShowExitModal]    = useState(false);
  const [showGuideModal,   setShowGuideModal]   = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [gameResult,       setGameResult]       = useState<{ xpEarned: number } | null>(null);

  // ── Refs ──────────────────────────────────────────────────────────────

  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef  = useRef(true);
  const runIdRef      = useRef(0);
  const allowExitRef  = useRef(false);
  const pulseAnim     = useRef(new Animated.Value(0)).current;

  // ── Responsive sizing ─────────────────────────────────────────────────
  //
  // FIX 1: Board sizing formula changed.
  // Old formula used gap prop on the board View which consumed extra width
  // not accounted for in tileSize → grid rendered as 2 columns, not 3.
  //
  // New formula:
  //   boardSize = available width capped at a safe max
  //   tileGap   = gap between tiles (NOT a View gap prop — applied as marginRight/Bottom)
  //   tileSize  = (boardSize - padding×2 - tileGap×(GRID_SIZE-1)) / GRID_SIZE
  //
  // This gives exact integer tile sizes that always sum to the board width.

  const isSmall    = winW < 360 || winH < 680;
  const BOARD_PAD  = isSmall ? 12 : 16;   // inner board padding
  const TILE_GAP   = isSmall ? 8  : 12;   // gap between tiles

  const boardSize  = Math.min(
    winW - (isSmall ? 32 : 48),           // horizontal margin from screen edge
    winH * 0.44,                          // max 44% of screen height
    400,                                  // hard cap
  );

  const tileSize   = Math.floor(
    (boardSize - BOARD_PAD * 2 - TILE_GAP * (GRID_SIZE - 1)) / GRID_SIZE
  );

  // ── Lifecycle ─────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    initGame();
    return () => {
      isMountedRef.current = false;
      stopTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', (e: any) => {
      if (allowExitRef.current || phase === 'LOADING') return;
      e.preventDefault();
      setShowExitModal(true);
    });
    return unsub;
  }, [navigation, phase]);

  // ── Tile pulse animation ──────────────────────────────────────────────

  useEffect(() => {
    if (activeTile === null) return;
    pulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 80,  useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [activeTile, pulseAnim]);

  // ── Timer ─────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (isMountedRef.current) setTimer((p) => p + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Game init ─────────────────────────────────────────────────────────

  const initGame = useCallback(async () => {
    const myRun = ++runIdRef.current;
    try {
      setPhase('LOADING');
      setShowSuccessModal(false);
      setTimer(0);
      setUserSequence([]);
      setActiveTile(null);

      const puzzleData   = await gameApi.getPuzzle(GAME_ID, 'EASY', 5);
      if (!isMountedRef.current || runIdRef.current !== myRun) return;
      setPuzzle(puzzleData.puzzle);

      const sessionData  = await gameApi.startGame({
        gameId: GAME_ID,
        puzzleId: puzzleData.puzzle._id,
      } as any);
      if (!isMountedRef.current || runIdRef.current !== myRun) return;

      setSessionId(sessionData.sessionId);
      const sequence = sessionData.sequence || [0, 4, 8, 2, 6];
      setTargetSequence(sequence);

      playPreviewSequence(sequence, myRun);
    } catch (error: any) {
      if (!isMountedRef.current || runIdRef.current !== myRun) return;
      showGameToast(
        'Initialization Failed',
        error?.response?.data?.message || 'Failed to initialize sequence session.',
        'error',
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Preview playback ──────────────────────────────────────────────────

  const playPreviewSequence = useCallback(async (sequence: number[], runId?: number) => {
    const myRun = runId ?? ++runIdRef.current;
    setPhase('PREVIEW');
    setUserSequence([]);

    for (let i = 0; i < sequence.length; i++) {
      if (!isMountedRef.current || runIdRef.current !== myRun) return;
      setActiveTile(sequence[i]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await wait(PREVIEW_HOLD_MS);
      if (!isMountedRef.current || runIdRef.current !== myRun) return;
      setActiveTile(null);
      await wait(PREVIEW_GAP_MS);
    }

    if (!isMountedRef.current || runIdRef.current !== myRun) return;
    await wait(PREVIEW_END_MS);
    if (!isMountedRef.current || runIdRef.current !== myRun) return;

    setPhase('PLAYING');
    startTimer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTimer]);

  // ── Tile tap ──────────────────────────────────────────────────────────

  const handleTilePress = useCallback((tileIdx: number) => {
    if (phase !== 'PLAYING') return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setActiveTile(tileIdx);
    setTimeout(() => { if (isMountedRef.current) setActiveTile(null); }, 200);

    const newSeq    = [...userSequence, tileIdx];
    const stepIndex = newSeq.length - 1;

    setUserSequence(newSeq);

    if (tileIdx !== targetSequence[stepIndex]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setPhase('FAILED');
      stopTimer();
      showGameToast('DESYNC DETECTED', 'Wrong node. Restart the sequence.', 'error');
      return;
    }

    if (newSeq.length === targetSequence.length) {
      submitSuccess(newSeq);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, userSequence, targetSequence, stopTimer]);

  const submitSuccess = useCallback(async (completedSequence: number[]) => {
    if (!sessionId) return;
    try {
      setPhase('SUBMITTING');
      stopTimer();
      const result = await gameApi.submitGame({
        sessionId,
        userSequence: completedSequence,
        clientTimeElapsed: timer,
      });
      if (!isMountedRef.current) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setGameResult({ xpEarned: result?.xpEarned || 0 });
      setShowSuccessModal(true);
    } catch {
      if (!isMountedRef.current) return;
      setPhase('PLAYING');
      startTimer();
      showGameToast('Submission Error', 'Failed to transmit sequence sync.', 'error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, timer, stopTimer, startTimer]);

  // ── Exit ──────────────────────────────────────────────────────────────

  const handleExitConfirm = useCallback(async () => {
    setShowExitModal(false);
    if (sessionId) {
      try { await gameApi.abandonGame(sessionId, timer); } catch { /* no-op */ }
    }
    allowExitRef.current = true;
    router.back();
  }, [sessionId, timer, router]);

  const openGuide = useCallback(() => {
    if (phase === 'PLAYING') stopTimer();
    setShowGuideModal(true);
  }, [phase, stopTimer]);

  const closeGuide = useCallback(() => {
    setShowGuideModal(false);
    if (phase === 'PLAYING') startTimer();
  }, [phase, startTimer]);

  // ── Loading screen ────────────────────────────────────────────────────

  if (phase === 'LOADING' || !puzzle) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center bg-[#070A0E]">
        <StatusBar barStyle="light-content" backgroundColor="#070A0E" />
        <ActivityIndicator size="large" color="#06B6D4" />
        <Text className="mt-4 font-rajdhani-bold text-xs tracking-widest text-cyan-400">
          SYNCHRONIZING MATRIX GRID...
        </Text>
      </ScreenContainer>
    );
  }

  // ── Status metadata ───────────────────────────────────────────────────

  const STATUS: Record<
    Exclude<Phase, 'LOADING'>,
    { label: string; borderColor: string; bgColor: string; textColor: string }
  > = {
    PREVIEW:    { label: '⚡  WATCH SEQUENCE', borderColor: 'rgba(6,182,212,0.4)',  bgColor: 'rgba(8,51,68,0.7)',   textColor: '#22D3EE' },
    PLAYING:    { label: '▶  REPEAT SEQUENCE', borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(6,52,42,0.7)',   textColor: '#34D399' },
    SUBMITTING: { label: '⏳  VERIFYING SYNC',  borderColor: 'rgba(16,185,129,0.4)', bgColor: 'rgba(6,52,42,0.7)',   textColor: '#34D399' },
    FAILED:     { label: '✕  DESYNC DETECTED', borderColor: 'rgba(239,68,68,0.4)',  bgColor: 'rgba(69,10,10,0.7)',  textColor: '#F87171' },
  };
  const status = STATUS[phase as Exclude<Phase, 'LOADING'>];

  // ── Tile renderer ─────────────────────────────────────────────────────
  //
  // FIX 2: Grid rendered as GRID_SIZE explicit rows, each a flex-row
  // of GRID_SIZE tiles. No flex-wrap. tileSize is exact. marginRight is
  // applied to all tiles except the last in each row.

  const renderGrid = () => {
    const rows: JSX.Element[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      const tiles: JSX.Element[] = [];

      for (let col = 0; col < GRID_SIZE; col++) {
        const tileIdx  = row * GRID_SIZE + col;
        const isActive = activeTile === tileIdx;
        const isLast   = col === GRID_SIZE - 1;

        tiles.push(
          <TouchableOpacity
            key={`tile-${tileIdx}`}
            activeOpacity={0.85}
            disabled={phase !== 'PLAYING'}
            onPress={() => handleTilePress(tileIdx)}
            accessibilityRole="button"
            accessibilityLabel={`Node ${tileIdx + 1}`}
            style={[
              styles.tile,
              {
                width:        tileSize,
                height:       tileSize,
                marginRight:  isLast ? 0 : TILE_GAP,
              },
              isActive && styles.tileActive,
            ]}
          >
            {/* Centre dot */}
            <View
              style={[
                styles.tileDot,
                isActive && styles.tileDotActive,
              ]}
            />

            {/* Pulse flash overlay */}
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                styles.tilePulse,
                { opacity: isActive ? pulseAnim : 0 },
              ]}
            />
          </TouchableOpacity>,
        );
      }

      rows.push(
        <View
          key={`row-${row}`}
          style={[
            styles.gridRow,
            row < GRID_SIZE - 1 && { marginBottom: TILE_GAP },
          ]}
        >
          {tiles}
        </View>,
      );
    }

    return rows;
  };

  // ─────────────────────────────────────────────────────────────────────

  return (
    <ScreenContainer className="flex-1 bg-[#070A0E]">
      <StatusBar barStyle="light-content" backgroundColor="#070A0E" />

      {/* ── HEADER ── */}
      <View className="flex-row items-center justify-between border-b border-cyan-500/10 px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Exit"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-950/30"
        >
          <Text className="font-orbitron-bold text-base text-cyan-400">←</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="font-orbitron-bold text-sm tracking-wider text-cyan-400">
            SEQUENCE BREAKER
          </Text>
          <Text className="font-rajdhani-medium text-xs tracking-wide text-cyan-300/60">
            {phase === 'PREVIEW'
              ? 'MEMORIZE PATTERN'
              : `PROGRESS: ${userSequence.length} / ${targetSequence.length}`}
          </Text>
        </View>

        <TouchableOpacity
          onPress={openGuide}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="How to play"
          className="h-10 w-10 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-950/30"
        >
          <Text className="font-orbitron-bold text-sm text-cyan-400">ⓘ</Text>
        </TouchableOpacity>
      </View>

      {/* ── STATUS + TIMER + DOTS ── */}
      {/*
        FIX 3: Replaced my-auto on grid with a proper 3-zone flex layout:
          - zone A (status) fixed height at top
          - zone B (grid)   flex: 1, centers the board
          - zone C (footer) fixed height at bottom
        No dead space possible because zones exactly fill remaining height.
      */}
      <View className="items-center px-4 pt-4 pb-2">
        {/* Status badge */}
        <View
          style={{
            borderColor: status.borderColor,
            backgroundColor: status.bgColor,
          }}
          className="flex-row items-center rounded-full border px-5 py-2"
        >
          <Text
            style={{ color: status.textColor }}
            className="font-orbitron-bold text-[11px] tracking-wider"
          >
            {status.label}
          </Text>
        </View>

        {/* Timer */}
        {(phase === 'PLAYING' || phase === 'SUBMITTING') && (
          <Text className="mt-2 font-orbitron-bold text-xs tracking-widest text-cyan-300/50">
            ⏱ {timer}s
          </Text>
        )}

        {/* Progress dots */}
        {(phase === 'PLAYING' || phase === 'SUBMITTING') && targetSequence.length > 0 && (
          <View className="mt-2 flex-row items-center" style={{ gap: 6 }}>
            {targetSequence.map((_, i) => (
              <View
                key={i}
                style={{
                  width:           7,
                  height:          7,
                  borderRadius:    3.5,
                  backgroundColor: i < userSequence.length
                    ? '#22D3EE'
                    : 'rgba(34,211,238,0.15)',
                }}
              />
            ))}
          </View>
        )}
      </View>

      {/* ── GRID (zone B — takes all remaining vertical space) ── */}
      <View className="flex-1 items-center justify-center">
        <View
          style={[
            styles.board,
            {
              width:   boardSize,
              height:  boardSize,
              padding: BOARD_PAD,
            },
          ]}
        >
          {renderGrid()}
        </View>
      </View>

      {/* ── FOOTER ACTION (zone C — fixed height) ── */}
      <View className="items-center justify-center px-4 pb-8 pt-4" style={{ minHeight: 72 }}>
        {phase === 'FAILED' && (
          <TouchableOpacity
            onPress={initGame}
            activeOpacity={0.8}
            className="rounded-2xl border border-red-500/40 bg-red-950/50 px-8 py-3.5"
          >
            <Text className="font-orbitron-bold text-xs tracking-wider text-red-400">
              RETRY SEQUENCE
            </Text>
          </TouchableOpacity>
        )}

        {phase === 'PLAYING' && (
          <TouchableOpacity
            onPress={() => playPreviewSequence(targetSequence)}
            activeOpacity={0.8}
            className="rounded-2xl border border-cyan-500/30 bg-cyan-950/50 px-7 py-3"
          >
            <Text className="font-orbitron-bold text-xs tracking-wider text-cyan-400">
              REPLAY PREVIEW
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── MODALS ── */}
      <ExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={handleExitConfirm}
      />

      <GuideModal visible={showGuideModal} gameId={GAME_ID} onClose={closeGuide} />

      <SuccessModal
        visible={showSuccessModal}
        timeFormatted={`${timer}s`}
        gameId={GAME_ID}
        xpEarned={gameResult?.xpEarned || 0}
        onPlayAgain={initGame}
        onExit={() => {
          setShowSuccessModal(false);
          allowExitRef.current = true;
          router.back();
        }}
      />
    </ScreenContainer>
  );
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────
// Only layout-critical styles that NativeWind can't express (dynamic values,
// Animated, and exact pixel math). Everything else stays in className.

const styles = StyleSheet.create({
  board: {
    borderRadius:    24,
    borderWidth:     1,
    borderColor:     'rgba(6,182,212,0.25)',
    backgroundColor: '#0B1017',
    // Shadow (iOS only — elevation handled by borderColor on Android)
    shadowColor:     '#06B6D4',
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.15,
    shadowRadius:    24,
    elevation:       8,
  },
  gridRow: {
    flexDirection: 'row',
  },
  tile: {
    borderRadius:    14,
    borderWidth:     1,
    borderColor:     'rgba(6,182,212,0.22)',
    backgroundColor: 'rgba(6,182,212,0.07)',
    alignItems:      'center',
    justifyContent:  'center',
    overflow:        'hidden',
  },
  tileActive: {
    borderColor:     'rgba(6,182,212,0.9)',
    backgroundColor: 'rgba(6,182,212,0.85)',
    shadowColor:     '#06B6D4',
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.9,
    shadowRadius:    18,
    elevation:       12,
  },
  tileDot: {
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: 'rgba(6,182,212,0.35)',
  },
  tileDotActive: {
    width:           18,
    height:          18,
    borderRadius:    9,
    backgroundColor: '#FFFFFF',
  },
  tilePulse: {
    borderRadius:    14,
    backgroundColor: '#22D3EE',
  },
});