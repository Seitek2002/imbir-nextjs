import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ClinicSkeleton } from "@/entities/clinic";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
      <Header title="Клиники" />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* ── Mobile ───────────────────────────────────────────────────── */}
        <div className="md:hidden p-4">
          <ClinicSkeleton count={4} variant="horizontal" />
        </div>

        {/* ── Desktop ──────────────────────────────────────────────────── */}
        <div className="hidden md:block px-10 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-2 skeleton rounded" />
            <div className="h-4 w-16 skeleton rounded" />
          </div>

          {/* FilterBar skeleton */}
          <div className="flex items-center gap-3 mb-6 py-3 border-b border-border-soft">
            <div className="h-7 w-32 skeleton rounded-lg mr-2" />
            <div className="h-9 w-36 skeleton rounded-full" />
            <div className="h-9 w-28 skeleton rounded-full" />
            <div className="ml-auto h-9 w-32 skeleton rounded-full" />
          </div>

          {/* Clinic cards grid */}
          <ClinicSkeleton count={8} variant="vertical" />
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
