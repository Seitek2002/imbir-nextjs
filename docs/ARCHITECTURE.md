# ARCHITECTURE — imbir-nextjs

> Аудит по состоянию на 2026-08-10, ветка `master`, коммит `b6c616c`.
> Всё ниже получено чтением файлов репозитория. Там, где я файл не читал или
> не смог проверить утверждение — это написано явно.

---

## ЭТАП 0. Инвентаризация

### Версии и менеджер пакетов

`package.json`:

| Что | Значение | Строка |
|---|---|---|
| Next.js | `^16.2.3` (реально собрано 16.2.3 — `.next/diagnostics/framework.json`) | `package.json:28` |
| React / ReactDOM | `19.2.4` (жёстко, без каретки) | `package.json:29-30` |
| TypeScript | `^5` | `package.json:54` |
| Менеджер пакетов | npm (`package-lock.json` в корне, `npm ci` в `dockerfile:8`) | — |

Ключевые библиотеки:

| Роль | Библиотека | Строка |
|---|---|---|
| Server state / кэш | `@tanstack/react-query ^5.99.0` + devtools | `package.json:23-24` |
| Client state | `zustand ^5.0.12` (с `persist`) | `package.json:34` |
| HTTP-транспорт | `axios ^1.16.1` | `package.json:25` |
| Стили | `tailwindcss ^4` + `@tailwindcss/postcss` | `package.json:41,53` |
| Классы | `clsx` + `tailwind-merge` | `package.json:26,33` |
| Тосты | `react-hot-toast ^2.6.0` | `package.json:31` |
| Утил-хуки | `react-use ^17.6.0` | `package.json:32` |
| Видеозвонки | `livekit-client`, `@livekit/components-react`, `@livekit/components-styles` | `package.json:21-22,27` |
| Мобильная оболочка | `@capacitor/*` 8.x | `package.json:19-20,37` |
| Линт архитектуры | `steiger` + `@feature-sliced/steiger-plugin` | `package.json:38,52` |
| SVG → React | `@svgr/webpack` (через turbopack rules) | `package.json:40`, `next.config.ts:82-87` |
| Компилятор | `babel-plugin-react-compiler 1.0.0`, включён через `reactCompiler: true` | `package.json:46`, `next.config.ts:13` |

**Форм-библиотеки нет.** Ни `react-hook-form`, ни `formik`. **Валидации-библиотеки нет** — ни `zod`, ни `yup`. Всё руками (см. CODESTYLE.md).
**Тестов нет вообще** — ни одного `*.test.*` / `*.spec.*` в `src` и `app`, ни одного тест-раннера в `devDependencies`.

### Скрипты

`package.json:5-17`: `dev`, `build`, `start`, `analyze` / `analyze:webpack`, `cap:sync`, `cap:open:android`, `lint`, `format`, `format:check`, `prepare` (husky).
`lint-staged` (`package.json:56-63`) гоняет **только prettier**, без eslint.
`.husky/pre-commit` — `npx lint-staged`.

### Конфиги

