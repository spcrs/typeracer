import { createContext, useContext } from "react";
import type { RoomUser } from "../types";


interface RoomContextType {
  roomId: string | null;
  paragraph: string;
  users: Record<string, RoomUser>;
  isAdmin: boolean;
  error: string | null;
  setError: (msg: string | null) => void;
  createRoom: (wordCount: number, timeLimit: number) => void;
  joinRoom: (id: string) => void;
  leaveRoom: () => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) throw new Error("useRoom must be used within a RoomProvider");
  return context;
};