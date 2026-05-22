export default function Loading() {
  return (
    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <div className="h-10 w-56 skeleton rounded-xl mb-8" />

      <div className="flex gap-6">
        {/* Sidebar skeleton */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 border border-[#E5E6E8]">
            <div className="w-14 h-14 rounded-full skeleton shrink-0" />
            <div className="flex-1">
              <div className="h-5 w-20 skeleton rounded mb-2" />
              <div className="h-4 w-14 skeleton rounded" />
            </div>
          </div>
          <div className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
                <div className="h-5 w-32 skeleton rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
            <div className="h-5 w-28 skeleton rounded" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div className="h-9 w-52 skeleton rounded-xl" />
            <div className="h-11 w-40 skeleton rounded-full" />
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 flex-1 skeleton rounded-full" />
            <div className="w-12 h-12 skeleton rounded-full shrink-0" />
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-[#E5E6E8] p-2"
              >
                <div className="aspect-square w-full rounded-2xl skeleton mb-3" />
                <div className="px-1 pb-1">
                  <div className="h-5 w-3/4 skeleton rounded mb-2" />
                  <div className="h-4 w-1/2 skeleton rounded mb-3" />
                  <div className="h-4 w-2/3 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
