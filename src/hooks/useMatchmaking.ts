import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface MatchStartPayload {
  roomId: string;
  gameCategory: string;
  puzzleSeed: string;
  playerA: string;
  playerB: string;
}

export function useMatchmaking(userId: string, gameCategory: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchData, setMatchData] = useState<MatchStartPayload | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);

  useEffect(() => {
    // 1. Connect to Socket Server
    // Replace URL with your local IP (e.g., http://192.168.1.X:5001) for physical devices
    socketRef.current = io(process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.29.38:5001', {
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    // 2. Event Listeners
    socket.on('MATCH_START', (data: MatchStartPayload) => {
      setIsSearching(false);
      setMatchData(data);
    });

    socket.on('OPPONENT_SCORE_UPDATE', ({ currentScore }: { currentScore: number }) => {
      setOpponentScore(currentScore);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action: Find Opponent
  const findMatch = () => {
    if (!socketRef.current) return;
    setIsSearching(true);
    socketRef.current.emit('JOIN_QUEUE', { userId, gameCategory });
  };

  // Action: Cancel Searching
  const cancelSearch = () => {
    if (!socketRef.current) return;
    setIsSearching(false);
    socketRef.current.emit('LEAVE_QUEUE', { userId, gameCategory });
  };

  // Action: Broadcast live score changes during gameplay
  const sendScoreUpdate = (currentScore: number) => {
    if (!socketRef.current || !matchData) return;
    socketRef.current.emit('SCORE_UPDATE', {
      roomId: matchData.roomId,
      userId,
      currentScore,
    });
  };

  // Action: Finish game & persist to DB
  const submitFinalMatch = (scoreA: number, scoreB: number, moveLog: any[], durationMs: number) => {
    if (!socketRef.current || !matchData) return;
    socketRef.current.emit('SUBMIT_MATCH', {
      roomId: matchData.roomId,
      playerA: matchData.playerA,
      playerB: matchData.playerB,
      scoreA,
      scoreB,
      durationMs,
      puzzleSeed: matchData.puzzleSeed,
      gameCategory: matchData.gameCategory,
      moveLog,
    });
  };

  return {
    isSearching,
    matchData,
    opponentScore,
    findMatch,
    cancelSearch,
    sendScoreUpdate,
    submitFinalMatch,
  };
}