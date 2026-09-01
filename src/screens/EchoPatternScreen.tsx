
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../components/ScreenContainer';
import { gameApi } from '../services/gameApi';
import { showGameToast } from '../utils/toast';
import { ExitModal, GuideModal, SuccessModal } from '../components/GameModals';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useMatchmaking } from '../hooks/useMatchmaking';

const MAX_BOARD_SIZE = 400;
const GRID_SIZE = 3;

// Round progression: 4 taps → 5 taps → 6 taps, same 3x3 grid throughout.
const ROUND_LENGTHS = [4, 5, 6];
const TOTAL_ROUNDS = ROUND_LENGTHS.length;
const TOTAL_TILES = ROUND_LENGTHS.reduce((a, b) => a + b, 0); // 15

const ROUND_TRANSITION_DELAY_MS = 900;
const MISTAKE_RECOVERY_DELAY_MS = 900;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateSeededSequence = (seedStr: string, length: number, totalTiles: number): number[] => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const sequence: number[] = [];
  for (let i = 0; i < length; i++) {
    const x = Math.sin(hash++) * 10000;
    const randomIndex = Math.floor((x - Math.floor(x)) * totalTiles);
    sequence.push(randomIndex);
  }
  return sequence;
};

export const EchoPatternScreen: React.FC = () => {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { user } = useAuth();

  const params = useLocalSearchParams<{
    roomId?: string;
    puzzleSeed?: string;
    isMultiplayer?: string;
    playerA?: string;
    playerB?: string;
  }>();

  const isMultiplayer = params.isMultiplayer === 'true';

  const { opponentScore, matchResult, sendScoreUpdate, submitFinalMatch } = useMatchmaking(
    user?.id || '',
    'echoPattern'
  );

  // Core Game States
  const [loading, setLoading] = useState(true);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);
  const [failedTileIndex, setFailedTileIndex] = useState<number | null>(null);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Round progression state
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundSessionIds, setRoundSessionIds] = useState<(string | null)[]>(
    Array(TOTAL_ROUNDS).fill(null)
  );
  const [completedCounts, setCompletedCounts] = useState<number[]>([]);
  const [roundTransitionMessage, setRoundTransitionMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState(false);

  // Timers & Modals
  const [timer, setTimer] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ xpEarned: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const totalXpRef = useRef(0);
  const pendingRoundSequenceRef = useRef<number[] | null>(null);
  const boardSize = Math.min(windowWidth - 32, MAX_BOARD_SIZE);

  const cumulativeTiles = completedCounts.reduce((a, b) => a + b, 0) + userSequence.length;

  // React Query Mutation
  const submitGameMutation = useMutation({
    mutationFn: (data: { sessionId: string; userSequence: number[]; clientTimeElapsed: number }) =>
      gameApi.submitGame(data),
  });

  const interactionDisabled =
    loading || isPlaybackActive || submitGameMutation.isPending || isResetting || !!roundTransitionMessage;

  // Timers
  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => {
      if (isMountedRef.current) setTimer((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    initGame();
    return () => {
      isMountedRef.current = false;
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Round loading ────────────────────────────────────────────────────

  const loadRound = async (idx: number): Promise<number[] | null> => {
    const length = ROUND_LENGTHS[idx];

    if (isMultiplayer && params.puzzleSeed) {
      return generateSeededSequence(`${params.puzzleSeed}-r${idx}`, length, GRID_SIZE * GRID_SIZE);
    }

    const sessionData = await gameApi.startGame({
      gameId: 'echoPattern',
      sequenceLength: length,
      gridSize: GRID_SIZE * GRID_SIZE,
    });
    if (!isMountedRef.current) return null;

    setRoundSessionIds((prev) => {
      const next = [...prev];
      next[idx] = sessionData.sessionId;
      return next;
    });

    return sessionData.sequence || [];
  };

  const initGame = async () => {
    try {
      setLoading(true);
      setShowSuccessModal(false);
      setTimer(0);
      setRoundIndex(0);
      setCompletedCounts([]);
      setRoundSessionIds(Array(TOTAL_ROUNDS).fill(null));
      setSubmissionError(false);
      setUserSequence([]);
      setActiveTileIndex(null);
      setFailedTileIndex(null);
      totalXpRef.current = 0;

      const targetSeq = await loadRound(0);
      if (!isMountedRef.current || !targetSeq) {
        setLoading(false);
        return;
      }

      setSequence(targetSeq);
      setLoading(false);

      if (targetSeq.length > 0) playSequencePreview(targetSeq);
    } catch (error: any) {
      setLoading(false);
    }
  };

  // ── Sequence Playback (Preview Phase) ────────────────────────────────

  const playSequencePreview = async (targetSequence: number[]) => {
    setIsPlaybackActive(true);
    stopTimer();
    setUserSequence([]);

    await wait(500);

    for (let i = 0; i < targetSequence.length; i++) {
      if (!isMountedRef.current) return;

      const tileIdx = targetSequence[i];
      setActiveTileIndex(tileIdx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });

      await wait(450);
      if (!isMountedRef.current) return;
      setActiveTileIndex(null);

      await wait(200);
    }

    if (isMountedRef.current) {
      setIsPlaybackActive(false);
      startTimer();
    }
  };

  // ── Tile Tap Interaction ──────────────────────────────────────────────

  const handleTilePress = (tileIndex: number) => {
    if (interactionDisabled) return;

    setActiveTileIndex(tileIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    setTimeout(() => {
      if (isMountedRef.current) setActiveTileIndex(null);
    }, 180);

    const currentStep = userSequence.length;
    const expectedTile = sequence[currentStep];

    if (tileIndex !== expectedTile) {
      setIsResetting(true);
      setFailedTileIndex(tileIndex);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => { });

      setTimeout(() => {
        if (!isMountedRef.current) return;
        setFailedTileIndex(null);
        setIsResetting(false);
        playSequencePreview(sequence);
      }, MISTAKE_RECOVERY_DELAY_MS);
      return;
    }

    const nextUserSequence = [...userSequence, tileIndex];
    setUserSequence(nextUserSequence);

    // Broadcast CUMULATIVE progress across all rounds, not just this round.
    if (isMultiplayer && params.roomId) {
      const completedSoFar = completedCounts.reduce((a, b) => a + b, 0);
      sendScoreUpdate(completedSoFar + nextUserSequence.length, params.roomId);
    }

    if (nextUserSequence.length === sequence.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
      stopTimer();
      handleRoundComplete(nextUserSequence);
    }
  };

  // ── Round completion / progression ──────────────────────────────────

  const submitRound = async (finalRoundSequence: number[]): Promise<boolean> => {
    if (isMultiplayer) return true; // multiplayer scoring goes through sendScoreUpdate/submitFinalMatch only

    const sessionId = roundSessionIds[roundIndex];
    if (!sessionId) return true; // nothing to submit against — shouldn't normally happen

    try {
      const result = await submitGameMutation.mutateAsync({
        sessionId,
        userSequence: finalRoundSequence,
        clientTimeElapsed: timer,
      });
      if (!isMountedRef.current) return false;
      totalXpRef.current += result?.xpEarned || 0;
      setSubmissionError(false);
      return true;
    } catch (err) {
      if (!isMountedRef.current) return false;
      setSubmissionError(true);
      showGameToast('Submission Failed', 'Could not save this round. Tap retry to continue.', 'error');
      return false;
    }
  };

  const handleRoundComplete = async (finalRoundSequence: number[]) => {
    pendingRoundSequenceRef.current = finalRoundSequence;
    const ok = await submitRound(finalRoundSequence);
    if (!ok) return; // halted — RETRY SAVE control takes over
    await proceedAfterRound(finalRoundSequence);
  };

  const handleRetrySubmission = async () => {
    const seq = pendingRoundSequenceRef.current;
    if (!seq) return;
    const ok = await submitRound(seq);
    if (!ok) return;
    await proceedAfterRound(seq);
  };

  const proceedAfterRound = async (finalRoundSequence: number[]) => {
    const isLastRound = roundIndex === TOTAL_ROUNDS - 1;
    const newCompletedCounts = [...completedCounts, finalRoundSequence.length];
    const cumulativeAfterThisRound = newCompletedCounts.reduce((a, b) => a + b, 0);
    setCompletedCounts(newCompletedCounts);

    if (isLastRound) {
      if (isMultiplayer && params.roomId) {
        const isPlayerA = params.playerA === user?.id;
        submitFinalMatch({
          roomId: params.roomId,
          playerA: params.playerA || '',
          playerB: params.playerB || '',
          scoreA: isPlayerA ? cumulativeAfterThisRound : opponentScore,
          scoreB: isPlayerA ? opponentScore : cumulativeAfterThisRound,
          durationMs: timer * 1000,
          puzzleSeed: params.puzzleSeed || '',
          gameCategory: 'echoPattern',
          moveLog: finalRoundSequence,
        });
      } else {
        setGameResult({ xpEarned: totalXpRef.current });
      }
      setShowSuccessModal(true);
      return;
    }

    setRoundTransitionMessage(`ROUND ${roundIndex + 1} COMPLETE`);
    await wait(ROUND_TRANSITION_DELAY_MS);
    if (!isMountedRef.current) return;
    setRoundTransitionMessage(null);

    const nextIdx = roundIndex + 1;
    setRoundIndex(nextIdx);
    setUserSequence([]);

    try {
      const nextSeq = await loadRound(nextIdx);
      if (!isMountedRef.current || !nextSeq) return;
      setSequence(nextSeq);
      playSequencePreview(nextSeq);
    } catch (err) {
      showGameToast('Load Failed', 'Could not load the next round. Try exiting and rejoining.', 'error');
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
          SYNCHRONIZING ECHO MATRIX...
        </Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-[#121212] px-4 pt-2 justify-between">
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      {/* TOP HEADER */}
      <View>
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowExitModal(true)}
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
          >
            <Text className="font-orbitron-black text-lg text-text-main">←</Text>
          </TouchableOpacity>

          <View className="flex-row items-center rounded-full border border-cardBorder bg-card px-4 py-1.5 shadow-sm">
            <Text className="mr-1.5 text-xs">⏱</Text>
            <Text className="font-orbitron text-xs font-bold text-accentGreen">
              {formatTime(timer)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              stopTimer();
              setShowGuideModal(true);
            }}
            activeOpacity={0.7}
            className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
          >
            <Text className="font-orbitron-bold text-sm text-accentGreen">ⓘ</Text>
          </TouchableOpacity>
        </View>

        {/* PROGRESS PILL */}
        <View className="items-center">
          <View className="flex-row items-center rounded-full border border-cardBorder bg-card px-5 py-2">
            <View
              style={{
                height: 8,
                width: 8,
                borderRadius: 4,
                marginRight: 8,
                backgroundColor: isPlaybackActive ? '#FBBF24' : '#B5F23D',
              }}
            />
            <Text className="font-rajdhani-bold text-xs uppercase tracking-wider text-text-main">
              {isPlaybackActive ? 'MEMORIZING PHASE' : 'RECALL PHASE'}
            </Text>
            <Text className="ml-2 font-orbitron-black text-xs text-accentGreen">
              ({userSequence.length}/{sequence.length})
            </Text>
          </View>
        </View>

        {/* ROUND PROGRESS CHIPS */}
        <View className="mt-2.5 flex-row items-center justify-center" style={{ gap: 8 }}>
          {ROUND_LENGTHS.map((len, i) => {
            const isDone = i < roundIndex || i < completedCounts.length;
            const isCurrent = i === roundIndex && !isDone;
            return (
              <View
                key={i}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  backgroundColor: isDone
                    ? 'rgba(181,242,61,0.15)'
                    : isCurrent
                      ? 'rgba(181,242,61,0.06)'
                      : 'rgba(255,255,255,0.03)',
                  borderColor: isDone
                    ? '#B5F23D'
                    : isCurrent
                      ? 'rgba(181,242,61,0.5)'
                      : 'rgba(255,255,255,0.08)',
                }}
              >
                <Text
                  className="font-orbitron-black text-[10px]"
                  style={{ color: isDone || isCurrent ? '#B5F23D' : 'rgba(255,255,255,0.35)' }}
                >
                  {isDone ? `✓ R${i + 1}` : `R${i + 1} · ${len}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* 1V1 LIVE OPPONENT DISPLAY */}
        {isMultiplayer && (
          <View className="mt-2 flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-2 border border-white/10">
            <Text className="font-rajdhani-bold text-xs text-white/70">
              YOU: {cumulativeTiles}/{TOTAL_TILES}
            </Text>
            <Text className="font-orbitron-bold text-xs text-lime-400">VS</Text>
            <Text className="font-rajdhani-bold text-xs text-red-400">
              OPPONENT: {opponentScore}/{TOTAL_TILES}
            </Text>
          </View>
        )}
      </View>

      {/* MATRIX GRID */}
      <View className="my-auto items-center justify-center">
        <View
          style={{ width: boardSize, height: boardSize, position: 'relative' }}
          className="flex-row flex-wrap items-center justify-between rounded-3xl border border-cardBorder bg-[#181818] p-4 shadow-2xl"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const isActive = activeTileIndex === index;
            const isFailed = failedTileIndex === index;

            // Using inline styles for tile backgrounds to avoid NativeWind context bugs
            let tileStyle: any = {
              backgroundColor: '#1E1E1E',
              borderColor: '#2A2A2A',
            };
            if (isFailed) {
              tileStyle = {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: '#EF4444',
              };
            } else if (isActive) {
              tileStyle = {
                backgroundColor: '#B5F23D',
                borderColor: '#B5F23D',
              };
            }

            let dotStyle: any = {
              backgroundColor: 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.2)',
            };
            if (isActive) {
              dotStyle = {
                backgroundColor: '#000000',
                borderColor: '#000000',
                transform: [{ scale: 1.25 }],
              };
            } else if (isFailed) {
              dotStyle = {
                backgroundColor: '#EF4444',
                borderColor: '#EF4444',
              };
            }

            return (
              <TouchableOpacity
                key={`tile-${index}`}
                activeOpacity={0.85}
                disabled={interactionDisabled}
                onPress={() => handleTilePress(index)}
                style={tileStyle}
                className="w-[30%] aspect-square items-center justify-center rounded-2xl border-2"
              >
                <View style={dotStyle} className="h-3 w-3 rounded-full border" />
              </TouchableOpacity>
            );
          })}

          {/* ROUND TRANSITION OVERLAY */}
          {roundTransitionMessage && (
            <View
              pointerEvents="none"
              style={StyleSheet.absoluteFillObject}
              className="items-center justify-center rounded-3xl bg-black/75"
            >
              <Text className="font-orbitron-black text-lg tracking-wider text-accentGreen">
                {roundTransitionMessage}
              </Text>
              <Text className="mt-1 font-rajdhani-bold text-[11px] text-white/50">
                Next round starting…
              </Text>
            </View>
          )}
        </View>

        <View className="mt-4 h-10 items-center justify-center">
          {submitGameMutation.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#B5F23D" />
              <Text className="font-rajdhani-bold text-xs text-accentGreen tracking-wider">
                VERIFYING PATTERN RECALL...
              </Text>
            </View>
          ) : submissionError ? (
            <Text className="max-w-[280px] text-center font-rajdhani text-xs text-red-400 leading-4">
              Round complete, but saving it failed. Tap "RETRY SAVE" below.
            </Text>
          ) : (
            <Text className="max-w-[280px] text-center font-rajdhani text-xs text-text-main/60 leading-4">
              {isPlaybackActive
                ? 'Observe the glowing pattern carefully.'
                : 'Repeat the sequence by tapping the tiles in order.'}
            </Text>
          )}
        </View>
      </View>

      {/* BOTTOM CONTROL TOOLBAR */}
      <View
        className="mb-6 items-center"
        style={{ opacity: interactionDisabled && !submissionError ? 0.4 : 1 }}
      >
        {submissionError ? (
          <TouchableOpacity
            onPress={handleRetrySubmission}
            activeOpacity={0.85}
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-8"
          >
            <Text className="text-sm">Retry</Text>
            <Text className="font-orbitron-bold text-xs tracking-wider text-red-400">
              RETRY SAVE
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => playSequencePreview(sequence)}
            disabled={interactionDisabled}
            activeOpacity={0.8}
            className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cardBorder bg-card px-8"
          >
            {/* <Text className="text-sm"><ReplayIcon /></Text> */}
            <Text className="font-orbitron-bold text-xs tracking-wider text-text-main">
              REPLAY PATTERN
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* MODALS */}
      <ExitModal
        visible={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={async () => {
          setShowExitModal(false);
          const currentSessionId = roundSessionIds[roundIndex];
          if (currentSessionId) {
            try {
              await gameApi.abandonGame(currentSessionId, timer);
            } catch (err) {
              console.error(err);
            }
          }
          router.back();
        }}
      />

      <GuideModal
        visible={showGuideModal}
        gameId="echoPattern"
        onClose={() => {
          setShowGuideModal(false);
          if (!isPlaybackActive) startTimer();
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        timeFormatted={formatTime(timer)}
        gameId="echoPattern"
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