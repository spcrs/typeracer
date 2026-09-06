import React, { useState, useEffect, type ReactNode } from "react";
import { useApp } from "./useAppContext";
import type { RoomUser, LeaderboardEntry, RoomPhase } from "../types";
import { RoomContext } from "./userRoomContext";


export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket, nickname, setCurrentScreen } = useApp();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [paragraph, setParagraph] = useState<string>("");
  const [users, setUsers] = useState<Record<string, RoomUser>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [phase, setPhase] = useState<RoomPhase>("lobby");
  const [timeLimit, setTimeLimit] = useState(120);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRoomCreated = (data: { roomId: string; paragraph: string }) => {
      setRoomId(data.roomId);
      setParagraph(data.paragraph);
      setIsAdmin(true);
      setPhase("lobby");
      setError(null);
      setUsers({
        [socket.id || "admin"]: {
          nickname,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finishedAt: null,
          status: "racing",
        },
      });
    };

    const handleRoomJoined = (data: {
      roomId: string;
      paragraph: string;
      users: Record<string, RoomUser>;
    }) => {
      setRoomId(data.roomId);
      setParagraph(data.paragraph);
      setUsers(data.users);
      setIsAdmin(false);
      setPhase("lobby");
      setError(null);
    };

    const handleRoomUpdated = (data: { users: Record<string, RoomUser> }) => {
      setUsers(data.users);
    };

    const handleRaceStart = (data: { startedAt: number; timeLimit: number }) => {
      setTimeLimit(data.timeLimit);
      setPhase("countdown");
    };

    const handleRaceUpdate = (data: { users: Record<string, RoomUser> }) => {
      setUsers(data.users);
    };

    const handleRaceEnd = (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
      setPhase("leaderboard");
    };

    const handleRoomError = (data: { message: string }) => {
      setError(data.message);
      setRoomId(null);
      setPhase("lobby");
    };

    socket.on("room:created", handleRoomCreated);
    socket.on("room:joined", handleRoomJoined);
    socket.on("room:updated", handleRoomUpdated);
    socket.on("race:start", handleRaceStart);
    socket.on("race:update", handleRaceUpdate);
    socket.on("race:end", handleRaceEnd);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:updated", handleRoomUpdated);
      socket.off("race:start", handleRaceStart);
      socket.off("race:update", handleRaceUpdate);
      socket.off("race:end", handleRaceEnd);
      socket.off("room:error", handleRoomError);
    };
  }, [socket, nickname]);

  const createRoom = (wordCount: number, timeLimit: number) => {
    setError(null);
    socket.emit("room:create", { nickname, wordCount, timeLimit });
  };

  const joinRoom = (id: string) => {
    setError(null);
    socket.emit("room:join", { nickname, roomId: id });
  };

  const startRace = () => {
    if (roomId && isAdmin) {
      socket.emit("room:start", { roomId });
    }
  };

  const emitProgress = (progress: number, wpm: number, accuracy: number) => {
    if (roomId) {
      socket.emit("race:progress", { roomId, progress, wpm, accuracy });
    }
  };

  const emitFinish = (wpm: number, accuracy: number, timeTaken: number) => {
    if (roomId) {
      socket.emit("race:finish", { roomId, wpm, accuracy, timeTaken });
    }
  };

  const leaveRoom = () => {
    if (roomId) {
      socket.emit("room:leave", { roomId });
    }
    setRoomId(null);
    setParagraph("");
    setUsers({});
    setIsAdmin(false);
    setPhase("lobby");
    setError(null);
    setCurrentScreen("home");
  };

  return (
    <RoomContext.Provider
      value={{
        roomId,
        paragraph,
        users,
        isAdmin,
        phase,
        timeLimit,
        leaderboard,
        error,
        setError,
        createRoom,
        joinRoom,
        startRace,
        leaveRoom,
        emitProgress,
        emitFinish,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

