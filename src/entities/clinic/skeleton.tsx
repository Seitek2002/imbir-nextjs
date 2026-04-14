type Props = {
  count?: number;
  variant?: "vertical" | "horizontal";
};

const ClinicCardSkeletonVertical = () => (
  <div className="bg-white rounded-3xl border border-[#E3E4E5] overflow-hidden flex flex-col">
    <div className="w-full aspect-video skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="h-3 w-2/3 skeleton rounded-md" />
    </div>
  </div>
);

const ClinicCardSkeletonHorizontal = () => (
  <div className="bg-white rounded-2xl border border-[#E3E4E5] p-2.5 flex items-stretch gap-2.5 w-full">
    <div className="w-20 h-20 rounded-xl skeleton shrink-0" />
    <div className="flex-1 py-1 space-y-2">
      <div className="h-4 w-3/4 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="h-3 w-2/3 skeleton rounded-md" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <ClinicCardSkeletonVertical key={i} />
      ))}
    </div>
  );
};
