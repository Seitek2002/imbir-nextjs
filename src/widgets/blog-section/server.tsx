import { fetchBlogCategories, fetchBlogPosts } from "@/entities/blog";

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

  return (
    <BlogSection
      posts={posts}
      categories={categories}
      variant={variant}
      prioritizeFirstCard={prioritizeFirstCard}
    />
  );
}
