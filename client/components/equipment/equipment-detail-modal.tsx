"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Loader2, MapPin, Package, Phone, X } from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { equipmentRequestService } from "@/services";
import { getErrorMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SemanticEquipmentSearchResult } from "@/services/equipment.service";

interface Props {
  result: SemanticEquipmentSearchResult | null;
  onClose: () => void;
}

type SearchHospital = {
  _id?: string;
  name: string;
  city?: string;
  state?: string;
  contactNumber?: string;
  availabilityStatus?: "free" | "busy";
};

const statusStyles: Record<string, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "in-use": "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusDescriptions: Record<string, string> = {
  available: "This equipment is available and can be requested.",
  "in-use": "This equipment is currently in use and cannot be requested.",
  maintenance: "This equipment is under maintenance and cannot be requested.",
};

export function EquipmentDetailModal({ result, onClose }: Props) {
  const { token, user } = useAuth();
  const toast = useToast();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requested, setRequested] = useState(false);

  if (!result) return null;

  const equipment = result.equipment;
  const hospital = equipment.hospitalId as string | SearchHospital | undefined;
  const hospitalName = !hospital ? "Unknown Hospital"
    : typeof hospital === "string" ? "Linked Hospital"
    : hospital.name;
  const hospitalCity = typeof hospital === "object" && hospital ? hospital.city ?? "" : "";
  const hospitalState = typeof hospital === "object" && hospital ? hospital.state ?? "" : "";
  const hospitalContact = typeof hospital === "object" && hospital ? hospital.contactNumber ?? "" : "";
  const hospitalId = typeof hospital === "object" && hospital ? hospital._id ?? "" : typeof hospital === "string" ? hospital : "";

  const myHospitalId = user?.linkedHospitalId ?? "";
  const isOwnHospital = hospitalId === myHospitalId;
  const canRequest = equipment.status === "available" && !isOwnHospital && !!token && !!myHospitalId;

  const handleRequest = async () => {
    if (!canRequest || !token) return;
    setIsSending(true);
    try {
      await equipmentRequestService.create(
        {
          equipmentId: equipment._id,
          requestingHospitalId: myHospitalId,
          message: message.trim() || undefined,
        },
        token
      );
      setRequested(true);
      toast.success("Request sent!", `Your request for "${equipment.name}" has been sent to ${hospitalName}.`);
    } catch (err) {
      toast.error("Request failed", getErrorMessage(err, "Could not send request."));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-[32px] border border-[var(--border)] bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)]">
              <Package className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{equipment.name}</h2>
              <p className="text-sm text-[var(--muted)]">{equipment.type}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[rgba(16,35,27,0.06)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Status banner */}
          <div className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3", statusStyles[equipment.status] ?? "border-[var(--border)] bg-white")}>
            <span className="text-sm font-semibold capitalize">{equipment.status.replace("-", " ")}</span>
            <span className="text-sm opacity-80">— {statusDescriptions[equipment.status]}</span>
          </div>

          {/* Details grid */}
          <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-[var(--muted)]" />
              <span className="font-medium text-[var(--foreground)]">{hospitalName}</span>
              {isOwnHospital && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">Your Hospital</span>}
            </div>
            {(hospitalCity || hospitalState) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-[var(--muted)]" />
                <span className="text-[var(--muted)]">{[hospitalCity, hospitalState].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {hospitalContact && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-[var(--muted)]" />
                <a href={`tel:${hospitalContact}`} className="text-[var(--primary)] hover:underline">{hospitalContact}</a>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--muted)]">Section:</span>
              <span className="font-medium text-[var(--foreground)]">{equipment.hospitalSection}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--muted)]">Semantic match:</span>
              <span className="font-medium text-[var(--foreground)]">{(result.similarity * 100).toFixed(1)}%</span>
            </div>
          </div>

          {/* Request section */}
          {requested ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Request sent successfully</p>
                <p className="text-xs text-emerald-700 mt-0.5">The hospital will review and respond to your request.</p>
              </div>
            </div>
          ) : canRequest ? (
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                  Message <span className="font-normal text-[var(--muted)]">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Describe why you need this equipment..."
                  className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                />
              </div>
              <button
                type="button"
                onClick={handleRequest}
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-70"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSending ? "Sending request..." : "Send Request"}
              </button>
            </div>
          ) : !token || !myHospitalId ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You need to be logged in as a hospital admin with a linked hospital to request equipment.
            </p>
          ) : isOwnHospital ? (
            <p className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
              This equipment belongs to your hospital.
            </p>
          ) : (
            <p className="rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]">
              Equipment is not available for request at this time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
