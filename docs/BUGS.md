# BUGS — imbir-nextjs

> Аудит 2026-08-10, `master` @ `b6c616c`. Только чтение, ничего не менялось.
> Каждый пункт проверен по коду. Где я не мог проверить поведение (нужен запуск,
> прод-окружение или доступ к бэку) — уверенность указана как «средняя» или
> «гипотеза», и написано, чем проверить.

---

## Сводная таблица

| # | Prio | Название | Файл | Уверенность |
|---|---|---|---|---|
| 1 | **P0** | Docker-сборка не получает `NEXT_PUBLIC_API_URL` → прод уходит на захардкоженный IP по HTTP | `dockerfile`, `docker-compose.yml`, `src/shared/api/client.ts:5-6` | высокая |
| 2 | **P0** | `docker-compose.yml` ссылается на `Dockerfile`, а файл называется `dockerfile` | `docker-compose.yml:6` | высокая |
| 3 | **P1** | Два разных дефолтных API-хоста: HTTP и WS смотрят в разные бэкенды | `client.ts:6` vs `chat/model/constants.ts:1` | высокая |
| 4 | **P1** | Токены (включая refresh) в localStorage + auth-cookie без `Secure`/`HttpOnly` | `shared/store/authStore.ts:14-30, 126-134` | высокая |
| 5 | **P1** | Нет `.dockerignore` → `.env.local` попадает в слой образа | `dockerfile:10` | высокая |
| 6 | **P1** | Multipart идёт двумя разными путями; три из четырёх — мимо anti-CORS прокси | `clinic-cabinet/requests.ts:22-34` vs `auth/requests.ts:99-108`, `profile/requests.ts:24-35`, `doctor-cabinet/requests.ts:64-81` | средняя |
| 7 | **P1** | `timeout: 15_000` глобальный — распространяется на загрузку файлов | `shared/api/client.ts:10` | высокая |
| 8 | **P1** | `/clinics/[id]` и `/specialists/[id]` без `revalidate` — данные врача/клиники могут залипнуть | `app/clinics/[id]/page.tsx`, `app/specialists/[id]/page.tsx` | средняя |
| 9 | **P2** | Очередь refresh не помечает запросы `_retry` → повторный цикл refresh | `shared/api/client.ts:56-63` | высокая |
| 10 | **P2** | Промис в очереди refresh без таймаута — запрос может повиснуть навсегда | `shared/api/client.ts:57-58` | средняя |
| 11 | **P2** | Refresh идёт голым `axios.post` — теряет `timeout` | `shared/api/client.ts:69-72` | высокая |
| 12 | **P2** | JWT в query string WebSocket-URL | `pages/chat/model/use-chat-room.ts:126-128` | высокая |
| 13 | **P2** | `lang="en"` при полностью русском контенте | `app/layout.tsx:35` | высокая |
| 14 | **P2** | Нет `metadata` ни на одной странице кроме корня; нет `sitemap`/`robots`/`not-found` | `app/**` | высокая |
| 15 | **P2** | First-load JS 0.92–1.49 МБ на маршрут; `@livekit/components-styles` в корневом layout | `app/layout.tsx:4`, `.next/diagnostics/route-bundle-stats.json` | высокая |
| 16 | **P2** | `Modal` без `role="dialog"`/`aria-modal`/focus-trap; 0 таких атрибутов во всём проекте | `shared/ui/modal/ui.tsx:45-88` | высокая |
| 17 | **P2** | `/chat` не в `PROTECTED_PREFIXES`, хотя требует авторизации | `middleware.ts:20-25`, `use-chat-room.ts:88` | высокая |
| 18 | **P2** | `dismiss()` в cityStore не персистится корректно как «баннер закрыт» между сессиями | `shared/store/cityStore.ts:55-56` | гипотеза |
| 19 | **P3** | `/record` шлёт запрос за всеми услугами при входе (нет `enabled`) | `use-record-form.ts:204-214` | высокая |
| 20 | **P3** | Интервал таймера пересоздаётся каждую секунду (дрейф) | `forgot-password/ui.tsx:47-51`, `register/ui.tsx:252-258` | высокая |
| 21 | **P3** | `useMemo` без эффекта: зависимости пересоздаются каждый рендер | `use-record-form.ts:240-300, 328-343, 453-502` | средняя |
| 22 | **P3** | `key={index}` на реальных данных (не скелетонах) | 9 файлов, см. карточку | высокая |
| 23 | **P3** | `useScrollLock` / global-search мутируют `document.body.style` без счётчика | `shared/lib/useScrollLock.ts`, `features/global-search/ui.tsx:46-52` | средняя |
| 24 | **P3** | `ProfileSaved`: `isMobile=false` на первом рендере → скачок раскладки на телефоне | `pages/profile/saved/ProfileSaved/ui.tsx:45-52` | высокая |
| 25 | **P3** | Middleware отрабатывает на `/backend-api/*` и вешает `Set-Cookie` на каждый upload | `middleware.ts:72` | высокая |
| 26 | **P3** | Мёртвый код: `uploadFile`, `api.getReviews`, `refreshTokenFn`, ветка `NEXT_PUBLIC_BUILD_TARGET` | 4 файла | высокая |
| 27 | **P3** | `getRoleRedirect` продублирован, и в register мобильная ветка теряется | `login/ui.tsx:28-41`, `register/ui.tsx:154-167, 516, 685` | высокая |
| 28 | **P3** | `is_authed` живёт 30 дней независимо от жизни refresh-токена | `authStore.ts:10`, `middleware.ts:37` | средняя |
| 29 | **P3** | Ни одного теста в проекте | — | высокая |
| 30 | **P3** | Дефолтные ассеты стартера в `public/`; опечатка в `.gitignore` | `public/`, `.gitignore:44` | высокая |

---

## Карточки

