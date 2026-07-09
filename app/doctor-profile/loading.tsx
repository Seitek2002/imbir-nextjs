export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="px-4 pt-8 pb-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full skeleton" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-32 skeleton rounded" />
            <div className="h-4 w-24 skeleton rounded" />
          </div>
        </div>

        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4">
                <div className="h-7 w-10 skeleton rounded mb-2" />
                <div className="h-3 w-20 skeleton rounded" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-3xl p-2 flex flex-col gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
                <div className="h-5 w-32 skeleton rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block max-w-360 mx-auto px-10 py-8">
        <div className="h-10 w-48 skeleton rounded-xl mb-8" />

        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-72 shrink-0">
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
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-4">
                  <div className="h-7 w-10 skeleton rounded mb-2" />
                  <div className="h-3 w-24 skeleton rounded" />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl border border-border p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl skeleton shrink-0" />
                <div>
                  <div className="h-6 w-48 skeleton rounded mb-2" />
                  <div className="h-4 w-40 skeleton rounded mb-3" />
                  <div className="h-4 w-28 skeleton rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border"
                  >
                    <div className="w-10 h-10 rounded-xl skeleton shrink-0" />
                    <div className="h-5 flex-1 skeleton rounded" />
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
