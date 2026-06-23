"use client";

import { FC, useState } from "react";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { colors } from "@/shared/config/tokens";

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
  categoryColor = colors.primary,
  date,
  image,
  href = "#",
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className="bg-white rounded-3xl overflow-hidden flex flex-col p-2 group w-full border border-border-soft"
    >
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        {!loaded && <div className="absolute inset-0 rounded-2xl skeleton" />}
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 text-xs mb-2">
          <span style={{ color: categoryColor }} className="font-medium">
            {category}
          </span>
          <span className="text-muted">•</span>
          <span className="text-muted">{date}</span>
        </div>
        <p
          className="font-semibold text-sm text-foreground leading-snug overflow-hidden"
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
