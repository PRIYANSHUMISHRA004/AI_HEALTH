"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Loader2, Package, RefreshCw, RotateCcw } from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { equipmentRequestService, type EquipmentRequestRecord } from "@/services";
import { getErrorMessage } from "@/lib/utils";

export function BorrowedEquipmentSection() {
  const { token, user } = useAuth();
  const toast = useToast();
  const hospitalId = user?.linkedHospitalId ?? "";

  const [items, setItems] = useState<EquipmentRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [returningId, setReturningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !hospitalId) return;
    setIsLoading(true);
    try {
      const data = await equipmentRequestService.borrowed(hospitalId, token);
      setItems(data as EquipmentRequestRecord[]);
    } catch {
      // silently fail — section just stays empty
    } finally {
      setIsLoading(false);
    }
  }, [token, hospitalId]);

  useEffect(() => { void load(); }, [load]);

  const handleReturn = async (item: EquipmentRequestRecord) => {
    if (!token || !hospitalId) return;
    if (!window.confirm(`Return "${item.equipmentName}" to ${item.owningHospitalName}?`)) return;

    setReturningId(item._id);
    try {
      await equipmentRequestService.returnEquipment(item._id, hospitalId, token);
      toast.success("Returned", `"${item.equipmentName}" has been returned to ${item.owningHospitalName}.`);
      setItems((prev) => prev.filter((r) => r._id !== item._id));
    } catch (err) {
      toast.error("Return failed", getErrorMessage(err, "Could not return equipment."));
    } finally {
      setReturningId(null);
    }
  };

  if (!hospitalId) return null;

  return (
    <section className="rounded-[30px] border border-[var(--border)] bg-white/92 shadow-[0_20px_50px_rgba(16,35,27,0.06)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Borrowed Equipment</h2>
          <p className="text-sm text-[var(--muted)]">
            Equipment currently borrowed from other hospitals. Return when done.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-xl p-2 text-[var(--muted)] transition hover:bg-[rgba(16,35,27,0.06)]"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <Package className="h-8 w-8 text-[var(--muted)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No borrowed equipment</p>
          <p className="text-xs text-[var(--muted)]">Approved requests will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {items.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
                  <Package className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--foreground)] truncate">{item.equipmentName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-[var(--muted)]">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">From: {item.owningHospitalName}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Approved {new Date(item.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleReturn(item)}
                disabled={returningId === item._id}
                className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-60"
              >
                {returningId === item._id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <RotateCcw className="h-3.5 w-3.5" />}
                Return
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
