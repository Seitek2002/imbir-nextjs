type Props = {
  count?: number;
  variant?: "vertical" | "horizontal";
};

const ClinicCardSkeletonVertical = () => (
  // Добавил p-2, как в реальной карточке
  <div className="bg-white rounded-3xl border border-[#E3E4E5] w-full h-full flex flex-col p-2">
    {/* Картинка: h-55 и rounded-2xl как в оригинале */}
    <div className="w-full h-55 rounded-2xl skeleton" />

    <div className="p-3 flex flex-col mt-1">
      {/* Название */}
      <div className="h-4 w-3/4 skeleton rounded-md" />

      {/* Рейтинг и отзывы */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-3.5 skeleton rounded-full" />
        <div className="h-3 w-1/2 skeleton rounded-md" />
      </div>

      {/* Адрес */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-3.5 skeleton rounded-full" />
        <div className="h-3 w-2/3 skeleton rounded-md" />
      </div>
    </div>
  </div>
);

const ClinicCardSkeletonHorizontal = () => (
  // Убрал p-2.5, так как в реальной карточке картинка прилегает к краю
  <div className="bg-white rounded-2xl border border-[#E3E4E5] overflow-hidden flex items-stretch w-full">
    {/* Картинка: w-35 как в оригинале */}
    <div className="w-35 skeleton shrink-0" style={{ minHeight: "110px" }} />

    <div className="p-3 flex-1 min-w-0 flex flex-col justify-center">
      {/* Название */}
      <div className="h-4 w-3/4 skeleton rounded-md" />

      {/* Рейтинг */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-3.5 skeleton rounded-full" />
        <div className="h-3 w-1/2 skeleton rounded-md" />
      </div>

      {/* Адрес */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-3.5 skeleton rounded-full" />
        <div className="h-3 w-2/3 skeleton rounded-md" />
      </div>

      {/* Кнопка "Сохранить" */}
      <div className="flex justify-end mt-2">
        <div className="size-6 skeleton rounded-md" />
      </div>
    </div>
  </div>
);

export const ClinicSkeleton = ({ count = 4, variant = "vertical" }: Props) => {
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, i) => (
          <ClinicCardSkeletonHorizontal key={i} />
        ))}
      </div>
    );
  }

  return (
    // Добавил items-stretch для одинаковой высоты карточек
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
      {Array.from({ length: count }, (_, i) => (
        <ClinicCardSkeletonVertical key={i} />
      ))}
    </div>
  );
};
