
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { gameApi } from '../../src/services/gameApi';
import { useAuth } from '../../src/context/AuthContext';
import { useMatchmaking } from '../../src/hooks/useMatchmaking';
import { ExitModal, GuideModal } from '../../src/components/GameModals';

// ────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

const MAX_ATTEMPTS = 6;
const GRID_GAP = 8;
const KEY_GAP = 6;

// Word bank for multiplayer's client-side deterministic word selection.
// Also used to validate a guess is a real word before it's submitted in
// multiplayer mode (no server round-trip needed there).
const WORD_LIST = [
    'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
    'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
    'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLE',
    'APPLY', 'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD',
    'AWARE', 'BADLY', 'BAKER', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING', 'BELOW', 'BENCH',
    'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLAST', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST',
    'BOOTH', 'BOUND', 'BRAIN', 'BRAND', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING', 'BROAD',
    'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CANDY', 'CARRY', 'CATCH', 'CAUSE',
    'CHAIN', 'CHAIR', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD', 'CHINA',
    'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK', 'CLOSE',
    'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH', 'CRAZY', 'CREAM',
    'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DEALT', 'DEATH',
    'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT', 'DRAMA', 'DRAWN', 'DREAM',
    'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT',
    'ELECT', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR', 'EVENT',
    'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIELD', 'FIFTH', 'FIFTY',
    'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID', 'FOCUS', 'FORCE',
    'FORTH', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRESH', 'FRONT', 'FRUIT', 'FULLY', 'FUNNY',
    'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE', 'GRAND', 'GRANT', 'GRASS',
    'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUEST', 'GUIDE', 'HAPPY',
    'HARSH', 'HEART', 'HEAVY', 'HENCE', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL', 'IMAGE',
    'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JOINT', 'JUDGE', 'KNOWN', 'LABEL', 'LARGE', 'LASER',
    'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LIGHT', 'LIMIT',
    'LOCAL', 'LOGIC', 'LOOSE', 'LOWER', 'LUCKY', 'LUNCH', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH',
    'MATCH', 'MAYOR', 'MEANT', 'MEDAL', 'MEDIA', 'MERGE', 'METAL', 'MIGHT', 'MINOR', 'MINUS',
    'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVIE', 'MUSIC',
    'NEEDS', 'NERVE', 'NEVER', 'NIGHT', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR',
    'OCEAN', 'OFFER', 'OFTEN', 'ORDER', 'OTHER', 'OUGHT', 'OUTER', 'PANEL', 'PAPER', 'PARTY',
    'PEACE', 'PHASE', 'PHONE', 'PHOTO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE',
    'PLANT', 'PLATE', 'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT',
    'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE', 'QUEEN', 'QUICK', 'QUIET', 'QUITE', 'RADIO',
    'RAISE', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'READY', 'REFER', 'RIGHT', 'RIVAL', 'RIVER',
    'ROBOT', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE',
    'SERVE', 'SEVEN', 'SHAPE', 'SHARE', 'SHARP', 'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHIRT',
    'SHOCK', 'SHOOT', 'SHORT', 'SHOWN', 'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SKILL',
    'SLEEP', 'SLIDE', 'SMALL', 'SMART', 'SMILE', 'SMOKE', 'SOLID', 'SOLVE', 'SORRY', 'SOUND',
    'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT',
    'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STICK', 'STILL',
    'STOCK', 'STONE', 'STORE', 'STORM', 'STORY', 'STRIP', 'STUCK', 'STUDY', 'STUFF', 'STYLE',
    'SUGAR', 'SUPER', 'SWEET', 'TABLE', 'TAKEN', 'TASTE', 'TEACH', 'THANK', 'THEME', 'THERE',
    'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGHT',
    'TIMES', 'TIRED', 'TITLE', 'TODAY', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TRACK', 'TRADE',
    'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIED', 'TRIES', 'TRUCK', 'TRULY', 'TRUST', 'TRUTH',
    'TWICE', 'UNDER', 'UNION', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID',
    'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOICE', 'WASTE', 'WATCH', 'WATER', 'WHEEL',
    'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD', 'WORRY',
    'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRITE', 'WRONG', 'WROTE', 'YIELD', 'YOUNG',
];
const WORD_SET = new Set(WORD_LIST);

