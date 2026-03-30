import { FC, ReactNode } from "react";

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
    <header className="px-4 pt-1 pb-4 bg-white md:border md:border-[#E3E4E5] rounded-br-2xl md:rounded-full rounded-bl-2xl md:mt-6 md:py-3 w-full max-w-360 mx-auto">
      {title || backTo ? (
        <div>
          <div className="grid grid-cols-3 items-center">
            <div>
              <BackButton backTo={backTo} />
            </div>
            <h2 className="text-center font-medium text-base">{title}</h2>
            <div></div>
          </div>
          <div>{children}</div>
        </div>
      ) : (
        (children ?? <DefaultContent searchable={searchable} />)
      )}
    </header>
  );
};
