import { io, Socket } from "socket.io-client";
import { type ServerToClientEvents, type ClientToServerEvents } from "./types";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5001";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL, {
  autoConnect: false,
});