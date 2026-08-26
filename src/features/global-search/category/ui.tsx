import { FC } from "react";

import { StaticImageData } from "next/image";
import Link from "next/link";

import { SpecializationIllustration } from "@/entities/specialization";

type Props = {
  href?: string;
  // Иллюстрация есть не у каждой специализации из справочника — для остальных
  // SpecializationIllustration рисует нейтральный значок.
  image?: StaticImageData | string;
  onClick?: () => void;
  title: string;
};

export const CategoryCard: FC<Props> = ({ title, image, href, onClick }) => {
  const className =
    "flex items-center gap-3 border border-border-soft p-3 rounded-2xl cursor-pointer hover:bg-background transition-colors";

  const inner = (
    <>
      <span className="relative w-9 h-9 shrink-0">
        <SpecializationIllustration image={image} name={title} sizes="36px" />
      </span>
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
