import { Spinner } from "@/shared/ui";

export const LoadingState = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-muted">
    <Spinner className="size-5" />
    Загрузка данных
  </div>
);
