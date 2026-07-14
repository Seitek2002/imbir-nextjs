// Контентный скелетон: рендерится внутри постоянного layout кабинета
// (сайдбар и заголовок живут в layout.tsx и не перерисовываются).
export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-56 skeleton rounded-xl hidden lg:block" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-border p-5">
          <div className="h-5 w-48 skeleton rounded mb-3" />
          <div className="h-4 w-72 max-w-full skeleton rounded mb-2" />
          <div className="h-4 w-56 max-w-full skeleton rounded" />
        </div>
      ))}
    </div>
  );
}
