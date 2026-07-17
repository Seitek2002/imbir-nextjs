import { FC } from "react";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

type Props = {
  title: string;
  image: StaticImageData | string;
  href?: string;
  onClick?: () => void;
};

export const CategoryCard: FC<Props> = ({ title, image, href, onClick }) => {
  const className =
    "flex items-center gap-3 border border-border-soft p-3 rounded-2xl cursor-pointer hover:bg-background transition-colors";

  const inner = (
    <>
      <Image
        src={image}
        alt={title}
        width={36}
        height={36}
        style={{ width: 36, height: "auto" }}
        className="shrink-0 object-contain"
      />
      <span className="truncate text-sm md:text-base">{title}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={className}>
      {inner}
    </div>
  );
};
