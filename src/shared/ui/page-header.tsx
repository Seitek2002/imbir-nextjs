"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

import { HeaderBackIcon } from "@/shared/assets/icons";

import { IconBtn } from "./icon-button";

type Props = {
  backTo?: string;
  onBack?: () => void;
  title: string;
};

export const PageHeader: FC<Props> = ({ title, backTo, onBack }) => {
  const router = useRouter();

  const handleBack = () => {
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
    <div className="px-4 pt-1 pb-4 bg-white border-b border-border-soft">
      <div className="grid grid-cols-3 items-center min-h-10">
        <div>
          <IconBtn
            variant="outline"
            size="sm"
            onClick={handleBack}
            aria-label="Вернуться назад"
          >
            <HeaderBackIcon className="size-4" />
          </IconBtn>
        </div>
        <h2 className="text-center font-medium text-base px-2">{title}</h2>
        <div />
      </div>
    </div>
  );
};
