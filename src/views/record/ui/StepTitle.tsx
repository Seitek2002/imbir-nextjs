export const StepTitle = ({
  number,
  title,
}: {
  number: number;
  title: string;
}) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="size-7 rounded-full border border-primary text-primary text-sm flex items-center justify-center">
      {number}
    </span>
    <h2 className="text-[28px] text-foreground leading-[130%] font-semibold">
      {title}
    </h2>
  </div>
);
