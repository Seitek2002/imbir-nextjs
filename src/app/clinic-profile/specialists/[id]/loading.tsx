function FieldRow() {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-4 w-24 skeleton rounded mb-2" />
          <div className="h-5 w-full skeleton rounded" />
        </div>
      ))}
    </div>
  );
}

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
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full skeleton shrink-0" />
            <div className="h-8 flex-1 skeleton rounded-xl" />
            <div className="h-10 w-36 skeleton rounded-full shrink-0" />
            <div className="w-10 h-10 rounded-full skeleton shrink-0" />
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-[#E5E6E8] divide-y divide-[#E5E6E8]">
            {/* Section 1: Основная информация */}
            <div className="p-8">
              <div className="h-6 w-48 skeleton rounded mb-6" />
              <div className="flex gap-8">
                <div className="flex-1">
                  <div className="col-span-2 mb-5">
                    <div className="h-4 w-8 skeleton rounded mb-2" />
                    <div className="h-6 w-3/4 skeleton rounded" />
                  </div>
                  <FieldRow />
                </div>
                <div className="w-30 h-30 rounded-2xl skeleton shrink-0" />
              </div>
            </div>

            {/* Section 2: Профессиональные данные */}
            <div className="p-8">
              <div className="h-6 w-56 skeleton rounded mb-6" />
              <FieldRow />
            </div>

            {/* Section 3: Образование */}
            <div className="p-8">
              <div className="h-6 w-32 skeleton rounded mb-6" />
              <FieldRow />
            </div>

            {/* Section 4: Сертификаты */}
            <div className="p-8">
              <div className="h-6 w-56 skeleton rounded mb-6" />
              <div className="h-4 w-28 skeleton rounded mb-2" />
              <div className="h-12 w-64 skeleton rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
