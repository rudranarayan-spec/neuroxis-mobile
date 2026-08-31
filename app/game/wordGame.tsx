import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { apiClient } from '../../src/config/apiClient';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

const MAX_ATTEMPTS = 6;

export default function WordGameScreen() {
    const router = useRouter();
    const { roomId, isMultiplayer } = useLocalSearchParams<{
        roomId?: string;
        isMultiplayer?: string;
    }>();

    const [wordLength, setWordLength] = useState<number>(5);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [gameStatus, setGameStatus] = useState<'IN_PROGRESS' | 'WON' | 'LOST'>('IN_PROGRESS');

    // Animation values for current row shake
    const shakeOffset = useSharedValue(0);

    useEffect(() => {
        initGameSession();
    }, []);

    const initGameSession = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.post('/games/start', {
                gameId: 'wordGame',
                difficulty: 'MEDIUM',
            });

            if (response.data?.success) {
                setSessionId(response.data.sessionId);
                setWordLength(response.data.wordLength || 5);
            }
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to start game session');
        } finally {
            setIsLoading(false);
        }
    };

    const triggerShake = () => {
        shakeOffset.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    };

    const handleKeyPress = (key: string) => {
        if (gameStatus !== 'IN_PROGRESS' || isSubmitting) return;

        if (key === 'DELETE') {
            setCurrentGuess((prev) => prev.slice(0, -1));
            return;
        }

        if (key === 'ENTER') {
            if (currentGuess.length !== wordLength) {
                triggerShake();
                return;
            }
            submitGuess();
            return;
        }

        if (currentGuess.length < wordLength) {
            setCurrentGuess((prev) => prev + key);
        }
    };

    const submitGuess = async () => {
        if (!sessionId) return;

        setIsSubmitting(true);
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        const submitted = currentGuess;
        setCurrentGuess('');

        try {
            const response = await apiClient.post('/games/submit', {
                sessionId,
                submittedWord: submitted,
            });

            if (response.data?.success) {
                setGameStatus('WON');
                Alert.alert('VICTORY', `You guessed the word! +${response.data.xpEarned} XP`, [
                    { text: 'Continue', onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            if (newGuesses.length >= MAX_ATTEMPTS) {
                setGameStatus('LOST');
                Alert.alert('GAME OVER', 'You ran out of attempts!', [
                    { text: 'Try Again', onPress: () => router.back() },
                ]);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const animatedRowStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeOffset.value }],
    }));

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
            <View className="flex-row items-center justify-between border-b border-white/10 pb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="font-orbitron-bold text-lg text-lime-400 tracking-wider">
                        LEXIMATCH 1v1
                    </Text>
                    <Text className="font-rajdhani-medium text-xs text-white/50">
                        {isMultiplayer ? `ROOM: ${roomId}` : 'SINGLE PLAYER SESSION'}
                    </Text>
                </View>

                <View className="w-10 h-10 rounded-full bg-lime-400/10 border border-lime-400/30 items-center justify-center">
                    <Ionicons name="key-outline" size={18} color="#B5F23D" />
                </View>
            </View>

            {/* Grid Area */}
            <View className="items-center justify-center my-auto">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === guesses.length;
                    const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');

                    const RowComponent = isCurrentRow ? Animated.View : View;

                    return (
                        <RowComponent
                            key={rowIndex}
                            style={isCurrentRow ? animatedRowStyle : undefined}
                            className="flex-row gap-2 my-1"
                        >
                            {Array.from({ length: wordLength }).map((_, colIndex) => {
                                const char = guess[colIndex] || '';

                                return (
                                    <View
                                        key={colIndex}
                                        className={`w-14 h-14 rounded-xl border items-center justify-center ${char
                                                ? 'border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/20'
                                                : 'border-white/10 bg-white/5'
                                            }`}
                                    >
                                        <Text className="font-orbitron-bold text-2xl text-white">
                                            {char}
                                        </Text>
                                    </View>
                                );
                            })}
                        </RowComponent>
                    );
                })}
            </View>

            {/* Custom Keypad */}
            <View className="gap-2">
                {KEYBOARD_ROWS.map((row, rIdx) => (
                    <View key={rIdx} className="flex-row justify-center gap-1.5">
                        {row.map((key) => {
                            const isSpecial = key === 'ENTER' || key === 'DELETE';
                            return (
                                <TouchableOpacity
                                    key={key}
                                    onPress={() => handleKeyPress(key)}
                                    activeOpacity={0.7}
                                    className={`h-14 rounded-lg items-center justify-center border ${isSpecial
                                            ? 'px-3 bg-lime-400 border-lime-400'
                                            : 'w-8 bg-white/5 border-white/10'
                                        }`}
                                >
                                    {key === 'DELETE' ? (
                                        <Ionicons name="backspace-outline" size={20} color="#04060A" />
                                    ) : (
                                        <Text
                                            className={`font-orbitron-bold text-sm ${isSpecial ? 'text-[#04060A]' : 'text-white'
                                                }`}
                                        >
                                            {key}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}