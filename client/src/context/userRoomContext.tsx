import { createContext, useContext } from "react";
import type { LeaderboardEntry, RoomPhase, RoomUser } from "../types";


interface RoomContextType {
  roomId: string | null;
  paragraph: string;
  users: Record<string, RoomUser>;
  isAdmin: boolean;
  phase: RoomPhase;
  timeLimit: number;
  leaderboard: LeaderboardEntry[];
  error: string | null;
  setError: (msg: string | null) => void;
  createRoom: (wordCount: number, timeLimit: number) => void;
  joinRoom: (id: string) => void;
  startRace: () => void;
  leaveRoom: () => void;
  emitProgress: (progress: number, wpm: number, accuracy: number) => void;
  emitFinish: (wpm: number, accuracy: number, timeTaken: number) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used within a RoomProvider");
  return context;
};