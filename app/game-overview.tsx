import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '../src/components/ScreenContainer';
import { GuideModal } from '../src/components/sudoku/SudokuModals';

export const GameOverviewScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ gameId?: string; title?: string; route?: string }>();

    const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

    // Fallback defaults or dynamic values passed via query params
    const gameTitle = params.title || 'MATRIX SUDOKU';
    const gameId = params.gameId || 'sudoku';


    const handlePlayNow = () => {
        // Use explicit route parameter or fallback to /game/[id] layout
        const targetRoute = params.route || `/${params.gameId}`;
        router.push(targetRoute as any);
    };

    return (
        <ScreenContainer className="flex-1 bg-[#121212] px-4 pt-2">
            <StatusBar barStyle="light-content" backgroundColor="#121212" />

            {/* HEADER */}
            <View className="mb-6 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
                >
                    <Text className="font-orbitron-black text-lg text-text-main">←</Text>
                </TouchableOpacity>

                <Text className="font-orbitron-bold text-sm tracking-widest text-text-muted">
                    GAME LOBBY
                </Text>

                {/* INFO / HOW TO PLAY BUTTON */}
                <TouchableOpacity
                    onPress={() => setShowGuideModal(true)}
                    className="h-10 w-10 items-center justify-center rounded-xl border border-cardBorder bg-card"
                >
                    <Text className="font-orbitron-bold text-sm text-accentGreen">ⓘ</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                {/* GAME BANNER / HERO CARD */}
                <View className="items-center rounded-3xl border-2 border-accentGreen/40 bg-card p-6 text-center shadow-lg">
                    <View className="mb-3 h-16 w-16 items-center justify-center rounded-2xl bg-accentGreen/10 border border-accentGreen/30">
                        <Text className="text-3xl">🧩</Text>
                    </View>
                    <Text className="font-orbitron-black text-2xl text-accentGreen">{gameTitle}</Text>
                    <Text className="mt-2 text-center font-rajdhani-medium text-sm text-text-muted">
                        Decrypt the matrix grid sequence under time pressure. Fill missing blocks without breaking row, column, or sub-grid integrity.
                    </Text>
                </View>

                {/* REWARDS & STATS OVERVIEW */}
                <View className="mt-6 flex-row gap-3">
                    <View className="flex-1 rounded-2xl border border-cardBorder bg-card p-4">
                        <Text className="font-rajdhani-bold text-xs text-text-muted">BASE REWARD</Text>
                        <Text className="mt-1 font-orbitron-bold text-lg text-accentGreen">+50 XP</Text>
                    </View>
                    <View className="flex-1 rounded-2xl border border-cardBorder bg-card p-4">
                        <Text className="font-rajdhani-bold text-xs text-text-muted">EST. TIME</Text>
                        <Text className="mt-1 font-orbitron-bold text-lg text-text-main">3-5 MIN</Text>
                    </View>
                    <View className="flex-1 rounded-2xl border border-cardBorder bg-card p-4">
                        <Text className="font-rajdhani-bold text-xs text-text-muted">GRID SIZE</Text>
                        <Text className="mt-1 font-orbitron-bold text-lg text-text-main">6x6</Text>
                    </View>
                </View>

                {/* HINTS & STRATEGY SECTION */}
                <View className="mt-6 rounded-2xl border border-cardBorder bg-card p-5">
                    <View className="flex-row items-center gap-2 mb-3">
                        <Text className="text-lg">💡</Text>
                        <Text className="font-orbitron-bold text-sm text-text-main">TACTICAL HINTS</Text>
                    </View>

                    <View className="gap-2">
                        <Text className="font-rajdhani-medium text-xs text-text-muted">
                            • Scan sub-grids with 4 or 5 pre-filled numbers first to quickly eliminate obvious choices.
                        </Text>
                        <Text className="font-rajdhani-medium text-xs text-text-muted">
                            • Misplaced entries can cause verification failures at auto-submission. Use UNDO to roll back mistakes.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* BOTTOM ACTION BUTTON */}
            <View className="mb-6 pt-2">
                <TouchableOpacity
                    onPress={handlePlayNow}
                    className="items-center justify-center rounded-2xl bg-accentGreen py-4 shadow-lg shadow-accentGreen/20"
                >
                    <Text className="font-orbitron-black text-base text-black">PLAY NOW</Text>
                </TouchableOpacity>
            </View>

            {/* REUSED GUIDE MODAL */}
            <GuideModal
                visible={showGuideModal}
                onClose={() => setShowGuideModal(false)}
            />
        </ScreenContainer>
    );
};

export default GameOverviewScreen;