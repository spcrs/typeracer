import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "./types/index";
import { registerSoloHandlers } from "./socket/soloHandlers";
import { registerTeamHandlers } from "./socket/teamHandlers";

const app = express();
app.use(cors());

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL, // Injected via deployment dashboard
].filter(Boolean) as string[];


const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(server, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  registerSoloHandlers(io, socket);
  registerTeamHandlers(io, socket);
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});