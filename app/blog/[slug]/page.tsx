import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/pages/blog-article";

import { fetchBlogArticle, fetchRelatedBlogPosts } from "@/entities/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

// Статьи приходят с бэка и появляются без деплоя — вместо статики по списку
// слагов держим страницу на ISR.
export const revalidate = 300;

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
