import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "./types";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});