export default function Loading() {
  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white">
        <div className="w-10 h-10 rounded-full skeleton shrink-0" />
        <div className="h-5 w-28 skeleton rounded" />
        <div className="w-10 h-10 shrink-0" />
      </div>

      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <div className="h-10 w-48 skeleton rounded-xl mb-8 hidden md:block" />

        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block shrink-0 w-88">
            <div className="bg-linear-to-br from-[#FFE5DC] to-[#FFD4C8] rounded-3xl px-6 py-5 flex flex-col items-center gap-3 mb-4">
              <div className="w-20 h-20 rounded-full skeleton" />
              <div className="h-5 w-24 skeleton rounded" />
            </div>
            <div className="bg-white rounded-3xl py-2 px-2 flex flex-col gap-1 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
                  <div className="h-5 w-32 skeleton rounded" />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
              <div className="h-5 w-28 skeleton rounded" />
            </div>
            <div className="bg-white rounded-3xl p-6">
              <div className="h-4 w-32 skeleton rounded mb-2" />
              <div className="h-6 w-24 skeleton rounded mb-3" />
              <div className="h-4 w-full skeleton rounded mb-1.5" />
              <div className="h-4 w-3/4 skeleton rounded" />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <div className="h-8 w-40 skeleton rounded-xl" />
              <div className="h-11 w-36 skeleton rounded-full" />
            </div>

            <div className="h-5 w-44 skeleton rounded mb-3" />

            <div className="bg-white rounded-3xl border border-border p-5">
              <div className="py-3 border-b border-background">
                <div className="h-3 w-10 skeleton rounded mb-2" />
                <div className="w-20 h-20 rounded-full skeleton" />
              </div>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="py-3 border-b border-background last:border-0">
                  <div className="h-3 w-24 skeleton rounded mb-2" />
                  <div className="h-4 w-40 skeleton rounded" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
