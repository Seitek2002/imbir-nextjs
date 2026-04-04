import { FC } from "react";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+";

type Props = {
  title: string;
  category: string;
  categoryColor?: string;
  date: string;
  image: StaticImageData | string;
  href?: string;
};

export const BlogCard: FC<Props> = ({
  title,
  category,
  categoryColor = "#F5653E",
  date,
  image,
  href = "#",
}) => {
  return (
    <Link
      href={href}
      className="bg-white rounded-3xl overflow-hidden flex flex-col p-2 group w-full border border-[#E3E4E5]"
    >
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 text-xs mb-2">
          <span style={{ color: categoryColor }} className="font-medium">
            {category}
          </span>
          <span className="text-[#838A8D]">•</span>
          <span className="text-[#838A8D]">{date}</span>
        </div>
        <p
          className="font-semibold text-sm text-[#191A1B] leading-snug overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </p>
      </div>
    </Link>
  );
};
