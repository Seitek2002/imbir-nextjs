"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";

// Куда можно уйти с несуществующего адреса. Это основные разделы шапки —
// чаще всего на 404 попадают именно по устаревшей ссылке на врача или клинику,
// поэтому список ведёт обратно в каталоги, а не только на главную.
const QUICK_LINKS = [
  { href: ROUTES.SPECIALISTS, label: "Специалисты" },
  { href: ROUTES.CLINICS, label: "Клиники" },
  { href: ROUTES.SERVICES, label: "Услуги" },
  { href: ROUTES.BLOG, label: "Блог" },
];

// Своя страница 404 вместо дефолтной у Next: та приходит без шрифтов и цветов
// проекта и посреди сайта читается как чужая. Каркас намеренно повторяет
// app/error.tsx — карточка по центру, тот же логотип, те же две кнопки, —
// чтобы оба тупика выглядели как один и тот же продукт.
export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border p-8 flex flex-col items-center text-center gap-4">
        <span className="text-2xl font-bold text-primary">IMBIR</span>

        {/* Плашка с числом — тот же приём, что у героя на /contacts:
            фирменный фон и два круга, выходящих за край. */}
        <div className="relative w-full overflow-hidden rounded-3xl bg-primary py-10">
          <span className="relative z-10 block text-6xl font-bold tracking-tight text-white tabular-nums">
            404
          </span>
          <div className="absolute -right-8 -bottom-10 size-32 rounded-full bg-white/10" />
          <div className="absolute -left-10 -top-12 size-28 rounded-full bg-white/10" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Страница не найдена
          </h1>
          <p className="text-secondary text-sm">
            Возможно, адрес введён с опечаткой, а специалиста или клинику уже
            удалили. Начните с одного из разделов ниже.
          </p>
        </div>

        {/* Сетка 2×2, а не flex-wrap: четыре чипа разной ширины в ряду не
            помещались в карточку, и последний уезжал на свою строку по центру. */}
        <div className="grid w-full grid-cols-2 gap-2">
          {QUICK_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-border px-4 py-2 text-center text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center"
            onClick={() => router.back()}
          >
            Назад
          </Button>
          <Link href={ROUTES.HOME} className="flex-1">
            <Button size="md" className="w-full justify-center">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
