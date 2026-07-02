"use client";

import { useEffect, useState } from "react";
import {
  Building2, CheckCircle2, Loader2, MapPin, PencilLine, Phone, Save, Search, User, X,
} from "lucide-react";

import { useAuth, useToast } from "@/hooks";
import { authService } from "@/services/auth.service";
import { hospitalService } from "@/services/hospital.service";
import { getErrorMessage } from "@/lib/utils";
import type { Hospital } from "@/types";

export default function ProfilePage() {
  const { token, user, updateUser } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  // Hospital search / change
  const [linkedHospital, setLinkedHospital] = useState<Hospital | null>(null);
  const [isLoadingHospital, setIsLoadingHospital] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [hospitalResults, setHospitalResults] = useState<Hospital[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingHospitalId, setPendingHospitalId] = useState<string | null | undefined>(undefined);
  // undefined = unchanged, null = clear, string = new id

  // Load linked hospital details on mount
  useEffect(() => {
    const id = user?.linkedHospitalId;
    if (!id) return;
    setIsLoadingHospital(true);
    hospitalService.getById(id)
      .then((h) => setLinkedHospital(h))
      .catch(() => {})
      .finally(() => setIsLoadingHospital(false));
  }, [user?.linkedHospitalId]);

  // Reset form when leaving edit mode
  const cancelEdit = () => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setPendingHospitalId(undefined);
    setHospitalSearch("");
    setHospitalResults([]);
    setEditing(false);
  };

  const searchHospitals = async (query: string) => {
    if (!query.trim()) { setHospitalResults([]); return; }
    setIsSearching(true);
    try {
      const res = await hospitalService.list({ limit: 6 });
      const q = query.toLowerCase();
      setHospitalResults(res.data.filter((h) => h.name.toLowerCase().includes(q)));
    } catch {
      setHospitalResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHospitalSearchChange = (value: string) => {
    setHospitalSearch(value);
    void searchHospitals(value);
  };

  const selectHospital = (h: Hospital) => {
    setPendingHospitalId(h._id);
    setLinkedHospital(h);
    setHospitalSearch("");
    setHospitalResults([]);
  };

  const clearHospital = () => {
    setPendingHospitalId(null);
    setLinkedHospital(null);
    setHospitalSearch("");
    setHospitalResults([]);
  };

  const handleSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
      const payload: { name?: string; phone?: string; linkedHospitalId?: string } = {};
      if (name.trim() !== user?.name) payload.name = name.trim();
      if (phone.trim() !== user?.phone) payload.phone = phone.trim();
      if (pendingHospitalId !== undefined) {
        payload.linkedHospitalId = pendingHospitalId ?? "";
      }

      if (Object.keys(payload).length === 0) {
        setEditing(false);
        return;
      }

      const updated = await authService.updateProfile(payload, token);
      updateUser(updated);
      toast.success("Profile updated", "Your profile has been saved.");
      setEditing(false);
      setPendingHospitalId(undefined);
    } catch (err) {
      toast.error("Save failed", getErrorMessage(err, "Could not update profile."));
    } finally {
      setIsSaving(false);
    }
  };

  const displayHospital = linkedHospital;
  const displayHospitalId = pendingHospitalId !== undefined
    ? (pendingHospitalId ?? "")
    : (user?.linkedHospitalId ?? "");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">Account</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">My Profile</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Manage your personal info and linked hospital.</p>
      </div>

      {/* Profile card */}
      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white shadow-sm">

        {/* Avatar + name row */}
        <div className="bg-[linear-gradient(135deg,#0f766e,#134e4a)] px-7 py-8">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold text-white">
              {(user?.name ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-teal-100/80">{user?.email}</p>
              <span className="mt-1 inline-flex rounded-full border border-teal-300/40 bg-teal-400/20 px-2.5 py-0.5 text-xs font-medium text-teal-100 capitalize">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">

          {/* Personal info */}
          <div className="px-7 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Personal info</p>
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[rgba(16,35,27,0.04)]"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                  <User className="h-3.5 w-3.5" /> Full name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[var(--foreground)]">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                ) : (
                  <p className="text-sm font-medium text-[var(--foreground)]">{user?.phone || "—"}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 text-xs font-medium text-[var(--muted)]">Email</label>
                <p className="text-sm text-[var(--muted)]">{user?.email} <span className="text-xs">(cannot be changed)</span></p>
              </div>
            </div>
          </div>

          {/* Linked hospital */}
          <div className="px-7 py-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">Linked hospital</p>

            {isLoadingHospital ? (
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading hospital info…
              </div>
            ) : displayHospital ? (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 border border-teal-200">
                      <Building2 className="h-4 w-4 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{displayHospital.name}</p>
                      {(displayHospital.city || displayHospital.state) && (
                        <p className="flex items-center gap-1 text-xs text-[var(--muted)] mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {[displayHospital.city, displayHospital.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {editing && (
                    <button
                      type="button"
                      onClick={clearHospital}
                      className="shrink-0 rounded-full p-1.5 text-[var(--muted)] transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {displayHospital.contactNumber && (
                  <p className="flex items-center gap-2 text-xs text-[var(--muted)] border-t border-[var(--border)] pt-2">
                    <Phone className="h-3 w-3" />
                    {displayHospital.contactNumber}
                  </p>
                )}
                <p className="text-xs text-[var(--muted)]">
                  ID: <span className="font-mono">{displayHospitalId}</span>
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-5 text-center">
                <Building2 className="mx-auto h-8 w-8 text-[var(--muted)]" />
                <p className="mt-2 text-sm font-medium text-[var(--foreground)]">No hospital linked</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Search and link a hospital below.</p>
              </div>
            )}

            {/* Hospital search (edit mode only) */}
            {editing && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--muted)]">Search to change hospital</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={hospitalSearch}
                    onChange={(e) => handleHospitalSearchChange(e.target.value)}
                    placeholder="Type hospital name…"
                    className="w-full rounded-2xl border border-[var(--border)] bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-[var(--primary)]"
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--muted)]" />
                  )}
                </div>
                {hospitalResults.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-md">
                    {hospitalResults.map((h) => (
                      <button
                        key={h._id}
                        type="button"
                        onClick={() => selectHospital(h)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-[rgba(16,35,27,0.04)] border-b border-[var(--border)] last:border-0"
                      >
                        <Building2 className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{h.name}</p>
                          {(h.city || h.state) && (
                            <p className="text-xs text-[var(--muted)]">{[h.city, h.state].filter(Boolean).join(", ")}</p>
                          )}
                        </div>
                        <CheckCircle2 className="ml-auto h-4 w-4 text-teal-500 opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save / cancel bar */}
          {editing && (
            <div className="flex items-center justify-end gap-3 px-7 py-4">
              <button
                type="button"
                onClick={cancelEdit}
                disabled={isSaving}
                className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[rgba(16,35,27,0.04)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)] disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
