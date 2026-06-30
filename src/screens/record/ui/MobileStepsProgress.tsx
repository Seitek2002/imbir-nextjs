import { cn } from "@/shared/lib/utils";

import type { MobileStep } from "../model/types";

export const MobileStepsProgress = ({
  currentStep,
  totalSteps,
}: {
  currentStep: MobileStep;
  totalSteps: number;
}) => {
  const progress =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="mt-1 px-1">
      <div className="relative">
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-px bg-[#D3D7DA]" />
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 h-px bg-primary transition-all duration-500 ease-out"
          style={{ width: `calc((100% - 24px) * ${progress / 100})` }}
        />

        <div className="relative flex items-center justify-between">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <span
                key={stepNumber}
                className={cn(
                  "size-6 rounded-full border text-xs flex items-center justify-center transition-colors duration-300 bg-white",
                  isDone || isCurrent
                    ? "border-primary text-primary"
                    : "border-[#C8CDD1] text-[#A2A9AE]",
                )}
              >
                {stepNumber}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
