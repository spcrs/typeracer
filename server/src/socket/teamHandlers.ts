import type { Socket, Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "../types/index.js";
import {
  createRoom,
  getRoom,
  usersMapToObject,
  removeUserFromRoom,
} from "../rooms";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const registerTeamHandlers = (io: TypedServer, socket: TypedSocket) => {
  // 1. Admin creates a room
  socket.on("room:create", ({ nickname, wordCount, timeLimit }) => {
    const safeWordCount = Math.min(Math.max(wordCount, 25), 500);
    const safeTimeLimit = Math.min(Math.max(timeLimit, 30), 300);

    const room = createRoom(socket.id, nickname, safeWordCount, safeTimeLimit);
    socket.data.roomId = room.id;
    socket.data.nickname = nickname;

    socket.join(room.id);
    socket.emit("room:created", { roomId: room.id, paragraph: room.paragraph });
  });

  // 2. User joins an existing room
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

  // 3. User voluntarily leaves room
  socket.on("room:leave", ({ roomId }) => {
    handleLeave(roomId);
  });

  // 4. Disconnect cleanup
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

    const result = removeUserFromRoom(cleanRoomId, socket.id);
    if (!result) return;

    if (result.roomDeleted) {
      io.to(cleanRoomId).emit("room:error", {
        message: result.adminLeft
          ? "Host closed the room or left the lobby."
          : "Room was closed.",
      });
    } else {
      io.to(cleanRoomId).emit("room:updated", {
        users: usersMapToObject(room.users),
      });
    }
  }
};