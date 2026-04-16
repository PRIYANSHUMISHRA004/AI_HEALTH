import { MapPin, Phone } from "lucide-react";

import type { MedicalShop } from "@/types";

interface MedicalShopCardProps {
  shop: MedicalShop;
}

export function MedicalShopCard({ shop }: MedicalShopCardProps) {
  return (
    <article className="rounded-[28px] border border-[var(--border)] bg-white/92 p-6 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Medical shop</p>
      <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{shop.name}</h3>

      <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
        <div className="inline-flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[var(--primary)]" />
          <span>
            {shop.area}, {shop.city}, {shop.state}
          </span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Phone className="h-4 w-4 text-[var(--primary)]" />
          <span>{shop.contactNumber}</span>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">Available medicines</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {shop.availableMedicines.length ? (
            shop.availableMedicines.slice(0, 6).map((medicine) => (
              <span
                key={medicine}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--foreground)]"
              >
                {medicine}
              </span>
            ))
          ) : (
            <span className="text-sm text-[var(--muted)]">Medicines not listed yet.</span>
          )}
        </div>
      </div>
    </article>
  );
}
