import { FC, ReactNode } from "react";

import { IconBtn } from "@/shared";

import { DefaultContent } from "./default-content";

type Props = {
  title?: string;
  backTo?: string;
  children?: ReactNode;
};

export const Header: FC<Props> = ({ children, title, backTo }) => {
  return (
    <header className="px-4 pt-1 pb-4 bg-white md:border md:border-[#E3E4E5] rounded-br-2xl md:rounded-full rounded-bl-2xl md:mt-6 md:py-3 w-full max-w-360 mx-auto">
      {title || backTo ? (
        <div>
          <div className="grid grid-cols-3 items-center">
            <div>
              <IconBtn variant="outline" size="sm">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.37967 3.95312L2.33301 7.99979L6.37967 12.0465"
                    stroke="#191A1B"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M13.6663 8H2.44629"
                    stroke="#191A1B"
                    stroke-width="1.5"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </IconBtn>
            </div>
            <h2 className="text-center font-medium text-base">{title}</h2>
            <div></div>
          </div>
          <div>{children}</div>
        </div>
      ) : (
        (children ?? <DefaultContent />)
      )}
    </header>
  );
};
