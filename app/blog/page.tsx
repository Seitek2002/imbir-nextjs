import { BlogPage } from "@/pages/blog";

// Список статей тянется с бэка при рендере — обновляем страницу по ISR, иначе
// новые публикации появлялись бы только с деплоем.
export const revalidate = 300;

export default function Page() {
  return <BlogPage />;
}
