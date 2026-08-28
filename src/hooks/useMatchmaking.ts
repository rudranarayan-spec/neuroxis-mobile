import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

interface MatchStartPayload {
  roomId: string;
  gameCategory: string;
  puzzleSeed: string;
  playerA: string;
  playerB: string;
}

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_SOCKET_URL || "http://192.168.29.38:5001";

export function useMatchmaking(userId: string, gameCategory: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [matchData, setMatchData] = useState<MatchStartPayload | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [matchResult, setMatchResult] = useState<any | null>(null);

  useEffect(() => {
    // 1. Singleton/Reusable Socket Connection
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ["polling", "websocket"],
        autoConnect: true,
        secure: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    const socket = socketRef.current;

    // 2. Event Listeners
    const handleMatchStart = (data: MatchStartPayload) => {
      setIsSearching(false);
      setMatchData(data);
    };

    const handleOpponentScore = ({
      currentScore,
    }: {
      currentScore: number;
    }) => {
      setOpponentScore(currentScore);
    };

    const handleMatchOver = (data: { match: any }) => {
      setMatchResult(data.match);
    };

    socket.on("MATCH_START", handleMatchStart);
    socket.on("OPPONENT_SCORE_UPDATE", handleOpponentScore);
    socket.on("MATCH_OVER", handleMatchOver);

    return () => {
      socket.off("MATCH_START", handleMatchStart);
      socket.off("OPPONENT_SCORE_UPDATE", handleOpponentScore);
      socket.off("MATCH_OVER", handleMatchOver);
    };
  }, []);

  // Action: Join Matchmaking Queue safely
  const findMatch = () => {
    if (!socketRef.current) return;
    setIsSearching(true);

    if (socketRef.current.connected) {
      socketRef.current.emit("JOIN_QUEUE", { userId, gameCategory });
    } else {
      socketRef.current.once("connect", () => {
        socketRef.current?.emit("JOIN_QUEUE", { userId, gameCategory });
      });
      socketRef.current.connect();
    }
  };

  // Action: Cancel Searching
  const cancelSearch = () => {
    if (!socketRef.current) return;
    setIsSearching(false);
    socketRef.current.emit("LEAVE_QUEUE", { userId, gameCategory });
  };

  // Action: Broadcast live score changes during gameplay
  const sendScoreUpdate = (currentScore: number, roomId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("SCORE_UPDATE", {
      roomId,
      userId,
      currentScore,
    });
  };

  // Action: Finish game & persist to DB
  const submitFinalMatch = (payload: {
    roomId: string;
    playerA: string;
    playerB: string;
    scoreA: number;
    scoreB: number;
    durationMs: number;
    puzzleSeed: string;
    gameCategory: string;
    moveLog: any[];
  }) => {
    if (!socketRef.current) return;
    socketRef.current.emit("SUBMIT_MATCH", payload);
  };

  return {
    isSearching,
    matchData,
    opponentScore,
    matchResult,
    findMatch,
    cancelSearch,
    sendScoreUpdate,
    submitFinalMatch,
  };
}
