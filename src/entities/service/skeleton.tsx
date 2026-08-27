type Props = {
  count?: number;
  variant?: "horizontal" | "vertical";
};

// Каркас карточки услуги — по образцу DoctorSkeleton/ClinicSkeleton. Раньше на
// /services во время загрузки стоял текст «Загрузка...», из-за которого сетка
// схлопывалась и после ответа прыгала обратно.
const ServiceCardSkeletonVertical = () => (
  <div className="bg-white rounded-3xl border border-border overflow-hidden flex flex-col h-full">
    <div className="aspect-4/3 w-full skeleton" />
    <div className="flex-1 p-4 flex flex-col gap-2">
      <div className="h-3 w-24 rounded skeleton" />
      <div className="h-4 w-full rounded skeleton" />
      <div className="h-3 w-32 rounded skeleton" />
      <div className="h-4 w-20 rounded skeleton mt-auto" />
    </div>
  </div>
);

const ServiceCardSkeletonHorizontal = () => (
  <div className="bg-white rounded-3xl p-4 flex items-center gap-4 border border-border">
    <div className="size-28 rounded-2xl skeleton shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-4 w-3/4 rounded skeleton" />
      <div className="h-3 w-1/2 rounded skeleton" />
      <div className="h-4 w-20 rounded skeleton" />
    </div>
  </div>
);

export const ServiceSkeleton = ({ count = 4, variant = "vertical" }: Props) => {
  if (variant === "horizontal") {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, i) => (
          <ServiceCardSkeletonHorizontal key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <ServiceCardSkeletonVertical key={i} />
      ))}
    </div>
  );
};
