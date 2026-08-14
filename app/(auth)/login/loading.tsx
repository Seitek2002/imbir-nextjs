// Шапка/картинка/футер теперь в app/(auth)/layout.tsx и не пересоздаются —
// здесь остаётся скелет только той части, что реально меняется (форма).
export default function Loading() {
  return (
    <>
      <div className="mt-8 mb-6 md:mt-12">
        <div className="h-7 w-2/3 skeleton rounded-lg mb-2" />
        <div className="h-4 w-4/5 skeleton rounded-md" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="h-14 w-full skeleton rounded-xl" />
        <div className="h-14 w-full skeleton rounded-xl" />
        <div className="flex items-center justify-between mt-2">
          <div className="h-4 w-32 skeleton rounded-md" />
          <div className="h-4 w-24 skeleton rounded-md" />
        </div>
      </div>

      <div className="mt-auto pt-10 md:mt-10">
        <div className="h-12 md:h-14 w-full skeleton rounded-full" />
      </div>
    </>
  );
}
