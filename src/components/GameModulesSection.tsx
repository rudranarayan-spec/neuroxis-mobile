
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import {
  Bot,
  Users,
  Star,
  Lock,
  Play,
  Flame,
  Grid3x3,
  Shapes,
  Waves,
  Binary,
  type LucideProps,
} from 'lucide-react-native';

export interface GameItem {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  xpReward: string;
  activePlayers: string;
  route: string;
  isAvailable: boolean;
}

type GameMode = 'SOLO' | 'ONLINE';
type IconComponent = React.ComponentType<LucideProps>;

const TOP_GAMES: GameItem[] = [
  {
    id: 'sudoku',
    title: 'Matrix Sudoku 6x6',
    description: 'Deconstruct numeric grid patterns using tactical logic constraints.',
    category: 'Logic & Decryption',
    rating: 4.9,
    xpReward: '+50 XP',
    activePlayers: '1.4k Live',
    route: '/game/sudoku',
    isAvailable: true,
  },
  {
    id: 'shikaku',
    title: 'Shikaku Rectangles',
    description: 'Partition the spatial domain into exact geometric value areas.',
    category: 'Spatial & Geometry',
    rating: 4.8,
    xpReward: '+40 XP',
    activePlayers: '890 Live',
    route: '/game/shikaku',
    isAvailable: true,
  },
  {
    id: 'echoPattern',
    title: 'Echo Pattern',
    description: 'High-frequency visual recall tests for working memory agility.',
    category: 'Memory & Speed',
    rating: 4.7,
    xpReward: '+40 XP',
    activePlayers: '2.1k Live',
    route: '/game/echoPattern',
    isAvailable: true,
  },
  {
    id: 'sequence_breaker',
    title: 'Sequence Breaker',
    description: 'Identify anomalous vectors in real-time neural data streams.',
    category: 'Pattern Analysis',
    rating: 4.8,
    xpReward: '+60 XP',
    activePlayers: 'Locked',
    route: '/game/sequence-breaker',
    isAvailable: false,
  },
];

// Per-game visual identity — icon + tint color, keyed by id.
const GAME_VISUALS: Record<string, { icon: IconComponent; tint: string }> = {
  sudoku: { icon: Grid3x3, tint: '#38BDF8' },
  shikaku: { icon: Shapes, tint: '#A78BFA' },
  echoPattern: { icon: Waves, tint: '#2DD4BF' },
  sequence_breaker: { icon: Binary, tint: '#FB923C' },
};
const DEFAULT_TINT = '#B5F23D';

interface GameModulesSectionProps {
  onSelectGame: (game: GameItem, mode: GameMode) => void;
}

