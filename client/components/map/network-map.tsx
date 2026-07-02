"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { Hospital, MedicalShop } from "@/types";

interface NetworkMapProps {
  hospitals: Hospital[];
  medicalShops: MedicalShop[];
}

const indiaCenter: [number, number] = [22.9734, 78.6569];

export function NetworkMap({ hospitals, medicalShops }: NetworkMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current || leafletMapRef.current) {
        return;
      }

      const L = await import("leaflet");

      if (cancelled || !mapRef.current) {
        return;
      }

      const hospitalIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      const shopIcon = L.divIcon({
        className: "medical-shop-marker",
        html: '<div style="height:18px;width:18px;border-radius:9999px;background:#d97706;border:3px solid white;box-shadow:0 6px 20px rgba(217,119,6,0.28);"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(indiaCenter, 5);

      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      hospitals.forEach((hospital) => {
        const marker = L.marker([hospital.location.lat, hospital.location.lng], {
          icon: hospitalIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:220px">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#0f766e;">Hospital</p>
            <h3 style="margin:0 0 8px;font-size:16px;color:#10231b;">${hospital.name}</h3>
            <p style="margin:0 0 6px;font-size:13px;color:#5b6e66;">${hospital.city}, ${hospital.state}</p>
            <p style="margin:0 0 8px;font-size:13px;color:#5b6e66;">Status: ${hospital.availabilityStatus}</p>
            <a href="/hospitals/${hospital._id}" style="font-size:13px;font-weight:600;color:#0f766e;text-decoration:none;">View hospital</a>
          </div>
        `);

        bounds.extend([hospital.location.lat, hospital.location.lng]);
      });

      medicalShops.forEach((shop) => {
        const marker = L.marker([shop.location.lat, shop.location.lng], {
          icon: shopIcon,
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:220px">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#d97706;">Medical Shop</p>
            <h3 style="margin:0 0 8px;font-size:16px;color:#10231b;">${shop.name}</h3>
            <p style="margin:0 0 6px;font-size:13px;color:#5b6e66;">${shop.area}, ${shop.city}, ${shop.state}</p>
            <p style="margin:0;font-size:13px;color:#5b6e66;">${shop.contactNumber}</p>
          </div>
        `);

        bounds.extend([shop.location.lat, shop.location.lng]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15));
      }

      requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    void initMap();

    return () => {
      cancelled = true;
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, [hospitals, medicalShops]);

  useEffect(() => {
    const handleResize = () => {
      leafletMapRef.current?.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <div className="min-w-0">
        <div className="relative isolate overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-sm sm:rounded-[32px]">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Interactive map</p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--foreground)] sm:text-2xl">Hospital and pharmacy coverage</h2>
          </div>
          <div className="h-[360px] w-full sm:h-[440px] lg:h-[520px]" ref={mapRef} />
        </div>
      </div>

      <div className="min-w-0 space-y-4">
        <div className="rounded-[28px] border border-[var(--border)] bg-white/92 p-5 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Map summary</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">Network view</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Hospitals use the default marker and medical shops use the amber marker, so the demo stays easy to read.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--card)] p-4">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{hospitals.length}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Hospitals shown</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] p-4">
              <p className="text-2xl font-semibold text-[var(--foreground)]">{medicalShops.length}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">Medical shops shown</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border)] bg-white/92 p-5 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Quick links</p>
          <div className="mt-4 space-y-3">
            {hospitals.slice(0, 4).map((hospital) => (
              <Link
                key={hospital._id}
                href={`/hospitals/${hospital._id}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 transition hover:border-[var(--primary)]"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">{hospital.name}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {hospital.city}, {hospital.state}
                </p>
              </Link>
            ))}
            {!hospitals.length ? (
              <p className="text-sm text-[var(--muted)]">No hospitals available for the current filters.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
