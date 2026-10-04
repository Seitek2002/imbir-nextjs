import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/pages/blog-article";

import { fetchBlogArticle, fetchRelatedBlogPosts } from "@/entities/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

// Статьи приходят с бэка и появляются без деплоя — вместо статики по списку
// слагов держим страницу на ISR.
export const revalidate = 300;
// Одного revalidate для маршрута с [slug] мало: без generateStaticParams Next
// считает его полностью динамическим и рендерит заново на каждый запрос, ничего
// не кешируя. Пустой список значит «на сборке ничего не генерируем, каждую
// статью собираем при первом обращении и дальше держим в кеше».
export const generateStaticParams = async () => [];

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const [article, relatedPosts] = await Promise.all([
    fetchBlogArticle(slug),
    fetchRelatedBlogPosts(slug),
  ]);

  if (!article) {
    notFound();
  }

  return <BlogArticlePage article={article} relatedPosts={relatedPosts} />;
}
