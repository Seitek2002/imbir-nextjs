export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  date: string;
  image: string | null;
  is_featured: boolean;
};

export type BlogPostDetail = BlogPost & {
  content: string;
};

export type BlogFilters = {
  category?: string;
  search?: string;
  page?: number;
  page_size?: number;
};