### [P0] Docker-сборка не получает `NEXT_PUBLIC_API_URL` → прод уходит на захардкоженный IP по HTTP
Файл: `dockerfile:1-16`, `docker-compose.yml:1-19`, `src/shared/api/client.ts:5-6`, `next.config.ts:8-10`
Суть: `NEXT_PUBLIC_*` — build-time константа, Next инлайнит её литералом в клиентский бандл в момент `next build`. В `dockerfile` нет ни `ARG NEXT_PUBLIC_API_URL`, ни `ENV` перед `RUN npm run build` (`dockerfile:14`). В `docker-compose.yml` в `environment` заданы только `NODE_ENV` и `PORT` (`:15-17`), и это переменные **рантайма**, а не сборки. Значит в собранный бандл попадёт фолбэк из `client.ts:6` — `http://155.212.216.197:8030`.
Почему баг: воспроизводится любой сборкой образа на чистой машине (без `.env.local` в контексте). Собрать образ → открыть DevTools → Network: все XHR уходят на `155.212.216.197:8030`. `capacitor.config.ts:15` говорит, что фронт живёт на `https://imbir.me` — значит браузер заблокирует эти запросы как mixed content, и приложение будет пустым. Плюс `chat/model/constants.ts:4` соберёт WS-адрес `ws://155.212.216.197:8030/ws/chat/...` — на https-странице тоже заблокировано.
Влияние: полностью нерабочее приложение после деплоя — либо всё падает на mixed content, либо (если фронт по http) прод-трафик, включая JWT в заголовке `Authorization`, идёт по открытому каналу на голый IP.
Предлагаемый фикс: `ARG NEXT_PUBLIC_API_URL` + `ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL` до `RUN npm run build`, и `build.args` в compose. Убрать фолбэк-строку из `client.ts:6` — пусть отсутствие переменной роняет сборку явной ошибкой, а не подставляет IP.
Уверенность: высокая (что фолбэк сработает — из кода; что сайт по https — из `capacitor.config.ts:15`, см. QUESTIONS.md п.1).

---

### [P0] `docker-compose.yml` ссылается на `Dockerfile`, а файл называется `dockerfile`
Файл: `docker-compose.yml:6` (`dockerfile: Dockerfile`), реальный файл в корне — `dockerfile` (строчная `d`, подтверждено листингом).
Суть: на macOS (case-insensitive FS) `docker compose build` находит файл. На Linux-CI и любом Linux-хосте — нет.
Почему баг: `docker compose build` на Linux → `failed to read dockerfile: open Dockerfile: no such file or directory`.
Влияние: сборка/деплой не проходит на всём, что не macOS/Windows.
Предлагаемый фикс: переименовать файл в `Dockerfile` (канонично) либо поправить ссылку в compose на `dockerfile`. Первое лучше — совпадёт с дефолтом Docker.
Уверенность: высокая.

---

### [P1] Два разных дефолтных API-хоста: HTTP и WS смотрят в разные бэкенды
Файл: `src/shared/api/client.ts:5-6` vs `src/pages/chat/model/constants.ts:1-4`
Суть:
```ts
// client.ts:6
process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030"
// chat/model/constants.ts:1
process.env.NEXT_PUBLIC_API_URL ?? "https://imbir.sino0on.ru"
```
Третье место с тем же фолбэком, что и первое, — `next.config.ts:9` (там строится `rewrites`).
Почему баг: если `NEXT_PUBLIC_API_URL` не задана (см. P0), REST уходит на IP, а WebSocket — на `wss://imbir.sino0on.ru`. История чата грузится с одного сервера, живой сокет открывается к другому. Сообщения будут «пропадать».
Влияние: чат в неконсистентном состоянии; отладка такого сценария — часы.
Предлагаемый фикс: один экспорт `API_BASE_URL` в `shared/config`, все три места импортируют его. Фолбэк убрать (см. P0).
Уверенность: высокая.

---

### [P1] Токены (включая refresh) в localStorage + auth-cookie без `Secure`/`HttpOnly`
Файл: `src/shared/store/authStore.ts:14-30`, `:32-60`, `:126-134`
Суть: `partialize` (`:129-134`) персистит `accessToken` **и** `refreshToken` в `localStorage`/`sessionStorage`. Cookie `is_authed` и `role` пишутся из JS (`:21-29`) с `path=/; samesite=lax` — без `Secure`, без `HttpOnly` (из `document.cookie` их поставить и нельзя).
Почему баг: любой XSS (или скомпрометированная зависимость — в бандле 1+ МБ стороннего кода) читает `localStorage.getItem("auth-storage")` и получает refresh-токен с полным сроком жизни. Отзыв единственного access-токена ситуацию не спасёт.
Влияние: полный угон сессии пациента/врача/клиники в медицинском приложении с персональными данными.
Предлагаемый фикс: перевести refresh-токен в `HttpOnly; Secure; SameSite=Lax` cookie, выставляемую бэкендом; в браузере держать только access-токен в памяти (zustand без persist), а обновлять через Route Handler в Next, который проксирует refresh. Как минимум — добавить `Secure` к `is_authed`/`role` (это можно сделать сразу, стоит одну строку в `writeAuthCookies`).
Уверенность: высокая (что так хранится — факт кода; серьёзность зависит от того, обсуждалась ли модель угроз — см. QUESTIONS.md п.4).

---

### [P1] Нет `.dockerignore` → `.env.local` и мусор попадают в слой образа
Файл: `dockerfile:10` (`COPY . .`), `.dockerignore` в репозитории отсутствует
Суть: `COPY . .` копирует весь контекст: `node_modules` (уже установленные локально), `.next` (уже собранный локально), `.git`, `.playwright-mcp/` (357 файлов сессий), `android/`, и **`.env.local`**.
Почему баг: `.env.local` остаётся в слое образа навсегда — `docker history` / `docker save` его достанет. Побочно: сборка тащит сотни мегабайт контекста и локальный `node_modules` может перетереть тот, что поставил `npm ci`.
Влияние: утечка конфигурации при публикации образа; медленные и невоспроизводимые сборки.
Предлагаемый фикс: добавить `.dockerignore` с `node_modules`, `.next`, `.git`, `.env*`, `.playwright-mcp`, `android`, `www`, `.claude`, `.agents`.
Уверенность: высокая.