type LetterState = 'correct' | 'present' | 'absent' | 'unknown';
interface GuessRecord {
    word: string;
    feedback: LetterState[];
}

const STATE_PRIORITY: Record<LetterState, number> = { unknown: 0, absent: 0, present: 1, correct: 2 };
const STATE_COLORS: Record<LetterState, { bg: string; border: string; text: string }> = {
    correct: { bg: '#B5F23D', border: '#B5F23D', text: '#04060A' },
    present: { bg: '#F5B400', border: '#F5B400', text: '#04060A' },
    absent: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.4)' },
    unknown: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: '#FFFFFF' },
};

// ────────────────────────────────────────────────────────────────────────
// Pure helpers
// ────────────────────────────────────────────────────────────────────────

const seededIndex = (seedStr: string, modulo: number): number => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) {
        hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash) * 10000;
    return Math.floor((x - Math.floor(x)) * modulo);
};

// Standard two-pass Wordle feedback algorithm — correctly handles
// duplicate letters (e.g. guessing "ARENA" against answer "AGREE").
const computeFeedback = (guess: string, answer: string): LetterState[] => {
    const length = answer.length;
    const feedback: LetterState[] = new Array(length).fill('absent');
    const answerLetters = answer.split('');
    const used = new Array(length).fill(false);

    for (let i = 0; i < length; i++) {
        if (guess[i] === answerLetters[i]) {
            feedback[i] = 'correct';
            used[i] = true;
        }
    }
    for (let i = 0; i < length; i++) {
        if (feedback[i] === 'correct') continue;
        const letter = guess[i];
        const foundIdx = answerLetters.findIndex((l, idx) => l === letter && !used[idx]);
        if (foundIdx !== -1) {
            feedback[i] = 'present';
            used[foundIdx] = true;
        }
    }
    return feedback;
};

const mergeLetterStates = (
    prev: Record<string, LetterState>,
    word: string,
    feedback: LetterState[]
): Record<string, LetterState> => {
    const next = { ...prev };
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const newState = feedback[i];
        const existing = next[letter];
        if (!existing || STATE_PRIORITY[newState] > STATE_PRIORITY[existing]) {
            next[letter] = newState;
        }
    }
    return next;
};

// ────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────

