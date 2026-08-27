import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { ScreenContainer } from '../components/ScreenContainer';
import { gameApi } from '../services/gameApi';
import { showGameToast } from '../utils/toast';
import { ExitModal, GuideModal, SuccessModal } from '../components/GameModals';

const MAX_BOARD_SIZE = 400;
const GRID_SIZE = 3;
const INITIAL_SEQUENCE_LENGTH = 5;

export const EchoPatternScreen: React.FC = () => {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();

  // Core Game States
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeTileIndex, setActiveTileIndex] = useState<number | null>(null);
  const [failedTileIndex, setFailedTileIndex] = useState<number | null>(null);
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);

  // Timers & Modals
  const [timer, setTimer] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [gameResult, setGameResult] = useState<{ xpEarned: number } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const boardSize = Math.min(windowWidth - 32, MAX_BOARD_SIZE);

  // React Query Mutation
  const submitGameMutation = useMutation({
    mutationFn: (data: { sessionId: string; userSequence: number[]; clientTimeElapsed: number }) =>
      gameApi.submitGame(data),
    onSuccess: (result) => {
      stopTimer();
      setGameResult({ xpEarned: result.xpEarned });
      setShowSuccessModal(true);
    },
    onError: () => {
      startTimer();
      showGameToast('Submission Failed', 'Could not verify pattern completion.', 'error');
    },
  });

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

  const initGame = async () => {
    try {
      setLoading(true);
      setShowSuccessModal(false);
      setTimer(0);
      setUserSequence([]);
      setActiveTileIndex(null);
      setFailedTileIndex(null);

      const sessionData = await gameApi.startGame({
        gameId: 'echoPattern',
        sequenceLength: INITIAL_SEQUENCE_LENGTH,
        gridSize: GRID_SIZE * GRID_SIZE,
      });

      if (!isMountedRef.current) return;

      setSessionId(sessionData.sessionId);
      const targetSeq = sessionData.sequence || [];
      setSequence(targetSeq);
      setLoading(false);

      if (targetSeq.length > 0) {
        playSequencePreview(targetSeq);
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;
      showGameToast(
        'Initialization Failed',
        error?.response?.data?.message || 'Failed to initialize game session.',
        'error'
      );
      setLoading(false);
    }
  };

  const playSequencePreview = async (targetSequence: number[]) => {
    setIsPlaybackActive(true);
    stopTimer();
    setUserSequence([]);

    await new Promise((resolve) => setTimeout(resolve, 500));

    for (let i = 0; i < targetSequence.length; i++) {
      if (!isMountedRef.current) return;

      const tileIdx = targetSequence[i];
      setActiveTileIndex(tileIdx);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 450));
      if (!isMountedRef.current) return;
      setActiveTileIndex(null);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    if (isMountedRef.current) {
      setIsPlaybackActive(false);
      startTimer();
    }
  };

  const handleTilePress = (tileIndex: number) => {
    if (isPlaybackActive || submitGameMutation.isPending || loading) return;

    setActiveTileIndex(tileIndex);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    setTimeout(() => {
      if (isMountedRef.current) setActiveTileIndex(null);
    }, 180);

    const currentStep = userSequence.length;
    const expectedTile = sequence[currentStep];

    if (tileIndex !== expectedTile) {
      setFailedTileIndex(tileIndex);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      showGameToast('Sequence Broken', 'Pattern mismatch. Watch closely!', 'error');

      setTimeout(() => {
        if (!isMountedRef.current) return;
        setFailedTileIndex(null);
        playSequencePreview(sequence);
      }, 900);
      return;
    }

    const nextUserSequence = [...userSequence, tileIndex];
    setUserSequence(nextUserSequence);

    if (nextUserSequence.length === sequence.length && sessionId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      submitGameMutation.mutate({
        sessionId,
        userSequence: nextUserSequence,
        clientTimeElapsed: timer,
      });
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
      </View>

      {/* MATRIX GRID */}
      <View className="my-auto items-center justify-center">
        <View
          style={{ width: boardSize, height: boardSize }}
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
                disabled={isPlaybackActive || submitGameMutation.isPending}
                onPress={() => handleTilePress(index)}
                style={tileStyle}
                className="w-[30%] aspect-square items-center justify-center rounded-2xl border-2"
              >
                <View style={dotStyle} className="h-3 w-3 rounded-full border" />
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-4 h-10 items-center justify-center">
          {submitGameMutation.isPending ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#B5F23D" />
              <Text className="font-rajdhani-bold text-xs text-accentGreen tracking-wider">
                VERIFYING PATTERN RECALL...
              </Text>
            </View>
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
        style={{ opacity: isPlaybackActive || submitGameMutation.isPending ? 0.4 : 1 }}
      >
        <TouchableOpacity
          onPress={() => playSequencePreview(sequence)}
          disabled={isPlaybackActive || submitGameMutation.isPending}
          activeOpacity={0.8}
          className="h-12 flex-row items-center justify-center gap-2 rounded-xl border border-cardBorder bg-card px-8"
        >
          <Text className="text-sm">🔄</Text>
          <Text className="font-orbitron-bold text-xs tracking-wider text-text-main">
            REPLAY PATTERN
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODALS */}
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