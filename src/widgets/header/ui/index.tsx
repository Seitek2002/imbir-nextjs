import { FC, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { BackButton } from "./back-button";
import { DefaultContent } from "./default-content";

type Props = {
  title?: string;
  backTo?: string;
  children?: ReactNode;
  searchable?: boolean;
};

export const Header: FC<Props> = ({ children, title, backTo, searchable }) => {
  return (
    <header
      className={cn(
        "px-4 pt-1 pb-4 bg-white md:border md:border-[#E3E4E5] md:mt-6 md:py-3 w-full max-w-360 md:max-w-300 mx-auto",
        !(title || backTo)
          ? "rounded-bl-2xl rounded-br-2xl md:rounded-full"
          : "border-b border-[#E3E4E5] md:rounded-full",
      )}
    >
      <div className="hidden md:block">
        <DefaultContent searchable={false} />
      </div>

      <div className="md:hidden">
        {title || backTo ? (
          <div>
            <div className="grid grid-cols-3 items-center min-h-10">
              <div>
                <BackButton backTo={backTo} />
              </div>
              <h2 className="text-center font-medium text-base px-2">
                {title}
              </h2>
              <div className="flex justify-end">
                {/* Место для иконки справа, если понадобится */}
              </div>
            </div>
            {children && <div className="mt-4">{children}</div>}
          </div>
        ) : (
          <DefaultContent searchable={searchable} />
        )}
      </div>
    </header>
  );
};
