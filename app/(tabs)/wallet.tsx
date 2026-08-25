import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { tabDataService } from '../../src/services/tabDataService';
import { COLORS, FONTS } from '../../src/constants/theme';

// SVG Icons
const ArrowDownLeftIcon = ({ size = 18, color = COLORS.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M17 7L7 17" />
    <Path d="M17 17H7V7" />
  </Svg>
);

const ArrowUpRightIcon = ({ size = 18, color = COLORS.danger }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M7 17L17 7" />
    <Path d="M7 7h10v10" />
  </Svg>
);

const CloseIcon = ({ size = 20, color = COLORS.textMain }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 6L6 18" />
    <Path d="M6 6l12 12" />
  </Svg>
);

const WalletIcon = ({ size = 20, color = COLORS.primary }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5z" />
    <Path d="M16 12h5" />
  </Svg>
);

export default function WalletScreen() {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [modalType, setModalType] = useState<'DEPOSIT' | 'WITHDRAW' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['walletHistory'],
    queryFn: tabDataService.getTransactions,
  });

  const filteredHistory = history.filter((tx) => {
    if (activeFilter === 'ALL') return true;
    return tx.type === activeFilter;
  });

  const handleActionSubmit = () => {
    if (!amountInput) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setModalType(null);
      setAmountInput('');
    }, 1200);
  };

  return (
    <ScreenContainer style={{ backgroundColor: COLORS.background }} className="px-4 sm:px-6">
      {/* Header */}
      <View className="mb-5 mt-3 flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.primary }}
            className="text-[11px] uppercase tracking-[0.25em]"
          >
            CREDENTIALS_ARMORY
          </Text>
          <Text
            style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
            className="mt-1 text-2xl sm:text-3xl"
          >
            DIGITAL <Text style={{ color: COLORS.primary }}>VAULT</Text>
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${COLORS.primary}12`,
            borderColor: `${COLORS.primary}40`,
          }}
          className="h-11 w-11 items-center justify-center rounded-2xl border"
        >
          <WalletIcon size={20} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 36 }}>
        {/* Balance Card - Cyber Glass Deck */}
        <View
          style={{
            backgroundColor: COLORS.card,
            borderColor: COLORS.cardBorder,
          }}
          className="mb-6 rounded-3xl border p-5 sm:p-6 shadow-2xl"
        >
          {/* Card Top Label */}
          <View className="flex-row items-center justify-between">
            <Text
              style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
              className="text-[11px] uppercase tracking-widest"
            >
              AVAILABLE BALANCE
            </Text>
            <View
              style={{
                backgroundColor: `${COLORS.primary}15`,
                borderColor: `${COLORS.primary}40`,
              }}
              className="rounded-full border px-2.5 py-0.5"
            >
              <Text
                style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.primary }}
                className="text-[10px]"
              >
                ● ACTIVE
              </Text>
            </View>
          </View>

          {/* Core Balance Figure */}
          <View className="mt-3 flex-row items-baseline gap-2">
            <Text
              style={{ fontFamily: FONTS.orbitronBlack, color: COLORS.textMain }}
              className="text-3xl sm:text-4xl"
            >
              1,480
            </Text>
            <Text
              style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
              className="text-base sm:text-lg"
            >
              NEURO
            </Text>
          </View>

          <Text
            style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
            className="mt-1 text-xs"
          >
            ≈ $148.00 USD
          </Text>

          {/* Quick Action Button Group */}
          <View className="mt-6 flex-row gap-3">
            {/* Glassmorphic Deposit Button */}
            <TouchableOpacity
              onPress={() => setModalType('DEPOSIT')}
              style={{
                backgroundColor: `${COLORS.primary}18`,
                borderColor: COLORS.primary,
              }}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-80"
            >
              <ArrowDownLeftIcon size={16} color={COLORS.primary} />
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
                className="text-xs uppercase tracking-wider"
              >
                DEPOSIT
              </Text>
            </TouchableOpacity>

            {/* Dark Outline Withdraw Button */}
            <TouchableOpacity
              onPress={() => setModalType('WITHDRAW')}
              style={{
                backgroundColor: COLORS.inputBg,
                borderColor: COLORS.cardBorder,
              }}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 active:opacity-80"
            >
              <ArrowUpRightIcon size={16} color={COLORS.secondary} />
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="text-xs uppercase tracking-wider"
              >
                WITHDRAW
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Section Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text
            style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMuted }}
            className="text-[11px] uppercase tracking-widest"
          >
            RECENT TRANSACTIONS
          </Text>

          {/* Mini Filter Pills */}
          <View className="flex-row gap-1.5">
            {(['ALL', 'CREDIT', 'DEBIT'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={{
                    backgroundColor: isActive ? `${COLORS.primary}20` : COLORS.card,
                    borderColor: isActive ? COLORS.primary : COLORS.cardBorder,
                  }}
                  className="rounded-lg border px-2.5 py-1"
                >
                  <Text
                    style={{
                      fontFamily: FONTS.rajdhaniBold,
                      color: isActive ? COLORS.primary : COLORS.textMuted,
                    }}
                    className="text-[10px]"
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Transaction History Items */}
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : filteredHistory.length === 0 ? (
          <View
            style={{ backgroundColor: COLORS.card, borderColor: COLORS.cardBorder }}
            className="rounded-2xl border p-8 items-center justify-center"
          >
            <Text
              style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
              className="text-sm"
            >
              No transactions recorded under this filter.
            </Text>
          </View>
        ) : (
          filteredHistory.map((tx) => {
            const isCredit = tx.type === 'CREDIT';
            return (
              <View
                key={tx.id}
                style={{
                  backgroundColor: COLORS.card,
                  borderColor: COLORS.cardBorder,
                }}
                className="mb-3 flex-row items-center justify-between rounded-2xl border p-4 shadow-sm"
              >
                <View className="flex-row items-center gap-3">
                  {/* Direction Badge */}
                  <View
                    style={{
                      backgroundColor: isCredit ? `${COLORS.primary}12` : `${COLORS.danger}12`,
                      borderColor: isCredit ? `${COLORS.primary}30` : `${COLORS.danger}30`,
                    }}
                    className="h-10 w-10 items-center justify-center rounded-xl border"
                  >
                    {isCredit ? (
                      <ArrowDownLeftIcon size={18} color={COLORS.primary} />
                    ) : (
                      <ArrowUpRightIcon size={18} color={COLORS.danger} />
                    )}
                  </View>

                  <View>
                    <Text
                      style={{ fontFamily: FONTS.rajdhaniBold, color: COLORS.textMain }}
                      className="text-sm"
                    >
                      {tx.title}
                    </Text>
                    <Text
                      style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
                      className="text-xs"
                    >
                      {tx.date}
                    </Text>
                  </View>
                </View>

                {/* Amount Output */}
                <Text
                  style={{
                    fontFamily: FONTS.orbitronBold,
                    color: isCredit ? COLORS.primary : COLORS.danger,
                  }}
                  className="text-sm"
                >
                  {isCredit ? `+${tx.amount}` : `-${tx.amount}`}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Deposit / Withdraw Action Sheet Modal */}
      <Modal
        visible={modalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/85 px-5">
          <View
            style={{
              backgroundColor: COLORS.card,
              borderColor: COLORS.cardBorder,
            }}
            className="w-full max-w-md rounded-3xl border p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <View
              style={{ borderColor: COLORS.cardBorder }}
              className="mb-5 flex-row items-center justify-between border-b pb-4"
            >
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.textMain }}
                className="text-base"
              >
                {modalType === 'DEPOSIT' ? 'ADD' : 'WITHDRAW'}{' '}
                <Text style={{ color: COLORS.primary }}>CREDITS</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setModalType(null)}
                className="rounded-full p-1 active:opacity-70"
              >
                <CloseIcon size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            {/* Input Form */}
            <Text
              style={{ fontFamily: FONTS.rajdhaniMedium, color: COLORS.textMuted }}
              className="mb-2 text-xs uppercase tracking-wider"
            >
              AMOUNT IN NEURO
            </Text>
            <View
              style={{
                backgroundColor: COLORS.inputBg,
                borderColor: COLORS.cardBorder,
              }}
              className="mb-6 flex-row items-center rounded-2xl border px-4 py-3"
            >
              <TextInput
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.secondary}
                keyboardType="numeric"
                style={{
                  fontFamily: FONTS.orbitronBold,
                  color: COLORS.textMain,
                }}
                className="flex-1 text-base"
              />
              <Text
                style={{ fontFamily: FONTS.orbitronBold, color: COLORS.primary }}
                className="text-xs"
              >
                NEURO
              </Text>
            </View>

            {/* Submit CTA */}
            <TouchableOpacity
              onPress={handleActionSubmit}
              disabled={isProcessing}
              style={{
                backgroundColor: COLORS.primary,
                shadowColor: COLORS.primary,
              }}
              className="w-full items-center justify-center rounded-2xl py-4 shadow-lg active:opacity-90"
            >
              {isProcessing ? (
                <ActivityIndicator color={COLORS.background} size="small" />
              ) : (
                <Text
                  style={{
                    fontFamily: FONTS.orbitronBold,
                    color: COLORS.background,
                  }}
                  className="text-xs uppercase tracking-widest"
                >
                  CONFIRM {modalType}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}