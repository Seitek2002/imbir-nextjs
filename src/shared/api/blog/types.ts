export type BlogCategory = {
  id: number;
  name: string;
  slug: string;
};

export type BlogPost = {
  category: BlogCategory;
  date: string;
  description: string;
  id: number;
  image: null | string;
  is_featured: boolean;
  slug: string;
  title: string;
};

export type BlogPostDetail = BlogPost & {
  content: string;
};

export type BlogFilters = {
  category?: string;
  page?: number;
  page_size?: number;
  search?: string;
};