---

### [P1] Multipart идёт двумя разными путями; три из четырёх — мимо anti-CORS прокси
Файл: `src/shared/api/clinic-cabinet/requests.ts:22-34` vs `src/shared/api/auth/requests.ts:99-108`, `src/shared/api/profile/requests.ts:24-35`, `src/shared/api/doctor-cabinet/requests.ts:64-81`
Суть: `next.config.ts:15-16` объясняет, зачем существует rewrite `/backend-api/*`:
> «Файлы отправляем через тот же origin, что и фронтенд: браузер не блокирует multipart по CORS».

Но через этот прокси ходит **только** `sendMultipart` в `clinic-cabinet/requests.ts` (логотип клиники, документы, фото). Три других multipart-запроса идут напрямую на кросс-доменный API:
- `registerClinicFn` (`auth/requests.ts:104-105`) — регистрация клиники с логотипом и фото
- `updateProfile` (`profile/requests.ts:31-33`) — аватар пациента
- `updateDoctorProfile` (`doctor-cabinet/requests.ts:76-79`) — фото врача

Почему баг: если утверждение в комментарии верно (бэк не отдаёт нужные CORS-заголовки на multipart), эти три сценария падают в браузере. Косвенное подтверждение — история коммитов: `b6c616c "add file upload functionality to clinic profile"`, `c0f9ff4 "persist clinic files after registration"`, `904b620 "persist doctor profile after registration"` — файлы после регистрации доносятся отдельными запросами из кабинета, то есть проблема уже всплывала.
Влияние: пользователь загружает аватар/фото, видит спиннер и ошибку; данные теряются.
Предлагаемый фикс: перевести все multipart-запросы на `sendMultipart`-подобный хелпер с `baseURL: "/backend-api"`, вынести его в `shared/api/client.ts`. Отдельно: `baseURL: "/backend-api"` — относительный URL, при вызове из серверного компонента axios упадёт; добавить guard или явно задокументировать «client-only».
Уверенность: средняя — сам факт расхождения точно есть; падают ли эти три запроса реально, проверяется только живым бэком (см. QUESTIONS.md п.5).

---

### [P1] `timeout: 15_000` глобальный — распространяется на загрузку файлов
Файл: `src/shared/api/client.ts:10`
Суть: единственный axios-инстанс с `timeout: 15_000` обслуживает и `GET /api/doctors/`, и `POST /api/clinic/photos/` с фотографией на несколько мегабайт.
Почему баг: клиника грузит фото 4 МБ с мобильного интернета на 300 КБ/с → 13+ секунд только на тело, плюс TLS и обработка на бэке → `ECONNABORTED`. Пользователь видит «Не удалось загрузить фотографию» (`useClinicCabinet.ts:169`) без объяснения. Воспроизводится дросселированием сети в DevTools до Slow 3G.
Влияние: систематически ломается загрузка документов/фото/аватаров на мобильном — то есть ровно на том сценарии, ради которого писалась Capacitor-обёртка.
Предлагаемый фикс: `timeout: 0` (или 120 000) на запросах с `FormData` — либо отдельным инстансом, либо переопределением в `sendMultipart`. Плюс индикатор прогресса через `onUploadProgress`.
Уверенность: высокая.

---

### [P1] `/clinics/[id]` и `/specialists/[id]` без `revalidate` — данные могут залипнуть
Файл: `app/clinics/[id]/page.tsx:1-21`, `app/specialists/[id]/page.tsx:1-22`
Суть: обе страницы `async`, фетчат данные через axios (`api.getClinicById` / `api.getDoctorById`), но:
- нет `export const revalidate`
- нет `generateStaticParams`
- не вызывают ни один динамический API (`cookies()`, `headers()`, `searchParams`)

Для сравнения: `/blog/[slug]` в такой же ситуации ставит `export const revalidate = 300` (`app/blog/[slug]/page.tsx:13`) с комментарием «статьи появляются без деплоя». Для врачей и клиник ровно та же логика применима, но `revalidate` не поставлен.
Почему баг: Next считает такой сегмент статически кэшируемым. Отрендеренный вывод попадает в Full Route Cache без окна инвалидации. Врач меняет цену/специализацию в кабинете → его публичная карточка отдаёт старый SSR-снимок. Частично маскируется тем, что клиент всё равно перезапрашивает через React Query (данные приходят как `initialData`), но первый кадр и всё, что видит краулер, — устаревшее.
Влияние: устаревшие цены и расписания на публичных карточках; поисковик индексирует старое.
Предлагаемый фикс: добавить `export const revalidate = 300` (или сколько нужно) на обе страницы, как уже сделано в блоге. Проверить фактическое поведение по выводу `next build` (колонка `○/●/ƒ`) — я его не запускал, чтобы не менять `.next`.
Уверенность: средняя (механизм — из конфигурации файлов; точный режим кэширования подтверждается только выводом сборки).

---

### [P2] Очередь refresh не помечает запросы `_retry` → возможен повторный цикл refresh
Файл: `src/shared/api/client.ts:56-63`
Суть:
```ts
if (isRefreshing) {
  return new Promise<string>((resolve, reject) => { pendingQueue.push({ resolve, reject }); })
    .then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);   // ← _retry так и остался undefined
    });
}
```
В соседней ветке (`:65`) `originalRequest._retry = true` ставится, здесь — нет.
Почему баг: пять параллельных запросов ловят 401, первый запускает refresh, четыре встают в очередь. Если новый токен по какой-то причине тоже отклонён (рассинхрон часов, отзыв на бэке), каждый из четырёх повторов снова получает 401, а `_retry` у них не выставлен → каждый заходит в интерсептор как «первый раз» и запускает **свой** refresh. Цикл ограничен вторым проходом, но это 5 лишних запросов к `/api/auth/refresh/` и 5 вызовов `logout()`.
Влияние: всплеск запросов к auth-эндпоинту и гонка логаутов при протухшей сессии.
Предлагаемый фикс: выставлять `originalRequest._retry = true` до `pendingQueue.push`.
Уверенность: высокая (по коду), сценарий — средняя.

