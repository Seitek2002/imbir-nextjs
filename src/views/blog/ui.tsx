import { Suspense } from "react";

import { Footer, Header } from "@/widgets";

import { BlogSectionServer } from "@/widgets/blog-section";

import { BLOG_CATEGORIES, BLOG_POSTS, BlogSkeleton } from "@/entities/blog";

const BLOG_SKELETON_COUNT = BLOG_POSTS.filter((post) => !post.featured).length;
const HAS_FEATURED_POST = BLOG_POSTS.some((post) => post.featured);

function BlogFallback() {
  return (
    <div className="flex flex-col gap-6">
      {HAS_FEATURED_POST && (
        <>
          <div className="hidden md:flex gap-5">
            <div className="w-167.5 shrink-0 h-105 rounded-3xl border border-[#E3E4E5] skeleton" />
            <div className="flex flex-col justify-center gap-4 bg-white rounded-3xl border border-[#E3E4E5] p-8 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 skeleton rounded-full" />
                <div className="h-8 w-28 skeleton rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-8 w-4/5 skeleton rounded-lg" />
                <div className="h-4 w-full skeleton rounded-md" />
                <div className="h-4 w-2/3 skeleton rounded-md" />
              </div>
              <div className="h-10 w-36 skeleton rounded-xl" />
            </div>
          </div>

          <div className="md:hidden flex flex-col gap-2">
            <div className="bg-white rounded-3xl border border-[#E3E4E5] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 skeleton rounded-full" />
                <div className="h-8 w-28 skeleton rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-7 w-full skeleton rounded-lg" />
                <div className="h-4 w-full skeleton rounded-md" />
                <div className="h-4 w-3/4 skeleton rounded-md" />
              </div>
              <div className="h-10 w-36 skeleton rounded-xl" />
            </div>
            <div className="w-full h-52 rounded-3xl border border-[#E3E4E5] skeleton" />
          </div>
        </>
      )}

      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="shrink-0 h-10 w-16 skeleton rounded-full" />
        {BLOG_CATEGORIES.map((category) => (
          <div
            key={category.id}
            className="shrink-0 h-10 w-28 skeleton rounded-full"
          />
        ))}
      </div>

      <BlogSkeleton count={BLOG_SKELETON_COUNT} />
    </div>
  );
}

export const BlogPage = () => {
  return (
    <main className="min-h-screen flex flex-col bg-[#F2F3F5]">
      <Header title="Блог" backTo="/" />

      <div className="flex-1 w-full max-w-340 mx-auto px-4 py-6">
        <h1 className="hidden md:block font-semibold text-[40px] leading-[130%] text-[#191A1B] mb-6">
          Блог
        </h1>
        <Suspense fallback={<BlogFallback />}>
          <BlogSectionServer />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
};
