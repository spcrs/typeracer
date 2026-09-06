import type { Socket, Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  LeaderboardEntry,
} from "../types/index";
import {
  createRoom,
  getRoom,
  usersMapToObject,
  removeUserFromRoom,
  rooms,
} from "../rooms";
import { getParagraphByWordCount } from "../data/paragraphs";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const generateLeaderboard = (roomId: string): LeaderboardEntry[] => {
  const room = getRoom(roomId);
  if (!room) return [];

  const entries: LeaderboardEntry[] = [];

  room.users.forEach((user) => {
    entries.push({
      rank: 0,
      nickname: user.nickname,
      wpm: user.wpm,
      accuracy: user.accuracy,
      progress: user.progress,
      timeTaken: user.finishedAt && room.startedAt ? Math.round((user.finishedAt - room.startedAt) / 1000) : null,
      status: user.status === "finished" ? "Finished" : "Did not finish",
    });
  });

  // Ranking logic:
  // 1. Finished players first (sorted ascending by time taken)
  // 2. Non-finishers next (sorted descending by % progress, then WPM)
  entries.sort((a, b) => {
    if (a.status === "Finished" && b.status === "Finished") {
      return (a.timeTaken ?? 0) - (b.timeTaken ?? 0);
    }
    if (a.status === "Finished") return -1;
    if (b.status === "Finished") return 1;

    if (b.progress !== a.progress) return b.progress - a.progress;
    return b.wpm - a.wpm;
  });

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
};

// Concludes the race but keeps the room alive in memory for rematching
const concludeRace = (cleanRoomId: string, io: TypedServer) => {
  const room = getRoom(cleanRoomId);
  if (!room || room.status === "finished") return;

  room.status = "finished";
  if (room.timerRef) {
    clearInterval(room.timerRef);
    room.timerRef = null;
  }

  const leaderboard = generateLeaderboard(cleanRoomId);
  io.to(cleanRoomId).emit("race:end", { leaderboard });
};

