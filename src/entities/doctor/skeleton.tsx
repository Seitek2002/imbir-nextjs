type Props = {
  count?: number;
  variant?: "vertical" | "horizontal";
};

const DoctorCardSkeletonVertical = () => (
  <div className="bg-white rounded-3xl border border-[#E3E4E5] p-2 w-full h-full flex flex-col relative">
    {/* Блок фото: квадратный, скругление 2xl, как в DoctorPhoto */}
    <div className="relative aspect-square w-full rounded-2xl skeleton" />

    {/* Блок информации */}
    <div className="flex-1 px-1 mt-3 flex flex-col">
      {/* Имя */}
      <div className="h-3 w-3/4 skeleton rounded-md" />

      {/* Специальность и клиника */}
      <div className="h-3 w-full skeleton rounded-md mt-1.5" />
      <div className="h-3 w-2/3 skeleton rounded-md mt-1" />

      {/* Рейтинг и опыт */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-3.5 skeleton rounded-full" />
        <div className="h-3 w-6 skeleton rounded-md" />
        <div className="h-3 w-16 skeleton rounded-md ml-1" />
      </div>
    </div>

    {/* Кнопка "Записаться" */}
    <div className="h-8 w-full skeleton rounded-xl mt-3" />
  </div>
);

const DoctorCardSkeletonHorizontal = () => (
  <div className="bg-white rounded-2xl border border-[#E3E4E5] p-2.5 flex items-stretch gap-2.5 w-full">
    {/* Фото */}
    <div className="w-30 min-w-30 self-stretch rounded-2xl skeleton" />

    <div className="flex-1 min-w-0 py-0.5 flex flex-col">
      {/* Имя и бейджик онлайна */}
      <div className="flex items-start justify-between gap-2">
        <div className="h-4.5 w-2/3 skeleton rounded-md" />
        <div className="h-4.5 w-12 skeleton rounded-md" />
      </div>

      {/* Специальность */}
      <div className="h-3 w-3/4 skeleton rounded-md mt-2" />

      {/* Рейтинг */}
      <div className="flex items-center gap-1 mt-2">
        <div className="size-4 skeleton rounded-full" />
        <div className="h-3 w-6 skeleton rounded-md" />
        <div className="h-3 w-16 skeleton rounded-md ml-1" />
      </div>

      {/* Кнопки внизу */}
      <div className="mt-auto pt-2 flex items-center gap-2">
        <div className="h-8 flex-1 skeleton rounded-xl" />
        <div className="size-8 skeleton rounded-full shrink-0" />
      </div>
    </div>
  </div>
);

export const DoctorSkeleton = ({ count = 4, variant = "vertical" }: Props) => {
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, i) => (
          <DoctorCardSkeletonHorizontal key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <DoctorCardSkeletonVertical key={i} />
      ))}
    </div>
  );
};
