# Зачем нужна эта папка

Эта папка `pages/` намеренно пустая — здесь нет роутов.

Проект использует **Next.js App Router** (`src/app`) вместе с **Feature-Sliced
Design**, у которого слой страниц (Pages) живёт в `src/pages`.

Без папки `pages/` в корне проекта Next.js принимает `src/pages` за свой
**Pages Router**: каждый барел `src/pages/<slice>/index.ts` становится маршрутом
и конфликтует с App Router (`src/app/**/page.tsx`), из-за чего падает
`next build` с ошибкой «App Router and Pages Router both match path».

Объявляя эту корневую `pages/`, мы заставляем Next.js использовать **её**
(пустой) Pages Router, оставляя `src/pages` свободным под слой страниц FSD.

Не удалять. См. раздел Next.js в документации FSD:
https://feature-sliced.design/docs/guides/tech/with-nextjs
