"use client";

import { FC, useState } from "react";

import { HeartIcon2 } from "@/shared/assets";
import { cn } from "@/shared/lib/utils";

type Props = {
  initialSaved?: boolean;
  onSave?: () => void;
};

export const ClinicSaveButton: FC<Props> = ({
  initialSaved = false,
  onSave,
}) => {
  const [saved, setSaved] = useState(initialSaved);

  return (
    <button
      type="button"
      onClick={() => {
        setSaved((prev) => !prev);
        onSave?.();
      }}
      aria-label={saved ? "Убрать из сохранённых" : "Сохранить клинику"}
      className="transition-transform active:scale-90"
    >
      <HeartIcon2
        className={cn(
          "transition-colors",
          saved && "[&_path]:fill-[#FFA18D] [&_path]:stroke-[#FFA18D]",
        )}
      />
    </button>
  );
};
