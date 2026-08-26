import {
  type BlogPost as ApiBlogPost,
  type BlogPostDetail as ApiBlogPostDetail,
  getBlogCategories,
  getBlogPost,
  getBlogPosts,
} from "@/shared/api";
import { ROUTES } from "@/shared/config";

export type BlogCategory = {
  // slug категории — по нему же фильтруется список
  id: string;
  label: string;
};

export type BlogPost = {
  category: string;
  categoryId: string;
  date: string;
  dateShort: string;
  description?: string;
  featured: boolean;
  href: string;
  id: string;
  image?: string;
  slug: string;
  title: string;
};

// Деталь статьи: тот же пост плюс текст. Бэк отдаёт его одним полем content,
// без структуры (введение/пункты/итог), поэтому страница статьи рисует его
// абзацами, а не по разделам, как было на моках.
export type BlogArticle = BlogPost & {
  content: string;
};

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const SHORT_MONTHS = [
  "янв.",
  "февр.",
  "март",
  "апр.",
  "май",
  "июнь",
  "июль",
  "авг.",
  "сент.",
  "окт.",
  "нояб.",
  "дек.",
];

// "2026-07-17" → "17 июля 2026"
export const formatBlogDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatBlogDateShort = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const adaptPost = (post: ApiBlogPost): BlogPost => ({
  id: String(post.id),
  slug: post.slug,
  title: post.title,
  description: post.description || undefined,
  categoryId: post.category?.slug ?? "",
  category: post.category?.name ?? "",
  date: formatBlogDate(post.date),
  dateShort: formatBlogDateShort(post.date),
  image: post.image ?? undefined,
  href: ROUTES.BLOG_ARTICLE(post.slug),
  featured: post.is_featured,
});

const adaptArticle = (post: ApiBlogPostDetail): BlogArticle => ({
  ...adaptPost(post),
  content: post.content ?? "",
});

// Блог — публичный контент: если запрос не прошёл, показываем пустой раздел, а
// не роняем страницу (она рендерится на сервере, в том числе при ISR).
export const fetchBlogPosts = async (limit = 12): Promise<BlogPost[]> => {
  try {
    const { data } = await getBlogPosts({ page_size: limit });
    return data.map(adaptPost);
  } catch {
    return [];
  }
};

export const fetchBlogCategories = async (): Promise<BlogCategory[]> => {
  try {
    const categories = await getBlogCategories();
    return categories.map((category) => ({
      id: category.slug,
      label: category.name,
    }));
  } catch {
    return [];
  }
};

export const fetchBlogArticle = async (
  slug: string,
): Promise<BlogArticle | null> => {
  try {
    return adaptArticle(await getBlogPost(slug));
  } catch {
    return null;
  }
};

export const fetchRelatedBlogPosts = async (
  slug: string,
  limit = 3,
): Promise<BlogPost[]> => {
  const posts = await fetchBlogPosts(limit + 1);
  return posts.filter((post) => post.slug !== slug).slice(0, limit);
};
