"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, XCircle, X, RefreshCw } from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { equipmentRequestService, type EquipmentRequestRecord } from "@/services";
import { getErrorMessage } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = "incoming" | "outgoing";

const statusStyles: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "approved") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "rejected") return <XCircle className="h-4 w-4 text-rose-600" />;
  return <Clock className="h-4 w-4 text-amber-600" />;
};

export function EquipmentApprovalsModal({ open, onClose }: Props) {
  const { token, user } = useAuth();
  const toast = useToast();
  const hospitalId = user?.linkedHospitalId ?? "";

  const [tab, setTab] = useState<Tab>("incoming");
  const [incoming, setIncoming] = useState<EquipmentRequestRecord[]>([]);
  const [outgoing, setOutgoing] = useState<EquipmentRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [responseMessages, setResponseMessages] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!token || !hospitalId) return;
    setIsLoading(true);
    try {
      const [inc, out] = await Promise.all([
        equipmentRequestService.incoming(hospitalId, token),
        equipmentRequestService.outgoing(hospitalId, token),
      ]);
      setIncoming(inc as EquipmentRequestRecord[]);
      setOutgoing(out as EquipmentRequestRecord[]);
    } catch {
      toast.error("Failed to load", "Could not fetch equipment requests.");
    } finally {
      setIsLoading(false);
    }
  }, [token, hospitalId]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionId(id);
    try {
      await equipmentRequestService.approve(id, hospitalId, responseMessages[id], token);
      toast.success("Request approved", "The requesting hospital has been notified.");
      void load();
    } catch (err) {
      toast.error("Failed", getErrorMessage(err, "Could not approve request."));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setActionId(id);
    try {
      await equipmentRequestService.reject(id, hospitalId, responseMessages[id], token);
      toast.success("Request rejected", "The requesting hospital has been notified.");
      void load();
    } catch (err) {
      toast.error("Failed", getErrorMessage(err, "Could not reject request."));
    } finally {
      setActionId(null);
    }
  };

  if (!open) return null;

  const pendingCount = incoming.filter((r) => r.status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[32px] border border-[var(--border)] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Equipment Requests</h2>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--muted)]">Manage incoming and outgoing equipment requests</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void load()} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[rgba(16,35,27,0.06)]">
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </button>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[rgba(16,35,27,0.06)]">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-6">
          {(["incoming", "outgoing"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-4 py-3 text-sm font-medium transition capitalize",
                tab === t
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {t}
              {t === "incoming" && incoming.length > 0 && (
                <span className="ml-2 rounded-full bg-[var(--border)] px-2 py-0.5 text-xs">{incoming.length}</span>
              )}
              {t === "outgoing" && outgoing.length > 0 && (
                <span className="ml-2 rounded-full bg-[var(--border)] px-2 py-0.5 text-xs">{outgoing.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[55vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
            </div>
          ) : tab === "incoming" ? (
            incoming.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--muted)]">No incoming requests</p>
            ) : (
              <div className="space-y-3">
                {incoming.map((req) => (
                  <div key={req._id} className="rounded-2xl border border-[var(--border)] bg-white p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{req.equipmentName}</p>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          Requested by <span className="font-medium text-[var(--foreground)]">{req.requestingHospitalName}</span>
                        </p>
                        {req.message && (
                          <p className="mt-1 text-sm italic text-[var(--muted)]">"{req.message}"</p>
                        )}
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize", statusStyles[req.status])}>
                        <StatusIcon status={req.status} />
                        {req.status}
                      </span>
                    </div>

                    {req.status === "pending" && (
                      <div className="space-y-2 pt-1 border-t border-[var(--border)]">
                        <input
                          value={responseMessages[req._id] ?? ""}
                          onChange={(e) => setResponseMessages((prev) => ({ ...prev, [req._id]: e.target.value }))}
                          placeholder="Optional response message..."
                          className="w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--primary)]"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => void handleApprove(req._id)}
                            disabled={actionId === req._id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            {actionId === req._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleReject(req._id)}
                            disabled={actionId === req._id}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                          >
                            {actionId === req._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {req.responseMessage && (
                      <p className="text-xs text-[var(--muted)] border-t border-[var(--border)] pt-2">
                        Response: "{req.responseMessage}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            outgoing.length === 0 ? (
              <p className="py-12 text-center text-sm text-[var(--muted)]">No outgoing requests</p>
            ) : (
              <div className="space-y-3">
                {outgoing.map((req) => (
                  <div key={req._id} className="rounded-2xl border border-[var(--border)] bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{req.equipmentName}</p>
                        <p className="mt-0.5 text-sm text-[var(--muted)]">
                          From <span className="font-medium text-[var(--foreground)]">{req.owningHospitalName}</span>
                        </p>
                        {req.message && (
                          <p className="mt-1 text-sm italic text-[var(--muted)]">"{req.message}"</p>
                        )}
                        {req.responseMessage && (
                          <p className="mt-1 text-xs text-[var(--muted)]">Their reply: "{req.responseMessage}"</p>
                        )}
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize", statusStyles[req.status])}>
                        <StatusIcon status={req.status} />
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