---

### [P2] Промис в очереди refresh без таймаута — запрос может повиснуть навсегда
Файл: `src/shared/api/client.ts:57-58`
Суть: `new Promise((resolve, reject) => pendingQueue.push({ resolve, reject }))` заселяется только из `processPendingQueue`. Тот вызывается в `try` (`:75`) и в `catch` (`:79`), но не в `finally` (`:82-84`).
Почему баг: если между установкой `isRefreshing = true` (`:66`) и `axios.post` (`:69`) выбросится синхронное исключение — оно попадёт в `catch` и очередь заселится. Но если само `.then((token) => apiClient(originalRequest))` (`:59-62`) кинет ошибку, а `processPendingQueue` уже отработал — часть промисов может остаться. Более практичная ветка: refresh идёт **без таймаута** (см. следующую карточку) — тогда все запросы в очереди висят столько же, сколько висит refresh, то есть потенциально бесконечно.
Влияние: спиннеры, которые никогда не гаснут; UI без выхода.
Предлагаемый фикс: перенести `processPendingQueue(new Error("refresh aborted"), null)` в `finally` как страховку + дать refresh явный таймаут.
Уверенность: средняя (механизм из кода; воспроизводимость зависит от поведения сети).

---

### [P2] Refresh идёт голым `axios.post` — теряет `timeout`
Файл: `src/shared/api/client.ts:69-72`
Суть: `axios.post(`${BASE_URL}/api/auth/refresh/`, …)` — не `apiClient`, а дефолтный инстанс, у которого `timeout` не задан (то есть 0 = без ограничения). Использование голого axios здесь **правильно** (чтобы не рекурсивно попасть в собственный интерсептор), но `timeout` надо было перенести.
Почему баг: сервер не отвечает на refresh → запрос висит бесконечно, `isRefreshing` остаётся `true`, вся очередь заблокирована. Воспроизводится блокировкой `/api/auth/refresh/` в DevTools (Block request URL) с последующим 401 на любом другом запросе.
Влияние: приложение «замерзает» на любом протухшем токене при недоступном auth-эндпоинте.
Предлагаемый фикс: `axios.post(url, body, { timeout: 15_000 })`. Заодно — использовать существующий `refreshTokenFn` нельзя (он на `apiClient`), но можно завести второй «чистый» инстанс с тем же таймаутом.
Уверенность: высокая.

---

### [P2] JWT в query string WebSocket-URL
Файл: `src/pages/chat/model/use-chat-room.ts:126-128`
Суть:
```ts
const socket = new WebSocket(`${CHAT_WS_BASE}/ws/chat/${roomId}/?token=${token}`);
```
Комментарий `:125` это фиксирует как решение («the token goes in the query string»), но не как компромисс.
Почему баг: query string попадает в access-логи nginx/балансировщика, в `Referer` при последующих переходах, в APM-трейсы и в историю прокси. В отличие от заголовка, он логируется по умолчанию.
Влияние: валидный JWT в логах инфраструктуры — низкая, но реальная поверхность утечки.
Смягчающее: WebSocket-API в браузере действительно не даёт задать заголовки, так что альтернатива требует участия бэка.
Предлагаемый фикс: одноразовый короткоживущий ticket — бэк отдаёт по REST `POST /api/chat/ws-ticket/` токен на 30 секунд, он и уходит в query. Как минимум — исключить query string `/ws/` из логов на балансировщике.
Уверенность: высокая (что так есть), средняя (насколько это критично в вашей инфраструктуре — см. QUESTIONS.md).

---

### [P2] `lang="en"` при полностью русском контенте
Файл: `app/layout.tsx:35`
Суть: `<html lang="en" …>`, при том что весь UI, все тексты, `metadata.description` (`:17`) — на русском, и шрифт подключён с кириллическим сабсетом (`:11`).
Почему баг: воспроизводится любым скринридером — он читает русский текст английскими правилами произношения. Плюс браузер предлагает «перевести страницу» на уже русской странице, а поисковик получает неверный сигнал о языке.
Влияние: доступность и SEO.
Предлагаемый фикс: `lang="ru"`.
Уверенность: высокая.

---

### [P2] Нет `metadata` ни на одной странице кроме корня; нет `sitemap`/`robots`/`not-found`
Файл: `app/layout.tsx:15-18` (единственный `export const metadata` во всём проекте)
Суть: проверено grep'ом — `export const metadata` и `generateMetadata` встречаются **ровно один раз**, в корневом layout. Значит:
- `/specialists/[id]`, `/clinics/[id]`, `/blog/[slug]` — у каждой карточки врача, клиники и каждой статьи одинаковый `<title>IMBIR</title>` и одинаковый description
- нет `app/sitemap.ts`, нет `app/robots.ts`, нет `opengraph-image` — проверено листингом `app/`
- нет `app/not-found.tsx` и `app/global-error.tsx` — используются дефолты Next

Почему баг: воспроизводится открытием любой карточки врача и просмотром `<head>`. Для каталога врачей и клиник — это основной органический трафик.
Влияние: страницы-карточки практически не индексируются осмысленно; шеринг в мессенджеры даёт одинаковое превью.
Предлагаемый фикс: `generateMetadata` на трёх динамических маршрутах (данные уже фетчатся на сервере, так что дополнительных запросов почти не будет — тот же фетч), `app/sitemap.ts` из `getDoctors`/`getClinics`/`getBlogPosts`, `app/robots.ts`, кастомный `not-found.tsx`.
Уверенность: высокая.

