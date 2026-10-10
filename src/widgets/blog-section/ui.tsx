"use client";

import { FC, useState } from "react";

import Link from "next/link";

import {
  BlogCard,
  BlogCategory,
  BlogImageFallback,
  BlogPost,
  BlogSkeleton,
  fetchBlogPostsPage,
} from "@/entities/blog";

import { colors } from "@/shared/config";
import { Button, ImageWithFallback } from "@/shared/ui";

type Props = {
  categories: BlogCategory[];
  posts: BlogPost[];
  // On the dedicated /blog page the grid is near the top, so eager-load the
  // first card (its image is the mobile LCP). Off by default (e.g. on home,
  // where the section sits far below the fold).
  prioritizeFirstCard?: boolean;
  // Сколько всего страниц у общего списка (первая уже в posts). Нет — значит,
  // кнопки «Показать ещё» не будет.
  totalPages?: number;
  variant?: "default" | "home";
};

// Загруженные статьи по одной вкладке категорий («all» — без фильтра).
type CategoryList = {
  error: boolean;
  loading: boolean;
  page: number;
  posts: BlogPost[];
  totalPages: number;
};

const EMPTY_LIST: CategoryList = {
  error: false,
  loading: false,
  page: 0,
  posts: [],
  totalPages: 1,
};

export const BlogSection: FC<Props> = ({
  posts,
  categories,
  variant = "default",
  prioritizeFirstCard = false,
  totalPages = 1,
}) => {
  const [activeCategory, setActiveCategory] = useState("all");
  // Каждая категория грузится с бэка отдельно (?category=slug) и листается
  // своими страницами — раньше фильтр работал только по первым 12 статьям, и
  // более старые статьи и целые категории пропадали.
  const [lists, setLists] = useState<Record<string, CategoryList>>(() => ({
    all: { ...EMPTY_LIST, page: 1, posts, totalPages },
  }));

  const featuredLinkClassName =
    "inline-flex w-fit items-center rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-white transition-all active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)]";

  const loadPage = async (categoryId: string, page: number) => {
    setLists((prev) => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] ?? EMPTY_LIST),
        loading: true,
        error: false,
      },
    }));
    try {
      const result = await fetchBlogPostsPage({
        page,
        category: categoryId === "all" ? undefined : categoryId,
      });
      setLists((prev) => {
        const current = prev[categoryId] ?? EMPTY_LIST;
        const base = page === 1 ? [] : current.posts;
        const seen = new Set(base.map((post) => post.id));
        return {
          ...prev,
          [categoryId]: {
            error: false,
            loading: false,
            page: result.page,
            posts: [
              ...base,
              ...result.posts.filter((post) => !seen.has(post.id)),
            ],
            totalPages: result.totalPages,
          },
        };
      });
    } catch {
      setLists((prev) => ({
        ...prev,
        [categoryId]: {
          ...(prev[categoryId] ?? EMPTY_LIST),
          loading: false,
          error: true,
        },
      }));
    }
  };

  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (!lists[categoryId]) void loadPage(categoryId, 1);
  };

  const current = lists[activeCategory] ?? { ...EMPTY_LIST, loading: true };

  // Крупно сверху — первая избранная статья. Остальные избранные идут в общую
  // сетку, а не пропадают. В чужой категории крупный блок не показываем.
  const featured = posts.find((post) => post.featured);
  const showFeatured =
    !!featured &&
    (activeCategory === "all" || featured.categoryId === activeCategory);
  const filtered = current.posts.filter(
    (post) => !(showFeatured && post.id === featured?.id),
  );
  const hasMore = current.page > 0 && current.page < current.totalPages;

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
      {featured && showFeatured && (
        <div className="hidden md:flex gap-5">
          <Link
            href={featured.href}
            className="relative w-167.5 shrink-0 h-105 rounded-3xl overflow-hidden border border-border-soft group block"
          >
            <ImageWithFallback
              src={featured.image}
              alt={featured.title}
              fill
              // Обложка featured-поста — LCP-элемент страницы блога, и
              // грузилась лениво.
              priority
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              fallback={<BlogImageFallback />}
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

      {featured && showFeatured && (
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
            <ImageWithFallback
              src={featured.image}
              alt={featured.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top"
              fallback={<BlogImageFallback />}
            />
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => selectCategory("all")}
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
            onClick={() => selectCategory(category.id)}
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
      ) : current.loading ? (
        <BlogSkeleton count={3} />
      ) : current.error ? null : (
        <p className="text-sm text-muted py-8 text-center">
          Нет статей в этой категории
        </p>
      )}

      {current.error && (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-muted text-center">
            Не удалось загрузить статьи
          </p>
          <Button
            variant="outline"
            onClick={() =>
              void loadPage(
                activeCategory,
                current.page > 0 ? current.page + 1 : 1,
              )
            }
          >
            Повторить
          </Button>
        </div>
      )}

      {hasMore && !current.error && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => void loadPage(activeCategory, current.page + 1)}
            loading={current.loading}
          >
            {current.loading ? "Загрузка…" : "Показать ещё"}
          </Button>
        </div>
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
  className: string;
  post: BlogPost;
  priority?: boolean;
  sizes: string;
}> = ({ post, className, sizes, priority = false }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <ImageWithFallback
      src={post.image}
      alt={post.title}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
      fallback={<BlogImageFallback />}
    />
  </div>
);

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
