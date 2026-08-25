import React, { useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { COLORS, FONTS } from '../constants/theme'; 

const { height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const CustomSplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Shared Animation Values
  const progress = useSharedValue(0);
  const ringRotation = useSharedValue(0);
  const scannerY = useSharedValue(-height * 0.3);
  const glitchX = useSharedValue(0);

  useEffect(() => {
    // 1. Core Timeline Scale & Fade Progress
    progress.value = withTiming(1, {
      duration: 1800,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    // 2. Continuous Cyber Ring Rotation
    ringRotation.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );

    // 3. Matrix Vertical Scan Line Loop
    scannerY.value = withRepeat(
      withTiming(height * 0.4, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // 4. Subtle Cyber Glitch Pulse
    glitchX.value = withRepeat(
      withSequence(
        withDelay(800, withTiming(-3, { duration: 40 })),
        withTiming(3, { duration: 40 }),
        withTiming(0, { duration: 40 })
      ),
      -1,
      false
    );

    // 5. Smooth Outro Fade & Handshake
    const timer = setTimeout(() => {
      progress.value = withTiming(2, { duration: 500, easing: Easing.in(Easing.exp) }, () => {
        runOnJS(onFinish)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // --- Animated Styles ---
  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.2, 1, 2], [0, 1, 1, 0]),
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1, 1.8], [0, 1, 1, 0]),
    transform: [
      { scale: interpolate(progress.value, [0, 1, 2], [0.75, 1, 1.15]) },
      { translateX: glitchX.value },
    ],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  const scannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scannerY.value }],
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: COLORS.background }, containerStyle]}
      className="flex-1 items-center justify-center px-6"
    >
      {/* 1. Ambient Background Rays */}
      <View className="absolute inset-0 items-center justify-center opacity-30">
        <View
          style={{ backgroundColor: COLORS.primary }}
          className="h-[400px] w-[400px] rounded-full opacity-15 blur-3xl"
        />
      </View>

      {/* 2. Vertical Matrix Scanner Line */}
      <Animated.View
        style={[
          scannerStyle,
          {
            backgroundColor: COLORS.primary,
            shadowColor: COLORS.primary,
          },
        ]}
        className="absolute h-[2px] w-full opacity-40 shadow-lg"
      />

      {/* 3. Glassmorphic Core Container */}
      <View className="items-center justify-center">
        {/* Rotating Outer Cyber Rings */}
        <Animated.View
          style={[ringStyle, { borderColor: COLORS.primary }]}
          className="absolute h-48 w-48 rounded-full border border-dashed opacity-40"
        />
        <Animated.View
          style={[ringStyle, { borderColor: COLORS.primary }]}
          className="absolute h-56 w-56 rounded-full border border-dotted opacity-20"
        />

        {/* Central Blur Card */}
        <BlurView
          intensity={25}
          tint="dark"
          style={{ borderColor: COLORS.cardBorder }}
          className="overflow-hidden rounded-3xl border p-8"
        >
          <Animated.View style={[logoStyle]} className="items-center">
            {/* Top Indicator Accent */}
            <View className="mb-4 flex-row items-center gap-1.5">
              <View
                style={{ backgroundColor: COLORS.primary }}
                className="h-1.5 w-1.5 rounded-full animate-pulse"
              />
              <Text
                style={{
                  fontFamily: FONTS.rajdhaniBold,
                  color: COLORS.primary,
                }}
                className="text-[10px] uppercase tracking-[0.25em]"
              >
                SYSTEM_v2.04 // ONLINE
              </Text>
            </View>

            {/* Main Brand Title */}
            <Text
              style={{
                fontFamily: FONTS.orbitronBlack,
                color: COLORS.textMain,
                shadowColor: COLORS.primary,
              }}
              className="text-4xl tracking-widest shadow-md"
            >
              NEURO
              <Text style={{ color: COLORS.primary }}>XIS</Text>
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontFamily: FONTS.rajdhaniMedium,
                color: COLORS.textMuted,
              }}
              className="mt-2 text-xs uppercase tracking-[0.35em]"
            >
              Neural Arena Engine
            </Text>
          </Animated.View>
        </BlurView>
      </View>

      {/* 4. Bottom System Status Bar */}
      <View className="absolute bottom-12 items-center">
        <View
          style={{ backgroundColor: COLORS.cardBorder }}
          className="h-1 w-24 overflow-hidden rounded-full"
        >
          <Animated.View
            style={[{ backgroundColor: COLORS.primary }, logoStyle]}
            className="h-full w-full"
          />
        </View>
        <Text
          style={{
            fontFamily: FONTS.rajdhaniBold,
            color: COLORS.textMuted,
          }}
          className="mt-3 text-[11px] uppercase tracking-[0.2em]"
        >
          INITIALIZING CORE MODULES...
        </Text>
      </View>
    </Animated.View>
  );
};