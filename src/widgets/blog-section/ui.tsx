"use client";

import { FC, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { BlogCard, BlogCategory, BlogPost } from "@/entities/blog";

import { ThunderIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";

type Props = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

export const BlogSection: FC<Props> = ({ posts, categories }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [featuredLoaded, setFeaturedLoaded] = useState(false);

  const featuredLinkClassName =
    "inline-flex w-fit items-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]";

  const featured = posts.find((post) => post.featured);
  const filtered =
    activeCategory === "all"
      ? posts.filter((post) => !post.featured)
      : posts.filter(
          (post) => !post.featured && post.categoryId === activeCategory,
        );

  return (
    <div className="flex flex-col gap-6">
      {featured && (
        <div className="hidden md:flex gap-5">
          <Link
            href={featured.href}
            className="relative w-167.5 shrink-0 h-105 rounded-3xl overflow-hidden border border-border-soft group block"
          >
            {!featuredLoaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setFeaturedLoaded(true)}
            />
          </Link>

          <div className="flex flex-col justify-center gap-4 bg-white rounded-3xl border border-border-soft p-8 flex-1">
            <div className="flex items-center gap-3">
              {featured.badge && (
                <span className="flex items-center gap-1.5 bg-[#FFF3F0] text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  <ThunderIcon />
                  {featured.badge}
                </span>
              )}
              <span className="text-sm text-muted border border-border-soft px-3 py-1.5 rounded-full">
                {featured.date}
              </span>
            </div>

            <div>
              <h2 className="font-semibold text-[28px] text-foreground leading-[130%] mb-2">
                {featured.title}
              </h2>
              {featured.description && (
                <p className="text-sm text-secondary leading-relaxed line-clamp-2">
                  {featured.description}
                </p>
              )}
            </div>

            <Link href={featured.href} className={featuredLinkClassName}>
              Читать статью
            </Link>
          </div>
        </div>
      )}

      {featured && (
        <div className="md:hidden flex flex-col gap-2">
          <div className="bg-white rounded-3xl border border-border-soft p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              {featured.badge && (
                <span className="flex items-center gap-1.5 bg-[#FFF3F0] text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                  <ThunderIcon />
                  {featured.badge}
                </span>
              )}
              <span className="text-sm text-muted border border-border-soft px-3 py-1.5 rounded-full">
                {featured.date}
              </span>
            </div>
            <h2 className="font-bold text-xl text-foreground leading-snug">
              {featured.title}
            </h2>
            {featured.description && (
              <p className="text-sm text-secondary leading-relaxed">
                {featured.description}
              </p>
            )}
            <Link href={featured.href} className={featuredLinkClassName}>
              Читать статью
            </Link>
          </div>
          <Link
            href={featured.href}
            className="relative w-full h-52 rounded-3xl overflow-hidden border border-border-soft block"
          >
            {!featuredLoaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="100vw"
              className="object-cover object-top"
              onLoad={() => setFeaturedLoaded(true)}
            />
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setActiveCategory("all")}
          className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
          style={{
            backgroundColor:
              activeCategory === "all" ? colors.primary : colors.borderSoft,
            color: activeCategory === "all" ? "#fff" : colors.secondary,
          }}
        >
          Все
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor:
                activeCategory === category.id
                  ? colors.primary
                  : colors.borderSoft,
              color: activeCategory === category.id ? "#fff" : colors.secondary,
            }}
          >
            {category.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              category={post.category}
              categoryColor={post.categoryColor}
              date={post.date}
              image={post.image}
              href={post.href}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted py-8 text-center">
          Нет статей в этой категории
        </p>
      )}
    </div>
  );
};