export const registerTeamHandlers = (io: TypedServer, socket: TypedSocket) => {
  // 1. Create Room
  socket.on("room:create", ({ nickname, wordCount, timeLimit }) => {
    const safeWordCount = Math.min(Math.max(wordCount, 25), 500);
    const safeTimeLimit = Math.min(Math.max(timeLimit, 30), 300);

    const room = createRoom(socket.id, nickname, safeWordCount, safeTimeLimit);
    socket.data.roomId = room.id;
    socket.data.nickname = nickname;

    socket.join(room.id);
    socket.emit("room:created", { roomId: room.id, paragraph: room.paragraph });
  });

  // 2. Join Room
  socket.on("room:join", ({ nickname, roomId }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);

    if (!room) {
      socket.emit("room:error", { message: "Room not found. Check the ID and try again." });
      return;
    }

    if (room.status !== "lobby") {
      socket.emit("room:error", { message: "This race has already started." });
      return;
    }

    if (room.users.size >= 10) {
      socket.emit("room:error", { message: "Room is full (max 10 players)." });
      return;
    }

    // Register user
    room.users.set(socket.id, {
      nickname,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finishedAt: null,
      status: "racing",
    });

    socket.data.roomId = room.id;
    socket.data.nickname = nickname;
    socket.join(room.id);

    const usersRecord = usersMapToObject(room.users);

    // Reply to joining user
    socket.emit("room:joined", {
      roomId: room.id,
      paragraph: room.paragraph,
      users: usersRecord,
    });

    // Notify other players in the room
    socket.to(room.id).emit("room:updated", { users: usersRecord });
  });

  // 3. Admin starts race
  socket.on("room:start", ({ roomId }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    if (!room || room.adminId !== socket.id || room.status !== "lobby") return;

    room.status = "racing";
    room.startedAt = Date.now();

    // Broadcast race start with the allotted time limit
    io.to(cleanRoomId).emit("race:start", {
      startedAt: room.startedAt,
      timeLimit: room.settings.timeLimit,
    });

    // Server-side race timer countdown check
    let remaining = room.settings.timeLimit;
    room.timerRef = setInterval(() => {
      remaining -= 1;

      // Check if all players completed before timer ends
      const allFinished = Array.from(room.users.values()).every(
        (u) => u.status === "finished"
      );

      if (remaining <= 0 || allFinished) {
        concludeRace(cleanRoomId, io);
      }
    }, 1000);
  });

  // 4. Progress Updates
  socket.on("race:progress", ({ roomId, progress, wpm, accuracy }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    if (!room || room.status !== "racing") return;

    const user = room.users.get(socket.id);
    if (user && user.status === "racing") {
      user.progress = progress;
      user.wpm = wpm;
      user.accuracy = accuracy;
      io.to(cleanRoomId).emit("race:update", {
        users: usersMapToObject(room.users),
      });
    }
  });

  // 5. User Finished
  socket.on("race:finish", ({ roomId, wpm, accuracy }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    if (!room || room.status !== "racing") return;

    const user = room.users.get(socket.id);
    if (user && user.status === "racing") {
      user.status = "finished";
      user.progress = 100;
      user.wpm = wpm;
      user.accuracy = accuracy;
      user.finishedAt = Date.now();

      io.to(cleanRoomId).emit("race:update", {
        users: usersMapToObject(room.users),
      });

      const allFinished = Array.from(room.users.values()).every(
        (u) => u.status === "finished"
      );

      if (allFinished) {
        concludeRace(cleanRoomId, io);
      }
    }
  });

  // 6. Rematch Trigger (Admin only)
  socket.on("room:rematch", ({ roomId }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    if (!room || room.adminId !== socket.id) return;

    // Reset room state
    room.status = "lobby";
    room.startedAt = null;
    room.paragraph = getParagraphByWordCount(room.settings.wordCount);

    // Filter roster: keep only the host initially, others must rejoin
    const hostUser = room.users.get(socket.id);
    room.users.clear();
    if (hostUser) {
      room.users.set(socket.id, {
        nickname: hostUser.nickname,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finishedAt: null,
        status: "racing",
      });
    }

    // Tell the admin their lobby is ready with the new paragraph
    socket.emit("room:created", { roomId: room.id, paragraph: room.paragraph });

    // Inform lingering racers in the room that rematch lobby is open
    socket.to(cleanRoomId).emit("room:rematch_ready");
  });

  // 7. Rejoin Trigger (Non-host re-entering lobby)
  socket.on("room:rejoin", ({ roomId }) => {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    const nickname = socket.data.nickname || "Racer";

    if (!room || room.status !== "lobby") {
      socket.emit("room:error", { message: "Match already in progress or room closed." });
      return;
    }

    room.users.set(socket.id, {
      nickname,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finishedAt: null,
      status: "racing",
    });

    const usersRecord = usersMapToObject(room.users);
    socket.emit("room:joined", {
      roomId: room.id,
      paragraph: room.paragraph,
      users: usersRecord,
    });
    io.to(cleanRoomId).emit("room:updated", { users: usersRecord });
  });

  // 8. User Leaves
  socket.on("room:leave", ({ roomId }) => {
    handleLeave(roomId);
  });

  // 9. Disconnect Cleanup
  socket.on("disconnect", () => {
    if (socket.data.roomId) {
      handleLeave(socket.data.roomId);
    }
  });

  function handleLeave(roomId: string) {
    const cleanRoomId = roomId.trim().toUpperCase();
    const room = getRoom(cleanRoomId);
    if (!room) return;

    socket.leave(cleanRoomId);
    socket.data.roomId = undefined;

    const isHost = room.adminId === socket.id;
    const result = removeUserFromRoom(cleanRoomId, socket.id);
    if (!result) return;

    // If host left, completely close the room and alert everyone
    if (isHost) {
      if (room.timerRef) clearInterval(room.timerRef);
      rooms.delete(cleanRoomId);
      io.to(cleanRoomId).emit("room:closed", {
        message: "The host has left. The room is now closed.",
      });
    } else {
      io.to(cleanRoomId).emit("room:updated", {
        users: usersMapToObject(room.users),
      });
    }
  }
};

