import { FC } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

import Link from "next/link";

import remarkGfm from "remark-gfm";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { BlogArticle, BlogCard, BlogPost } from "@/entities/blog";

import { ROUTES } from "@/shared/config";

import { ArticleImage } from "./article-image";

type Props = {
  article: BlogArticle;
  relatedPosts: BlogPost[];
};

// Бэк отдаёт текст статьи одним полем content в markdown. react-markdown сам
// парсит его в React-элементы и не выполняет сырой HTML из текста (мы не
// подключаем rehype-raw) — это тот же результат, что и явная защита от XSS,
// без ручного вырезания тегов.
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="text-2xl font-semibold text-foreground mt-2">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-foreground mt-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-foreground mt-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base text-secondary leading-[145%]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 space-y-1 text-base text-secondary leading-[145%]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 space-y-1 text-base text-secondary leading-[145%]">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-primary/30 bg-primary-tint rounded-r-xl px-4 py-3 text-secondary italic">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <Link
      href={href ?? "#"}
      className="text-primary underline hover:text-primary-dark transition-colors"
    >
      {children}
    </Link>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  hr: () => <hr className="border-border" />,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-secondary border-collapse">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 text-left">{children}</td>
  ),
};

export const BlogArticlePage: FC<Props> = ({ article, relatedPosts }) => {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Статья" backTo={ROUTES.BLOG} />

      <div className="w-full max-w-340 mx-auto px-3 md:px-4 pt-4 md:pt-6 pb-8">
        <nav className="hidden md:flex items-center gap-3 text-sm leading-none mb-6 text-muted">
          <Link
            href={ROUTES.HOME}
            className="hover:text-primary transition-colors"
          >
            Главная
          </Link>
          <span>•</span>
          <Link
            href={ROUTES.BLOG}
            className="hover:text-primary transition-colors"
          >
            Блог
          </Link>
          <span className="text-primary">•</span>
          <span className="text-primary">{article.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-4 md:mb-6">
          {article.category && (
            <span className="rounded-full bg-[#FFF3F0] text-primary text-[12px] md:text-sm font-medium px-4 py-2">
              {article.category}
            </span>
          )}
          <span className="rounded-full border border-[#D6D9DC] text-secondary text-[12px] md:text-sm font-medium px-4 py-2">
            {article.date}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_332px] gap-6 md:gap-3 md:items-start">
          <article>
            <h1 className="text-[32px] font-semibold leading-[115%] text-foreground mb-5 md:mb-6">
              {article.title}
            </h1>

            <ArticleImage src={article.image} alt={article.title} />

            <div className="mt-5 md:mt-6 space-y-4 md:space-y-5">
              {article.description && (
                <p className="text-base text-secondary leading-[145%] font-medium">
                  {article.description}
                </p>
              )}

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Пока в блоге одна статья, показывать пустой блок «Читать далее» не за чем */}
          <aside className={relatedPosts.length ? "w-full" : "hidden"}>
            <h2 className="text-[32px] font-semibold leading-[120%] text-foreground mb-3">
              Читать далее
            </h2>
            <div className="flex flex-col gap-3">
              {relatedPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  title={post.title}
                  category={post.category}
                  date={post.date}
                  image={post.image}
                  href={post.href}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </main>
  );
};
