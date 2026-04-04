"use client";

import { FC, useState } from "react";

import { HeartIcon2 } from "@/shared/assets";

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
      onClick={() => {
        setSaved((p) => !p);
        onSave?.();
      }}
      aria-label={saved ? "Убрать из сохранённых" : "Сохранить клинику"}
      className="transition-transform active:scale-90"
    >
      <HeartIcon2
        className={
          saved ? "[&_path]:fill-[#F5653E] [&_path]:stroke-[#F5653E]" : ""
        }
      />
    </button>
  );
};