---

### [P2] First-load JS 0.92–1.49 МБ на маршрут
Файл: `.next/diagnostics/route-bundle-stats.json` (данные последней сборки), `app/layout.tsx:4`
Суть: несжатый first-load JS по данным сборки:

| Маршрут | МБ |
|---|---|
| `/consultation/[id]` | 1.49 |
| `/register` | 1.12 |
| `/clinics/[id]` | 1.12 |
| `/` | 1.12 |
| `/specialists`, `/clinics`, `/chat`, `/doctor-profile/my-data` | ~1.11 |
| `/terms`, `/privacy`, `/videos`, `/contacts` (минимум) | 0.92 |

То есть **общий baseline ~0.92 МБ несжатого JS** приезжает даже на страницу «Условия использования», где нет ничего кроме текста.
Отдельно: `app/layout.tsx:4` импортирует `@livekit/components-styles` в **корневом** layout — CSS видеозвонков грузится на каждой странице сайта, хотя нужен только на `/consultation/[id]`.
Почему баг: воспроизводится `npm run analyze`. Baseline формируют `Providers` (`src/app/providers.tsx`) — React Query + devtools + Toaster + MobileBottomNav + CityConfirmBanner, — и они клиентские, то есть тянут за собой всё дерево.
Влияние: LCP/TBT на мобильном; в WebView-обёртке — заметный старт.
Предлагаемый фикс: (1) убрать `@livekit/components-styles` из корневого layout в `app/consultation/layout.tsx`; (2) `ConsultationRoom` импортировать через `next/dynamic` с `ssr: false`; (3) прогнать `npm run analyze` и посмотреть, что именно даёт 0.92 МБ baseline — подозреваю `@tanstack/react-query-devtools`, который в `dependencies` (`package.json:24`), а не в `devDependencies`.
Уверенность: высокая (цифры из артефакта сборки), средняя по причинам (нужен анализатор).

---

### [P2] `Modal` без `role="dialog"`/`aria-modal`/focus-trap
Файл: `src/shared/ui/modal/ui.tsx:45-88`
Суть: портал рендерит оверлей и панель как обычные `<div>`. Проверено grep'ом: во всём `src` и `app` **0 вхождений** `role="dialog"` и `aria-modal` (при 57 `aria-label`). У кнопок закрытия (`:60-65`, `:77-82`) нет `aria-label` — внутри только SVG-иконка.
Почему баг: воспроизводится с клавиатуры — открыть любую модалку и жать Tab: фокус уходит на элементы под оверлеем. Скринридер не объявляет открытие диалога и продолжает читать фоновую страницу. При закрытии фокус не возвращается на кнопку-триггер.
Влияние: модалки в проекте — это выбор клиники/врача/услуги при записи (`SelectionModal`), подтверждения удаления (`ConfirmDialog`), форма отзыва. То есть ключевые сценарии недоступны с клавиатуры и для скринридера.
Предлагаемый фикс: в базовом `Modal` — `role="dialog" aria-modal="true" aria-labelledby={titleId}`, focus-trap (или `<dialog>`+`showModal()`), возврат фокуса на `document.activeElement` при закрытии, `aria-label="Закрыть"` на крестике. Правится один раз, чинит все модалки проекта.
Уверенность: высокая.

---

### [P2] `/chat` не в `PROTECTED_PREFIXES`, хотя требует авторизации
Файл: `middleware.ts:20-25`, `src/pages/chat/model/use-chat-room.ts:86-88`
Суть: `PROTECTED_PREFIXES = ["/profile", "/doctor-profile", "/clinic-profile", "/consultation"]`. `/chat` в списке нет, и `/chat` отдаётся статически (`.next/prerender-manifest.json`, `initialRevalidate: false`). При этом `use-chat-room.ts:88` — `const authError = token ? null : "Требуется авторизация";`
Почему баг: неавторизованный пользователь открывает `/chat`, видит каркас чата и надпись «Требуется авторизация» вместо редиректа на `/login`, как во всех остальных приватных разделах.
Влияние: несогласованный UX; тупик без кнопки «Войти».
Предлагаемый фикс: либо добавить `/chat` в `PROTECTED_PREFIXES` (и обернуть в `AuthGuard`), либо оставить и сделать нормальный экран «войдите, чтобы писать» с кнопкой. Первое согласованнее. См. QUESTIONS.md п.3 — возможно, это осознанно.
Уверенность: высокая (что расхождение есть), намеренность — вопрос.

---

### [P2] `dismiss()` в cityStore не помечает «баннер закрыт» так, как ожидает middleware
Файл: `src/shared/store/cityStore.ts:55-56`, `src/features/city-confirm/ui.tsx:69-79`, `middleware.ts:46`
Суть: три разных «переключателя» для одного состояния:
- `handleConfirm` (`city-confirm/ui.tsx:70-74`): `setCity()` + `setCookie("imbir-city-set", "1")` + `setClosed(true)`
- `handleChange` (`:76-79`): `dismiss()` (пишет только `isSet: true` в persist-стор) + `setClosed(true)` — **cookie `imbir-city-set` не ставится**
- middleware (`:46`): `if (request.cookies.get("imbir-city-set")) return response;`

Почему баг (гипотеза): пользователь жмёт «Изменить» → `isSet: true` в localStorage → баннер больше не показывается. Но cookie `imbir-city-set` не выставлена, поэтому middleware продолжает на каждом запросе перезаписывать `imbir-detected-city` (`middleware.ts:62-66`). Функционально баннер скрыт (проверка `isSet` в `:69` отработает), так что видимого бага может и не быть — но лишний `Set-Cookie` уходит на каждый навигационный запрос до конца жизни браузера, и логика раздвоена между cookie и persist-стором.
Влияние: лишний заголовок на каждом ответе; сложная для сопровождения тройная синхронизация состояния города.
Предлагаемый фикс: свести к одному источнику — либо всё в cookie (их и так читает сервер), либо `dismiss()` тоже ставит `imbir-city-set`.
Уверенность: **гипотеза** — я не воспроизводил, вывод из чтения трёх файлов.

