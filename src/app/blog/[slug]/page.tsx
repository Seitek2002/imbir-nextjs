import { notFound } from "next/navigation";

import { BlogArticlePage } from "@/views";

import {
  BLOG_POSTS,
  getBlogArticleBySlug,
  getRelatedBlogPosts,
} from "@/entities/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <BlogArticlePage
      article={article}
      relatedPosts={getRelatedBlogPosts(slug)}
    />
  );
}
