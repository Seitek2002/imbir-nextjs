export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      <div className="md:hidden flex items-center px-4 py-4 bg-white border-b border-border">
        <div className="h-5 w-20 skeleton rounded" />
      </div>

      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <div className="h-10 w-28 skeleton rounded-xl mb-2 hidden md:block" />

        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <aside className="w-72 shrink-0 hidden lg:block">
            <div className="bg-white rounded-3xl p-5 flex items-center gap-4 mb-4 border border-border">
              <div className="w-14 h-14 rounded-full skeleton shrink-0" />
              <div className="flex-1">
                <div className="h-5 w-28 skeleton rounded mb-2" />
                <div className="h-4 w-16 skeleton rounded" />
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
          </aside>

          {/* Main content — tabs + table */}
          <main className="flex-1 min-w-0">
            <div className="flex gap-1 bg-white rounded-2xl p-1 mb-4 border border-border">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex-1 h-9 skeleton rounded-xl" />
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-border overflow-hidden">
              <div className="grid grid-cols-4 px-5 py-3 border-b border-border gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-16 skeleton rounded" />
                ))}
              </div>
              {[0, 1, 2, 3, 4].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-4 px-5 py-4 border-b border-background last:border-0 gap-4 items-center"
                >
                  {[0, 1, 2, 3].map((col) => (
                    <div key={col} className="h-4 w-20 skeleton rounded" />
                  ))}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
