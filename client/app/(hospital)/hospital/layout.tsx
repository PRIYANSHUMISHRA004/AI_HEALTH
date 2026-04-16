import { AuthGuard } from "@/components/auth/auth-guard";
import { HospitalSidebar } from "@/components/layout/hospital-sidebar";
import { HospitalTopbar } from "@/components/layout/hospital-topbar";

export default function HospitalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard
      allowedRoles={["hospital_admin"]}
      unauthorizedRedirectTo="/login"
    >
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.06),transparent_28%),rgba(250,252,248,0.72)]">
        <div className="mx-auto grid min-h-screen max-w-[1440px] gap-4 px-3 py-3 sm:gap-5 sm:px-4 sm:py-4 xl:grid-cols-[292px_1fr] xl:gap-6 xl:px-6">
          <HospitalSidebar />
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)] backdrop-blur sm:rounded-[32px] sm:p-5 lg:p-6">
            <HospitalTopbar />
            <main className="mt-5 sm:mt-6">{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
