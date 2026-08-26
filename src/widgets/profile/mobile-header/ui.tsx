"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { HeaderBackIcon } from "@/shared/assets/icons";
import { IconBtn } from "@/shared/ui";

type Props = {
  bottomElement?: ReactNode;
  hasBorder?: boolean;
  onBack?: () => void;
  rightElement?: ReactNode;
  title: string;
};

export const MobilePageHeader: FC<Props> = ({
  title,
  rightElement,
  bottomElement,
  hasBorder = false,
  onBack,
}) => {
  const router = useRouter();

  return (
    <div
      className={`md:hidden px-4 pt-1 pb-4 bg-white${hasBorder ? " border-b border-border" : ""}`}
    >
      <div className="grid grid-cols-3 items-center min-h-10">
        <div>
          <IconBtn
            onClick={onBack ?? (() => router.back())}
            variant="outline"
            size="sm"
            aria-label="Назад"
          >
            <HeaderBackIcon className="size-4" />
          </IconBtn>
        </div>

        <h1 className="text-center font-medium text-base px-2">{title}</h1>

        <div className="flex justify-end">{rightElement ?? null}</div>
      </div>

      {bottomElement && <div className="mt-3">{bottomElement}</div>}
    </div>
  );
};
