export default function Loading() {
  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white">
        <div className="w-10 h-10 rounded-full skeleton shrink-0" />
        <div className="h-5 w-36 skeleton rounded" />
        <div className="w-10 h-10 shrink-0" />
      </div>

      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <div className="h-10 w-48 skeleton rounded-xl mb-8 hidden md:block" />

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0 w-88">
            <div className="bg-linear-to-b from-[#FFE2DA] to-white rounded-3xl px-6 py-5 flex flex-col items-center gap-3 mb-4">
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
          </aside>

          <main className="flex-1 min-w-0">
            <div className="h-8 w-56 skeleton rounded-xl mb-6 hidden md:block" />

            <div className="hidden md:flex gap-2 mb-6">
              <div className="h-11 w-36 skeleton rounded-full" />
              <div className="h-11 w-32 skeleton rounded-full" />
            </div>
            <div className="md:hidden h-11 w-full skeleton rounded-full mb-6" />

            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="hidden md:flex bg-white rounded-3xl p-5 border border-border items-start gap-4"
                >
                  <div className="w-50 h-50 rounded-2xl skeleton shrink-0" />
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="h-6 w-48 skeleton rounded mb-3" />
                    <div className="h-4 w-64 skeleton rounded mb-5" />
                    <div className="h-4 w-40 skeleton rounded mb-2.5" />
                    <div className="h-4 w-56 skeleton rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-6 pt-1">
                    <div className="h-10 w-32 skeleton rounded-full" />
                    <div className="text-right">
                      <div className="h-4 w-24 skeleton rounded mb-2" />
                      <div className="h-7 w-20 skeleton rounded" />
                    </div>
                  </div>
                </div>
              ))}

              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="md:hidden bg-white rounded-3xl p-4 border border-border"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-2xl skeleton shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-5 w-32 skeleton rounded mb-1.5" />
                      <div className="h-4 w-40 skeleton rounded mb-2" />
                      <div className="h-4 w-36 skeleton rounded mb-1.5" />
                      <div className="h-4 w-28 skeleton rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
