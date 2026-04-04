import { FC } from "react";

import Image, { StaticImageData } from "next/image";

import { UserCircleIcon } from "@/shared/assets";

type Props = {
  title: string;
  authorName: string;
  authorRole: string;
  thumbnail: StaticImageData | string;
  youtubeUrl: string;
};

export const VideoCard: FC<Props> = ({
  title,
  authorName,
  authorRole,
  thumbnail,
  youtubeUrl,
}) => {
  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      // Жесткая высота 357px для десктопа
      className="bg-white rounded-3xl border border-[#E3E4E5] overflow-hidden flex flex-col w-full h-auto md:h-[357px] shrink-0 group-hover:shadow-lg transition-shadow duration-300"
    >
      {/* Жесткая высота 220px для картинки на десктопе */}
      <div className="relative w-full aspect-video md:aspect-auto md:h-[220px] shrink-0 overflow-hidden bg-[#F2F3F5]">
        <Image
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-12 rounded-full bg-white/90 flex items-center justify-center shadow-md pl-0.5">
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-[#F5653E] stroke-[#F5653E]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5.14v14l11-7-11-7z"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 p-4 md:p-6 bg-white">
        <p
          className="font-medium text-base md:text-[18px] text-[#191A1B] leading-snug overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </p>

        <div className="flex items-center gap-2 text-xs md:text-sm text-[#686F72] mt-auto pt-4">
          <UserCircleIcon className="size-5 shrink-0 text-[#F5653E]" />
          <span className="truncate">{authorName}</span>
          <span className="shrink-0">•</span>
          <span className="truncate">{authorRole}</span>
        </div>
      </div>
    </a>
  );
};
