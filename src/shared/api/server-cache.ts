import { unstable_cache } from "next/cache";

import type { QueryClient, QueryKey } from "@tanstack/react-query";

import { CITIES_BY_COUNTRY } from "@/shared/config";

import { getSpecializations } from "./references/requests";
import type { SpecializationScope } from "./references/types";

// Серверный кеш для публичных чтений каталога — тех, что одинаковы для всех
// посетителей (первая страница врачей в городе, справочник специализаций).
//
// Зачем. Страницы каталогов рендерятся на сервере при каждом переходе и перед
// ответом ждут бэк. Обычный запрос занимает 0.3–0.6 с, а примерно каждый
// пятый — на 3 с дольше (замеры 4 октября 2026), и всё это время человек
// смотрит на скелетон. С кешем сервер отвечает сразу тем, что уже знает, а
// бэк опрашивает в фоне.
//
// Как это работает (unstable_cache = stale-while-revalidate): пока запись
// моложе `revalidate` секунд, отдаётся она. Когда устарела — всё равно
// отдаётся она же, а свежие данные запрашиваются фоном и подменяют запись к
// следующему обращению. Упал фоновый запрос — запись остаётся прежней.
//
// Следствие: при редких заходах запись может оказаться и часовой давности.
// Поэтому вместе с данными хранится момент их получения (fetchedAt), и в
// QueryClient они кладутся именно с ним (см. seedQuery ниже): браузер видит,
// что данные старше staleTime, и сразу тихо перезапрашивает их — без
// скелетона, поверх уже показанного списка.
//
// Только для серверных компонентов: из "@/shared/api" файл намеренно не
// реэкспортируется, next/cache в клиентский бандл попадать не должен.
// Кешируй только запросы с ограниченным набором аргументов (город, тип
// справочника): под каждое сочетание аргументов заводится своя запись, и
// произвольный текст поиска раздул бы кеш без пользы.

type Stamped<T> = {
  data: T;
  fetchedAt: number;
};

export const cachedPublicRead = <Args extends unknown[], T>(
  // Имя записи в кеше — уникальное на проект.
  name: string,
  read: (...args: Args) => Promise<T>,
  // Сколько секунд запись считается свежей.
  revalidate: number,
): ((...args: Args) => Promise<Stamped<T>>) =>
  unstable_cache(
    async (...args: Args) => ({
      data: await read(...args),
      fetchedAt: Date.now(),
    }),
    [name],
    { revalidate },
  );

// Кладёт результат cachedPublicRead в QueryClient под нужным ключом и с
// настоящим временем получения. Как и prefetchQuery, ошибку не пробрасывает:
// запрос просто не попадёт в dehydrate, и клиент сходит за данными сам.
export const seedQuery = async <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  read: Promise<Stamped<T>>,
): Promise<void> => {
  try {
    const { data, fetchedAt } = await read;
    queryClient.setQueryData(queryKey, data, { updatedAt: fetchedAt });
  } catch {
    // см. комментарий выше
  }
};

// То же для useInfiniteQuery: его данные — это { pages, pageParams }, и первая
// страница должна лежать в кеше ровно в такой форме, иначе клиент её не
// подхватит (prefetchInfiniteQuery складывает так же).
export const seedInfiniteQuery = async <T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  read: Promise<Stamped<T>>,
  initialPageParam = 1,
): Promise<void> => {
  try {
    const { data, fetchedAt } = await read;
    queryClient.setQueryData(
      queryKey,
      { pages: [data], pageParams: [initialPageParam] },
      { updatedAt: fetchedAt },
    );
  } catch {
    // см. комментарий к seedQuery
  }
};

// Город каталога приходит из cookie, то есть от пользователя. Кешируем только
// города из нашего списка: иначе произвольными значениями cookie можно было бы
// наплодить в кеше сколько угодно записей.
const KNOWN_CITIES = new Set(Object.values(CITIES_BY_COUNTRY).flat());

export const isKnownCity = (city: string): boolean => KNOWN_CITIES.has(city);

// Справочник специализаций нужен фильтрам всех каталогов и меняется редко,
// поэтому читатель один на всех и живёт дольше списков.
export const readSpecializations = cachedPublicRead(
  "reference-specializations",
  (scope: SpecializationScope) => getSpecializations(scope),
  300,
);
