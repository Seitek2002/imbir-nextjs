import Link from "next/link";

import { fetchBlogCategories, fetchBlogPosts } from "@/entities/blog";

import { ROUTES } from "@/shared/config";

import { BlogSection } from "./ui";

export async function BlogSectionServer({
  variant = "default",
  prioritizeFirstCard = false,
}: {
  variant?: "default" | "home";
  prioritizeFirstCard?: boolean;
}) {
  const [posts, categories] = await Promise.all([
    fetchBlogPosts(),
    fetchBlogCategories(),
  ]);

  // На главной блог — необязательный блок: если статей нет вообще (бэк
  // пуст — проверено через swagger), скрываем его целиком, вместе с
  // заголовком/описанием/ссылкой «Все», а не оставляем пустую секцию с
  // заголовком без единой карточки. Заголовок поэтому и живёт здесь, а не
  // в HomePage — тот рендерит Suspense-заглушку синхронно и не может знать
  // заранее, найдутся ли посты.
  if (variant === "home") {
    if (posts.length === 0) return null;

    return (
      <section className="mx-auto w-full max-w-360 px-3 pt-3 pb-0 md:px-8 md:pt-8 md:pb-12">
        <div className="rounded-2xl bg-white px-4 py-4 md:rounded-none md:bg-transparent md:px-0 md:py-0">
          <div className="mb-4 flex items-start justify-between md:mb-6">
            <div>
              <h2 className="text-[18px] font-semibold leading-tight text-foreground md:text-[28px]">
                Блог
              </h2>
              <p className="hidden md:block text-muted text-base mt-1">
                Статьи о здоровье, советы специалистов и новости медицины
              </p>
            </div>
            <Link
              href={ROUTES.BLOG}
              className="md:hidden text-primary text-sm font-medium mt-1"
            >
              Все
            </Link>
          </div>
          <BlogSection
            posts={posts}
            categories={categories}
            variant={variant}
            prioritizeFirstCard={prioritizeFirstCard}
          />
        </div>
      </section>
    );
  }

  return (
    <BlogSection
      posts={posts}
      categories={categories}
      variant={variant}
      prioritizeFirstCard={prioritizeFirstCard}
    />
  );
}
