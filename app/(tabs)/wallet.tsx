import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { tabDataService } from '../../src/services/tabDataService';

export default function WalletScreen() {
  const { data: history = [] } = useQuery({
    queryKey: ['walletHistory'],
    queryFn: tabDataService.getTransactions,
  });

  return (
    <ScreenContainer className="px-5">
      {/* Header */}
      <View className="mb-4">
        <Text className="font-rajdhani-bold text-xs uppercase tracking-[0.2em] text-[#00FF66]">
          CREDENTIALS_ARMORY
        </Text>
        <Text className="mt-0.5 font-orbitron-black text-2xl text-white">
          DIGITAL <Text className="text-[#00FF66]">VALUT</Text>
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Balance Card */}
        <View className="mb-6 rounded-2xl border border-[#00FF66]/30 bg-[#0B101B] p-5 shadow-lg shadow-[#00FF66]/5">
          <Text className="font-rajdhani-bold text-xs uppercase tracking-widest text-slate-400">
            TOTAL BALANCE
          </Text>
          <Text className="mt-1 font-orbitron-black text-3xl text-white">
            1,480 <Text className="text-[#00FF66]">NEURO</Text>
          </Text>
          <Text className="mt-1 font-rajdhani text-xs text-slate-400">≈ $148.00 USD</Text>

          <View className="mt-5 flex-row gap-3">
            <TouchableOpacity className="flex-1 items-center justify-center rounded-xl bg-[#00FF66] py-3">
              <Text className="font-orbitron text-xs font-bold text-[#05070B]">DEPOSIT</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 items-center justify-center rounded-xl border border-[#121824] bg-[#121824] py-3">
              <Text className="font-orbitron text-xs text-white">WITHDRAW</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction History */}
        <Text className="mb-3 font-rajdhani-bold text-xs uppercase tracking-wider text-slate-400">
          RECENT TRANSACTIONS
        </Text>

        {history.map((tx) => (
          <View
            key={tx.id}
            className="mb-2.5 flex-row items-center justify-between rounded-xl border border-[#121824] bg-[#0B101B] p-3.5"
          >
            <View>
              <Text className="font-rajdhani-bold text-sm text-white">{tx.title}</Text>
              <Text className="font-rajdhani text-xs text-slate-500">{tx.date}</Text>
            </View>
            <Text
              className={`font-orbitron text-sm ${
                tx.type === 'CREDIT' ? 'text-[#00FF66]' : 'text-red-400'
              }`}
            >
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}