---

### [P3] `/record` шлёт запрос за всеми услугами при входе
Файл: `src/pages/record/model/use-record-form.ts:204-214`
Суть: единственный `useQuery` в этом хуке **без** `enabled` (у соседних `record-clinic-detail:196` и `record-available-slots:225` он есть):
```ts
const { data: servicesRaw } = useQuery({
  queryKey: ["record-services", selectedClinicId, selectedDoctorId],
  queryFn: () => getServices(selectedDoctorId ? { doctor_id: … } : selectedClinicId ? { clinic_id: … } : {}),
});
```
Почему баг: на первом рендере ни врач, ни клиника не выбраны → уходит `GET /api/services/` без фильтров, то есть весь каталог услуг. Воспроизводится открытием `/record` с чистой сессией и взглядом в Network.
Влияние: лишний тяжёлый запрос на каждом входе в форму записи, замедляет самый конверсионный экран.
Предлагаемый фикс: `enabled: Boolean(selectedDoctorId || selectedClinicId)`.
Уверенность: высокая.

---

### [P3] Интервал таймера пересоздаётся каждую секунду
Файл: `src/pages/forgot-password/ui.tsx:47-51`, `src/pages/register/ui.tsx:252-258`
Суть:
```ts
useEffect(() => {
  if (step !== "code" || resendLeft <= 0) return;
  const timer = setInterval(() => setResendLeft((s) => s - 1), 1000);
  return () => clearInterval(timer);
}, [step, resendLeft]);      // ← resendLeft
```
Счётчик в зависимостях → каждый тик уничтожает интервал и создаёт новый.
Почему баг: `setInterval` уже накопил дрейф к моменту срабатывания, а пересоздание сбрасывает фазу. За 59 секунд обратный отсчёт заметно расходится с реальным временем (обычно отстаёт на 1–3 с). Плюс 59 лишних циклов setup/cleanup.
Влияние: кнопка «Отправить код повторно» разблокируется позже, чем истёк серверный лимит. Косметика, но воспроизводится стабильно.
Предлагаемый фикс: зависимость только от «таймер должен идти» (`step === "code"`), а остановку на нуле делать внутри колбэка через `setResendLeft(s => (s <= 1 ? 0 : s - 1))`. Или считать от `Date.now()`-дедлайна.
Уверенность: высокая.

---

### [P3] `useMemo`, чьи зависимости пересоздаются каждый рендер
Файл: `src/pages/record/model/use-record-form.ts:240-300`, `:328-343`, `:453-502`
Суть: `CLINICS` (`:240`), `DOCTORS` (`:250`), `CLINIC_DOCTORS` (`:270`), `SERVICES` (`:289`) — простые `.map()` **без** `useMemo`, то есть новые массивы каждый рендер. И они стоят в зависимостях у:
- `clinicMap` (`:328-331`), `selectedClinic` (`:333-336`), `doctorPool` (`:340-343`), `selectedService` (`:374-377`), `doctorOptions` (`:381-384`), `modalConfig` (`:453-466`), `mobileStep1Config` (`:473-502`)
- и у эффекта `:349-368`, который зависит от `doctorPool`

Почему баг: без мемоизации все эти `useMemo` — накладные расходы без выгоды, а эффект `:349` перезапускается на каждый рендер (от бесконечного цикла спасает только ранний `if (!pendingWorkplaceDoctorId) return;` на `:350`).
**Важно:** в проекте включён React Compiler (`next.config.ts:13`), который, скорее всего, автоматически мемоизирует эти `.map()` по `clinicsData`/`doctorsData`. Тогда рантайм-эффекта нет, но код всё равно вводит в заблуждение и перестанет работать, если компилятор выключат или он забейлится на этом файле.
Влияние: потенциальные лишние ре-рендеры и перезапуски эффекта в самом сложном хуке проекта (770 строк).
Предлагаемый фикс: обернуть четыре массива в `useMemo` — либо, наоборот, убрать `useMemo` у производных и положиться на компилятор явно, одним решением на файл.
Уверенность: средняя (наличие проблемы в коде — высокая; фактическое влияние зависит от React Compiler, не проверял).

---

### [P3] `key={index}` на реальных данных
Файл (только случаи с данными, не скелетонами):
- `src/pages/specialist-details/ui.tsx:322`, `:348`
- `src/pages/clinic/clinic-details/ui.tsx:215`, `:246`
- `src/pages/blog-article/ui.tsx:83`
- `src/pages/doctor/my-data/sections/documents.tsx:172`
- `src/pages/doctor/my-data/sections/education.tsx:278`
- `src/entities/clinic-profile/ui.tsx:327`, `:392`, `:677`
- `src/pages/register/clinic-form/Step4Legal.tsx:98`, `Step1BasicInfo.tsx:144`
- `src/pages/register/doctor-form/Step4Certificates.tsx:86`
- `src/pages/clinic/clinic-invites/ui.tsx` (не проверял детально)

Суть: индекс как `key` в списках, которые редактируются (документы, сертификаты, образование, фото).
Почему баг: удаление элемента из середины списка загруженных файлов → React переиспользует DOM-узлы по позиции. Локальное состояние внутри строки (открытое меню, прогресс, фокус в input) «переезжает» на соседний элемент. Воспроизводится: загрузить 3 документа, удалить средний.
Влияние: визуальные артефакты и потеря ввода при редактировании списков в кабинетах.
Предлагаемый фикс: `key` по `id` там, где он есть (`document.id`, `photo.id`), по `file.name + file.size` для ещё не загруженных файлов.
Уверенность: высокая для списков с удалением, для остальных — косметика.

