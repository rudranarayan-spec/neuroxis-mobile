import React, { useEffect } from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
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
  const ringRotationClockwise = useSharedValue(0);
  const ringRotationCounter = useSharedValue(0);
  const scannerY = useSharedValue(-height * 0.25);
  const glitchX = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    // 1. Core Timeline Scale & Fade Progress
    progress.value = withTiming(1, {
      duration: 1800,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });

    // 2. Dual-Layer Cyber Ring Rotations
    ringRotationClockwise.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    ringRotationCounter.value = withRepeat(
      withTiming(-360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );

    // 3. Matrix Vertical Scan Line Sweep
    scannerY.value = withRepeat(
      withTiming(height * 0.35, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // 4. Subtle Cyber Glitch Pulse
    glitchX.value = withRepeat(
      withSequence(
        withDelay(900, withTiming(-3, { duration: 35 })),
        withTiming(3, { duration: 35 }),
        withTiming(0, { duration: 35 })
      ),
      -1,
      false
    );

    // 5. System Status Indicator Pulse
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      ),
      -1,
      true
    );

    // 6. Smooth Outro Transition
    const timer = setTimeout(() => {
      progress.value = withTiming(2, { duration: 450, easing: Easing.in(Easing.exp) }, () => {
        runOnJS(onFinish)();
      });
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  // --- Animated Styles ---
  const containerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.15, 0.9, 2], [0, 1, 1, 0]),
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.3, 1, 1.8], [0, 1, 1, 0]),
    transform: [
      { scale: interpolate(progress.value, [0, 1, 2], [0.8, 1, 1.1]) },
      { translateX: glitchX.value },
    ],
  }));

  const clockwiseRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotationClockwise.value}deg` }],
  }));

  const counterRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotationCounter.value}deg` }],
  }));

  const scannerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scannerY.value }],
  }));

  const pulseIndicatorStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100])}%`,
  }));

  return (
    <Animated.View
      style={[{ backgroundColor: '#000000' }, containerStyle]}
      className="flex-1 items-center justify-center px-6"
    >
      {/* 1. Ambient Background Glowing Core */}
      <View className="absolute inset-0 items-center justify-center opacity-40 pointer-events-none">
        <View
          style={{ backgroundColor: COLORS.primary || '#B5F23D' }}
          className="h-[320px] w-[320px] rounded-full opacity-20 blur-3xl"
        />
      </View>

      {/* 2. Vertical Matrix Laser Scanner Line */}
      <Animated.View
        style={[
          scannerStyle,
          {
            backgroundColor: COLORS.primary || '#B5F23D',
            shadowColor: COLORS.primary || '#B5F23D',
          },
        ]}
        className="absolute h-[2px] w-full opacity-50 shadow-lg pointer-events-none"
      />

      {/* 3. Central Glassmorphic Node Frame */}
      <View className="items-center justify-center">
        {/* Outer Rotating Cyber Rings */}
        <Animated.View
          style={[clockwiseRingStyle, { borderColor: COLORS.primary || '#B5F23D' }]}
          className="absolute h-64 w-64 rounded-full border border-dashed opacity-30"
        />
        <Animated.View
          style={[counterRingStyle, { borderColor: COLORS.primary || '#B5F23D' }]}
          className="absolute h-72 w-72 rounded-full border border-dotted opacity-15"
        />

        {/* Central Glass Card */}
        <BlurView
          intensity={35}
          tint="dark"
          style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
          className="overflow-hidden rounded-3xl border px-8 py-9 items-center bg-black/40"
        >
          <Animated.View style={[logoStyle]} className="items-center">
            {/* Neural Brain Logo Image */}
            <View className="mb-4 h-24 w-24 items-center justify-center">
              <Image
                source={require('../../assets/images/logo.png')}
                className="h-full w-full"
                resizeMode="contain"
              />
            </View>

            {/* Live System Online Status */}
            <View className="mb-3 flex-row items-center gap-2">
              <Animated.View
                style={[
                  pulseIndicatorStyle,
                  { backgroundColor: COLORS.primary || '#B5F23D' },
                ]}
                className="h-2 w-2 rounded-full"
              />
              <Text
                style={{
                  fontFamily: FONTS.rajdhaniBold,
                  color: COLORS.primary || '#B5F23D',
                }}
                className="text-[10px] uppercase tracking-[0.3em]"
              >
                SYSTEM_v2.04 // ONLINE
              </Text>
            </View>

            {/* Brand Title */}
            <Text
              style={{
                fontFamily: FONTS.orbitronBlack,
                color: COLORS.textMain || '#FFFFFF',
                shadowColor: COLORS.primary || '#B5F23D',
              }}
              className="text-4xl tracking-widest shadow-md text-center"
            >
              NEURO
              <Text style={{ color: COLORS.primary || '#B5F23D' }}>XIS</Text>
            </Text>

            {/* Subtitle Tag */}
            <Text
              style={{
                fontFamily: FONTS.rajdhaniMedium,
                color: COLORS.textMuted || '#888888',
              }}
              className="mt-1 text-xs uppercase tracking-[0.35em]"
            >
              Neural Arena Engine
            </Text>
          </Animated.View>
        </BlurView>
      </View>

      {/* 4. Bottom System Loading Bar */}
      <View className="absolute bottom-12 items-center w-full px-12">
        <View
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          className="h-1 w-36 overflow-hidden rounded-full"
        >
          <Animated.View
            style={[
              progressBarStyle,
              { backgroundColor: COLORS.primary || '#B5F23D' },
            ]}
            className="h-full"
          />
        </View>
        <Text
          style={{
            fontFamily: FONTS.rajdhaniBold,
            color: COLORS.textMuted || '#888888',
          }}
          className="mt-3 text-[11px] uppercase tracking-[0.25em]"
        >
          INITIALIZING CORE MODULES...
        </Text>
      </View>
    </Animated.View>
  );
};