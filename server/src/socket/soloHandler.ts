import type { Socket, Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, SocketData } from "../types/index.js";
import { getRandomParagraph } from "../data/paragraphs.js";

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>;

export const registerSoloHandlers = (_io: TypedServer, socket: TypedSocket) => {
  socket.on("solo:start", () => {
    const paragraph = getRandomParagraph();
    socket.emit("solo:paragraph", { paragraph });
  });
};