import { FC } from "react";

import Image, { StaticImageData } from "next/image";

type Props = {
  title: string;
  image: StaticImageData | string;
};

export const CategoryCard: FC<Props> = ({ title, image }) => {
  return (
    <div className="flex items-center gap-3 border border-[#E3E4E5] p-3 rounded-2xl cursor-pointer hover:bg-[#F2F3F5] transition-colors">
      <Image
        src={image}
        alt={title}
        width={36}
        height={36}
        className="shrink-0-0 object-contain"
      />
      <span className="truncate text-sm md:text-base">{title}</span>
    </div>
  );
};
