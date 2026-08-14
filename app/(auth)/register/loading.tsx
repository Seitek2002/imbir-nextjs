// Шапка/картинка/футер теперь в app/(auth)/layout.tsx и не пересоздаются —
// здесь остаётся скелет только той части, что реально меняется (форма).
export default function Loading() {
  return (
    <>
      <div className="mt-8 mb-6 md:mt-12 text-center">
        <div className="h-7 w-1/2 mx-auto skeleton rounded-lg mb-2" />
        <div className="h-4 w-3/4 mx-auto skeleton rounded-md" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-white"
          >
            <div className="shrink-0 size-12 rounded-full skeleton" />
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="h-4 w-1/3 skeleton rounded-md" />
              <div className="h-3 w-4/5 skeleton rounded-md" />
            </div>
            <div className="shrink-0 size-5 rounded-full skeleton" />
          </div>
        ))}
      </div>

      <div className="mt-auto pt-10 md:mt-10">
        <div className="h-12 md:h-14 w-full skeleton rounded-full" />
      </div>
    </>
  );
}
