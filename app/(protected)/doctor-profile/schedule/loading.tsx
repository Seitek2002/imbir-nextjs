export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <div className="w-10 h-10 rounded-full skeleton shrink-0" />
        <div className="h-5 w-28 skeleton rounded" />
        <div className="w-10 h-10 shrink-0" />
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <div className="h-10 w-48 skeleton rounded-xl mb-8 hidden lg:block" />

        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 border border-border">
              <div className="w-14 h-14 rounded-full skeleton shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-24 skeleton rounded mb-2" />
                <div className="h-4 w-20 skeleton rounded" />
              </div>
            </div>
            <div className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
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
          </div>

          {/* Main content — schedule rows */}
          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="h-8 w-56 skeleton rounded-xl" />
              <div className="h-11 w-32 skeleton rounded-full" />
            </div>

            <div className="bg-white rounded-3xl border border-border p-5 lg:p-8 flex flex-col gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 py-3 border-b border-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-6 rounded-full skeleton shrink-0" />
                    <div className="h-4 w-28 skeleton rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-24 skeleton rounded-xl" />
                    <div className="h-9 w-24 skeleton rounded-xl" />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 py-3 border-b border-background">
                <div className="h-4 w-36 skeleton rounded" />
                <div className="flex items-center gap-2">
                  <div className="h-9 w-24 skeleton rounded-xl" />
                  <div className="h-9 w-24 skeleton rounded-xl" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 py-3">
                <div className="h-4 w-44 skeleton rounded" />
                <div className="w-11 h-6 rounded-full skeleton shrink-0" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