export const GameModulesSection: React.FC<GameModulesSectionProps> = ({ onSelectGame }) => {
  const [activeTab, setActiveTab] = useState<GameMode>('SOLO');
  const { width: windowWidth } = useWindowDimensions();
  const isWide = windowWidth >= 700;

  // ── Animated sliding tab pill ────────────────────────────────────────
  const [tabLayouts, setTabLayouts] = useState<Record<string, { x: number; width: number }>>({});
  const pillX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(0)).current;
  const pillReady = useRef(false);

  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (!layout) return;
    if (!pillReady.current) {
      pillX.setValue(layout.x);
      pillWidth.setValue(layout.width);
      pillReady.current = true;
      return;
    }
    Animated.spring(pillX, { toValue: layout.x, friction: 9, tension: 90, useNativeDriver: false }).start();
    Animated.spring(pillWidth, {
      toValue: layout.width,
      friction: 9,
      tension: 90,
      useNativeDriver: false,
    }).start();
  }, [activeTab, tabLayouts]);

  const TABS: { label: string; value: GameMode; icon: IconComponent }[] = [
    { label: 'COMPUTER', value: 'SOLO', icon: Bot },
    { label: 'PLAY ONLINE', value: 'ONLINE', icon: Users },
  ];

  return (
    <View className="mb-6">
      {/* SECTION HEADER */}
      <View className="mb-3 flex-row items-center justify-between px-1">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full bg-lime-400" />
          <Text className="font-rajdhani-bold text-base uppercase tracking-wider text-text-main">
            Combat Arenas
          </Text>
        </View>
        <Text className="font-rajdhani-bold text-xs tracking-widest text-text-muted">
          {String(TOP_GAMES.length).padStart(2, '0')} MODULES ONLINE
        </Text>
      </View>

      {/* MODE TAB SELECTOR SWITCH */}
      <View className="relative mb-4 flex-row rounded-2xl border border-white/10 bg-[#090D14] p-1">
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: pillX,
            width: pillWidth,
            backgroundColor: '#B5F23D',
            borderRadius: 12,
          }}
        />
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const TabIcon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setTabLayouts((prev) => ({ ...prev, [tab.value]: { x, width } }));
              }}
              activeOpacity={0.85}
              className="z-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl py-2.5"
            >
              <TabIcon size={15} color={isActive ? '#000000' : '#8E8E93'} />
              <Text
                className={`font-orbitron-bold text-[11px] tracking-wider ${
                  isActive ? 'text-black' : 'text-text-muted'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* GAME CARDS — responsive 1-col (phone) / 2-col (tablet) */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {TOP_GAMES.map((game) => (
          <View key={game.id} style={{ width: isWide ? '48.5%' : '100%', marginBottom: 12 }}>
            <GameCard game={game} mode={activeTab} onPress={() => onSelectGame(game, activeTab)} />
          </View>
        ))}
      </View>
    </View>
  );
};

// ────────────────────────────────────────────────────────────────────────
// GameCard
// ────────────────────────────────────────────────────────────────────────

interface GameCardProps {
  game: GameItem;
  mode: GameMode;
  onPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, mode, onPress }) => {
  const isPlayable = game.isAvailable;
  const visual = GAME_VISUALS[game.id] ?? { icon: Star, tint: DEFAULT_TINT };
  const Icon = visual.icon;

  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!isPlayable) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayable]);

  const handlePressIn = () => {
    if (!isPlayable) return;
    Animated.spring(scale, { toValue: 0.97, friction: 8, tension: 200, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    if (!isPlayable) return;
    Animated.spring(scale, { toValue: 1, friction: 8, tension: 200, useNativeDriver: true }).start();
  };

  const CtaIcon = !isPlayable ? Lock : mode === 'ONLINE' ? Users : Play;
  const ctaLabel = !isPlayable ? 'LOCKED' : mode === 'ONLINE' ? 'SEARCH 1V1' : 'LAUNCH';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={() => isPlayable && onPress()}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={isPlayable ? 0.92 : 1}
        disabled={!isPlayable}
        accessibilityRole="button"
        accessibilityLabel={`${game.title}${isPlayable ? '' : ', coming soon'}`}
        className={`relative overflow-hidden rounded-2xl border bg-[#0D1117] p-4 ${
          isPlayable ? 'border-white/10' : 'border-white/5'
        }`}
        style={{ opacity: isPlayable ? 1 : 0.6 }}
      >
        {/* TOP METADATA ROW */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5">
              <Text className="font-rajdhani-bold text-[10px] uppercase tracking-widest text-text-muted">
                {game.category}
              </Text>
            </View>

            {isPlayable ? (
              <View className="flex-row items-center gap-1 rounded-md border border-lime-400/20 bg-lime-400/10 px-2 py-0.5">
                <Animated.View style={{ opacity: pulse }}>
                  <Flame size={10} color="#B5F23D" />
                </Animated.View>
                <Text className="font-rajdhani-bold text-[10px] text-lime-400">
                  {game.activePlayers}
                </Text>
              </View>
            ) : (
              <View className="rounded-md border border-orange-400/20 bg-orange-400/10 px-2 py-0.5">
                <Text className="font-rajdhani-bold text-[10px] text-orange-400">COMING SOON</Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center gap-1">
            <Star size={12} color="#FACC15" fill="#FACC15" />
            <Text className="font-rajdhani-bold text-xs text-yellow-400">{game.rating}</Text>
          </View>
        </View>

        {/* ICON + TITLE + DESCRIPTION */}
        <View className="mt-3 flex-row items-start gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-xl border"
            style={{ backgroundColor: `${visual.tint}1A`, borderColor: `${visual.tint}40` }}
          >
            <Icon size={22} color={visual.tint} />
          </View>
          <View className="flex-1">
            <Text className="font-orbitron-black text-base tracking-wide text-text-main">
              {game.title}
            </Text>
            <Text numberOfLines={2} className="mt-1 font-rajdhani text-xs leading-4 text-text-muted">
              {game.description}
            </Text>
          </View>
        </View>

        {/* FOOTER ACTION ROW */}
        <View className="mt-3 flex-row items-center justify-between border-t border-white/5 pt-3">
          <Text className="font-orbitron-bold text-xs text-lime-400">{game.xpReward}</Text>

          <View
            className={`flex-row items-center gap-1.5 rounded-xl border px-4 py-2 ${
              !isPlayable ? 'border-white/10 bg-white/5' : 'border-lime-400/30 bg-lime-400/10'
            }`}
          >
            <CtaIcon size={12} color={!isPlayable ? '#8E8E93' : '#B5F23D'} fill={
              isPlayable && mode === 'SOLO' ? '#B5F23D' : 'none'
            } />
            <Text
              className={`font-orbitron-bold text-[11px] tracking-wider ${
                !isPlayable ? 'text-text-muted' : 'text-lime-400'
              }`}
            >
              {ctaLabel}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};