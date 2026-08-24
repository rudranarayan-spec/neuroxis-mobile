export interface ArenaItem {
  id: string;
  title: string;
  category: string;
  prizePool: string;
  entryFee: string;
  players: string;
  status: 'LIVE' | 'UPCOMING';
}

export interface WalletTransaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  type: 'CREDIT' | 'DEBIT';
}

export const tabDataService = {
  getArenas: async (): Promise<ArenaItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      { id: '1', title: 'Cyber Clash Solo Cup', category: 'SOLO QUEUE', prizePool: '$1,200', entryFee: 'FREE', players: '64/64', status: 'LIVE' },
      { id: '2', title: 'Neural Squads Showdown', category: 'SQUAD 4v4', prizePool: '$5,000', entryFee: '100 TOKENS', players: '12/32', status: 'UPCOMING' },
      { id: '3', title: 'Matrix Masters League', category: 'DUO ARENA', prizePool: '$2,500', entryFee: '50 TOKENS', players: '28/32', status: 'UPCOMING' },
    ];
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [
      { id: 't1', title: 'Tournament Reward - Rank 1', date: 'Today, 14:20', amount: '+500 TOKENS', type: 'CREDIT' },
      { id: 't2', title: 'Arena Entry Fee', date: 'Yesterday, 19:45', amount: '-50 TOKENS', type: 'DEBIT' },
      { id: 't3', title: 'Weekly Login Bonus', date: '2 days ago', amount: '+100 TOKENS', type: 'CREDIT' },
    ];
  },
};