import { Suspense } from "react";

import { BlogSection, Footer, Header } from "@/widgets";

import { BLOG_CATEGORIES, BLOG_POSTS } from "@/entities/blog";

export const BlogPage = () => {
  return (
    <main className="min-h-screen flex flex-col bg-[#F2F3F5]">
      <Suspense fallback={<div className="h-16 w-full bg-white" />}>
        <Header title="Блог" backTo="/" />
      </Suspense>

      <div className="flex-1 w-full max-w-340 mx-auto px-4 py-6">
        <h1 className="hidden md:block font-semibold text-[40px] leading-[130%] text-[#191A1B] mb-6">
          Блог
        </h1>
        <BlogSection posts={BLOG_POSTS} categories={BLOG_CATEGORIES} />
      </div>

      <Footer />
    </main>
  );
};
