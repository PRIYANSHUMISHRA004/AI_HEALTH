"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, Loader2, MapPin, Phone, Siren, Stethoscope, X } from "lucide-react";

import { aiService } from "@/services";
import type { EmergencyResponse } from "@/types";
import { getErrorMessage } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";

interface EmergencyLauncherProps {
  compact?: boolean;
}

export function EmergencyLauncher({ compact = false }: EmergencyLauncherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [problemDescription, setProblemDescription] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<EmergencyResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const priorityTone = useMemo(() => {
    const priority = result?.interpretation.priority;
    if (priority === "critical") {
      return "danger" as const;
    }
    if (priority === "high") {
      return "warning" as const;
    }
    return "info" as const;
  }, [result?.interpretation.priority]);

  const resetState = () => {
    setProblemDescription("");
    setLocation("");
    setResult(null);
    setError(null);
    setIsSubmitting(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    resetState();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!problemDescription.trim() || !location.trim()) {
      setError("Please describe the emergency and share the location.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const response = await aiService.emergency({
        problemDescription: problemDescription.trim(),
        location: location.trim(),
      });
      setResult(response);
      toast.success("Emergency options ready", "Nearest support and contacts have been identified.");
    } catch (submitError) {
      const message = getErrorMessage(submitError, "Emergency lookup failed");
      setError(message);
      toast.error("Emergency lookup failed", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          compact
            ? "btn-secondary btn-sm border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "btn-danger btn-md"
        }
      >
        <AlertTriangle className="h-4 w-4" />
        Emergency
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(8,15,12,0.55)] p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[32px] border border-[rgba(255,255,255,0.45)] bg-[rgba(255,255,255,0.98)] p-6 shadow-[0_30px_90px_rgba(8,15,12,0.24)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-600">Rapid triage</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  Emergency mode
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                  Describe the situation and location. We will suggest the best hospital, likely equipment support,
                  and the fastest contact path for the demo.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="icon-button text-[var(--muted)] transition hover:text-[var(--foreground)]"
                aria-label="Close emergency mode"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">Problem description</span>
                  <textarea
                    value={problemDescription}
                    onChange={(event) => setProblemDescription(event.target.value)}
                    rows={5}
                    placeholder="Example: Severe breathing difficulty, patient may need oxygen and urgent ambulance support."
                    className="min-h-[150px] rounded-3xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">Location</span>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Area, city, state or coordinates like 28.6139, 77.2090"
                    className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                  />
                </label>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-danger btn-md"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Siren className="h-4 w-4" />}
                    Find help now
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] p-5">
                {result ? (
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge label={result.interpretation.priority} tone={priorityTone} />
                        {result.interpretation.suggestedDepartment ? (
                          <StatusBadge label={result.interpretation.suggestedDepartment} tone="info" />
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                        {result.interpretation.summary}
                      </p>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Suggested support: {result.interpretation.equipmentHints.join(", ")}
                      </p>
                    </div>

                    {result.bestHospital ? (
                      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Best hospital
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                          {result.bestHospital.name}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--muted)]">{result.bestHospital.matchReason}</p>
                        <div className="mt-3 grid gap-2 text-sm text-[var(--foreground)]">
                          <p className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-emerald-700" />
                            <span>
                              {result.bestHospital.address}, {result.bestHospital.city}, {result.bestHospital.state}
                            </span>
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-700" />
                            <span>
                              {result.bestHospital.contactNumber} / {result.bestHospital.emergencyContact}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                          Best equipment
                        </p>
                        {result.bestEquipment ? (
                          <>
                            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                              {result.bestEquipment.name}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              {result.bestEquipment.type} • {result.bestEquipment.hospitalSection}
                            </p>
                            <p className="mt-2 text-sm text-[var(--foreground)]">
                              {result.bestEquipment.hospital.name}, {result.bestEquipment.hospital.city}
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            No exact equipment match found, but nearby hospitals can still coordinate support.
                          </p>
                        )}
                      </div>

                      <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                          Best ambulance
                        </p>
                        {result.bestAmbulance ? (
                          <>
                            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">
                              {result.bestAmbulance.vehicleNumber}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                              Driver: {result.bestAmbulance.driverName}
                            </p>
                            <p className="mt-2 text-sm text-[var(--foreground)]">
                              {result.bestAmbulance.contactNumber}
                            </p>
                          </>
                        ) : (
                          <p className="mt-2 text-sm text-[var(--muted)]">
                            No active ambulance is currently available in the shortlist.
                          </p>
                        )}
                      </div>
                    </div>

                    {result.nearbyHospitals.length ? (
                      <div className="rounded-[24px] border border-[var(--border)] bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
                          Nearby options
                        </p>
                        <div className="mt-3 grid gap-3">
                          {result.nearbyHospitals.map((hospital) => (
                            <div
                              key={hospital.id}
                              className="rounded-2xl border border-[var(--border)] bg-[rgba(16,35,27,0.03)] px-4 py-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-[var(--foreground)]">{hospital.name}</p>
                                  <p className="text-sm text-[var(--muted)]">{hospital.matchReason}</p>
                                </div>
                                <StatusBadge
                                  label={hospital.availabilityStatus}
                                  tone={hospital.availabilityStatus === "free" ? "success" : "warning"}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[340px] flex-col justify-center rounded-[24px] border border-dashed border-[var(--border)] bg-white/80 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">Fast emergency guidance</h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Submit the problem and location to get the best hospital recommendation, likely equipment
                      support, and direct contact details.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