---

### [P3] `useScrollLock` и global-search мутируют `document.body.style` без счётчика
Файл: `src/shared/lib/useScrollLock.ts:1-22`, `src/features/global-search/ui.tsx:46-52`
Суть: два независимых механизма пишут в `document.body.style` (`position/top/left/right` и `overflow` соответственно) и в cleanup безусловно сбрасывают их в `""`.
Почему баг: сценарий — открыт `SelectionModal` (использует `useScrollLock`), из него открывается `ConfirmDialog` (тоже блокирует), закрывается второй → его cleanup сбрасывает `position: fixed`, хотя первый ещё открыт. Страница под первой модалкой начинает скроллиться. Дополнительно `useScrollLock` в cleanup делает `window.scrollTo({top: scrollY})` (`:19`) с позицией, захваченной при **своём** открытии — при вложенности прыжок будет неверным.
Влияние: скролл фона под модалкой, прыжки позиции.
Предлагаемый фикс: модульный счётчик блокировок — стиль ставится при переходе 0→1 и снимается при 1→0. Свести оба механизма к одному хуку.
Уверенность: средняя (вложенные модалки в проекте есть — `SelectionModal` + `ConfirmDialog` в кабинетах, — но конкретную пару я не воспроизводил).

---

### [P3] `ProfileSaved`: `isMobile=false` на первом рендере
Файл: `src/pages/profile/saved/ProfileSaved/ui.tsx:45-52`, `:140-150`
Суть:
```ts
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  const checkMobile = () => setIsMobile(window.innerWidth < 768);
  checkMobile();
  ...
```
Первый рендер всегда «десктоп» → отрисовывается `grid md:grid-cols-2 lg:grid-cols-3` с `variant="vertical"`, затем эффект переключает на вертикальный список с `variant="horizontal"`.
Почему баг: на телефоне видно мигание раскладки при каждом заходе на «Сохранённое». Воспроизводится в мобильном эмуляторе DevTools.
Влияние: скачок вёрстки (CLS) на кабинетной странице.
Предлагаемый фикс: определять вариант карточки CSS-медиазапросом (рендерить оба варианта и прятать через `md:hidden`/`hidden md:block`, как это уже сделано в `pages/home/doctorsMainList.tsx:91,112`), а не JS-стейтом. Заодно уйдёт `resize`-слушатель.
Уверенность: высокая.

---

### [P3] Middleware отрабатывает на `/backend-api/*` и вешает `Set-Cookie` на каждый upload
Файл: `middleware.ts:71-73`
Суть: матчер `"/((?!_next/static|_next/image|favicon.ico|api/).*)"` исключает `/api/`, но не `/backend-api/`. Через `/backend-api/*` проксируются все загрузки файлов клиники (`clinic-cabinet/requests.ts:28`).
Почему баг: на каждый multipart-запрос запускается middleware, парсит `x-nf-geo` и добавляет `Set-Cookie: imbir-detected-city=…` (`:62-66`) в ответ прокси. Воспроизводится: загрузить фото в кабинете клиники и посмотреть response headers.
Влияние: лишний Edge-вызов и мусорный `Set-Cookie` на файловых ответах. Функционально не ломает (это не защищённый префикс), но зашумляет.
Предлагаемый фикс: добавить `backend-api/` в negative lookahead матчера.
Уверенность: высокая.

---

### [P3] Мёртвый код
Файл:
- `src/shared/api/upload/requests.ts:7-14` — `uploadFile()`; grep по `src` и `app` даёт **только** объявление
- `src/shared/api/requests.ts:262-263` — `api.getReviews()`; ноль вызовов, внутри `getReviews("doctor", 0)` с id `0`
- `src/shared/api/auth/requests.ts:111-118` — `refreshTokenFn`; дублирует логику интерсептора, ноль вызовов
- `src/shared/lib/readInitialAuth.ts:19-29` — ветка `NEXT_PUBLIC_BUILD_TARGET === "capacitor"`; переменная не задана нигде, а комментарий `:19-20` утверждает, что мобильная сборка идёт через `output: 'export'` — в `next.config.ts` `output` **отсутствует**, и `capacitor.config.ts:1-8` прямо пишет обратное: «под статический экспорт он не подходит… нативная оболочка просто открывает во WebView живой сайт»
- `eslint.config.mjs:15-16` — игнор `server/**`, папки нет

Почему баг: комментарий в `readInitialAuth.ts` прямо противоречит `capacitor.config.ts`. Следующий разработчик, читая его, будет уверен, что статический экспорт поддерживается, и построит на этом решение.
Влияние: ложная карта местности; мёртвый код в бандле.
Предлагаемый фикс: удалить всё перечисленное; в `readInitialAuth.ts` оставить одно предложение со ссылкой на `capacitor.config.ts`.
Уверенность: высокая.

---

### [P3] `getRoleRedirect` продублирован, и в register мобильная ветка теряется
Файл: `src/pages/login/ui.tsx:28-41` и `src/pages/register/ui.tsx:154-167`, использование — `:516`, `:685`
Суть: функция и таблица `ROLE_REDIRECT` скопированы в оба файла. При этом в register `getRoleRedirect` вызывается только для пациента (`:382`), а после регистрации врача (`:516`) и клиники (`:685`) стоит голое `ROLE_REDIRECT[res.user.role] ?? "/doctor-profile"` / `?? "/clinic-profile"`.
Почему баг: клиника регистрируется с телефона → должна попасть на `/clinic-profile/menu` (мобильный хаб), как после логина, но попадает на `/clinic-profile`. Воспроизводится регистрацией клиники в мобильном эмуляторе.
Влияние: сразу после регистрации клиника видит десктопный экран на телефоне.
Предлагаемый фикс: одна функция в `shared/config/routes.ts` или `shared/lib`, оба файла её импортируют.
Уверенность: высокая.

