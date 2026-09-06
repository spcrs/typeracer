import type { Room, RoomUser } from "./types/index.js";
import { getParagraphByWordCount } from "./data/paragraphs.js";

export const rooms = new Map<string, Room>();

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous chars like O, 0, 1, I

export const generateRoomId = (): string => {
  let roomId = "";
  do {
    roomId = "";
    for (let i = 0; i < 6; i++) {
      roomId += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
  } while (rooms.has(roomId));
  return roomId;
};

export const createRoom = (
  adminId: string,
  nickname: string,
  wordCount: number,
  timeLimit: number
): Room => {
  const id = generateRoomId();
  const paragraph = getParagraphByWordCount(wordCount);

  const initialUsers = new Map<string, RoomUser>();
  initialUsers.set(adminId, {
    nickname,
    progress: 0,
    wpm: 0,
    accuracy: 100,
    finishedAt: null,
    status: "racing",
  });

  const room: Room = {
    id,
    adminId,
    settings: {
      wordCount,
      timeLimit,
    },
    paragraph,
    users: initialUsers,
    status: "lobby",
    startedAt: null,
    timerRef: null,
  };

  rooms.set(id, room);
  return room;
};

export const getRoom = (roomId: string): Room | undefined => {
  return rooms.get(roomId.toUpperCase());
};

export const usersMapToObject = (users: Map<string, RoomUser>): Record<string, RoomUser> => {
  const record: Record<string, RoomUser> = {};
  users.forEach((val, key) => {
    record[key] = val;
  });
  return record;
};

export const removeUserFromRoom = (roomId: string, socketId: string) => {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.users.delete(socketId);

  // If room is empty or the admin leaves during lobby, dismantle the room
  if (room.users.size === 0 || (room.adminId === socketId && room.status === "lobby")) {
    if (room.timerRef) clearInterval(room.timerRef);
    rooms.delete(roomId);
    return { roomDeleted: true, adminLeft: room.adminId === socketId };
  }

  return { roomDeleted: false, adminLeft: false };
};