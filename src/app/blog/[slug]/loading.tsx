export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F2F3F5]">
      <span className="sr-only">loading...</span>

      <div className="md:hidden h-16 bg-white" />

      <div className="w-full max-w-340 mx-auto px-3 md:px-4 pt-4 md:pt-6 pb-8">
        <div className="hidden md:flex items-center gap-3 mb-6">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full" />
          <div className="size-1 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-4 w-14 bg-gray-200 animate-pulse rounded-full" />
          <div className="size-1 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-full" />
        </div>

        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_332px] gap-6 md:gap-3 md:items-start">
          <article>
            <div className="space-y-3 mb-5 md:mb-6">
              <div className="h-10 md:h-11 w-full bg-gray-200 animate-pulse rounded-xl" />
              <div className="h-10 md:h-11 w-3/4 bg-gray-200 animate-pulse rounded-xl" />
            </div>

            <div className="w-full h-64 md:h-105 overflow-hidden rounded-3xl bg-gray-200 animate-pulse" />

            <div className="mt-5 md:mt-6 space-y-4 md:space-y-5">
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded-md" />
              </div>

              {Array.from({ length: 3 }, (_, index) => (
                <div key={index}>
                  <div className="h-6 w-3/5 bg-gray-200 animate-pulse rounded-md" />
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                    <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded-md" />
                  </div>
                </div>
              ))}

              <div>
                <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-md" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                  <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-md" />
                </div>
              </div>
            </div>
          </article>

          <aside className="w-full">
            <div className="h-10 w-40 bg-gray-200 animate-pulse rounded-xl mb-3" />

            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl overflow-hidden flex flex-col p-2 w-full border border-[#E3E4E5]"
                >
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 animate-pulse" />

                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full" />
                      <div className="size-1 bg-gray-200 animate-pulse rounded-full" />
                      <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-full" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
