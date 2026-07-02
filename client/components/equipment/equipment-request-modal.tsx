"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Building2, CheckCircle2, Loader2, Package, Search, X } from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { equipmentRequestService, equipmentService } from "@/services";
import { getErrorMessage, cn } from "@/lib/utils";
import type { Equipment } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

const statusStyles: Record<string, string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "in-use": "border-amber-200 bg-amber-50 text-amber-700",
  maintenance: "border-rose-200 bg-rose-50 text-rose-700",
};

export function EquipmentRequestModal({ open, onClose }: Props) {
  const { token, user } = useAuth();
  const toast = useToast();
  const myHospitalId = user?.linkedHospitalId ?? "";

  const [search, setSearch] = useState("");
  const [allItems, setAllItems] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSelectedItem(null);
    setMessage("");
    setSearch("");
    void loadAll();
  }, [open]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      // Load all available equipment across all hospitals
      const res = await equipmentService.list({ status: "available", limit: 100 });
      setAllItems(res.data);
    } catch {
      toast.error("Failed to load", "Could not fetch equipment.");
    } finally {
      setIsLoading(false);
    }
  };

  const getItemHospitalId = (item: Equipment): string => {
    if (typeof item.hospitalId === "string") return item.hospitalId;
    return (item.hospitalId as { _id?: string })?._id ?? "";
  };

  const getItemHospitalName = (item: Equipment): string => {
    if (typeof item.hospitalId === "object" && item.hospitalId) {
      return (item.hospitalId as { name?: string }).name ?? "Another Hospital";
    }
    return "Another Hospital";
  };

  const handleSend = async () => {
    if (!selectedItem || !token || !myHospitalId) return;
    setIsSending(true);
    try {
      await equipmentRequestService.create(
        { equipmentId: selectedItem._id, requestingHospitalId: myHospitalId, message: message.trim() || undefined },
        token
      );
      setSentIds((prev) => new Set(prev).add(selectedItem._id));
      toast.success("Request sent", `Your request for "${selectedItem.name}" has been sent.`);
      setSelectedItem(null);
      setMessage("");
    } catch (err) {
      toast.error("Request failed", getErrorMessage(err, "Could not send request."));
    } finally {
      setIsSending(false);
    }
  };

  const filtered = allItems.filter((e) =>
    search.trim() === "" ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.type.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-[32px] border border-[var(--border)] bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              {selectedItem ? "Send Request" : "Browse Equipment"}
            </h2>
            <p className="text-sm text-[var(--muted)]">
              {selectedItem ? `Requesting: ${selectedItem.name}` : "All available equipment across the network"}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[var(--muted)] hover:bg-[rgba(16,35,27,0.06)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {!selectedItem ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or type..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto h-10 w-10 text-[var(--muted)]" />
                  <p className="mt-3 text-sm text-[var(--muted)]">No available equipment found</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filtered.map((item) => {
                    const itemHospitalId = getItemHospitalId(item);
                    const isOwn = itemHospitalId === myHospitalId;
                    const alreadySent = sentIds.has(item._id);
                    const hospitalName = getItemHospitalName(item);

                    return (
                      <div
                        key={item._id}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border p-4 transition",
                          isOwn
                            ? "border-[var(--border)] bg-[var(--background)] opacity-60"
                            : "cursor-pointer border-[var(--border)] bg-white hover:border-[var(--primary)] hover:shadow-sm"
                        )}
                        onClick={() => { if (!isOwn && !alreadySent) setSelectedItem(item); }}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[var(--foreground)] truncate">{item.name}</p>
                            {isOwn && (
                              <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-semibold text-teal-700">
                                Your hospital
                              </span>
                            )}
                            {alreadySent && (
                              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Requested
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-sm text-[var(--muted)]">{item.type} · {item.hospitalSection}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            <Building2 className="h-3 w-3" />
                            {isOwn ? "Your hospital" : hospitalName}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 ml-3">
                          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", statusStyles[item.status] ?? "")}>
                            {item.status.replace("-", " ")}
                          </span>
                          {!isOwn && !alreadySent && (
                            <ArrowRight className="h-4 w-4 text-[var(--muted)]" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Confirm request */
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => { setSelectedItem(null); setMessage(""); }}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                ← Back to list
              </button>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-2">
                <p className="font-semibold text-[var(--foreground)]">{selectedItem.name}</p>
                <p className="text-sm text-[var(--muted)]">{selectedItem.type} · {selectedItem.hospitalSection}</p>
                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <Building2 className="h-3 w-3" />
                  {getItemHospitalName(selectedItem)}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">
                  Message <span className="font-normal text-[var(--muted)]">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Explain why you need this equipment..."
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-70"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSending ? "Sending..." : "Send Request"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
