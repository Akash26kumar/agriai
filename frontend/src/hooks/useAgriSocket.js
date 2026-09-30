"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export function useAgriSocket() {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [agentStatus, setAgentStatus] = useState({ stage: "idle", label: "Ready" });
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create socket once
    const socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    // ---- Connection ----
    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setAgentStatus({ stage: "idle", label: "Disconnected" });
    });

    socket.on("connect_error", () => {
      setIsConnected(false);
      setError("Cannot reach backend. Make sure the server is running on port 5000.");
    });

    // ---- Server events ----
    socket.on("connected", (data) => {
      setSocketId(data.socketId);
    });

    socket.on("agent:status", (data) => {
      setAgentStatus({ stage: data.stage, label: data.label });
    });

    socket.on("agent:reply", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          role: "assistant",
          content: data.content,
          timestamp: data.timestamp,
        },
      ]);
      setAgentStatus({ stage: "idle", label: "Ready" });
    });

    socket.on("agent:error", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "error",
          content: data.message || "Something went wrong.",
          timestamp: new Date().toISOString(),
        },
      ]);
      setAgentStatus({ stage: "idle", label: "Ready" });
    });

    socket.on("chat:cleared", () => {
      setMessages([]);
      setAgentStatus({ stage: "idle", label: "Ready" });
    });

    return () => {
      // Clean up ALL listeners before destroying
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("connected");
      socket.off("agent:status");
      socket.off("agent:reply");
      socket.off("agent:error");
      socket.off("chat:cleared");
      socket.disconnect();
    };
  }, []);

  const sendMessage = useCallback((message, location = "") => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) {
      setError("Not connected to backend.");
      return;
    }
    if (!message || !message.trim()) return;

    // Add user message to local state immediately
    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: message.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);

    setAgentStatus({ stage: "thinking", label: "Analyzing agricultural query..." });
    setError(null);

    // Emit to backend using exact event name and payload shape
    socket.emit("chat:message", {
      message: message.trim(),
      location: location || undefined,
    });
  }, []);

  const clearChat = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;
    socket.emit("chat:clear");
  }, []);

  const isThinking = agentStatus.stage !== "idle";

  return {
    isConnected,
    socketId,
    agentStatus,
    messages,
    error,
    isThinking,
    sendMessage,
    clearChat,
  };
}
