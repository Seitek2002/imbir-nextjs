type Props = {
  count?: number;
  variant?: "vertical" | "horizontal";
};

const DoctorCardSkeletonVertical = () => (
  <div className="bg-white rounded-3xl border border-[#E3E4E5] overflow-hidden flex flex-col">
    <div className="w-full aspect-[3/4] skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-4 w-3/4 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="h-3 w-2/3 skeleton rounded-md" />
      <div className="flex items-center gap-1 mt-1">
        <div className="size-3 skeleton rounded-full" />
        <div className="h-3 w-8 skeleton rounded-md" />
      </div>
      <div className="h-9 w-full skeleton rounded-xl mt-2" />
    </div>
  </div>
);

const DoctorCardSkeletonHorizontal = () => (
  <div className="bg-white rounded-2xl border border-[#E3E4E5] p-2.5 flex items-stretch gap-2.5 w-full">
    <div
      className="w-30 min-w-30 rounded-2xl skeleton"
      style={{ minHeight: "100px" }}
    />
    <div className="flex-1 py-1 space-y-2">
      <div className="h-4 w-3/4 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="h-3 w-2/3 skeleton rounded-md" />
      <div className="flex items-center gap-1">
        <div className="size-3 skeleton rounded-full" />
        <div className="h-3 w-8 skeleton rounded-md" />
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
