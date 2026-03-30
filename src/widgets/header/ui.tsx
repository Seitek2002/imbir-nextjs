import { FC, ReactNode } from "react";

import { DefaultContent } from "./default-content";

type Props = {
  children?: ReactNode;
};

export const Header: FC<Props> = ({ children }) => {
  return (
    <header className="px-4 pt-1 pb-4 bg-white md:border md:border-[#E3E4E5] rounded-br-2xl md:rounded-full rounded-bl-2xl md:mt-6 md:py-3 w-full max-w-360 mx-auto">
      {children ?? <DefaultContent />}
    </header>
  );
};
