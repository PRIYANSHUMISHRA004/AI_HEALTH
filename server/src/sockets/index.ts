import type { Server as HttpServer } from "http";
import { Server } from "socket.io";

import { CHAT_EVENTS, registerChatSocket } from "./chat.socket";
import { EQUIPMENT_EVENTS, registerEquipmentSocket } from "./equipment.socket";
import { ISSUE_EVENTS, registerIssueSocket } from "./issue.socket";

let io: Server | null = null;

export const initSockets = (httpServer: HttpServer): Server => {
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: true, // Echoes the request origin
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true, // For compatibility
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log(`[socket] Client connected: ${socket.id} (${socket.handshake.address})`);

    registerChatSocket(io as Server, socket);
    registerIssueSocket(io as Server, socket);
    registerEquipmentSocket(io as Server, socket);

    socket.on("disconnect", (reason) => {
      console.log(`[socket] Client disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }
  return io;
};

export const emitIssueCreated = (payload: unknown): void => {
  getIO().emit(ISSUE_EVENTS.CREATED, payload);
};

export const emitIssueUpdated = (payload: unknown): void => {
  getIO().emit(ISSUE_EVENTS.UPDATED, payload);
};

export const emitEquipmentUpdated = (payload: unknown): void => {
  getIO().emit(EQUIPMENT_EVENTS.UPDATED, payload);
};

export const emitAppointmentUpdated = (payload: unknown): void => {
  getIO().emit("appointment:updated", payload);
};

export const emitChatMessage = (chatRoomId: string, payload: unknown): void => {
  getIO().to(chatRoomId).emit(CHAT_EVENTS.MESSAGE, payload);
};

