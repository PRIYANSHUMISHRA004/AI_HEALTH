"use client";

import { memo, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { getErrorMessage } from "@/lib/utils";
import { searchService } from "@/services/search.service";
import type {
  GlobalSearchDoctorResult,
  GlobalSearchEquipmentResult,
  GlobalSearchHospitalResult,
  GlobalSearchResponse,
  GlobalSearchShopResult,
} from "@/types";

interface GlobalSearchProps {
  compact?: boolean;
}

const MIN_QUERY_LENGTH = 2;

const getHospitalLink = (hospital: GlobalSearchHospitalResult) =>
  hospital._id ? `/hospitals/${hospital._id}` : "/hospitals";

const getDoctorHospitalName = (doctor: GlobalSearchDoctorResult) =>
  typeof doctor.hospitalId === "object" && doctor.hospitalId ? doctor.hospitalId.name : "Hospital";

const getEquipmentHospitalName = (equipment: GlobalSearchEquipmentResult) =>
  typeof equipment.hospitalId === "object" && equipment.hospitalId ? equipment.hospitalId.name : "Hospital";

const SearchSection = memo(function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
});

export function GlobalSearch({ compact = false }: GlobalSearchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const cacheRef = useRef(new Map<string, GlobalSearchResponse>());
  const requestIdRef = useRef(0);

  const totalResults = useMemo(() => {
    if (!results) return 0;
    return results.hospitals.length + results.doctors.length + results.equipment.length + results.shops.length;
  }, [results]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const cached = cacheRef.current.get(trimmedQuery.toLowerCase());
    if (cached) {
      setResults(cached);
      setIsLoading(false);
      setIsOpen(true);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      searchService
        .global(trimmedQuery)
        .then((response) => {
          if (requestIdRef.current !== requestId) {
            return;
          }
          cacheRef.current.set(trimmedQuery.toLowerCase(), response);
          setResults(response);
          setIsOpen(true);
        })
        .catch((requestError: unknown) => {
          if (requestIdRef.current !== requestId) {
            return;
          }
          setResults(null);
          setError(getErrorMessage(requestError));
          setIsOpen(true);
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoading(false);
          }
        });
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [deferredQuery]);

  const inputClasses = compact
    ? "h-11 w-full rounded-full border border-[var(--border)] bg-white/94 pl-11 pr-10 text-sm text-[var(--foreground)] shadow-[0_10px_24px_rgba(16,35,27,0.04)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(15,118,110,0.08)]"
    : "h-11 w-full rounded-full border border-[var(--border)] bg-white/96 pl-11 pr-10 text-sm text-[var(--foreground)] shadow-[0_10px_24px_rgba(16,35,27,0.04)] outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-[rgba(15,118,110,0.08)]";

  return (
    <div ref={containerRef} className={compact ? "relative w-full max-w-md" : "relative w-full max-w-xl"}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= MIN_QUERY_LENGTH) {
              setIsOpen(true);
            }
          }}
          placeholder="Search hospitals, doctors, equipment, shops..."
          className={inputClasses}
        />
        {isLoading ? (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[var(--primary)]" />
        ) : null}
      </div>

      {isOpen && query.trim().length >= MIN_QUERY_LENGTH ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-50 max-h-[72vh] overflow-y-auto rounded-[28px] border border-[var(--border)] bg-[rgba(255,255,255,0.98)] p-4 shadow-[0_28px_70px_rgba(16,35,27,0.12)] backdrop-blur-xl">
          {error ? (
            <p className="rounded-[18px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          {!error && !isLoading && results && totalResults === 0 ? (
            <p className="rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.03)] px-4 py-3 text-sm text-[var(--muted)]">
              {`No results found for "${query.trim()}".`}
            </p>
          ) : null}

          {!error && results && totalResults > 0 ? (
            <div className="space-y-5">
              {results.hospitals.length ? (
                <SearchSection title="Hospitals">
                  {results.hospitals.map((hospital) => (
                    <a
                      key={hospital._id ?? hospital.name}
                      href={getHospitalLink(hospital)}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.02)] px-4 py-3 transition hover:border-[rgba(15,118,110,0.22)] hover:bg-[rgba(15,118,110,0.04)]"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{hospital.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {[hospital.city, hospital.state].filter(Boolean).join(", ")}
                      </p>
                    </a>
                  ))}
                </SearchSection>
              ) : null}

              {results.doctors.length ? (
                <SearchSection title="Doctors">
                  {results.doctors.map((doctor) => (
                    <div
                      key={doctor._id ?? `${doctor.name}-${doctor.specialization}`}
                      className="rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.02)] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{doctor.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {[doctor.specialization, doctor.department, getDoctorHospitalName(doctor)]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </div>
                  ))}
                </SearchSection>
              ) : null}

              {results.equipment.length ? (
                <SearchSection title="Equipment">
                  {results.equipment.map((item) => (
                    <a
                      key={item._id ?? `${item.name}-${item.type}`}
                      href={item._id ? `/hospital/equipment/${item._id}` : "#"}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.02)] px-4 py-3 transition hover:border-[rgba(15,118,110,0.22)] hover:bg-[rgba(15,118,110,0.04)]"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {[item.type, item.hospitalSection, getEquipmentHospitalName(item)]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    </a>
                  ))}
                </SearchSection>
              ) : null}

              {results.shops.length ? (
                <SearchSection title="Shops">
                  {results.shops.map((shop: GlobalSearchShopResult) => (
                    <div
                      key={shop._id ?? `${shop.name}-${shop.area}`}
                      className="rounded-[18px] border border-[var(--border)] bg-[rgba(16,35,27,0.02)] px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-[var(--foreground)]">{shop.name}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {[shop.area, shop.city, shop.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  ))}
                </SearchSection>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
