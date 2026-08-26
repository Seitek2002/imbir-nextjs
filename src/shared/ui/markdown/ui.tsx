"use client";

import { FC } from "react";
import ReactMarkdown, { type Components } from "react-markdown";

import Link from "next/link";

import remarkGfm from "remark-gfm";

// Единая отрисовка markdown для всего проекта: статьи блога и юридические
// страницы (условия, политика) — бэк отдаёт их одним текстовым полем.
//
// rehype-raw НЕ подключаем сознательно: без него react-markdown не выполняет
// сырой HTML из текста. Это и есть защита от XSS — сами теги вырезать не
// нужно. Важно, потому что текст приходит из админки.

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

export const Markdown: FC<{ children: string; className?: string }> = ({
  children,
  className,
}) => (
  <div className={className}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  </div>
);
