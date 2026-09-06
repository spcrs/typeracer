import React, { useState, useEffect, type ReactNode } from "react";
import { useApp } from "./useAppContext";
import type { RoomUser } from "../types";
import { RoomContext } from "./userRoomContext";

export const RoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { socket, nickname, setCurrentScreen } = useApp();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [paragraph, setParagraph] = useState<string>("");
  const [users, setUsers] = useState<Record<string, RoomUser>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRoomCreated = (data: { roomId: string; paragraph: string }) => {
      setRoomId(data.roomId);
      setParagraph(data.paragraph);
      setIsAdmin(true);
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
      setError(null);
    };

    const handleRoomUpdated = (data: { users: Record<string, RoomUser> }) => {
      setUsers(data.users);
    };

    const handleRoomError = (data: { message: string }) => {
      setError(data.message);
      setRoomId(null);
    };

    socket.on("room:created", handleRoomCreated);
    socket.on("room:joined", handleRoomJoined);
    socket.on("room:updated", handleRoomUpdated);
    socket.on("room:error", handleRoomError);

    return () => {
      socket.off("room:created", handleRoomCreated);
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:updated", handleRoomUpdated);
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

  const leaveRoom = () => {
    if (roomId) {
      socket.emit("room:leave", { roomId });
    }
    setRoomId(null);
    setParagraph("");
    setUsers({});
    setIsAdmin(false);
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
        error,
        setError,
        createRoom,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

