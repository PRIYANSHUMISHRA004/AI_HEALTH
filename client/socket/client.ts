"use client";

import { io, type Socket } from "socket.io-client";

import { getApiOrigin } from "@/lib/api";

let socketInstance: Socket | null = null;

function getSocketUrl() {
  try {
    return getApiOrigin();
  } catch {
    return null;
  }
}

export function getSocketClient() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!socketInstance) {
    const socketUrl = getSocketUrl();

    if (!socketUrl) {
      return null;
    }

    socketInstance = io(socketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: false,
    });
  }

  return socketInstance;
}

export function connectSocket() {
  const socket = getSocketClient();

  if (socket && !socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (socketInstance?.connected) {
    socketInstance.disconnect();
  }
}

export type AppSocket = Socket;
