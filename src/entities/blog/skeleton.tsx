type Props = {
  count?: number;
};

const BlogCardSkeleton = () => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden flex flex-col p-2 w-full border border-[#E3E4E5]">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-200 animate-pulse" />

      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full" />
          <div className="size-1 bg-gray-200 animate-pulse rounded-full" />
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md" />
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const BlogSkeleton = ({ count = 3 }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {Array.from({ length: count }, (_, index) => (
        <BlogCardSkeleton key={index} />
      ))}
    </div>
  );
};
