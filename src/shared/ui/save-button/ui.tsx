"use client";

import { FC, useState } from "react";

import { HeartIcon2 } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

type Props = {
  initialSaved?: boolean;
  savedLabel?: string;
  unsavedLabel?: string;
  onSave?: () => void;
};

export const SaveButton: FC<Props> = ({
  initialSaved = false,
  savedLabel = "Убрать из сохранённых",
  unsavedLabel = "Сохранить",
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
      aria-label={saved ? savedLabel : unsavedLabel}
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
