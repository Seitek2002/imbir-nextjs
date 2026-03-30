"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

import { IconBtn } from "@/shared";

import { HeaderBackIcon } from "@/shared/assets";

interface BackButtonProps {
  backTo?: string;
}

export const BackButton: FC<BackButtonProps> = ({ backTo }) => {
  const router = useRouter();

  const handleClick = () => {
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
