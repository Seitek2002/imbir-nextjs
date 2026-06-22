import { Footer, Header } from "@/widgets";

import { DoctorSkeleton } from "@/entities/doctor";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
      <Header title="Специалисты" />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* ── Mobile ───────────────────────────────────────────────────── */}
        <div className="md:hidden p-4">
          <DoctorSkeleton count={6} variant="horizontal" />
        </div>

        {/* ── Desktop ──────────────────────────────────────────────────── */}
        <div className="hidden md:block px-10 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-4 w-16 skeleton rounded" />
            <div className="h-4 w-2 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>

          {/* FilterBar skeleton */}
          <div className="flex items-center gap-3 mb-6 py-3 border-b border-border-soft">
            <div className="h-7 w-32 skeleton rounded-lg mr-2" />
            <div className="h-9 w-36 skeleton rounded-full" />
            <div className="h-9 w-28 skeleton rounded-full" />
            <div className="h-9 w-28 skeleton rounded-full" />
            <div className="h-9 w-28 skeleton rounded-full" />
            <div className="ml-auto h-9 w-32 skeleton rounded-full" />
          </div>

          {/* Doctor cards grid */}
          <DoctorSkeleton count={8} variant="vertical" />
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
