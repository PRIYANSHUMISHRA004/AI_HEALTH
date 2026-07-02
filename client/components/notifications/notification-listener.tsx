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

type EquipmentRequestNewPayload = {
  requestId?: string;
  equipmentName?: string;
  requestingHospitalName?: string;
  owningHospitalId?: string;
  message?: string;
};

type EquipmentRequestResolvedPayload = {
  requestId?: string;
  equipmentName?: string;
  owningHospitalName?: string;
  requestingHospitalId?: string;
  status?: "approved" | "rejected";
  responseMessage?: string;
};

type EquipmentRequestReturnedPayload = {
  requestId?: string;
  equipmentName?: string;
  requestingHospitalName?: string;
  owningHospitalId?: string;
};

export function NotificationListener() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const seenKeysRef = useRef<Set<string>>(new Set());
  const myHospitalId = user?.linkedHospitalId ?? "";

  useEffect(() => {
    seenKeysRef.current.clear();
  }, []);

  const pushNotification = (key: string, payload: Parameters<typeof addNotification>[0]) => {
    if (seenKeysRef.current.has(key)) return;
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

    // Equipment request — owning hospital gets notified when someone requests their equipment
    "equipment:request:new": (payload) => {
      const data = payload as EquipmentRequestNewPayload;
      if (!data?.requestId) return;
      // Only notify the hospital that owns the equipment
      if (!myHospitalId || data.owningHospitalId !== myHospitalId) return;
      pushNotification(`eq-req-new:${data.requestId}`, {
        type: "equipment_request_new",
        title: "Equipment request received",
        description: `${data.requestingHospitalName ?? "Another hospital"} requested "${data.equipmentName ?? "equipment"}". Go to Approvals to respond.`,
      });
    },

    // Equipment returned — owning hospital gets notified when borrower returns equipment
    "equipment:request:returned": (payload) => {
      const data = payload as EquipmentRequestReturnedPayload;
      if (!data?.requestId) return;
      // Only notify the hospital that owns the equipment
      if (!myHospitalId || data.owningHospitalId !== myHospitalId) return;
      pushNotification(`eq-req-returned:${data.requestId}`, {
        type: "equipment_request_new",
        title: "Equipment returned",
        description: `${data.requestingHospitalName ?? "A hospital"} returned "${data.equipmentName ?? "equipment"}". It is now available again.`,
      });
    },

    // Equipment request resolved — requesting hospital gets notified on approve/reject
    "equipment:request:resolved": (payload) => {
      const data = payload as EquipmentRequestResolvedPayload;
      if (!data?.requestId) return;
      // Only notify the hospital that made the request
      if (!myHospitalId || data.requestingHospitalId !== myHospitalId) return;
      const approved = data.status === "approved";
      pushNotification(`eq-req-resolved:${data.requestId}`, {
        type: approved ? "equipment_request_approved" : "equipment_request_rejected",
        title: approved ? "Equipment request approved" : "Equipment request rejected",
        description: approved
          ? `${data.owningHospitalName ?? "A hospital"} approved your request for "${data.equipmentName ?? "equipment"}".${data.responseMessage ? ` Note: ${data.responseMessage}` : ""}`
          : `${data.owningHospitalName ?? "A hospital"} rejected your request for "${data.equipmentName ?? "equipment"}".${data.responseMessage ? ` Reason: ${data.responseMessage}` : ""}`,
      });
    },
  });

  return null;
}
