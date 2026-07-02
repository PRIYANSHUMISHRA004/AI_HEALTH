"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, CheckCircle2, Clock,
  Layers, Loader2, MapPin, Package, Phone, SendHorizonal, Tag,
} from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { equipmentRequestService, equipmentService } from "@/services";
import { getErrorMessage, cn } from "@/lib/utils";
import type { Equipment } from "@/types";

const statusStyles: Record<string, { badge: string; banner: string; text: string }> = {
  available: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    banner: "border-emerald-200 bg-emerald-50",
    text: "text-emerald-700",
  },
  "in-use": {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    banner: "border-amber-200 bg-amber-50",
    text: "text-amber-700",
  },
  maintenance: {
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    banner: "border-rose-200 bg-rose-50",
    text: "text-rose-700",
  },
};

const statusDescriptions: Record<string, string> = {
  available: "This equipment is available and can be requested.",
  "in-use": "Currently in active use — you can still send a request.",
  maintenance: "Under maintenance — you can still send a request for future availability.",
};

type HospitalInfo = {
  _id?: string;
  name?: string;
  city?: string;
  state?: string;
  contactNumber?: string;
  emergencyContact?: string;
};

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const toast = useToast();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [requested, setRequested] = useState(false);

  const myHospitalId = user?.linkedHospitalId ?? "";

  useEffect(() => {
    if (!id) return;
    void load();
  }, [id]);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await equipmentService.getById(id);
      setEquipment(data);
    } catch (err) {
      toast.error("Not found", getErrorMessage(err, "Equipment not found."));
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const getHospital = (): HospitalInfo => {
    if (!equipment) return {};
    if (typeof equipment.hospitalId === "object" && equipment.hospitalId) {
      return equipment.hospitalId as HospitalInfo;
    }
    return {};
  };

  const getEquipmentHospitalId = (): string => {
    if (!equipment) return "";
    if (typeof equipment.hospitalId === "string") return equipment.hospitalId;
    return (equipment.hospitalId as HospitalInfo)?._id ?? "";
  };

  const handleRequest = async () => {
    if (!equipment || !token || !myHospitalId) return;
    const own = getEquipmentHospitalId() === myHospitalId;
    setIsSending(true);
    try {
      await equipmentRequestService.create(
        { equipmentId: equipment._id, requestingHospitalId: myHospitalId, message: message.trim() || undefined },
        token
      );
      setRequested(true);
      if (own) {
        setEquipment((prev) => prev ? { ...prev, status: "in-use" } : prev);
        toast.success("Marked in use", `"${equipment.name}" is now marked as in-use. Return it from the Borrowed Equipment section.`);
      } else {
        toast.success("Request sent!", `Your request for "${equipment.name}" has been sent to ${hospital.name ?? "the hospital"}.`);
      }
    } catch (err) {
      toast.error("Request failed", getErrorMessage(err, "Could not send request."));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!equipment) return null;

  const hospital = getHospital();
  const equipmentHospitalId = getEquipmentHospitalId();
  const isOwn = !!equipmentHospitalId && equipmentHospitalId === myHospitalId;
  const canRequest = !!token && !!myHospitalId;
  const style = statusStyles[equipment.status] ?? statusStyles.available;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Card */}
      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white shadow-sm">

        {/* Header */}
        <div className="bg-[linear-gradient(135deg,#0f766e,#134e4a)] px-7 py-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Package className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">Equipment</p>
                <h1 className="mt-1 text-2xl font-semibold">{equipment.name}</h1>
              </div>
            </div>
            <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold capitalize shrink-0", style.badge)}>
              {equipment.status.replace("-", " ")}
            </span>
          </div>
          <div className={cn("mt-4 rounded-2xl border px-4 py-2.5", style.banner)}>
            <p className={cn("text-sm", style.text)}>{statusDescriptions[equipment.status]}</p>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">

          {/* Equipment details */}
          <div className="px-7 py-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Equipment details</p>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Tag className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                <span className="text-[var(--muted)]">Type</span>
                <span className="ml-auto font-medium text-[var(--foreground)]">{equipment.type}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Layers className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                <span className="text-[var(--muted)]">Section</span>
                <span className="ml-auto font-medium text-[var(--foreground)]">{equipment.hospitalSection}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                <span className="text-[var(--muted)]">Added</span>
                <span className="ml-auto font-medium text-[var(--foreground)]">
                  {new Date(equipment.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital / owner section */}
          <div className="px-7 py-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              {isOwn ? "Your hospital's equipment" : "Request will be sent to"}
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary-soft)]">
                  <Building2 className="h-4 w-4 text-[var(--primary)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {hospital.name ?? "Unknown Hospital"}
                    {isOwn && (
                      <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                        Your hospital
                      </span>
                    )}
                  </p>
                  {(hospital.city || hospital.state) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                      <MapPin className="h-3 w-3" />
                      {[hospital.city, hospital.state].filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
              </div>
              {hospital.contactNumber && (
                <div className="flex items-center gap-2 text-sm border-t border-[var(--border)] pt-3">
                  <Phone className="h-4 w-4 text-[var(--muted)]" />
                  <span className="text-[var(--muted)]">Contact:</span>
                  <a href={`tel:${hospital.contactNumber}`} className="font-medium text-[var(--primary)] hover:underline">
                    {hospital.contactNumber}
                  </a>
                </div>
              )}
              {hospital.emergencyContact && hospital.emergencyContact !== hospital.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-rose-400" />
                  <span className="text-[var(--muted)]">Emergency:</span>
                  <a href={`tel:${hospital.emergencyContact}`} className="font-medium text-rose-600 hover:underline">
                    {hospital.emergencyContact}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Request section */}
          <div className="px-7 py-5">
            {requested ? (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-800">
                    {isOwn ? "Marked as in use" : `Request sent to ${hospital.name ?? "the hospital"}`}
                  </p>
                  <p className="mt-0.5 text-sm text-emerald-700">
                    {isOwn
                      ? "Equipment is now marked in-use. Go to Borrowed Equipment to return it when done."
                      : "They will review it and respond. You'll get a notification when approved or rejected."}
                  </p>
                </div>
              </div>
            ) : canRequest ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  {isOwn ? "Mark as in use" : "Send a request"}
                </p>
                {isOwn && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    This is your hospital's equipment — request will be auto-approved and equipment marked in-use immediately.
                  </p>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder={isOwn ? "Add a note about internal use (optional)..." : `Tell ${hospital.name ?? "the hospital"} why you need this equipment...`}
                  className="w-full resize-none rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={handleRequest}
                  disabled={isSending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-70"
                >
                  {isSending
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <SendHorizonal className="h-4 w-4" />}
                  {isSending ? "Processing..." : isOwn ? "Mark in use" : `Request from ${hospital.name ?? "this hospital"}`}
                </button>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">Login as a hospital admin with a linked hospital to request equipment.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
