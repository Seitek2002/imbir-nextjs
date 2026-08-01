"use client";

import { FC, useState } from "react";

import Link from "next/link";

import { BlogCard, BlogCategory, BlogPost } from "@/entities/blog";

import { colors } from "@/shared/config";
import { ImageWithFallback } from "@/shared/ui";

type Props = {
  posts: BlogPost[];
  categories: BlogCategory[];
  variant?: "default" | "home";
  // On the dedicated /blog page the grid is near the top, so eager-load the
  // first card (its image is the mobile LCP). Off by default (e.g. on home,
  // where the section sits far below the fold).
  prioritizeFirstCard?: boolean;
};

export const BlogSection: FC<Props> = ({
  posts,
  categories,
  variant = "default",
  prioritizeFirstCard = false,
}) => {
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

  if (variant === "home") {
    const homeFeatured = featured ?? posts[0];
    const homeSecondary = posts
      .filter((post) => post.id !== homeFeatured?.id)
      .slice(0, 3);
    const homeMobilePosts = [
      ...(homeFeatured ? [homeFeatured] : []),
      ...homeSecondary,
    ].slice(0, 3);

    if (!homeFeatured) return null;

    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-7">
        <HomeFeaturedCard post={homeFeatured} />

        <div className="hidden flex-col gap-3 md:flex">
          {homeSecondary.map((post) => (
            <HomeHorizontalCard key={post.id} post={post} />
          ))}
        </div>

        <div className="flex flex-col gap-2 md:hidden">
          {homeMobilePosts.map((post, index) => (
            <HomeHorizontalCard
              key={post.id}
              post={post}
              priority={prioritizeFirstCard && index === 0}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {featured && (
        <div className="hidden md:flex gap-5">
          <Link
            href={featured.href}
            className="relative w-167.5 shrink-0 h-105 rounded-3xl overflow-hidden border border-border-soft group block"
          >
            {!featuredLoaded && <div className="absolute inset-0 skeleton" />}
            <ImageWithFallback
              src={featured.image}
              alt={featured.title}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => setFeaturedLoaded(true)}
              onError={() => setFeaturedLoaded(true)}
              fallback={<div className="absolute inset-0 bg-surface" />}
            />
          </Link>

          <div className="flex flex-col justify-center gap-4 bg-white rounded-3xl border border-border-soft p-8 flex-1">
            <div className="flex items-center gap-3">
              {featured.category && (
                <span className="text-sm text-primary bg-[#FFF3F0] px-3 py-1.5 rounded-full font-medium">
                  {featured.category}
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
              {featured.category && (
                <span className="text-sm text-primary bg-[#FFF3F0] px-3 py-1.5 rounded-full font-medium">
                  {featured.category}
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
            <ImageWithFallback
              src={featured.image}
              alt={featured.title}
              fill
              sizes="100vw"
              className="object-cover object-top"
              onLoad={() => setFeaturedLoaded(true)}
              onError={() => setFeaturedLoaded(true)}
              fallback={<div className="absolute inset-0 bg-surface" />}
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
          {filtered.map((post, index) => (
            <BlogCard
              key={post.id}
              title={post.title}
              category={post.category}
              date={post.date}
              image={post.image}
              href={post.href}
              priority={prioritizeFirstCard && index === 0}
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

const HomePostMeta: FC<{ post: BlogPost }> = ({ post }) => (
  <div className="flex items-center gap-2 whitespace-nowrap text-xs leading-none">
    <span className="font-medium text-primary">{post.category}</span>
    <span className="text-muted">•</span>
    <span className="hidden text-muted md:inline">{post.date}</span>
    <span className="text-muted md:hidden">{post.dateShort}</span>
  </div>
);

const HomePostImage: FC<{
  post: BlogPost;
  className: string;
  sizes: string;
  priority?: boolean;
}> = ({ post, className, sizes, priority = false }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <ImageWithFallback
        src={post.image}
        alt={post.title}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        fallback={<div className="absolute inset-0 bg-surface" />}
      />
    </div>
  );
};

const HomeFeaturedCard: FC<{ post: BlogPost }> = ({ post }) => (
  <Link
    href={post.href}
    className="hidden min-w-0 overflow-hidden rounded-2xl border border-border-soft bg-white md:flex md:flex-col"
  >
    <HomePostImage
      post={post}
      className="mx-1 mt-1 aspect-[5/3] rounded-2xl"
      sizes="(max-width: 1360px) 50vw, 620px"
    />
    <div className="flex flex-col gap-2 p-3.5 pt-2.5">
      <HomePostMeta post={post} />
      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
        {post.title}
      </h3>
      {post.description && (
        <p className="line-clamp-2 text-sm leading-snug text-secondary">
          {post.description}
        </p>
      )}
    </div>
  </Link>
);

const HomeHorizontalCard: FC<{
  post: BlogPost;
  priority?: boolean;
}> = ({ post, priority = false }) => (
  <Link
    href={post.href}
    className="flex h-[108px] min-w-0 gap-2 overflow-hidden rounded-2xl border border-border-soft bg-white p-1 md:h-[120px] md:gap-3"
  >
    <HomePostImage
      post={post}
      className="h-full w-[102px] shrink-0 rounded-xl md:w-[110px] md:rounded-2xl"
      sizes="110px"
      priority={priority}
    />
    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-1.5 py-2 md:gap-3 md:px-2.5">
      <HomePostMeta post={post} />
      <h3 className="line-clamp-3 text-base font-semibold leading-[1.2] text-foreground md:line-clamp-2">
        {post.title}
      </h3>
    </div>
  </Link>
);