export default function WordGameScreen() {
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

    const { opponentScore, sendScoreUpdate, submitFinalMatch } = useMatchmaking(
        user?.id || '',
        'wordGame'
    );

    const [wordLength, setWordLength] = useState<number>(5);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [guesses, setGuesses] = useState<GuessRecord[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [letterStates, setLetterStates] = useState<Record<string, LetterState>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [timer, setTimer] = useState(0);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [gameOverInfo, setGameOverInfo] = useState<{
        won: boolean;
        xpEarned?: number;
        answer?: string;
    } | null>(null);

    const shakeOffset = useSharedValue(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isMountedRef = useRef(true);
    const secretWordRef = useRef<string | null>(null);

    // ── Lifecycle ────────────────────────────────────────────────────────

    useEffect(() => {
        isMountedRef.current = true;
        initGameSession();
        return () => {
            isMountedRef.current = false;
            stopTimer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startTimer = useCallback(() => {
        stopTimer();
        timerRef.current = setInterval(() => {
            if (isMountedRef.current) setTimer((prev) => prev + 1);
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ── Session init ─────────────────────────────────────────────────────

    const initGameSession = async () => {
        try {
            setIsLoading(true);

            if (isMultiplayer && params.puzzleSeed) {
                const idx = seededIndex(params.puzzleSeed, WORD_LIST.length);
                const secret = WORD_LIST[idx];
                secretWordRef.current = secret;
                setWordLength(secret.length);
                setIsLoading(false);
                startTimer();
                return;
            }

            const sessionData = await gameApi.startGame({
                gameId: 'wordGame',
                difficulty: 'MEDIUM',
            } as any);
            if (!isMountedRef.current) return;

            setSessionId(sessionData.sessionId);
            setWordLength((sessionData as any).wordLength || 5);
            setIsLoading(false);
            startTimer();
        } catch (error: any) {
            if (!isMountedRef.current) return;
            Alert.alert('Error', error?.response?.data?.message || 'Failed to start game session');
            setIsLoading(false);
        }
    };

    // ── Input handling ───────────────────────────────────────────────────

    const triggerShake = () => {
        shakeOffset.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const handleKeyPress = (key: string) => {
        if (gameOverInfo || isSubmitting) return;

        if (key === 'DELETE') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setCurrentGuess((prev) => prev.slice(0, -1));
            return;
        }

        if (key === 'ENTER') {
            if (currentGuess.length !== wordLength) {
                triggerShake();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                return;
            }
            submitGuess(currentGuess);
            return;
        }

        if (currentGuess.length < wordLength) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            setCurrentGuess((prev) => prev + key);
        }
    };

    const submitGuess = async (word: string) => {
        if (isMultiplayer && secretWordRef.current) {
            handleMultiplayerGuess(word);
        } else {
            await handleSoloGuess(word);
        }
    };

    // ── Multiplayer guess (client-authoritative, seed-derived word) ─────

    const handleMultiplayerGuess = (word: string) => {
        if (!WORD_SET.has(word)) {
            triggerShake();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
            return; // not a recognized word — no attempt consumed
        }

        const secret = secretWordRef.current!;
        const feedback = computeFeedback(word, secret);
        const nextGuesses = [...guesses, { word, feedback }];

        setGuesses(nextGuesses);
        setLetterStates((prev) => mergeLetterStates(prev, word, feedback));
        setCurrentGuess('');

        if (params.roomId) {
            sendScoreUpdate(nextGuesses.length, params.roomId);
        }

        const won = word === secret;
        const isOver = won || nextGuesses.length >= MAX_ATTEMPTS;

        if (isOver) {
            stopTimer();
            Haptics.notificationAsync(
                won ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
            ).catch(() => {});

            if (params.roomId) {
                const isPlayerA = params.playerA === user?.id;
                const myAttempts = nextGuesses.length;
                submitFinalMatch({
                    roomId: params.roomId,
                    playerA: params.playerA || '',
                    playerB: params.playerB || '',
                    scoreA: isPlayerA ? myAttempts : opponentScore,
                    scoreB: isPlayerA ? opponentScore : myAttempts,
                    durationMs: timer * 1000,
                    puzzleSeed: params.puzzleSeed || '',
                    gameCategory: 'wordGame',
                    moveLog: nextGuesses.map((g) => g.word),
                });
            }

            setGameOverInfo({ won, answer: secret });
        }
    };

    // ── Solo guess (server-authoritative) ────────────────────────────────

    const handleSoloGuess = async (word: string) => {
        if (!sessionId) return;
        setIsSubmitting(true);

        try {
            const result = await gameApi.submitGame({
                sessionId,
                submittedWord: word,
                attemptNumber: guesses.length + 1,
            } as any);
            if (!isMountedRef.current) return;

            const data = result as any;

            if (data?.invalidWord) {
                triggerShake();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                return; // real word check failed server-side — no attempt consumed
            }

            // Expects the backend's SubmitGameResponse to include a per-letter
            // `feedback` array (['correct'|'present'|'absent', ...]) for full
            // Wordle-style coloring, plus `success`/`correctWord` fields for
            // word-type games. I haven't seen games.types.ts, so I can't
            // confirm SubmitGameResponse actually carries these for
            // gameId: 'wordGame' — worth checking that type definition.
            // Falls back to an uncolored row if `feedback` is missing so
            // this doesn't crash either way.
            const feedback: LetterState[] = data?.feedback || Array(wordLength).fill('unknown');
            const nextGuesses = [...guesses, { word, feedback }];
            setGuesses(nextGuesses);
            setLetterStates((prev) => mergeLetterStates(prev, word, feedback));
            setCurrentGuess('');

            if (data?.success) {
                stopTimer();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                setGameOverInfo({ won: true, xpEarned: data.xpEarned });
            } else if (nextGuesses.length >= MAX_ATTEMPTS) {
                stopTimer();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
                setGameOverInfo({ won: false, answer: data?.correctWord });
            }
        } catch (error: any) {
            if (!isMountedRef.current) return;
            if (error?.response?.data?.invalidWord) {
                triggerShake();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                return;
            }
            Alert.alert('Connection Error', 'Could not submit your guess. Please try again.');
        } finally {
            if (isMountedRef.current) setIsSubmitting(false);
        }
    };

    const handleExitConfirm = async () => {
        setShowExitModal(false);
        if (sessionId) {
            try {
                await gameApi.abandonGame(sessionId, timer);
            } catch (err) {
                console.error(err);
            }
        }
        router.back();
    };

    const animatedRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }],
    }));

    // ── Responsive sizing ────────────────────────────────────────────────

    const cellSize = Math.min((windowWidth - 32 - GRID_GAP * (wordLength - 1)) / wordLength, 56);
    const keySize = Math.min((windowWidth - 32 - KEY_GAP * 9) / 10, 34);

    // ── Render ───────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#04060A]">
                <ActivityIndicator size="large" color="#B5F23D" />
                <Text className="font-rajdhani-medium text-lime-400 mt-4 tracking-widest">
                    INITIALIZING LEXI-MATRIX...
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#04060A] px-4 pt-12 pb-6 justify-between">
            {/* Header */}
            <View>
                <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
                    <TouchableOpacity
                        onPress={() => setShowExitModal(true)}
                        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="Exit game"
                    >
                        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="font-orbitron-bold text-lg text-lime-400 tracking-wider">
                            LEXIMATCH 1v1
                        </Text>
                        <Text className="font-rajdhani-medium text-xs text-white/50">
                            {isMultiplayer ? `ROOM: ${params.roomId}` : 'SINGLE PLAYER SESSION'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            stopTimer();
                            setShowGuideModal(true);
                        }}
                        className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/30 items-center justify-center"
                        accessibilityRole="button"
                        accessibilityLabel="How to play"
                    >
                        <Ionicons name="key-outline" size={18} color="#B5F23D" />
                    </TouchableOpacity>
                </View>

                {/* STATUS ROW: timer + attempts */}
                <View className="mt-3 flex-row items-center justify-center gap-3">
                    <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        <Text className="text-[11px]">⏱</Text>
                        <Text className="font-orbitron-bold text-[11px] text-white/80">
                            {formatTime(timer)}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                        <Text className="font-rajdhani-bold text-[11px] text-white/60">ATTEMPT</Text>
                        <Text className="font-orbitron-black text-[11px] text-lime-400">
                            {guesses.length}/{MAX_ATTEMPTS}
                        </Text>
                    </View>
                </View>

                {isMultiplayer && (
                    <View className="mt-2 flex-row items-center justify-between rounded-xl bg-white/5 px-4 py-2 border border-white/10">
                        <Text className="font-rajdhani-bold text-xs text-white/70">
                            YOU: {guesses.length}/{MAX_ATTEMPTS}
                        </Text>
                        <Text className="font-orbitron-bold text-xs text-lime-400">VS</Text>
                        <Text className="font-rajdhani-bold text-xs text-red-400">
                            OPPONENT: {opponentScore}/{MAX_ATTEMPTS}
                        </Text>
                    </View>
                )}
            </View>

            {/* Grid Area */}
            <View className="items-center justify-center my-auto">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === guesses.length && !gameOverInfo;
                    const submittedGuess = guesses[rowIndex];
                    const displayWord = submittedGuess?.word || (isCurrentRow ? currentGuess : '');

                    const RowComponent = isCurrentRow ? Animated.View : View;

                    return (
                        <RowComponent
                            key={rowIndex}
                            style={[{ gap: GRID_GAP }, isCurrentRow ? animatedRowStyle : undefined]}
                            className="flex-row my-1"
                        >
                            {Array.from({ length: wordLength }).map((_, colIndex) => {
                                const char = displayWord[colIndex] || '';
                                const state = submittedGuess?.feedback[colIndex];

                                let cellStyle: { backgroundColor: string; borderColor: string };
                                let textColor = '#FFFFFF';

                                if (state) {
                                    const colors = STATE_COLORS[state];
                                    cellStyle = { backgroundColor: colors.bg, borderColor: colors.border };
                                    textColor = colors.text;
                                } else if (char) {
                                    cellStyle = { backgroundColor: 'rgba(181,242,61,0.1)', borderColor: '#B5F23D' };
                                } else {
                                    cellStyle = { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' };
                                }

                                return (
                                    <View
                                        key={colIndex}
                                        style={{
                                            width: cellSize,
                                            height: cellSize,
                                            borderWidth: 1,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            ...cellStyle,
                                        }}
                                    >
                                        <Text
                                            style={{ color: textColor }}
                                            className="font-orbitron-bold text-2xl"
                                        >
                                            {char}
                                        </Text>
                                    </View>
                                );
                            })}
                        </RowComponent>
                    );
                })}
            </View>

            {/* GAME OVER OVERLAY */}
            {gameOverInfo && (
                <View className="items-center justify-center rounded-2xl border border-white/10 bg-[#090D14] px-6 py-5 mb-4">
                    <Text
                        className="font-orbitron-black text-xl tracking-wider"
                        style={{ color: gameOverInfo.won ? '#B5F23D' : '#EF4444' }}
                    >
                        {gameOverInfo.won ? 'VICTORY' : 'OUT OF ATTEMPTS'}
                    </Text>
                    {!gameOverInfo.won && gameOverInfo.answer && (
                        <Text className="mt-1 font-rajdhani-bold text-sm text-white/70">
                            The word was{' '}
                            <Text className="text-lime-400">{gameOverInfo.answer}</Text>
                        </Text>
                    )}
                    {gameOverInfo.won && typeof gameOverInfo.xpEarned === 'number' && (
                        <Text className="mt-1 font-rajdhani-bold text-sm text-white/70">
                            +{gameOverInfo.xpEarned} XP
                        </Text>
                    )}
                    <View className="mt-4 flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3"
                        >
                            <Text className="font-orbitron-bold text-xs text-white/80">EXIT</Text>
                        </TouchableOpacity>
                        {!isMultiplayer && (
                            <TouchableOpacity
                                onPress={() => {
                                    setGuesses([]);
                                    setLetterStates({});
                                    setCurrentGuess('');
                                    setGameOverInfo(null);
                                    setSessionId(null);
                                    initGameSession();
                                }}
                                style={{ backgroundColor: '#B5F23D' }}
                                className="rounded-xl px-6 py-3"
                            >
                                <Text className="font-orbitron-bold text-xs text-[#04060A]">PLAY AGAIN</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Custom Keypad */}
            {!gameOverInfo && (
                <View style={{ gap: KEY_GAP }}>
                    {KEYBOARD_ROWS.map((row, rIdx) => (
                        <View key={rIdx} style={{ gap: KEY_GAP }} className="flex-row justify-center">
                            {row.map((key) => {
                                const isSpecial = key === 'ENTER' || key === 'DELETE';
                                const state = letterStates[key];
                                const colors = isSpecial
                                    ? { bg: '#B5F23D', border: '#B5F23D', text: '#04060A' }
                                    : state
                                    ? STATE_COLORS[state]
                                    : STATE_COLORS.unknown;

                                return (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => handleKeyPress(key)}
                                        activeOpacity={0.7}
                                        disabled={isSubmitting}
                                        style={{
                                            height: 52,
                                            width: isSpecial ? undefined : keySize,
                                            paddingHorizontal: isSpecial ? 12 : 0,
                                            backgroundColor: colors.bg,
                                            borderColor: colors.border,
                                            borderWidth: 1,
                                            borderRadius: 8,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {key === 'DELETE' ? (
                                            <Ionicons name="backspace-outline" size={20} color={colors.text} />
                                        ) : (
                                            <Text
                                                style={{ color: colors.text }}
                                                className="font-orbitron-bold text-sm"
                                            >
                                                {key}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}

                    {isSubmitting && (
                        <View className="mt-1 flex-row items-center justify-center gap-2">
                            <ActivityIndicator size="small" color="#B5F23D" />
                            <Text className="font-rajdhani-bold text-[11px] text-lime-400 tracking-wider">
                                CHECKING WORD...
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* MODALS */}
            <ExitModal
                visible={showExitModal}
                onCancel={() => setShowExitModal(false)}
                onConfirmExit={handleExitConfirm}
            />

            <GuideModal
                visible={showGuideModal}
                gameId="wordGame"
                onClose={() => {
                    setShowGuideModal(false);
                    if (!gameOverInfo) startTimer();
                }}
            />
        </View>
    );
}