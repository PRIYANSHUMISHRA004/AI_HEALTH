"use client";

import { useEffect, useRef } from "react";

import { useAuth, useNotifications, useSocketEvents } from "@/hooks";
import type { Appointment, Equipment, Issue } from "@/types";

type ChatNotificationPayload = {
  id?: string;
  sender?: { _id?: string; name?: string };
  senderRole?: string;
  message?: string;
};

export function NotificationListener() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const seenKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenKeysRef.current.clear();
  }, []);

  const pushNotification = (key: string, payload: Parameters<typeof addNotification>[0]) => {
    if (seenKeysRef.current.has(key)) {
      return;
    }

    seenKeysRef.current.add(key);
    addNotification(payload);

    if (seenKeysRef.current.size > 50) {
      const next = Array.from(seenKeysRef.current).slice(-30);
      seenKeysRef.current = new Set(next);
    }
  };

  useSocketEvents({
    "issue:created": (payload) => {
      const issue = payload as Issue;
      if (!issue?._id) return;

      pushNotification(`issue-created:${issue._id}`, {
        type: "new_issue",
        title: "New issue reported",
        description: issue.title || "A new issue was added to the network.",
      });
    },
    "issue:updated": (payload) => {
      const issue = payload as Issue;
      if (!issue?._id || issue.status !== "resolved") return;

      pushNotification(`issue-resolved:${issue._id}:${issue.updatedAt}`, {
        type: "issue_resolved",
        title: "Issue resolved",
        description: issue.title || "An issue was marked resolved.",
      });
    },
    "appointment:updated": (payload) => {
      const appointment = payload as Appointment;
      if (!appointment?._id) return;

      const isLikelyNewAppointment = appointment.status === "pending";
      if (!isLikelyNewAppointment) return;

      pushNotification(`appointment:${appointment._id}:${appointment.updatedAt}`, {
        type: "new_appointment",
        title: "New appointment",
        description: appointment.caseSummary || "A new appointment request was created.",
      });
    },
    "equipment:updated": (payload) => {
      const equipment = payload as Equipment;
      if (!equipment?._id) return;

      pushNotification(`equipment:${equipment._id}:${equipment.updatedAt}`, {
        type: "equipment_update",
        title: "Equipment updated",
        description: `${equipment.name} is now ${equipment.status.replace("-", " ")}.`,
      });
    },
    "chat:message": (payload) => {
      const message = payload as ChatNotificationPayload;
      if (!message?.id) return;
      if (message.sender?._id && message.sender._id === user?.id) return;

      pushNotification(`chat:${message.id}`, {
        type: "chat_message",
        title: "New chat message",
        description: message.message || `A new message arrived from ${message.sender?.name || message.senderRole || "chat"}.`,
      });
    },
  });

  return null;
}