**`next.config.ts`**
- `reactCompiler: true` (`:13`) — React Compiler включён на весь проект.
- `rewrites()` (`:17-24`): `/backend-api/:path*` → `${backendUrl}/:path*`. Причина в комментарии `:15-16` — «файлы отправляем через тот же origin, чтобы браузер не блокировал multipart по CORS».
- `experimental.appNewScrollHandler: true` (`:33`) с подробным объяснением бага старого скролл-хендлера.
- `images` (`:36-76`): форматы avif/webp, `qualities: [55, 75]`, шесть `remotePatterns` — включая **`http`** для `155.212.216.197:8030` (`:57-62`) и для `imbir.sino0on.ru` (`:68-74`).
- `turbopack.root: __dirname` (`:81`) — иначе Next находит `~/package-lock.json`.
- Обёрнут в `@next/bundle-analyzer` (`:4-6, :91`).
- **`output` не задан** — статического экспорта нет (проверил grep'ом по файлу).

**`tsconfig.json`**: `strict: true`, `target: ES2017`, `moduleResolution: bundler`, alias `@/* → ./src/*` (`:21-23`). Никаких дополнительных строгих флагов (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) нет.

**`eslint.config.mjs`**: flat-config, `eslint-config-next/core-web-vitals` + `/typescript`, плюс `globalIgnores` (в т.ч. `server/**` — «локальный мок-сервер», хотя папки `server/` в репозитории сейчас нет). Своих правил нет.

**`.prettierrc`**: единственная настройка кроме дефолтов — `@trivago/prettier-plugin-sort-imports` с `importOrder`, повторяющим слои FSD:
`^react` → `^next` → `<THIRD_PARTY_MODULES>` → `@/app` → `@/pages` → `@/widgets` → `@/features` → `@/entities` → `@/shared` → относительные. `importOrderSeparation: true`.

**`steiger.config.ts`**: `fsd.configs.recommended` + два точечных отключения (`shared/assets/**` — `public-api`/`no-public-api-sidestep`; `widgets/profile/sidebar/**` — `insignificant-slice`), оба с объяснением в комментарии.

**`middleware.ts`** — см. раздел Auth ниже.

**`.env*`**: в корне только `.env.local`. Имя переменной в нём одно — `NEXT_PUBLIC_API_URL`. Значение не привожу.
Все обращения к `process.env` в коде (полный список):
- `src/shared/api/client.ts:6` — `NEXT_PUBLIC_API_URL`
- `src/pages/chat/model/constants.ts:1` — `NEXT_PUBLIC_API_URL`
- `src/shared/lib/readInitialAuth.ts:27` — `NEXT_PUBLIC_BUILD_TARGET` (**нигде не задаётся**)
- `next.config.ts:5` — `ANALYZE`, `next.config.ts:9` — `NEXT_PUBLIC_API_URL`

Серверных (не `NEXT_PUBLIC_*`) переменных в приложении **нет вообще**.

### Router: App Router, гибрида нет

Роутинг — **App Router** в корневой `app/`. Корневая `pages/` существует, но **намеренно пустая**: в ней только `pages/README.md`, который объясняет, что папка нужна как «пустой Pages Router», иначе Next принимает FSD-слой `src/pages` за Pages Router и `next build` падает с «App Router and Pages Router both match path».

Граница: **`app/` = только роутинг** (тонкие обёртки), **`src/pages/` = FSD-слой страниц** (вся реализация).

### Дерево директорий

```
.
├── app/                     ← Next App Router: только page/layout/loading/error
├── pages/                   ← ПУСТАЯ заглушка для Next (см. pages/README.md)
├── public/                  ← favicon, assets/icons + дефолтные ассеты Next (next.svg, vercel.svg…)
├── src/
│   ├── app/                 ← globals.css + providers.tsx (НЕ FSD-слой app в обычном смысле)
│   ├── pages/               ← FSD Pages: реализация экранов
│   ├── widgets/             ← header, footer, mobile-bottom-nav, blog-section,
│   │                          videos-swiper, reviews, appointment-datetime-picker,
│   │                          clinic/layout, doctor/layout, profile/{sidebar,mobile-header}
│   ├── features/            ← global-search, filter-bar, mobile-filters,
│   │                          active-filters-chips, search-by-query, favorite-toggle,
│   │                          review-modal, city-confirm, start-chat
│   ├── entities/            ← blog, clinic, clinic-profile, doctor, service, specialization
│   ├── shared/
│   │   ├── api/             ← axios-клиент + слой запросов, сгруппированный по ресурсам
│   │   ├── ui/              ← ~30 базовых компонентов (kit проекта)
│   │   ├── lib/             ← хуки и утилиты (AuthGuard, errors, media, price…)
│   │   ├── store/           ← zustand: authStore, cityStore, useSearchHistoryStore
│   │   ├── config/          ← ROUTES, colors, cities, reference-defaults
│   │   ├── assets/          ← icons/*.svg (svgr) + images/*
│   │   └── dummies/         ← мок-типы и данные, ещё живут в проде (см. ниже)
│   ├── components/livekit/  ← ⚠ ВНЕ FSD: ConsultationRoom, ControlBar, DeviceSetup, VideoConference
│   ├── hooks/               ← ⚠ ВНЕ FSD: useLiveKitToken.ts
│   └── services/            ← ⚠ ВНЕ FSD: livekit.service.ts
├── android/, www/           ← Capacitor-обёртка (WebView открывает живой сайт)
├── dockerfile, docker-compose.yml
└── .agents/, .claude/, .playwright-mcp/  ← служебное
```

`src/components`, `src/hooks`, `src/services` — **три папки вне FSD**, единственный «жилец» каждой связан с LiveKit-консультациями. Steiger их, судя по всему, не покрывает (в `steiger.config.ts` они не упомянуты).

---

## ЭТАП 1. Архитектура

### 1.1 Карта роутинга

**Route groups:** две — `app/(auth)/` (login, register) и `app/profile/(cabinet)/`.
**Параллельных и перехватывающих роутов (`@slot`, `(.)`) в проекте нет** — ни одной папки с `@` или скобочным перехватом в `app/`.

```
app/
├── layout.tsx                  корневой, metadata, шрифт Onest, <Providers>
├── page.tsx                    / — export const revalidate = 300
├── loading.tsx, error.tsx      корневые
│
├── (auth)/
│   ├── login/                  page + loading            (клиентский экран)
│   └── register/               page (в <Suspense>) + loading
│
├── blog/                       revalidate = 300
│   └── [slug]/                 revalidate = 300, notFound() при отсутствии
│
├── clinics/                    SSR + prefetchInfiniteQuery (читает cookie city)
│   └── [id]/                   SSR-фетч → initialClinic пропом
├── specialists/                SSR + prefetchInfiniteQuery (читает cookie city)
│   └── [id]/                   SSR-фетч → initialDoctor пропом
├── services/                   SSR + prefetchInfiniteQuery (по searchParams)
├── search/                     SSR + три prefetchQuery
├── record/                     page в <Suspense>
├── chat/, videos/, contacts/, terms/, privacy/, forgot-password/
│
├── profile/                    layout: readInitialAuth + AuthGuard + Header/Footer
│   ├── page.tsx                "use client" — редирект на /profile/my-data на десктопе
│   └── (cabinet)/layout.tsx    постоянный каркас с ProfileSidebar
│       ├── my-data/ history/ reviews/ saved/
│
├── doctor-profile/             layout: readInitialAuth + AuthGuard + DoctorPageLayoutSkeleton
│   ├── page.tsx                "use client" — редирект на my-data на десктопе
│   ├── my-data/{,basic,documents,education,professional}/
│   └── appointments/ patients/ reviews/ schedule/ services/
│
├── clinic-profile/             layout: readInitialAuth + AuthGuard + ClinicPageLayoutSkeleton
│   ├── page.tsx, menu/ (use client)
│   ├── basic-info/ location/ schedule/ legal/ specialization/ equipment/
│   ├── procedures/{,new,[id]}/
│   ├── specialists/{,new,[id]/{,basic-info,certificates,education,professional}}/
│   ├── appointments/ invites/ reviews/
│
└── consultation/               layout: readInitialAuth + AuthGuard
    └── [id]/{,finished}/       валидация id регуляркой ^\d+$ → notFound()
```

**`loading.tsx` есть у 16 маршрутов** (все публичные + `clinic-profile`, `doctor-profile`, `profile`).
**`error.tsx` — ровно один, корневой** (`app/error.tsx`). Ни `app/not-found.tsx`, ни `app/global-error.tsx` в проекте нет — используются дефолты Next.

### 1.2 Server vs Client

Проект **серверный по умолчанию**: в папке `app/` `"use client"` стоит всего в 4 файлах:

| Файл | Зачем |
|---|---|
| `app/error.tsx:1` | error boundary обязан быть клиентским |
| `app/profile/page.tsx:1` | `matchMedia` + `router.replace` для десктопного редиректа |
| `app/doctor-profile/page.tsx:1` | то же |
| `app/clinic-profile/menu/page.tsx:1` | не читал детально |

Остальные 51 `page.tsx` — серверные компоненты, но почти все они **однострочные обёртки** над клиентским экраном из `src/pages`. То есть фактическая граница «сервер/клиент» проходит не в `app/`, а на первой строке файла из `src/pages/*/ui.tsx`.

Настоящий серверный рендер данных есть только там, где серверный компонент сам ходит в API:
- `src/widgets/blog-section/server.tsx:12-15` — `Promise.all([fetchBlogPosts(), fetchBlogCategories()])`, отдаёт в клиентский `BlogSection` пропами.
- `app/search|clinics|specialists|services/page.tsx` — `prefetchQuery`/`prefetchInfiniteQuery` + `<HydrationBoundary>`.
- `app/clinics/[id]/page.tsx`, `app/specialists/[id]/page.tsx` — фетч на сервере → `initialClinic`/`initialDoctor` пропом (не через HydrationBoundary).

Все три серверных layout'а защищённых разделов (`profile`, `doctor-profile`, `clinic-profile`, `consultation`) — `async` и вызывают `readInitialAuth()`.

Корневой `app/layout.tsx` намеренно **не** вызывает `cookies()` — комментарий `:20-27` объясняет: это сделало бы динамическим всё дерево, включая `/terms`, `/privacy`, `/blog`.

### 1.3 Server Actions / Route Handlers / API routes

**Ничего из этого нет.**
- `"use server"` — 0 совпадений во всём `src` и `app`.
- Ни одного `route.ts` — папки `app/api/` не существует.

Весь обмен с бэкендом идёт напрямую через axios: из браузера или из серверного компонента, но всегда мимо Next-слоя. Единственный «прокси» — декларативный `rewrites()` в `next.config.ts:17-24`, и им пользуется ровно один модуль (`clinic-cabinet/requests.ts:28`).

### 1.4 Стратегия данных

| Маршрут | Стратегия | Обоснование в коде |
|---|---|---|
| `/` | **ISR 300 c** | `app/page.tsx:5` + комментарий: блок «Блог» рендерится на сервере |
| `/blog`, `/blog/[slug]` | **ISR 300 c** | `app/blog/page.tsx:5`, `app/blog/[slug]/page.tsx:13` |
| `/login`, `/register`, `/record`, `/chat`, `/contacts`, `/terms`, `/privacy`, `/videos`, `/forgot-password` | **SSG** (`initialRevalidate: false` в `.next/prerender-manifest.json`) | данных на сервере нет |
| `/clinics`, `/specialists` | **SSR** — вызывают `cookies()` (`app/clinics/page.tsx:31`, `app/specialists/page.tsx:33`) | нужен город из cookie |
| `/services`, `/search` | **SSR** — читают `searchParams` | |
| `/clinics/[id]`, `/specialists/[id]` | **не заданы явно** — нет ни `revalidate`, ни динамических API | ⚠ см. BUGS.md `[P1] Детальные страницы` |
| Кабинеты (`/profile/**`, `/doctor-profile/**`, `/clinic-profile/**`) | CSR под `AuthGuard`; серверный layout читает cookie | |

`export const dynamic` / `fetchCache` / `generateStaticParams` — **ни одного вхождения** во всём проекте.
`revalidateTag` / `revalidatePath` / `unstable_cache` / `next: { tags }` — **ни одного вхождения**.

**Важное следствие:** данные ходят через **axios**, а не через `fetch`. Значит нативный Data Cache Next'а к ним не применяется вообще — работает только Full Route Cache уровня страницы (`export const revalidate`). Тегов и точечной инвалидации на серверной стороне нет и быть не может без переписывания транспорта.

Клиентский кэш — React Query, глобальные дефолты в `src/app/providers.tsx:20-28`:
```ts
staleTime: 60 * 1000,
refetchOnWindowFocus: false,
```
`retry`, `gcTime`, `refetchOnReconnect` не переопределены → дефолты React Query (3 ретрая с экспоненциальной задержкой).

### 1.5 Глобальное состояние

**Server state** — целиком React Query. Ключи централизованы в `src/shared/api/queryKeys.ts` (12 фабрик: `authKeys`, `doctorKeys`, `clinicKeys`, `serviceKeys`, `searchKeys`, `reviewKeys`, `appointmentKeys`, `profileKeys`, `doctorCabinetKeys`, `clinicCabinetKeys`, `blogKeys`, `referenceKeys`, `notificationKeys`, `chatKeys`), все в иерархическом стиле `all → lists() → list(filters)`.

**Client state** — три zustand-стора в `src/shared/store/`:

| Стор | Что хранит | persist |
|---|---|---|
| `authStore.ts` | `accessToken`, `refreshToken`, `user`, `rememberMe` | `name: "auth-storage"`, кастомный storage: **localStorage если rememberMe, иначе sessionStorage** (`:32-60`) |
| `cityStore.ts` | `city`, `isSet`, `manuallySelected` | `name: "user-city-storage"`, дефолтный localStorage |
| `useSearchHistoryStore.ts` | история поиска (файл не читал детально) | — |

**Дубли состояния — есть, и они осознанные, но их три штуки:**

1. **Город** живёт одновременно в: zustand `cityStore.city`, cookie `city` (пишется из `writeCityCookie`, `cityStore.ts:12-15`), cookie `imbir-detected-city` (пишется middleware, `middleware.ts:62-66`), cookie `imbir-city-set` (пишется `city-confirm/ui.tsx`). Четыре источника. Разграничение описано в комментариях, но синхронизация ручная и асинхронная (`city-confirm/ui.tsx:55-67` явно ждёт `onFinishHydration`, иначе гидратация перетирает город).

2. **Факт авторизации** живёт в: zustand `authStore.accessToken` (localStorage/sessionStorage), cookie `is_authed`, cookie `role`, и React-контекст `InitialAuthContext` (`shared/lib/initialAuthContext.tsx`). Синхронизация — `writeAuthCookies()` (`authStore.ts:14-30`), вызывается из `setTokens`, `setUser`, `setRememberMe`, `logout`, `onRehydrateStorage`. **`setAccessToken` (используется refresh-интерсептором) cookie не переписывает** — для `is_authed` это не важно, но факт стоит знать.

3. **Данные профиля** дублируются: `authStore.user` (из ответа логина) и React Query `profileKeys.me()` / `getProfile()`. В `use-record-form.ts:109-133` форма подтягивается из `getProfile()`, а не из стора.

`src/shared/dummies/mocks.ts` — **мок-типы всё ещё являются продовым контрактом UI**: `shared/api/requests.ts` — это адаптер, который приводит реальные snake_case DTO обратно к camelCase-форме моков (см. шапку файла, `:1-7`). Это не «остатки», это активный слой.

### 1.6 Auth

**Где хранится сессия:**
- `accessToken` + `refreshToken` — **в localStorage** (если «Запомнить меня») **или sessionStorage** (если нет), под ключом `auth-storage` (`authStore.ts:32-60, 126-134`).
- Флаг `is_authed=1` и `role=<роль>` — в **обычных JS-cookie** (`document.cookie`, `authStore.ts:14-30`). `path=/`, `samesite=lax`, `max-age` 30 дней только при `rememberMe`. **Без `Secure`, без `HttpOnly`** — иначе middleware их бы не увидел, а поставить их из JS нельзя в принципе.

**Три эшелона защиты:**

1. **`middleware.ts:32-40`** — гейт на границе. `PROTECTED_PREFIXES = ["/profile", "/doctor-profile", "/clinic-profile", "/consultation"]` (`:20-25`). Если нет cookie `is_authed` → `redirect("/login")`. Комментарий `:17-19` прямо говорит: это дубль клиентского AuthGuard, чтобы не отдать даже первый SSR-кадр.
   Матчер (`:72`): `["/((?!_next/static|_next/image|favicon.ico|api/).*)"]`.
   ⚠ `/chat` в список защищённых **не входит**.

2. **`readInitialAuth()`** (`shared/lib/readInitialAuth.ts`) в серверных layout'ах защищённых разделов — читает cookie `is_authed`/`role` и кладёт в `InitialAuthProvider`, чтобы первый SSR-кадр хедера был правильным. Токен на сервер **не попадает** (`:9-10`).

3. **`AuthGuard`** (`shared/lib/AuthGuard.tsx`) — клиентский. Пока `persist` не гидратировался, рендерит `null`; после — если нет токена, `router.replace("/login")` (`:49-61`). Файл содержит 18 строк комментария (`:13-30`), объясняющего, почему `token` читается императивно через `getState()`, а не через реактивный селектор: `useSyncExternalStore` отдаёт «замороженный» `getInitialState()` на первом клиентском рендере после SSR, из-за чего залогиненного пользователя выкидывало на `/login`.

**Роли:** `type UserRole = "patient" | "doctor" | "clinic"` (`authStore.ts:4`). Роль определяет редирект после логина (`login/ui.tsx:28-41`) — с отдельной веткой для мобильной клиники (`/clinic-profile/menu`). **Проверки роли на границе нет**: middleware смотрит только `is_authed`, не `role`. Пациент по прямой ссылке может попасть в `/doctor-profile/*` — что покажет UI, я не проверял (см. QUESTIONS.md).

### 1.7 Стили

**Tailwind CSS v4**, без `tailwind.config.js` — конфигурация целиком в CSS-директиве `@theme` внутри `src/app/globals.css:3-24`.

Дизайн-токены (`globals.css:3-24`):
```
--color-primary        #f5653e     --color-foreground   #191a1b
--color-primary-dark   #e5542d     --color-secondary    #686f72
--color-primary-tint   #fff8f5     --color-muted        #838a8d
--color-background     #f2f3f5     --color-dim          #c4c8ca
--color-surface        #f8f9fa     --color-border       #e5e6e8
--color-overlay        #0d0d12     --color-border-soft  #e3e4e5
```
Те же цвета продублированы в TS-виде в `src/shared/config/tokens.ts` (экспорт `colors`, `ColorToken`) — нужны там, где цвет уходит в проп SVG (`register/ui.tsx:60` `stroke={colors.primary}`).

**Тем нет** — ни dark mode, ни `data-theme`. Закомментированный `:root { --background/--foreground }` в `globals.css` — остаток стартера.

Брейкпоинты — дефолтные Tailwind (`sm/md/lg/xl`). В коде преобладают `md:` (768) и `lg:` (1024); мобильный/десктопный разрыв кабинетов проходит по `lg`.

Кастомное в `globals.css`: `@utility scrollbar-hide`, класс `.skeleton` с `@keyframes skeleton-wave`, анимации модалок через `@starting-style` + `data-state="closed"`, а также глобальное «обезвебовление» для WebView: `overscroll-behavior-y: none`, `-webkit-tap-highlight-color: transparent`, `user-select: none` на `button/a/[role=button]`.

CSS Modules используется **ровно один раз**: `src/components/livekit/livekit.module.css` (LiveKit-компоненты вне FSD).

---

## ЭТАП 3. Подключение к бэкенду

### 3.1 Базовый URL

Определяется **в трёх местах, с двумя разными фолбэками**:

| Файл | Строка | Код |
|---|---|---|
| `src/shared/api/client.ts` | `5-6` | `process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030"` |
| `next.config.ts` | `8-10` | `(process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030").replace(/\/$/, "")` |
| `src/pages/chat/model/constants.ts` | `1` | `process.env.NEXT_PUBLIC_API_URL ?? "https://imbir.sino0on.ru"` |

Третий фолбэк **отличается** от первых двух — см. BUGS.md `[P1] Два разных дефолтных хоста`.

Переменная — `NEXT_PUBLIC_*`, то есть **build-time константа, инлайнящаяся литералом в клиентский бандл**. Серверных env-переменных для API в проекте нет: сервер и клиент ходят по одному и тому же адресу. Из этого следует, что **её значение обязано быть задано в момент `next build`**, а не в момент старта контейнера — чего `dockerfile` не делает (см. BUGS.md `[P0]`).

WebSocket-адрес чата выводится из того же URL: `CHAT_WS_BASE = API_URL.replace(/^http/, "ws")` (`chat/model/constants.ts:4`).

### 3.2 Транспорт: разбор `src/shared/api/client.ts` построчно

Это единственный транспорт в проекте. 87 строк, читаю целиком.

```ts
1   import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
3   import { useAuthStore } from "@/shared/store";
```
Транспорт напрямую импортирует zustand-стор. Это создаёт связность «shared/api → shared/store» и означает, что на сервере `useAuthStore` — **модульный синглтон, общий на все запросы**. Сейчас это безопасно (persist-storage на сервере возвращает `null`, `authStore.ts:34`, токен там всегда `null`), но защиты от «кто-то вызвал `setTokens` на сервере» нет.

```ts
5-6  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030";
8-11 export const apiClient = axios.create({ baseURL: BASE_URL, timeout: 15_000 });
```
Единый инстанс. **`timeout: 15 000 мс` глобальный** — включая загрузку файлов (см. BUGS.md).

```ts
14-20  apiClient.interceptors.request.use((config) => {
         const token = useAuthStore.getState().accessToken;
         if (token) config.headers.Authorization = `Bearer ${token}`;
         return config;
       });
```
Токен подставляется императивно через `getState()` (не через хук — правильно). Никакой фильтрации по URL: `Authorization` уходит и на публичные эндпоинты тоже.

```ts
23-27  let isRefreshing = false;
       let pendingQueue: Array<{ resolve: (v: string) => void; reject: (r: unknown) => void }> = [];
29-35  const processPendingQueue = (error, token) => { ... pendingQueue = []; };
```
Классический single-flight на **модульных переменных**. На сервере это опять-таки общие переменные для всех запросов — но раз токена на сервере нет, ветка refresh недостижима.

```ts
38-45  apiClient.interceptors.response.use((res) => res, async (error: AxiosError) => {
         const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
         if (error.response?.status !== 401 || originalRequest._retry) return Promise.reject(error);
```
Обрабатывается **только 401**. **403 не обрабатывается вообще** — уходит в вызывающий код как обычная ошибка. Ретраев по сети/5xx нет. `AbortController` на уровне клиента не используется (`signal` пробрасывается только в `livekit.service.ts:69`).

```ts
49-54  const { refreshToken, setAccessToken, logout } = useAuthStore.getState();
       if (!refreshToken) { logout(); return Promise.reject(error); }
```
Нет refresh-токена → мгновенный logout. **Редиректа отсюда нет** — увести на `/login` должен реактивный эффект в `AuthGuard` (`AuthGuard.tsx:49-58`), который сработает только если пользователь на защищённой странице.

```ts
56-63  if (isRefreshing) {
         return new Promise<string>((resolve, reject) => { pendingQueue.push({ resolve, reject }); })
           .then((token) => { originalRequest.headers.Authorization = `Bearer ${token}`;
                              return apiClient(originalRequest); });
       }
```
Пока refresh в полёте, остальные 401 встают в очередь. ⚠ Здесь **не выставляется `_retry = true`** — в отличие от ветки ниже. Плюс у этого промиса нет таймаута: если refresh никогда не заселится, запрос повиснет навсегда.

```ts
65-77  originalRequest._retry = true;
       isRefreshing = true;
       const { data } = await axios.post<{ access: string }>(`${BASE_URL}/api/auth/refresh/`, { refresh: refreshToken });
       setAccessToken(data.access);
       processPendingQueue(null, data.access);
       originalRequest.headers.Authorization = `Bearer ${data.access}`;
       return apiClient(originalRequest);
```
Refresh идёт **голым `axios.post`**, а не через `apiClient` — сознательно (чтобы не попасть в собственный интерсептор), но побочно **теряется `timeout: 15_000`**: у голого axios таймаута нет вообще. Обратите внимание: существует и `refreshTokenFn` (`auth/requests.ts:111-118`), который делает то же самое через `apiClient` — он здесь **не используется** (дубль).

```ts
78-85  } catch (refreshError) { processPendingQueue(refreshError, null); logout(); return Promise.reject(refreshError); }
       finally { isRefreshing = false; }
```
Ошибка refresh → очередь reject'ится, полный logout. `finally` корректно сбрасывает флаг.

**Чего в транспорте нет:** ретраев, backoff, дедупликации, отмены, обработки 403/429/5xx, логирования, request-id, «офлайн»-ветки.

### 3.3 Слой API

`src/shared/api/` — 15 подпапок по ресурсам, каждая по строгому шаблону `requests.ts` + `types.ts`:

```
appointments/  auth/  blog/  chat/  clinic-cabinet/  clinics/  doctor-cabinet/
doctors/  notifications/  profile/  references/  reviews/  search/  services/  upload/
```
Плюс на верхнем уровне: `client.ts`, `types.ts` (общие `Pagination`, `PaginatedResponse<T>`, `ApiResponse<T>`, `ApiError`), `queryKeys.ts`, `requests.ts` (legacy-адаптер) и барель `index.ts` (`export *` из всего).

**Типизация ответов.** DTO описаны в `types.ts` каждого ресурса в **snake_case, как их отдаёт бэк** (`full_name`, `experience_years`, `reviews_count`, `is_online_available`). Все запросы типизированы дженериком: `apiClient.get<PaginatedResponse<DoctorListItem>>(...)`. **Рантайм-валидации ответов нет нигде** (ни zod, ни ручных guard'ов) — единственное исключение `isLiveKitCredentials()` в `services/livekit.service.ts:31-42`.

**Маппинг backend → frontend — есть, и он двухслойный:**

1. **`src/shared/api/requests.ts`** (273 строки) — «legacy compatibility shim» (так написано в шапке, `:1-7`). Приводит snake_case DTO обратно к camelCase-форме моков из `shared/dummies/mocks.ts`. Содержит `adaptDoctor`, `adaptDoctorDetail`, `adaptClinic`, `adaptClinicDetail`, `adaptService`, `adaptReview`, `formatClinicSchedule` и экспортирует объект `api` с 11 методами. Часть логики здесь — не маппинг, а **бизнес-форматирование**: `adaptDoctorDetail:77-90` считает стаж в годах и клеит строку `"5 лет"`, `formatClinicSchedule:138-169` схлопывает расписание в `"ПН-ПТ • 09:00-18:00"`, `adaptDoctorDetail:116` **хардкодит** `contacts.schedule = "ПН-ПТ • 09:00-18:00"`.

2. **Доменные адаптеры в слоях выше**: `entities/blog/model.ts:80-97` (`adaptPost`/`adaptArticle`), `entities/clinic-profile/useClinicCabinet.ts:65-101` (`mapApiToClinicProfile`), `use-record-form.ts:240-300` (маппинг в локальные `Clinic`/`Doctor`/`Service`).

То есть один и тот же DTO врача маппится в двух-трёх местах по-разному.

**Нормализация медиа.** `shared/lib/media.ts` — `toHttps()` чинит `http://imbir.sino0on.ru` → `https://` (бэк отдаёт media по http). Вызывается точечно в `adaptDoctor:64`, `adaptClinic:135`, `getClinicProfile:40`, `getClinicDoctors:171`, `useClinicCabinet:185,196`. Это **ручной, не централизованный** вызов — легко пропустить в новом эндпоинте.

**Мёртвый код в API-слое:**
- `shared/api/upload/requests.ts` — `uploadFile()` не вызывается **нигде** (проверил grep'ом по `src` и `app`).
- `api.getReviews()` (`requests.ts:262-263`) — не вызывается нигде; внутри `getReviews("doctor", 0)` с id `0`.
- `refreshTokenFn` (`auth/requests.ts:111-118`) — дублирует логику интерсептора, не используется.

### 3.4 Кэширование

**Клиент — React Query.** Глобально `staleTime: 60 000`, `refetchOnWindowFocus: false` (`providers.tsx:23-24`). Локальные переопределения: `useReferenceValues` ставит `staleTime: 60 * 60 * 1000` для справочников (`shared/lib/useReference.ts:39`).

**Ключи** — из `queryKeys.ts`, но **не везде**. В `use-record-form.ts` ключи написаны строками мимо фабрик: `["record-profile"]` (`:110`), `["record-clinics"]` (`:141`), `["record-doctors", selectedCity]` (`:186`), `["record-clinic-detail", …]` (`:194`), `["record-services", …]` (`:205`), `["record-available-slots", …]` (`:219`). Аналогично `app/search/page.tsx:76,80` префетчит по `["clinics"]` / `["services"]` — эти ключи не совпадают с `clinicKeys.list()`/`serviceKeys.list()` из фабрики.

**Инвалидация после мутаций — есть и делается последовательно** в кабинетных хуках:
- `useClinicCabinet.ts:132-179` — `setQueryData` на профиль после сохранения; `invalidateQueries` на documents/photos после upload/delete; тост на успех и на ошибку в каждой мутации.
- `useFavoriteToggle` (`features/favorite-toggle/model.ts:42-84`) — полноценный оптимистичный апдейт: `onMutate` патчит кэш и возвращает `previous`, `onError` откатывает + тост, `onSettled` инвалидирует. Это эталонный паттерн проекта.
- `use-record-form.ts:97-105` — после создания записи инвалидирует `[...profileKeys.all, "appointments"]`.

**Серверный кэш Next** — только `export const revalidate` на трёх маршрутах. Тегов нет, `revalidateTag`/`revalidatePath` нет (транспорт на axios — они бы и не сработали).

**SSR-префетч + гидратация.** `app/clinics`, `app/specialists`, `app/services`, `app/search` строят `QueryClient`, префетчат и оборачивают в `<HydrationBoundary state={dehydrate(queryClient)}>`. В каждом из этих файлов есть развёрнутый комментарий о том, что ключ и **значения фильтров** должны совпадать с клиентскими до буквы, иначе гидратация не подхватится (`app/clinics/page.tsx:24-30`, `app/services/page.tsx:26-32`, `app/specialists/page.tsx:34-41`, `app/search/page.tsx:19-25`). Совпадение поддерживается **вручную**, через продублированные константы (`PAGE_SIZE = 8`, `MAX_PRICE = 10000`, `PREFIX = "svc"`) с комментарием «должно совпадать с …». Это хрупко по построению.

Детальные страницы сделаны иначе — через `initialData`-проп, а не `HydrationBoundary`: `app/clinics/[id]/page.tsx:12-17`, `app/specialists/[id]/page.tsx:11-16`.

### 3.5 Что вызывается с сервера, а что из браузера

**С сервера (Node):**
- `fetchBlogPosts`, `fetchBlogCategories`, `fetchBlogArticle`, `fetchRelatedBlogPosts` — `entities/blog/model.ts:101-138`, все обёрнуты в `try/catch` с возвратом `[]`/`null` (комментарий `:99-100`: «блог публичный, не роняем ISR-страницу»).
- `api.getDoctors`, `api.getClinics`, `api.getServices`, `api.getDoctorsPaginated`, `api.getClinicsPaginated`, `api.getServicesPaginated` — в `prefetch*` на 4 листинговых страницах.
- `api.getClinicById`, `api.getDoctorById` — на детальных страницах, с `.catch(() => undefined)`.

**Из браузера:** всё остальное — авторизация, все кабинеты, запись, чат, избранное, отзывы, справочники, загрузка файлов.

**Прокси через Route Handlers — нет.** Есть один прокси, но декларативный: `rewrites()` в `next.config.ts:17-24`, и им пользуется **только** `sendMultipart` в `clinic-cabinet/requests.ts:22-34` (`baseURL: "/backend-api"`).

⚠ Это непоследовательно: комментарий `next.config.ts:15-16` объясняет, что multipart гоняют через свой origin именно чтобы обойти CORS — но три других multipart-запроса идут **мимо** прокси, напрямую на кросс-доменный API:
- `registerClinicFn` (`auth/requests.ts:99-108`) — регистрация клиники с логотипом и фото
- `updateProfile` (`profile/requests.ts:24-35`) — аватар пациента
- `updateDoctorProfile` (`doctor-cabinet/requests.ts:64-81`) — фото врача

Кроме того, `baseURL: "/backend-api"` — **относительный URL**: если этот код когда-нибудь вызовут при SSR, axios упадёт на невалидном URL.

### 3.6 Полный сценарий: логин → приватные данные

```
┌─ БРАУЗЕР ────────────────────────────────────────────────────────────────┐

 1. Пользователь на /login
    app/(auth)/login/page.tsx  (серверный, 5 строк)
      └─> src/pages/login/ui.tsx  "use client"  LoginPage

 2. Заполняет форму, жмёт «Продолжить»
    LoginPage.handleSubmit()                              login/ui.tsx:66
      ├─ guard: if (!identifierFilled || !password) return          :67
      ├─ setError(""); setIsLoading(true)                        :68-69
      ├─ identifier = loginBy === "email" ? email : `${dialCode}${phoneLocal}`   :74-75
      │  (комментарий :72-73 — бэк принимает и телефон в поле `email`)
      └─ await loginFn({ email: identifier, password })              :76

 3. API-СЛОЙ
    loginFn()                                        auth/requests.ts:41
      └─ apiClient.post<AuthResponse>("/api/auth/login/", body)      :42

 4. ТРАНСПОРТ
    request-интерсептор                                    client.ts:14
      └─ token = useAuthStore.getState().accessToken → null, заголовок не ставится
    axios → POST {BASE_URL}/api/auth/login/     timeout 15 000 мс   client.ts:10

 5. БЭКЕНД → 200 { access, refresh, user }

 6. УСПЕХ                                                  login/ui.tsx:77-81
      ├─ setRememberMeStore(rememberMe)     authStore.ts:107-116
      ├─ setTokens({ access, refresh })     authStore.ts:95-98
      │    ├─ set({ accessToken, refreshToken })
      │    ├─ persist → customStateStorage.setItem()  authStore.ts:39-54
      │    │     rememberMe ? localStorage : sessionStorage
      │    └─ writeAuthCookies(access, role, rememberMe)  authStore.ts:14-30
      │          document.cookie: is_authed=1; role=patient
      │          path=/; samesite=lax; max-age=2592000 (если rememberMe)
      ├─ setUser(res.user)                  authStore.ts:100-103  (снова пишет cookie)
      ├─ toast.success(`Добро пожаловать, ${res.user.first_name}!`)
      └─ router.push(getRoleRedirect(res.user.role))    login/ui.tsx:34-41
              patient → /profile   doctor → /doctor-profile
              clinic  → /clinic-profile  (или /clinic-profile/menu если < 768px)

┌─ ПЕРЕХОД НА /profile ────────────────────────────────────────────────────┐

 7. MIDDLEWARE (Edge)                                     middleware.ts:32
      isProtectedPath("/profile") → true                          :36
      request.cookies.get("is_authed") → есть → пропускаем         :37-39
      (дальше гео-логика: если нет imbir-city-set → ставит imbir-detected-city)

 8. СЕРВЕРНЫЙ LAYOUT                              app/profile/layout.tsx:10
      const initialAuth = await readInitialAuth()                    :15
        readInitialAuth.ts:31-35 → cookies() → { isAuthed: true, role: "patient" }
        (токен сюда НЕ попадает — комментарий :9-10)
      <InitialAuthProvider value={initialAuth}>
        <Header/>                        ← useAuthDisplay() отдаёт initialAuth,
        <AuthGuard>{children}</AuthGuard>   пока persist не гидратировался
        <Footer/>
      </InitialAuthProvider>

 9. КЛИЕНТСКАЯ ГИДРАТАЦИЯ
      AuthGuard.tsx:38-47
        hydrated = useAuthStore.persist.hasHydrated()  (лениво, синхронно)
        если ещё нет → подписка на onFinishHydration
      AuthGuard.tsx:60   if (!hydrated || !token) return null   ← детей не рендерим
      AuthGuard.tsx:55-57 if (hydrated && !getState().accessToken) router.replace("/login")

      Параллельно useAuthDisplay.ts:19-24 переключается с initialAuth
      на реактивный селектор стора → хедер показывает аватар вместо «Войти»

┌─ ПРИВАТНЫЙ ЗАПРОС ───────────────────────────────────────────────────────┐

10. Компонент кабинета вызывает хук, напр. useFavoriteToggle("doctor")
                                          features/favorite-toggle/model.ts:28
      isAuthed = useAuthStore(s => Boolean(s.accessToken))            :29
      useQuery({ queryKey: profileKeys.favorites(),
                 queryFn: getFavorites, enabled: isAuthed })       :32-36

11. API-СЛОЙ
      getFavorites()                              profile/requests.ts:82
        └─ apiClient.get("/api/profile/favorites/")
        └─ toFavoritesList(data)   :68-78  — разбирает и { data: {...} }, и голый объект

12. ТРАНСПОРТ
      request-интерсептор                                client.ts:14-20
        Authorization: Bearer <accessToken>

┌─ ВЕТКА ОШИБКИ: токен протух ─────────────────────────────────────────────┐

13. Бэкенд → 401
    response-интерсептор                              client.ts:38-86
      ├─ status === 401 && !_retry                            :45
      ├─ refreshToken есть?  нет → logout() + reject          :51-54
      ├─ isRefreshing?  да → встать в pendingQueue            :56-63
      │                       ⚠ _retry здесь НЕ ставится
      └─ нет → _retry = true; isRefreshing = true             :65-66
           axios.post(`${BASE_URL}/api/auth/refresh/`, { refresh })   :69-72
             ├─ 200 → setAccessToken(access)                          :74
             │        processPendingQueue(null, access)               :75
             │        повтор исходного запроса с новым Bearer      :76-77
             └─ ошибка → processPendingQueue(err, null)               :79
                         logout()  (authStore.ts:118-121:              :80
                            set({accessToken:null, refreshToken:null, user:null})
                            writeAuthCookies(null) → cookie max-age=0)
                         reject
                         ⚠ редиректа отсюда НЕТ

14. ПОСЛЕ logout()
      реактивный селектор в AuthGuard видит token === null
      → эффект AuthGuard.tsx:55-57 → router.replace("/login")
      → рендер AuthGuard.tsx:60 отдаёт null (контент кабинета скрыт)

┌─ ВЕТКА ОШИБКИ: 400/404/500 ──────────────────────────────────────────────┐

15. Интерсептор пропускает как есть (обрабатывается только 401)
    Вызывающий код достаёт err.response.data и прогоняет через
    extractErrorMessage()                            shared/lib/errors.ts:11
      ├─ строка   → отдать, если <= 300 символов и не похожа на HTML  :8-9,15
      ├─ массив   → рекурсивно первый непустой                     :17-23
      ├─ объект   → рекурсивно по Object.values (DRF: {step1:{field:[…]}})  :24-30
      └─ иначе    → fallback «Что-то пошло не так. Попробуйте снова»
    Комментарий :5-7 объясняет второй случай: axios парсит JSON без оглядки
    на Content-Type, и HTML-страница 500-й от Django прилетает сырой строкой.

16. UI
      мутации кабинета  → toast.error(...)     напр. useClinicCabinet.ts:136-138
      формы             → setErrors(prev => ({...prev, submit: msg}))
                                              напр. use-record-form.ts:690-702
      логин             → setError(msg) → проп error у <Input>   login/ui.tsx:82-91
```
