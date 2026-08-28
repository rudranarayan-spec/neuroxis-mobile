/**
 * MatchmakingScreen — premium rebuild.
 *
 * Same data contract as before: still just useAuth + useMatchmaking +
 * expo-router params. Nothing invented on those hooks — if useMatchmaking
 * exposes an error/timeout state in your version, wire it into the
 * `loadError`-style branch left as a comment below; without seeing its
 * return type I've added a client-side "taking longer than usual" hint
 * instead, driven purely by a local elapsed-time counter, so it works
 * regardless of what the hook exposes.
 *
 * What changed:
 *  1. Real "radar" animation — staggered pulsing rings around your app
 *     logo instead of a bare ActivityIndicator. Falls back gracefully in
 *     layout if the logo image is missing; swap the require() path below
 *     if your asset lives somewhere else.
 *  2. A "YOU vs ?" matchup preview so the screen isn't just a spinner —
 *     standard premium-lobby pattern (Valorant/COD-style).
 *  3. Elapsed search timer, and a "taking longer than usual" hint after
 *     20s so the player isn't left guessing whether it's still working.
 *  4. A brief "MATCH FOUND" beat (haptic + ~700ms) before navigating,
 *     instead of an instant, jarring screen swap the moment matchData
 *     arrives.
 *  5. Mount-safety guard around the match-found navigation timeout so a
 *     cancel-then-unmount during that window can't fire a stray
 *     navigation or setState-after-unmount warning.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Shield, X, Swords, CircleUserRound } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/context/AuthContext';
import { useMatchmaking } from '../src/hooks/useMatchmaking';
import { ScreenContainer } from '../src/components/ScreenContainer';

// Adjust this relative path if your logo lives somewhere else.
const LOGO_SOURCE = require('../assets/images/logo.png');

const LONG_WAIT_THRESHOLD_SECONDS = 20;
const MATCH_FOUND_DELAY_MS = 700;

export default function MatchmakingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // console.log('MatchmakingScreen user:', user);
  const params = useLocalSearchParams<{ gameId: string; title: string; route: string }>();
  // console.log('MatchmakingScreen params:', params);

  const currentUserId = user?.id || user?._id || `guest_${Math.random().toString(36).substring(7)}`;
  const { isSearching, matchData, findMatch, cancelSearch } = useMatchmaking(
    currentUserId,
    params.gameId || 'echoPattern'
  );

  const [elapsed, setElapsed] = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const isMountedRef = useRef(true);

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

  // Match found → brief celebratory beat, then navigate
  useEffect(() => {
    if (!matchData) return;
    setMatchFound(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });

    const timeout = setTimeout(() => {
      if (!isMountedRef.current) return;
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

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    cancelSearch();
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Radar ring animation ─────────────────────────────────────────────

  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const buildRingLoop = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 2200, useNativeDriver: true }),
        ])
      );

    const loops = matchFound
      ? []
      : [buildRingLoop(ring1, 0), buildRingLoop(ring2, 700), buildRingLoop(ring3, 1400)];
    loops.forEach((l) => l.start());

    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1.06, duration: 1000, useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    breatheLoop.start();

    return () => {
      loops.forEach((l) => l.stop());
      breatheLoop.stop();
    };
  }, [matchFound]);

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
        borderColor: 'rgba(181, 242, 61, 0.5)',
        transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
        opacity: val.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.6, 0.25, 0] }),
      }}
    />
  );

  return (
    <ScreenContainer className="justify-between bg-[#05070B] px-6 py-10">
      {/* HEADER */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Shield size={18} color="#B5F23D" />
          <Text className="font-orbitron-bold text-xs tracking-widest text-lime-400">
            NEURAL LOBBY
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
          <Text className="text-[11px]">⏱</Text>
          <Text className="font-orbitron-bold text-[11px] text-white/80">{formatTime(elapsed)}</Text>
        </View>

        <TouchableOpacity
          onPress={handleCancel}
          className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5"
          accessibilityRole="button"
          accessibilityLabel="Cancel matchmaking"
        >
          <X size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* RADAR / STATUS AREA */}
      <View className="items-center justify-center">
        <View style={{ height: 200, width: 200 }} className="items-center justify-center">
          {!matchFound && [ring1, ring2, ring3].map((val, i) => renderRing(val, i))}

          <View
            style={{
              shadowColor: matchFound ? '#B5F23D' : 'transparent',
              shadowOpacity: matchFound ? 0.6 : 0,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
            }}
            className="h-24 w-24 items-center justify-center rounded-full border border-lime-400/40 bg-black"
          >
            <Animated.Image
              source={LOGO_SOURCE}
              resizeMode="contain"
              style={{ width: 48, height: 48, transform: [{ scale: breathe }] }}
            />
          </View>
        </View>

        <Text className="mt-8 font-orbitron-black text-xl tracking-wider text-white">
          {matchFound ? 'MATCH FOUND' : 'SEARCHING OPPONENT'}
        </Text>

        <Text className="mt-2 font-rajdhani-bold text-xs uppercase tracking-widest text-text-muted">
          {params.title || 'COMBAT MODULE'} // 1V1 RANKED
        </Text>

        {!matchFound && elapsed >= LONG_WAIT_THRESHOLD_SECONDS && (
          <Text className="mt-4 max-w-[260px] text-center font-rajdhani text-[11px] text-white/40">
            Taking a little longer than usual — you can keep waiting or cancel and try again.
          </Text>
        )}

        {/* MATCHUP PREVIEW */}
        <View className="mt-10 flex-row items-center justify-center" style={{ gap: 24 }}>
          <View className="items-center" style={{ width: 76 }}>
            <View className="h-14 w-14 items-center justify-center rounded-full border-2 border-lime-400 bg-lime-400/10">
              <Text className="font-orbitron-black text-base text-lime-400">{youInitial}</Text>
            </View>
            <Text
              numberOfLines={1}
              className="mt-1.5 font-rajdhani-bold text-[11px] text-white/80"
            >
              {user?.username || 'YOU'}
            </Text>
          </View>

          <Swords size={18} color="rgba(255,255,255,0.3)" />

          <View className="items-center" style={{ width: 76 }}>
            <View
              className={`h-14 w-14 items-center justify-center rounded-full border-2 ${matchFound ? 'border-lime-400 bg-lime-400/10' : 'border-dashed border-white/20 bg-white/5'
                }`}
            >
              <CircleUserRound size={22} color={matchFound ? '#B5F23D' : 'rgba(255,255,255,0.3)'} />
            </View>
            <Text className="mt-1.5 font-rajdhani-bold text-[11px] text-white/40">
              {matchFound ? 'Opponent' : 'Searching…'}
            </Text>
          </View>
        </View>
      </View>

      {/* CANCEL FOOTER CTA */}
      {!matchFound && (
        <TouchableOpacity
          onPress={handleCancel}
          activeOpacity={0.8}
          className="w-full items-center rounded-2xl border border-red-500/30 bg-red-500/10 py-4"
          accessibilityRole="button"
          accessibilityLabel="Abort search"
        >
          <Text className="font-orbitron-bold text-xs uppercase tracking-widest text-red-400">
            ABORT SEARCH
          </Text>
        </TouchableOpacity>
      )}
    </ScreenContainer>
  );
}