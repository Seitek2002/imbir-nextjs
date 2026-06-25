"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

import { HeaderBackIcon } from "@/shared/assets/icons";
import { IconBtn } from "@/shared/ui";

interface BackButtonProps {
  backTo?: string;
  onBack?: () => void;
}

export const BackButton: FC<BackButtonProps> = ({ backTo, onBack }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <IconBtn
      variant="outline"
      size="sm"
      onClick={handleClick}
      aria-label="Вернуться назад"
    >
      <HeaderBackIcon className="size-4" />
    </IconBtn>
  );
};
