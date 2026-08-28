import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

interface MatchmakingModalProps {
  visible: boolean;
  gameTitle: string;
  onCancel: () => void;
}

export const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ visible, gameTitle, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        <View 
          style={{ borderColor: COLORS.cardBorder || 'rgba(255,255,255,0.1)' }}
          className="w-full items-center rounded-3xl border bg-[#090D16] p-8 shadow-2xl"
        >
          {/* Pulsing Search Indicator */}
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <ActivityIndicator size="large" color={COLORS.primary || '#B5F23D'} />
          </View>

          <Text 
            style={{ fontFamily: FONTS.orbitronBold }} 
            className="text-xl text-white tracking-wider text-center"
          >
            SEARCHING OPPONENT
          </Text>

          <Text 
            style={{ fontFamily: FONTS.rajdhaniMedium }} 
            className="mt-2 text-xs text-gray-400 tracking-widest text-center uppercase"
          >
            {gameTitle} // 1V1 MATCHMAKING
          </Text>

          {/* Cancel Search Button */}
          <TouchableOpacity
            onPress={onCancel}
            activeOpacity={0.8}
            className="mt-8 rounded-xl bg-red-500/20 px-8 py-3 border border-red-500/40"
          >
            <Text 
              style={{ fontFamily: FONTS.rajdhaniBold }} 
              className="text-xs text-red-400 tracking-widest uppercase"
            >
              Cancel Search
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};