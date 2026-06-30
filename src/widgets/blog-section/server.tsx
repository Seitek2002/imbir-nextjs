import { fetchBlogCategories, fetchBlogPosts } from "@/entities/blog";

import { BlogSection } from "./ui";

export async function BlogSectionServer({
  prioritizeFirstCard = false,
}: {
  prioritizeFirstCard?: boolean;
}) {
  const [posts, categories] = await Promise.all([
    fetchBlogPosts(),
    fetchBlogCategories(),
  ]);

  return (
    <BlogSection
      posts={posts}
      categories={categories}
      prioritizeFirstCard={prioritizeFirstCard}
    />
  );
}