---

### [P3] `is_authed` живёт 30 дней независимо от жизни refresh-токена
Файл: `src/shared/store/authStore.ts:10` (`AUTH_COOKIE_MAX_AGE = 60*60*24*30`), `middleware.ts:37`
Суть: cookie `is_authed=1` ставится на 30 дней при `rememberMe`. Срок жизни refresh-токена задаёт бэк и он может быть короче (или токен отозван).
Почему баг: refresh протух → пользователь идёт на `/profile` → middleware видит `is_authed` и пропускает → рендерится серверный layout с хедером → `AuthGuard` гидратируется, видит токен, делает запрос, ловит 401, интерсептор пробует refresh, получает отказ, `logout()` → редирект на `/login`. Пользователь успевает увидеть шапку кабинета и белый экран.
Влияние: мигание при истёкшей сессии; лишний круг запросов.
Предлагаемый фикс: синхронизировать `max-age` cookie со сроком refresh-токена (бэк может отдавать `refresh_expires_in`), либо в `logout()` дополнительно чистить cookie раньше — сейчас `logout()` это делает (`authStore.ts:120`), проблема только в первом кадре.
Уверенность: средняя (зависит от TTL refresh-токена на бэке — см. QUESTIONS.md п.6).

---

### [P3] Ни одного теста в проекте
Файл: — (проверено `find src app -iname "*.test.*" -o -iname "*.spec.*"` → пусто; в `devDependencies` нет ни vitest, ни jest, ни playwright)
Суть: при этом в коде есть места с плотной, неочевидной логикой, которую руками регрессировать дорого: `shared/lib/errors.ts` (рекурсивный разбор DRF-ошибок), `shared/api/requests.ts` (6 адаптеров + `formatClinicSchedule`), `shared/lib/price.ts`, `pages/record/model/lib.ts` (валидаторы телефона/email, группировка слотов), `client.ts` (single-flight refresh).
Почему баг: не «падает», но каждое изменение в этих файлах — ручная проверка полного сценария записи/регистрации.
Влияние: скорость и безопасность будущих изменений.
Предлагаемый фикс: начать с юнит-тестов на чистые функции — это ~15 файлов без React и без сети, покрываются vitest за день. Транспорт и refresh-флоу — отдельно, с `axios-mock-adapter`.
Уверенность: высокая (что тестов нет).

---

### [P3] Дефолтные ассеты стартера в `public/`; опечатка в `.gitignore`
Файл: `public/` (содержит `next.svg`, `vercel.svg`, `globe.svg`, `window.svg`, `file.svg`), `.gitignore:44`
Суть: пять неиспользуемых SVG из `create-next-app`. В `.gitignore:44` строка `?# local env files` — вопросительный знак перед комментарием (вероятно, артефакт BOM/копипаста); строка трактуется как паттерн `?# local env files`, а не как комментарий.
Влияние: косметика; `.gitignore` работает (следующая строка `.env.local` валидна, да и `.env*` выше уже покрывает).
Предлагаемый фикс: удалить пять SVG, поправить строку.
Уверенность: высокая.

---

## Проверено — и это НЕ баг

Чтобы не тратить время повторно:

- **`<img>` вместо `next/image`** — 0 вхождений `<img`, 68 `<Image`. Чисто.
- **`any`** — 0 вхождений. Чисто.
- **`dangerouslySetInnerHTML`** — 0 вхождений. Чисто.
- **`Math.random()` в рендере** — 0 вхождений. Чисто.
- **Пустые `catch {}`** — не найдено; все `catch` либо показывают ошибку, либо содержат комментарий-обоснование (`entities/blog/model.ts:106`, `useLogout.ts:20-22`, `register/ui.tsx:222-225`).
- **`useSearchParams` без `Suspense`** — все 12 использований либо в странице, обёрнутой в `<Suspense>` (`app/record`, `app/(auth)/register`, `app/doctor-profile/my-data`), либо компонент сам обёрнут внутри (`pages/home/doctorsMainList.tsx:142,182`), либо страница и так динамическая (`/clinics`, `/services`, `/search`, `/specialists`). Сборка проходит — подтверждено наличием `.next/prerender-manifest.json`.
- **Секреты в клиентском бандле** — единственная переменная `NEXT_PUBLIC_API_URL`, серверных env нет вообще. Секретов утекать нечему (но см. P0 — проблема обратная: переменной не хватает).
- **`Content-Type: multipart/form-data` без boundary** (`auth/requests.ts:105`, `profile/requests.ts:32`, `upload/requests.ts:11`) — не баг: axios v1 в браузере сбрасывает вручную заданный Content-Type, когда тело — `FormData`, и позволяет браузеру подставить boundary.
- **Утечка токена между запросами при SSR через модульный zustand-стор** (`client.ts:3,15`) — сейчас невозможна: серверный `customStateStorage.getItem` возвращает `null` (`authStore.ts:34`), и на сервере `setTokens` не вызывается нигде. Риск существует только теоретически, если кто-то добавит серверную авторизацию — стоит держать в голове, но как баг не засчитываю.
- **`useChatRoom` cleanup** (`use-chat-room.ts:237-246`) — корректный: `isActive = false`, `socket.close()`, все таймеры очищены, состояние сброшено. Образцовый.
- **`useLiveKitToken`** (`hooks/useLiveKitToken.ts:26-51`) — единственное место с `AbortController`, флаг `active`, отмена, `axios.isCancel`. Тоже образцовый.
- **`useInView`** (`shared/lib/useInView.ts`) — `observer.disconnect()` и в колбэке, и в cleanup, фолбэк при отсутствии `IntersectionObserver`. Чисто.
- **`useTapHaptics`** (`shared/lib/useTapHaptics.ts:27-29`) — слушатель снимается. Чисто.
