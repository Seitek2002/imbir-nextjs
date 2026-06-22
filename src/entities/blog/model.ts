import { StaticImageData } from "next/image";

import {
  BlogBanner,
  BlogImage1,
  BlogImage2,
  BlogImage3,
} from "@/shared/assets";
import { colors } from "@/shared/config/tokens";

export type BlogCategory = {
  id: string;
  label: string;
  color?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  categoryId: string;
  category: string;
  categoryColor?: string;
  date: string;
  image: StaticImageData | string;
  href: string;
  featured?: boolean;
  badge?: string;
};

export type BlogArticlePoint = {
  title: string;
  text: string;
};

export type BlogArticle = {
  slug: string;
  title: string;
  categoryId: string;
  category: string;
  categoryColor?: string;
  date: string;
  badge?: string;
  image: StaticImageData | string;
  intro: string;
  points: BlogArticlePoint[];
  summaryTitle: string;
  summary: string;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: "health", label: "Здоровье", color: colors.primary },
  { id: "telemedicine", label: "Телемедицина", color: "#4A90D9" },
  { id: "prevention", label: "Профилактика", color: colors.primary },
  { id: "patients", label: "Советы пациентам", color: colors.primary },
];

const makeHref = (slug: string) => `/blog/${slug}`;

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "0",
    slug: "kak-ponyat-chto-pora-k-vrachu-a-ne-v-google",
    title: "Как понять, что пора к врачу, а не в Google",
    description:
      "Простые признаки, при которых самодиагностика может навредить, и когда нужна консультация специалиста",
    categoryId: "health",
    category: "Здоровье",
    categoryColor: colors.primary,
    date: "23 октября 2025",
    image: BlogBanner,
    href: makeHref("kak-ponyat-chto-pora-k-vrachu-a-ne-v-google"),
    featured: true,
    badge: "Новое",
  },
  {
    id: "1",
    slug: "7-privychek-kotorye-portyat-zdorove",
    title: "7 привычек, которые незаметно портят ваше здоровье",
    categoryId: "prevention",
    category: "Профилактика",
    categoryColor: colors.primary,
    date: "24 декабря 2025",
    image: BlogImage1,
    href: makeHref("7-privychek-kotorye-portyat-zdorove"),
  },
  {
    id: "2",
    slug: "onlayn-konsultatsiya-s-vrachom-mify-i-realnost",
    title: "Онлайн-консультация с врачом: мифы и реальность",
    categoryId: "telemedicine",
    category: "Телемедицина",
    categoryColor: colors.primary,
    date: "12 января 2025",
    image: BlogImage2,
    href: makeHref("onlayn-konsultatsiya-s-vrachom-mify-i-realnost"),
  },
  {
    id: "3",
    slug: "kak-vybrat-vracha-opyt-otzyvy-ili-tsena",
    title: "Как выбрать врача: опыт, отзывы или цена?",
    categoryId: "patients",
    category: "Советы пациентам",
    categoryColor: colors.primary,
    date: "17 января 2025",
    image: BlogImage3,
    href: makeHref("kak-vybrat-vracha-opyt-otzyvy-ili-tsena"),
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "kak-ponyat-chto-pora-k-vrachu-a-ne-v-google",
    title: "Как понять, что пора к врачу, а не в Google",
    categoryId: "health",
    category: "Здоровье",
    categoryColor: colors.primary,
    date: "23 октября 2025",
    badge: "Новое",
    image: BlogBanner,
    intro:
      "Мы все сначала открываем поиск - это быстро, удобно и вроде бы помогает понять, что происходит с организмом. Но интернет не видит вас, не задаёт уточняющих вопросов и легко может либо напугать, либо усилить бдительность. Есть ситуации, когда лучше закрыть вкладку и записаться к врачу.",
    points: [
      {
        title: "Симптомы не проходят или становятся сильнее",
        text: "Если дискомфорт длится несколько дней, усиливается или появляются новые ощущения - это сигнал, что нужна профессиональная оценка. Самодиагностика тут только тянет время.",
      },
      {
        title: "Сильная боль или резкое ухудшение состояния",
        text: "Острая боль, высокая температура, сильная слабость, головокружение, проблемы с дыханием - это уже не «погуглить», а действовать быстро.",
      },
      {
        title: "Повторяющиеся проблемы",
        text: "Если одно и то же возвращается снова и снова, значит причина глубже, чем кажется. Интернет может подсказать варианты, но не поставить диагноз.",
      },
      {
        title: "Вы начинаете себя пугать",
        text: "Если после чтения статей становится тревожно, а симптомы будто «примеряются» на себя - пора остановиться. Врач поможет отделить реальные риски от лишних страхов.",
      },
      {
        title: "Нужны анализы или лечение",
        text: "Назначать себе лекарства или интерпретировать результаты анализов по статьям - плохая идея. Тут важен опыт и клиническое мышление специалиста.",
      },
    ],
    summaryTitle: "Главное",
    summary:
      "Google - это инструмент для общей информации, а не замена врачу. Если есть сомнения - лучше перестраховаться и получить профессиональное мнение. Спокойствие и ясность почти всегда стоят одного визита.",
  },
  {
    slug: "7-privychek-kotorye-portyat-zdorove",
    title: "7 привычек, которые незаметно портят ваше здоровье",
    categoryId: "prevention",
    category: "Профилактика",
    categoryColor: colors.primary,
    date: "24 декабря 2025",
    image: BlogImage1,
    intro:
      "Кажется, что мелкие ежедневные действия не влияют на самочувствие. На деле именно они формируют нагрузку на организм и постепенно ухудшают качество жизни.",
    points: [
      {
        title: "Сон по остаточному принципу",
        text: "Недосып снижает концентрацию, повышает уровень стресса и влияет на иммунитет. Стабильный режим сна - базовая профилактика.",
      },
      {
        title: "Мало воды в течение дня",
        text: "Обезвоживание часто проявляется как усталость и головная боль. Регулярный питьевой режим помогает поддерживать обменные процессы.",
      },
      {
        title: "Питание на бегу",
        text: "Переизбыток быстрых перекусов и сахара перегружает организм. Лучше выбирать простую, регулярную и сбалансированную еду.",
      },
    ],
    summaryTitle: "Главное",
    summary:
      "Здоровье чаще зависит не от разовых подвигов, а от ежедневных привычек. Маленькие изменения, которые вы можете удерживать, работают лучше всего.",
  },
  {
    slug: "onlayn-konsultatsiya-s-vrachom-mify-i-realnost",
    title: "Онлайн-консультация с врачом: мифы и реальность",
    categoryId: "telemedicine",
    category: "Телемедицина",
    categoryColor: colors.primary,
    date: "12 января 2025",
    image: BlogImage2,
    intro:
      "Телемедицина уже стала нормой: это удобно, быстро и безопасно для многих сценариев. Но важно понимать, когда онлайн действительно уместен.",
    points: [
      {
        title: "Онлайн не заменяет экстренную помощь",
        text: "При острых симптомах или резком ухудшении состояния нужно обращаться в неотложку. Телемедицина подходит для плановых и уточняющих вопросов.",
      },
      {
        title: "Качество консультации зависит от подготовки",
        text: "Если заранее собрать жалобы, измерения и анализы, врач быстрее поймет картину и даст более точные рекомендации.",
      },
      {
        title: "Это удобно для наблюдения в динамике",
        text: "Повторные визиты и контроль терапии часто можно проводить удаленно, экономя время без потери качества.",
      },
    ],
    summaryTitle: "Главное",
    summary:
      "Онлайн-консультация - отличный инструмент, если использовать его по назначению. Для диагностики в сложных случаях очный визит остается обязательным.",
  },
  {
    slug: "kak-vybrat-vracha-opyt-otzyvy-ili-tsena",
    title: "Как выбрать врача: опыт, отзывы или цена?",
    categoryId: "patients",
    category: "Советы пациентам",
    categoryColor: colors.primary,
    date: "17 января 2025",
    image: BlogImage3,
    intro:
      "Выбор врача часто вызывает стресс: вариантов много, критерии разные, а решение хочется принять быстро. Лучше опираться на несколько факторов сразу.",
    points: [
      {
        title: "Смотрите на профиль и релевантный опыт",
        text: "Важно не только количество лет практики, но и специализация под ваш запрос. Узкий профиль часто повышает точность рекомендаций.",
      },
      {
        title: "Отзывы полезны, но не абсолютны",
        text: "Ориентируйтесь на повторяющиеся сигналы: внимательность, объяснения, результат лечения. Единичные эмоциональные оценки могут искажать картину.",
      },
      {
        title: "Цена должна быть прозрачной",
        text: "Сравнивайте не только стоимость первичного приема, но и дальнейший план: анализы, повторные визиты и формат сопровождения.",
      },
    ],
    summaryTitle: "Главное",
    summary:
      "Оптимальный выбор врача строится на балансе компетенции, коммуникации и прозрачных условий. Хороший специалист объясняет, что и зачем вы делаете вместе.",
  },
];

export const getBlogArticleBySlug = (slug: string) =>
  BLOG_ARTICLES.find((article) => article.slug === slug);

export const getRelatedBlogPosts = (slug: string, limit = 3) =>
  BLOG_POSTS.filter((post) => post.slug !== slug).slice(0, limit);

// Async data-fetching functions — replace with real API calls when backend is ready
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  return BLOG_POSTS;
}

export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  return BLOG_CATEGORIES;
}
