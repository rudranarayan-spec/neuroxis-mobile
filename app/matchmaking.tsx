import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Swords, CircleUserRound, ShieldAlert, Timer } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/context/AuthContext';
import { useMatchmaking } from '../src/hooks/useMatchmaking';
import { ScreenContainer } from '../src/components/ScreenContainer';

const LOGO_SOURCE = require('../assets/images/logo.png');

const LONG_WAIT_THRESHOLD_SECONDS = 20;
const MATCH_FOUND_DELAY_MS = 800;

export default function MatchmakingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ gameId: string; title: string; route: string }>();

  const currentUserId = useMemo(
    () => user?.id || user?._id || `guest_${Math.random().toString(36).substring(7)}`,
    [user?.id, user?._id]
  );

  const { isSearching, matchData, findMatch, cancelSearch } = useMatchmaking(
    currentUserId,
    params.gameId || 'echoPattern'
  );

  const [elapsed, setElapsed] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [isCancelActive, setIsCancelActive] = useState(false);
  const isMountedRef = useRef(true);
  const hasNavigatedRef = useRef(false);
  const youInitial = user?.username?.charAt(0)?.toUpperCase() || 'Y';

  // ── Lifecycle ────────────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    findMatch();
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed search timer
  useEffect(() => {
    if (!isSearching || matchFound) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isSearching, matchFound]);

  // Match found transition
  useEffect(() => {
    if (!matchData || hasNavigatedRef.current) return;
    setMatchFound(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    const timeout = setTimeout(() => {
      if (!isMountedRef.current || hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      router.replace({
        pathname: (params.route || '/game/echoPattern') as any,
        params: {
          roomId: matchData.roomId,
          puzzleSeed: matchData.puzzleSeed,
          isMultiplayer: 'true',
          playerA: matchData.playerA,
          playerB: matchData.playerB,
        },
      });
    }, MATCH_FOUND_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [matchData]);

  const handleCancelPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsCancelActive(true);
    cancelSearch();
    setTimeout(() => {
      if (isMountedRef.current) {
        router.back();
      }
    }, 150);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Animations ────────────────────────────────────────────────────────

  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const buildRingLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 2400, useNativeDriver: true }),
        ])
      );

    const loops = matchFound
      ? []
      : [buildRingLoop(ring1, 0), buildRingLoop(ring2, 800), buildRingLoop(ring3, 1600)];
    loops.forEach((l) => l.start());

    // Radar Spinner
    const spinnerLoop = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    if (!matchFound) spinnerLoop.start();

    // Pulse Core
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    breatheLoop.start();

    return () => {
      loops.forEach((l) => l.stop());
      spinnerLoop.stop();
      breatheLoop.stop();
    };
  }, [matchFound]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderRing = (val: Animated.Value, key: number) => (
    <Animated.View
      key={key}
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 1.5,
        borderColor: 'rgba(181, 242, 61, 0.45)',
        transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.1] }) }],
        opacity: val.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.6, 0.2, 0] }),
      }}
    />
  );

  return (
    <ScreenContainer className="flex-1 justify-between bg-[#04060A] px-6 py-6">
      {/* 1. TOP HEADER BADGE */}
      <View className="items-center justify-center pt-2">
        <View className="flex-row items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/5 px-4 py-1.5">
          <View className="h-2 w-2 rounded-full bg-lime-400 animate-ping" />
          <Text className="font-orbitron-bold text-[11px] tracking-widest text-lime-400 uppercase">
            {params.title || 'COMBAT MODULE'} • 1V1 DUEL
          </Text>
        </View>
      </View>

      {/* 2. CENTER CONTENT CONTAINER */}
      <View className="items-center justify-center my-auto">
        {/* RADAR SWEEP CONTAINER */}
        <View style={{ height: 210, width: 210 }} className="items-center justify-center">
          {!matchFound && [ring1, ring2, ring3].map((val, i) => renderRing(val, i))}

          {!matchFound && (
            <Animated.View
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                borderRadius: 100,
                transform: [{ rotate: spin }],
              }}
              className="items-center justify-start"
            >
              <View className="h-24 w-[2px] bg-gradient-to-b from-lime-400 to-transparent opacity-80" />
            </Animated.View>
          )}

          {/* Central Logo Core */}
          <Animated.View
            style={{
              transform: [{ scale: breathe }],
              shadowColor: matchFound ? '#B5F23D' : '#000',
              shadowOpacity: matchFound ? 0.9 : 0.3,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            }}
            className={`h-24 w-24 items-center justify-center rounded-full border ${
              matchFound
                ? 'border-lime-400 bg-lime-400/20'
                : 'border-white/10 bg-[#0A0E17]'
            }`}
          >
            <Animated.Image
              source={LOGO_SOURCE}
              resizeMode="contain"
              style={{ width: 48, height: 48 }}
            />
          </Animated.View>
        </View>

        {/* TIMER CAPSULE DIRECTLY BELOW RADAR */}
        <View className="mt-4 flex-row items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 shadow-inner">
          <Timer size={14} color="#B5F23D" />
          <Text className="font-rajdhani-bold text-xs tracking-wider text-gray-400">SEARCH TIME</Text>
          <Text className="font-orbitron-bold text-xs tracking-widest text-white">
            {formatTime(elapsed)}
          </Text>
        </View>

        {/* STATUS TITLE */}
        <Text className="mt-6 font-orbitron-black text-2xl tracking-widest text-white uppercase text-center">
          {matchFound ? 'MATCH FOUND' : 'SEARCHING OPPONENT'}
        </Text>

        {/* TAKING LONGER NOTICE (Fixed height slot to prevent screen jump) */}
        <View className="h-8 items-center justify-center mt-2">
          {!matchFound && elapsed >= LONG_WAIT_THRESHOLD_SECONDS && (
            <View className="flex-row items-center gap-1.5 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-1">
              <ShieldAlert size={13} color="#EAB308" />
              <Text className="font-rajdhani-semibold text-[11px] text-yellow-200/90">
                Finding high-rank players...
              </Text>
            </View>
          )}
        </View>

        {/* MATCHUP CARD PREVIEW */}
        <View className="mt-6 w-full max-w-xs flex-row items-center justify-between rounded-3xl border border-white/10 bg-[#090D14]/80 p-4">
          {/* PLAYER (YOU) */}
          <View className="items-center flex-1">
            <View className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/20">
              <Text className="font-orbitron-black text-lg text-lime-400">{youInitial}</Text>
            </View>
            <Text
              numberOfLines={1}
              className="mt-2 font-rajdhani-bold text-xs text-white/90 tracking-wide text-center"
            >
              {user?.username || 'YOU'}
            </Text>
          </View>

          {/* SWORDS CENTER DIVIDER */}
          <View className="h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10">
            <Swords size={16} color={matchFound ? '#B5F23D' : 'rgba(255,255,255,0.4)'} />
          </View>

          {/* OPPONENT */}
          <View className="items-center flex-1">
            <View
              className={`h-14 w-14 items-center justify-center rounded-2xl border-2 ${
                matchFound
                  ? 'border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/20'
                  : 'border-dashed border-white/20 bg-white/5'
              }`}
            >
              <CircleUserRound
                size={24}
                color={matchFound ? '#B5F23D' : 'rgba(255,255,255,0.3)'}
              />
            </View>
            <Text
              numberOfLines={1}
              className={`mt-2 font-rajdhani-bold text-xs tracking-wide text-center ${
                matchFound ? 'text-lime-400' : 'text-white/40'
              }`}
            >
              {matchFound ? 'Opponent' : 'Searching…'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. CANCEL FOOTER BUTTON */}
      <View className="w-full pb-2">
        {!matchFound && (
          <TouchableOpacity
            onPress={handleCancelPress}
            activeOpacity={0.8}
            className={`w-full items-center justify-center rounded-2xl border py-4 transition-all ${
              isCancelActive
                ? 'border-red-500'
                : 'border-white/10 bg-white/5 active:border-red-500/50 active:bg-red-500/10'
            }`}
            accessibilityRole="button"
            accessibilityLabel="Cancel search"
          >
            <Text
              className={`font-orbitron-bold text-xs uppercase tracking-widest ${
                isCancelActive ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              CANCEL SEARCH
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScreenContainer>
  );
}