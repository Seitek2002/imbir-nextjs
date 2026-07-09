export default function Loading() {
  return (
    <div className="w-full min-h-screen">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <div className="h-5 w-28 skeleton rounded" />
        <div className="h-9 w-28 skeleton rounded-full" />
      </div>

      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <div className="h-10 w-48 skeleton rounded-xl mb-8 hidden md:block" />

        <div className="flex gap-6">
          {/* Sidebar */}
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

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <div className="h-8 w-40 skeleton rounded-xl" />
              <div className="h-11 w-36 skeleton rounded-full" />
            </div>

            {/* Stats tiles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-4">
                  <div className="h-7 w-10 skeleton rounded mb-2" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              ))}
            </div>

            {/* Labeled section cards (basic info / location / schedule / legal / services / equipment) */}
            {[0, 1, 2, 3, 4, 5].map((section) => (
              <div
                key={section}
                className="bg-white rounded-3xl border border-border p-5 lg:p-6 mb-6"
              >
                <div className="h-5 w-48 skeleton rounded mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="h-3 w-24 skeleton rounded mb-2" />
                      <div className="h-4 w-40 skeleton rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
