export type RoomStatus = "lobby" | "racing" | "finished";
export type UserStatus = "racing" | "finished";

export interface RoomUser {
  nickname: string;
  progress: number; // 0–100
  wpm: number;
  accuracy: number;
  finishedAt: number | null;
  status: UserStatus;
}

export interface RoomSettings {
  wordCount: number;
  timeLimit: number; // in seconds
}

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  wpm: number;
  accuracy: number;
  timeTaken: number | null;
  progress: number;
  status: "Finished" | "Did not finish";
}

// Socket Event Contracts
export interface ClientToServerEvents {
  "solo:start": (data: { nickname: string }) => void;
  "room:create": (data: { nickname: string; wordCount: number; timeLimit: number }) => void;
  "room:join": (data: { nickname: string; roomId: string }) => void;
  "room:start": (data: { roomId: string }) => void;
  "race:progress": (data: { roomId: string; progress: number; wpm: number; accuracy: number }) => void;
  "race:finish": (data: { roomId: string; wpm: number; accuracy: number; timeTaken: number }) => void;
  "room:leave": (data: { roomId: string }) => void;
}

export interface ServerToClientEvents {
  "solo:paragraph": (data: { paragraph: string }) => void;
  "room:created": (data: { roomId: string; paragraph: string }) => void;
  "room:joined": (data: { roomId: string; paragraph: string; users: Record<string, RoomUser> }) => void;
  "room:updated": (data: { users: Record<string, RoomUser> }) => void;
  "race:start": (data: { startedAt: number; timeLimit: number }) => void;
  "race:update": (data: { users: Record<string, RoomUser> }) => void;
  "race:end": (data: { leaderboard: LeaderboardEntry[] }) => void;
  "room:error": (data: { message: string }) => void;
}

export interface SocketData {
  nickname?: string;
  roomId?: string;
}