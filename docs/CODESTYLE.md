# CODESTYLE — imbir-nextjs

> Правила выведены из кода, а не из общих рекомендаций. Каждое — с примером-пруфом.
> Формулировка «правило» = так реально написано в проекте, так и продолжай.
> В конце — раздел **анти-паттерны**: это в проекте тоже есть, но копировать не надо.

---

## 1. Архитектура: Feature-Sliced Design, соблюдай слои

**Слои сверху вниз:** `app → pages → widgets → features → entities → shared`.
Импорт разрешён только вниз. Порядок закреплён линтером (`steiger.config.ts`) и форматтером (`.prettierrc:3-14`).

**Правило.** Новый экран — это тонкая обёртка в `app/` + реализация в `src/pages/<slice>/`:

```tsx
// app/chat/page.tsx — всё, что должно быть в app/
import { ChatPage } from "@/pages/chat";

export default function Page() {
  return <ChatPage />;
}
```

**Правило.** Каждый слайс имеет публичный API — `index.ts`, реэкспортирующий только то, что нужно снаружи:

```ts
// src/shared/ui/index.ts:1-3
export { Button } from "./button";
export { CancelEditButton } from "./cancel-edit-button";
export { IconBtn } from "./icon-button";
```

**Правило.** Внутри слайса файлы называются по роли, а не по компоненту:
`ui.tsx` (разметка), `model.ts` (типы + чистая логика), `index.ts` (публичный API), `skeleton.tsx`, `compact-card.tsx`, `shared-ui.tsx`, `use<Name>.ts` (хук слайса).
Пример: `src/entities/doctor/{index.ts, ui.tsx, compact-card.tsx, photo.tsx, skeleton.tsx}`.

**Правило.** Если слайс перерос один `ui.tsx` — разбивай на подпапки `ui/` и `model/`, не на плоскую кучу:

```
src/pages/record/
├── index.ts
├── ui.tsx
├── model/{constants.ts, lib.ts, types.ts, use-record-form.ts}
└── ui/{Step1Selection.tsx, Step2DateTime.tsx, SelectField.tsx, ...}
```

**Правило.** Отключаешь правило steiger — пиши в конфиге, почему. Оба существующих исключения так и сделаны (`steiger.config.ts:7-9`, `:17-26`).

---

## 2. Именование

| Что | Соглашение | Пример |
|---|---|---|
| Папки-слайсы и сегменты | `kebab-case` | `clinic-profile/`, `active-filters-chips/`, `appointment-datetime-picker/` |
| Файлы-роли внутри слайса | `lowercase` | `ui.tsx`, `model.ts`, `index.ts`, `skeleton.tsx` |
| Файлы-компоненты (когда их несколько) | `PascalCase.tsx` | `Step1BasicInfo.tsx`, `MessageComposer.tsx`, `SpecialistCard.tsx` |
| Хуки-файлы | `useCamelCase.ts` или `use-kebab-case.ts` | `useClinicCabinet.ts`, `use-record-form.ts` ⚠ два стиля |
| React-компоненты | `PascalCase` | `LoginPage`, `DoctorCard`, `CityConfirmBanner` |
| Хуки | `useCamelCase` | `useAuthDisplay`, `useRecordForm`, `useScrollLock` |
| Типы и type-alias'ы | `PascalCase` | `AuthUser`, `DoctorFilters`, `MobileStep` |
| Модульные константы | `SCREAMING_SNAKE_CASE` | `DEBOUNCE_MS`, `PROTECTED_PREFIXES`, `CABINET_PAGE_SIZE`, `TYPING_EXPIRE_MS` |
| API-функции запросов | `getX` / `updateX` / `createX` / `deleteX`, авторизационные — с суффиксом `Fn` | `getDoctors`, `updateClinicProfile`, `loginFn`, `registerClientFn`, `logoutFn` |
| Фабрики query-ключей | `<domain>Keys` | `doctorKeys`, `clinicCabinetKeys`, `profileKeys` |
| Поля DTO | `snake_case`, как у бэка — **не переименовывать в типах** | `full_name`, `experience_years`, `is_online_available` |
| Локальные приватные обёртки над импортом | префикс `_` | `import { getClinicById as _getClinicById }` (`shared/api/requests.ts:19`) |

**Правило.** Файлы страниц в `app/` — только зарезервированные имена Next (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`). Ничего своего туда не класть.

---

## 3. Структура типичного компонента

**Правило — порядок импортов.** Он не на глаз, его ставит `@trivago/prettier-plugin-sort-imports` (`.prettierrc:3-14`), группы разделяются пустой строкой:

```
1. ^react
2. ^next
3. <THIRD_PARTY_MODULES>
4. @/app/*
5. @/pages/*
6. @/widgets/*
7. @/features/*
8. @/entities/*
9. @/shared/*
10. относительные (./ ../)
```

Эталон — `src/pages/login/ui.tsx:1-24`:

```tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { loginFn } from "@/shared/api";
import { EmailIcon, EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import { AuthShell, Button, Checkbox, type Country, Input, PhoneInput } from "@/shared/ui";
```

Запускай `npm run format` перед коммитом — pre-commit hook (`.husky/pre-commit` → `lint-staged`) сделает это сам, но только для `src/**`.

**Правило — порядок внутри файла:**

```tsx
"use client";              // если нужен — САМАЯ первая строка

// импорты (см. выше)

// 1. локальные типы
type LoginBy = "email" | "phone";

// 2. модульные константы и чистые хелперы (вне компонента!)
const ROLE_REDIRECT: Record<string, string> = { patient: "/profile", ... };
const getRoleRedirect = (role: string): string => { ... };

// 3. компонент
export const LoginPage = () => {
  // 3.1 роутер / сторы / query
  // 3.2 useState — все подряд
  // 3.3 производные значения
  // 3.4 useEffect
  // 3.5 обработчики (handleX)
  // 3.6 return JSX
};
```
Пруф: `src/pages/login/ui.tsx:26-202` — ровно этот порядок.

**Правило — props-паттерн.** Локальный `type Props`, деструктуризация в сигнатуре, дефолты прямо там:

```tsx
// src/shared/ui/lazy-in-view/index.tsx:7-25
type Props = {
  children: ReactNode;
  minHeight: number;
  rootMargin?: string;
  className?: string;
};

export const LazyInView: FC<Props> = ({ children, minHeight, rootMargin = "300px 0px", className }) => {
```

Второй допустимый вариант — инлайновый тип, если пропов 1–2:
```tsx
// src/shared/lib/AuthGuard.tsx:31
export const AuthGuard = ({ children }: { children: ReactNode }) => {
```

Аннотация `FC<Props>` используется, но **непоследовательно** — `Button` и `LazyInView` с `FC`, `LoginPage` и `AuthGuard` без. Оба варианта в проекте живые; выбирай по соседнему файлу.

**Правило — экспорт: named, всегда.**
`export const LoginPage = () => {…}`, `export const Button: FC<Props> = …`.
`export default` во всём `src/` есть **ровно в одном файле** — `src/components/livekit/ConsultationRoom.tsx` (он и так вне FSD). В `app/` — наоборот, `export default` обязателен по требованию Next.

---

## 4. TypeScript

**Правило: `type`, не `interface`.** 393 объявления `type` против 2 `interface` во всём проекте. Не заводи новые интерфейсы.

**Правило: `any` запрещён.** Во всём `src` и `app` — **ноль** вхождений `: any`, `as any`, `<any>`. Для неизвестного используется `unknown` с последующим сужением:

```ts
// src/shared/lib/errors.ts:11-14
export const extractErrorMessage = (
  value: unknown,
  fallback = "Что-то пошло не так. Попробуйте снова",
): string => { ... }
```

**Правило: ошибки ловятся как `unknown` и разбираются inline-типом.** Устоявшийся в проекте шаблон:

```ts
// повторяется ~10 раз, напр. src/pages/register/ui.tsx:323-324
} catch (err: unknown) {
  const errData = (err as { response?: { data?: unknown } })?.response?.data;
  toast.error(extractErrorMessage(errData, "…"));
}
```

**Правило: `enum` не использовать.** Ноль вхождений. Вместо них — union-литералы:
```ts
type UserRole = "patient" | "doctor" | "clinic";      // shared/store/authStore.ts:4
type Step = "email" | "code" | "new_password" | "success";  // forgot-password/ui.tsx:29
export type LiveKitErrorCode = "access_denied" | "expired" | "invalid_response" | "not_started" | "request_failed";
```

**Правило: `as const` для литеральных объектов-конфигов.** `ROUTES` (`shared/config/routes.ts:1,66`), все фабрики ключей (`queryKeys.ts` — `as const` на каждом массиве).

**Правило: дженерики — только там, где реально параметризуют.** Их в проекте мало и они простые:
```ts
export type PaginatedResponse<T> = { data: T[]; pagination: Pagination };   // api/types.ts:8
const sendMultipart = async <T>(path, method, form): Promise<T> => …        // clinic-cabinet/requests.ts:22
export function useInView<T extends Element>(rootMargin = "300px 0px")      // shared/lib/useInView.ts:4
const asCollection = <T>(data: T | T[] | null | undefined): T[] => …        // clinic-cabinet/requests.ts:115
```

**Правило: возвращаемый тип у API-функций пишется явно.**
```ts
export const getProfile = async (): Promise<ClientProfile> => {
  const { data } = await apiClient.get<ClientProfile>("/api/profile/");
  return data;
};
```
Дженерик в `apiClient.get<T>` **и** `Promise<T>` в сигнатуре — оба, всегда. См. любой `requests.ts`.

**Правило: `import type` для типов.** `import type { NextConfig } from "next"`, `import type { AuthUser } from "@/shared/store/authStore"`, `import { AuthShell, Button, type Country, … }`.

**Где лежат типы:**
- DTO бэка → `src/shared/api/<resource>/types.ts` (snake_case)
- общие API-типы → `src/shared/api/types.ts`
- доменные модели → `model.ts` слайса (`entities/blog/model.ts`, `pages/record/model/types.ts`)
- пропсы компонента → локальный `type Props` в его же файле
- **legacy camelCase-модели → `src/shared/dummies/mocks.ts`** (см. анти-паттерны)

---

## 5. Хуки, утилиты, константы

**Правило.** Хук общего назначения → `src/shared/lib/use<Name>.ts`, один хук на файл, с `export` (не default):
`useInView.ts`, `useLogout.ts`, `useMounted.ts`, `useReference.ts`, `useScrollLock.ts`, `useSidebarIndicator.ts`, `useTapHaptics.ts`.

**Правило.** Хук, знающий про домен, живёт в слайсе домена, а не в `shared`:
`entities/clinic-profile/useClinicCabinet.ts`, `widgets/doctor/layout/doctor-profile/useDoctorCabinet.ts`, `widgets/header/lib/useAuthDisplay.ts`, `pages/record/model/use-record-form.ts`.

**Правило: «жирный хук + тупой UI».** Большие экраны выносят всё состояние в один хук, который возвращает объект, а `ui.tsx` только раскладывает его по подкомпонентам:

```ts
// src/pages/record/model/use-record-form.ts:708-769
return { router, mobileStep, setMobileStep, mode, setMode, ..., validateAndSubmit };
};
export type RecordForm = ReturnType<typeof useRecordForm>;
```
Обрати внимание на последнюю строку — тип формы **выводится**, а не дублируется руками. Так же в `useClinicCabinet`.

**Правило.** Чистые функции без React → `model.ts` / `lib.ts` слайса или `shared/lib/<name>.ts` (`price.ts`, `media.ts`, `booking.ts`, `errors.ts`, `utils.ts`). Один файл — одна тема.

**Правило.** Константы, влияющие на поведение, — модульные, в SCREAMING_SNAKE, **рядом с местом использования**, с комментарием-почему:

```ts
// src/shared/api/clinic-cabinet/requests.ts:156-160
// Списки кабинета пагинированы (по умолчанию бэк отдаёт page_size=20), а UI
// показывает их одним списком без пагинации. Без явного page_size клиника с
// 21+ врачом молча теряла бы хвост. 100 — потолок бэка: page_size=500 он
// приводит к 100.
const CABINET_PAGE_SIZE = 100;
```

**Правило.** Никаких строковых путей в JSX — только `ROUTES` из `@/shared/config`:
```tsx
<Link href={ROUTES.FORGOT_PASSWORD}>Забыли пароль?</Link>
router.push(ROUTES.SEARCH({ query }));
router.push(ROUTES.RECORD_FOR_DOCTOR(doc.id, { workplaces: doc.workplaces }));
```
`ROUTES` — объект `as const` со статикой и функциями-билдерами (`routes.ts:24-65`).

---

## 6. Загрузки, ошибки, скелетоны, тосты

**Правило: у публичного маршрута должен быть `loading.tsx`.** Он есть у 16 маршрутов. Скелетоны собираются из класса `.skeleton` (`globals.css:69-88`, `background-color + ::after` с волной):
```tsx
<div className="h-9 w-28 skeleton rounded-full" />
```

**Правило: у сущности со списком — свой `skeleton.tsx` в слайсе**, экспортируемый через `index.ts`:
`entities/doctor/skeleton.tsx` → `<DoctorSkeleton count={4} variant="vertical" />`, аналогично `entities/clinic/skeleton.tsx`, `entities/blog/skeleton.tsx`.

**Правило: `error.tsx` не должен зависеть от того, что могло сломаться.** Корневой (`app/error.tsx:10-13`) прямо это декларирует: он не тянет Header/Footer/сторы, только `Button` + иконку.

**Правило: сетевую ошибку сначала прогоняют через `extractErrorMessage`, потом показывают.**
```ts
// src/pages/forgot-password/ui.tsx:60-68
onError: (err) => {
  const data = (err as { response?: { data?: unknown } })?.response?.data;
  toast.error(extractErrorMessage(data, "Не удалось отправить письмо. Попробуйте снова"));
},
```

**Правило: где показывать ошибку.**

| Контекст | Куда |
|---|---|
| Мутация кабинета / фоновое действие | `toast.error(...)` из `react-hot-toast`, тостер в `providers.tsx:39` |
| Поле формы | локальный `error`-стейт → проп `error` у `<Input>` |
| Сабмит формы | `setErrors(prev => ({ ...prev, submit: msg }))` (`use-record-form.ts:696-702`) |
| Успех мутации | `toast.success("Данные сохранены")` |

**Правило: у каждой мутации — и `onSuccess`, и `onError`.** Эталон — `useClinicCabinet.ts:141-179`: пять мутаций, у каждой обе ветки с тостом.

**Правило: серверные фетчи публичного контента не роняют страницу.**
```ts
// src/entities/blog/model.ts:99-108
// Блог — публичный контент: если запрос не прошёл, показываем пустой раздел, а
// не роняем страницу (она рендерится на сервере, в том числе при ISR).
export const fetchBlogPosts = async (limit = 12): Promise<BlogPost[]> => {
  try { const { data } = await getBlogPosts({ page_size: limit }); return data.map(adaptPost); }
  catch { return []; }
};
```
Правило именно такое: `catch` без вывода в UI допустим **только** для необязательного публичного контента и **только** с комментарием-обоснованием.

---

## 7. Формы и валидация

**Правило: библиотек форм нет — и не добавляй без обсуждения.** Ни `react-hook-form`, ни `zod`. Всё руками, по единому шаблону:

```
useState на каждое поле
   +  useState<Errors>({})     — объект ошибок с опциональными ключами
   +  useState(isLoading)      — или isPending из useMutation
   →  handleSubmit / validateAndSubmit:
        1. собрать nextErrors
        2. setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
        3. setIsLoading(true)
        4. try { await ... } catch { извлечь сообщение } finally { setIsLoading(false) }
```

Эталон валидации — `use-record-form.ts:652-706`:
```ts
const validateAndSubmit = async () => {
  const nextErrors: OptionalFormErrors = {};
  if (!canUseOnline) {
    if (!firstName.trim()) nextErrors.firstName = "Введите ваше имя";
    if (!phone.trim()) nextErrors.phone = "Введите номер телефона";
    else if (!isPhoneValid(phone)) nextErrors.phone = "Проверьте формат телефона";
  }
  if (email && !isEmailValid(email)) nextErrors.email = "Введите корректный email";
  setErrors(nextErrors);
  if (Object.keys(nextErrors).length > 0) return;
  ...
```
Предикаты валидации (`isPhoneValid`, `isEmailValid`, `normalizeLocalPhone`) — чистые функции в `model/lib.ts` слайса, не инлайн.

**Правило: кнопка сабмита всегда `disabled` + `loading`.**
```tsx
// src/pages/login/ui.tsx:190-198
<Button onClick={handleSubmit}
        disabled={!identifierFilled || !password || isLoading}
        loading={isLoading}>
  Продолжить
</Button>
```
`Button` сам добавляет `disabled={props.disabled || loading}` (`shared/ui/button/ui.tsx:58`) — но проп `disabled` всё равно ставь явно, как везде в проекте.

**Правило: многошаговые формы держат `step` в родителе, шаги — тупые компоненты.**
`pages/register/ui.tsx` владеет `clientStep`/`doctorStep`/`clinicStep` и `handleBack` (`:274-301`), а `Step1BasicInfo.tsx … Step7Completion.tsx` только рисуют.

**Правило: маски и преобразование форматов — отдельными чистыми функциями.**
`maskDate` (`shared/lib/utils.ts:9-14`), `toApiDate` (`register/ui.tsx:170-174` — «ДД.ММ.ГГГГ» → «YYYY-MM-DD»), `toApiTime`, `normalizeLocalPhone` (`record/model/lib.ts`).

**Правило: телефон хранится разложенным.** Национальная часть и код страны — раздельные стейты, E.164 собирается только при отправке:
```ts
// src/pages/login/ui.tsx:55-57, :75
const [phoneLocal, setPhoneLocal] = useState("");
const [dialCode, setDialCode] = useState("+996");
const identifier = loginBy === "email" ? email : `${dialCode}${phoneLocal}`;
```

**Правило: если часть данных сохраняется отдельным запросом — сообщи об этом честно.**
```ts
// src/pages/register/ui.tsx:678-682
if (profileResult.some((result) => result.status === "rejected")) {
  toast.error("Клиника создана, но часть файлов или данных не сохранилась. Попробуйте загрузить их в кабинете.");
}
```
Именно `Promise.allSettled`, а не `Promise.all` — частичный успех не должен выглядеть как полный провал.

---

## 8. Стили

**Правило: Tailwind-классы прямо в JSX. `cn()` — только когда есть условие или внешний `className`.**

```ts
// src/shared/lib/utils.ts:4-6
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Безусловные классы пишутся строкой без обёртки:
```tsx
<div className="flex items-center gap-4 p-4 rounded-2xl border-2" />
```
С условием — `cn()`, база первым аргументом, условное вторым, внешний `className` **последним** (чтобы `twMerge` дал ему выиграть):
```tsx
// src/shared/ui/button/ui.tsx:56
<button className={cn(baseStyles, variants[variant], className)} {...props} />
```
```tsx
// src/pages/register/ui.tsx:741-746
className={cn(
  "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer",
  selectedRole === value
    ? "border-primary bg-[#FFF8F6]"
    : "border-border bg-white hover:border-primary/40",
)}
```

**Правило: варианты компонента — `Record<Variant, string>` внутри компонента, не в JSX.**
```tsx
// src/shared/ui/button/ui.tsx:32-52
const sizes: Record<Sizes, string> = { xs: "h-8 text-xs px-4 …", sm: …, md: …, lg: … };
const variants: Record<Variant, string> = { default: "bg-primary text-white …", outline: …, text: … };
```

**Правило: цвета — только через семантические токены.** `text-foreground`, `text-muted`, `text-secondary`, `bg-background`, `border-border`, `bg-primary`. Токены определены в `globals.css:3-24` (`@theme`), TS-зеркало — `shared/config/tokens.ts`.
Хекс-литералы в классах (`bg-[#FEF3F0]`, `text-[#FF7C63]`) в проекте встречаются — это долг, не образец. Если цвет нужен повторно, заводи токен.

**Правило: mobile-first.** Базовый класс — мобильный, `md:`/`lg:` надстраивают. Разделение кабинета «мобильный хаб vs десктопный сайдбар» проходит по `lg`.

**Правило: цвет в проп SVG — из `colors`, не строкой.**
```tsx
<path stroke={colors.primary} strokeWidth="1.5" />   // register/ui.tsx:60
```

**Правило: CSS Modules не заводить.** Единственный `.module.css` в проекте — у LiveKit-компонентов вне FSD.

---

## 9. Комментарии и язык

**Правило: язык кода — английский, язык комментариев и UI — русский.**
Идентификаторы, ключи, имена файлов — английские. Все пользовательские строки — русские, зашитые прямо в JSX. **i18n в проекте нет** — ни библиотеки, ни словарей, ни `[locale]`-сегмента.

**Правило — главное в этом проекте: комментарий объясняет ПОЧЕМУ, а не ЧТО.** Это самая заметная черта кодовой базы, и её надо держать. Комментарии здесь длинные, конкретные и почти всегда содержат обнаруженный факт о поведении Next/zustand/бэкенда:

```ts
// src/shared/api/clinic-cabinet/requests.ts:63-64
// Бэк принимает на запись только id (проверено живым запросом: массив
// названий строк молча очищает специализации клиники, без ошибки).
primary_specialization_ids?: number[];
```

```ts
// next.config.ts:78-81
// Без явного root Next ищет lockfile вверх по дереву и находит
// ~/package-lock.json — за корень воркспейса берётся домашняя папка.
root: __dirname,
```

`src/shared/lib/AuthGuard.tsx:13-30` — 18 строк комментария про `useSyncExternalStore` и `getInitialState()` zustand v5. Это норма проекта, а не перебор.

**Правило: нетривиальный обход бага — комментарий обязателен.** Особенно: расхождения с документацией Next, особенности DRF-ответов, ограничения WebView, гонки гидратации zustand.

**Правило: пиши, что проверено живым запросом.** Формулировки «проверено живым запросом», «по нашей просьбе бэк привёл их к одному виду» встречаются в `clinic-cabinet/requests.ts:236`, `profile/requests.ts:61-62`, `doctor-cabinet/requests.ts` — сохраняй эту практику, она заменяет отсутствующую документацию API.

---

## 10. Работа с данными (React Query + zustand)

**Правило: server state — только React Query, client state — только zustand.** Не держи ответ API в `useState`.

**Правило: ключ берётся из фабрики `queryKeys.ts`.**
```ts
useQuery({ queryKey: profileKeys.favorites(), queryFn: getFavorites, enabled: isAuthed });
useQuery({ queryKey: doctorKeys.list(filters), queryFn: () => api.getDoctors(filters) });
```
Новый ресурс → сначала добавь фабрику в `queryKeys.ts` по существующему шаблону (`all → lists() → list(filters) → details() → detail(id)`), потом используй.

**Правило: `enabled` для всего, что зависит от авторизации или от выбора пользователя.**
```ts
enabled: isAuthed                        // favorite-toggle/model.ts:35
enabled: Boolean(selectedClinicId)       // use-record-form.ts:196
enabled: Boolean(selectedDoctorId) && Boolean(selectedDateStr)   // :225
enabled: isCityHydrated                  // :189
```

**Правило: оптимистичный апдейт делается по полному циклу `onMutate → onError(rollback) → onSettled(invalidate)`.** Эталон — `features/favorite-toggle/model.ts:62-84`.

**Правило: токен читается императивно (`getState()`), а не хуком, если он нужен вне рендера.**
```ts
const token = useAuthStore.getState().accessToken;              // client.ts:15
const { refreshToken, logout } = useAuthStore.getState();       // useLogout.ts:15
if (hydrated && !useAuthStore.getState().accessToken) { … }     // AuthGuard.tsx:55
```
В разметку значение стора идёт **только** через реактивный селектор, и только после гидратации (`useAuthDisplay.ts:37-45`).

**Правило: разлогин — через `useLogout()`, не через `store.logout()`.**
```ts
// src/shared/lib/useLogout.ts:8-10
// Logs out on the server (best-effort), clears local auth, returns home.
// Use everywhere instead of calling the store's logout directly so the
// refresh token is always invalidated server-side.
```

**Правило: гидратация persist-стора асинхронна — ждать явно.** Три разных корректных приёма уже есть в коде, выбирай подходящий:
- значение нужно в разметке → `useSyncExternalStore` с `getServerSnapshot: () => false` (`useAuthDisplay.ts:19-24`)
- значение нужно только в эффекте → `hasHydrated()` + `onFinishHydration` (`AuthGuard.tsx:38-47`, `use-record-form.ts:172-181`, `city-confirm/ui.tsx:55-67`)
- нужен просто факт монтирования → `useMounted()` (`shared/lib/useMounted.ts`)

---

## 11. Производительность

**Правило: тяжёлое ниже сгиба — за `LazyInView` + `dynamic()`.**
```tsx
// src/pages/home/ui.tsx:27-36, :51-53
const ClinicsList = dynamic(() => import("./clinicsList").then((m) => m.ClinicsMainList));
...
<LazyInView minHeight={520}>
  <ClinicsList />
</LazyInView>
```
`minHeight` обязателен — резервирует место, держит CLS = 0 (`shared/ui/lazy-in-view/index.tsx:9`).

**Правило: `dynamic()` без отложенного монтирования не применять.** Прямо задокументировано в `src/pages/home/ui.tsx:17-22`: для блоков, которые рендерятся сразу, `dynamic()` только добавляет round-trip и дублирует общие зависимости в чанк каждого компонента.

**Правило: картинки — `next/image` (или `ImageWithFallback` из `shared/ui`), никогда `<img>`.** Во всём `src` и `app` — **ноль** тегов `<img>`, 68 `<Image`. Новый хост картинок → добавь в `next.config.ts:41-75` `remotePatterns`. Нестандартный `quality` → добавь в `qualities` (`:40`), Next 16 их whitelist'ит.

**Правило: `useSearchParams()` оборачивается в `<Suspense>`** — либо в `app/*/page.tsx` (`app/record/page.tsx:7-9`, `app/(auth)/register/page.tsx:7-9`), либо внутри самого клиентского компонента с осмысленным скелетоном (`pages/home/doctorsMainList.tsx:142-166, 182-190`).

---

## 12. Прочие правила, которые видно в коде

- **`ROUTES` вместо строк** — см. §5.
- **`toHttps()` на любой media-URL с бэка** (`shared/lib/media.ts`) — иначе mixed content и отказ `next/image`.
- **`parsePrice()` / `hasPrice()` вместо ручного `parseFloat`** (`shared/lib/price.ts`) — `0` это валидная цена, `null` это отсутствие данных, и путать их нельзя.
- **Ответы, которые бэк отдаёт то массивом, то объектом, нормализуются хелпером**: `asCollection<T>()` (`clinic-cabinet/requests.ts:115-118`), `toFavoritesList()` (`profile/requests.ts:68-78`).
- **`page_size` задаётся явно** во всех кабинетных списках — иначе дефолтные 20 записей молча обрезают данные (`CABINET_PAGE_SIZE = 100`).

---

# АНТИ-ПАТТЕРНЫ — это в проекте есть, но копировать НЕ надо

### A1. Legacy-адаптер snake_case → camelCase-моки
`src/shared/api/requests.ts` (273 строки) приводит реальные DTO обратно к форме моков из `shared/dummies/mocks.ts`. Шапка файла сама называет это «backward-compatibility layer during migration» (`:1-7`), но миграция не закончена, и файл — активный прод-код. Плюс внутри него не только маппинг, а бизнес-форматирование и хардкод (`adaptDoctorDetail:116` вшивает `contacts.schedule = "ПН-ПТ • 09:00-18:00"`).
**Как надо:** новый экран потребляет DTO из `<resource>/types.ts` напрямую или через адаптер в `model.ts` своего слайса. Ничего нового в `requests.ts` и `dummies/` не добавлять.

### A2. Три папки вне FSD
`src/components/livekit/`, `src/hooks/`, `src/services/` — не слои FSD, живут в обход steiger. В `src/components/livekit/ConsultationRoom.tsx` вдобавок единственный `export default` во всём `src`.
**Как надо:** это `widgets/consultation-room` (UI), `shared/api/livekit` (транспорт), `entities/consultation` (модель).

### A3. Query-ключи строками мимо фабрики
`use-record-form.ts` — шесть ключей руками: `["record-profile"]`, `["record-clinics"]`, `["record-doctors", selectedCity]`, `["record-clinic-detail", …]`, `["record-services", …]`, `["record-available-slots", …]`.
`app/search/page.tsx:76,80` префетчит по `["clinics"]` и `["services"]` — эти ключи **не совпадают** с `clinicKeys.list()`/`serviceKeys.list()`, значит точечная инвалидация их не достанет.
**Как надо:** только `queryKeys.ts`.

### A4. Ручная синхронизация SSR-префетча с клиентскими фильтрами
В `app/{clinics,services,specialists,search}/page.tsx` фильтры и `PAGE_SIZE`/`MAX_PRICE`/`PREFIX` **скопированы** из клиентского компонента, с комментарием «должно совпадать значение в значение». Четыре пары мест, где рассинхрон не даст ошибки, а просто тихо выключит префетч.
**Как надо:** вынести построение фильтров в общую чистую функцию `buildXFilters(searchParams)` в `model.ts` слайса и звать её с обеих сторон.

### A5. Захардкоженный прод-адрес как fallback env
`http://155.212.216.197:8030` в `src/shared/api/client.ts:6` и `next.config.ts:9`, `https://imbir.sino0on.ru` в `chat/model/constants.ts:1`. Три места, два разных значения, оба по умолчанию.
**Как надо:** одна константа в одном модуле; отсутствие `NEXT_PUBLIC_API_URL` должно ронять сборку, а не подставлять IP. См. BUGS.md `[P0]`.

### A6. `key={index}` в списках, которые могут меняться
Допустимо для скелетонов из `Array.from({length: n})` — таких большинство. Но есть и настоящие данные:
`pages/specialist-details/ui.tsx:322,348`, `pages/clinic/clinic-details/ui.tsx:215,246`, `pages/blog-article/ui.tsx:83`, `pages/doctor/my-data/sections/documents.tsx:172`, `entities/clinic-profile/ui.tsx:327,392,677`, `pages/register/clinic-form/Step4Legal.tsx:98`, `Step1BasicInfo.tsx:144`, `doctor-form/Step4Certificates.tsx:86`.
**Как надо:** `key` по `id`/уникальному полю. Для файлов — `file.name + file.size`.

### A7. Интервал, пересоздающийся каждый тик
```ts
// src/pages/forgot-password/ui.tsx:47-51 — и то же в register/ui.tsx:252-258
useEffect(() => {
  if (step !== "code" || resendLeft <= 0) return;
  const timer = setInterval(() => setResendLeft((s) => s - 1), 1000);
  return () => clearInterval(timer);
}, [step, resendLeft]);          // ← resendLeft в зависимостях
```
Каждую секунду интервал убивается и создаётся заново — таймер дрейфует, а на каждый тик идёт лишний цикл монтирования эффекта.
**Как надо:** зависимость только от «таймер активен», а остановка — внутри колбэка.

### A8. Массивы, пересобираемые на каждом рендере и служащие зависимостями `useMemo`
```ts
// src/pages/record/model/use-record-form.ts:240, 250, 270, 289
const CLINICS: Clinic[] = clinicsData.map(...);           // не в useMemo
const DOCTORS: Doctor[] = doctorsData.map(...);           // не в useMemo
const CLINIC_DOCTORS: Doctor[] = (clinicDetail?.doctors ?? []).map(...);
const SERVICES: Service[] = (servicesRaw?.data ?? []).map(...);
// ...и дальше они стоят в deps:
const doctorPool = useMemo(() => [...CLINIC_DOCTORS, ...DOCTORS], [CLINIC_DOCTORS, DOCTORS]);  // :340-343
```
Ниже по файлу от них зависят ещё шесть `useMemo` и один `useEffect` (`:349-368`). Без React Compiler мемоизация не работала бы вообще. Компилятор включён (`next.config.ts:13`) и, скорее всего, это спасает, — но полагаться на это в новом коде не стоит.
**Как надо:** либо всё в `useMemo` явно, либо ничего (и не ставить в deps).

### A9. `SCREAMING_SNAKE_CASE` для локальных переменных
`CLINICS`, `DOCTORS`, `SERVICES`, `CLINIC_DOCTORS` в `use-record-form.ts` — это не константы, а производные значения, пересчитываемые каждый рендер. Имя вводит в заблуждение.
**Как надо:** `clinics`, `doctors`, `services`.

### A10. Два стиля именования файлов-хуков
`useClinicCabinet.ts`, `useSpecialistDetail.ts`, `useSpecialistForm.ts`, `useDoctorCabinet.ts` — camelCase.
`use-record-form.ts`, `use-ai-chat.ts`, `use-chat-room.ts`, `use-dropdown-swipe.ts` — kebab-case.
**Как надо:** выбрать один (см. QUESTIONS.md) и не смешивать в новых файлах.

### A11. Мёртвый код в API-слое
`uploadFile` (`shared/api/upload/requests.ts`) не вызывается нигде. `api.getReviews()` (`shared/api/requests.ts:262`) не вызывается нигде и внутри зовёт `getReviews("doctor", 0)` с id `0`. `refreshTokenFn` (`auth/requests.ts:111`) дублирует логику интерсептора и не используется. Ветка `NEXT_PUBLIC_BUILD_TARGET === "capacitor"` (`readInitialAuth.ts:27`) недостижима — переменная нигде не задаётся, а `capacitor.config.ts:1-8` прямо пишет, что статический экспорт **не используется**.
**Как надо:** удалять сразу, а не оставлять «на всякий». Комментарий, противоречащий соседнему конфигу, хуже отсутствия комментария.

### A12. Дублирующийся `getRoleRedirect`
Одна и та же функция и её таблица `ROLE_REDIRECT` скопированы в `pages/login/ui.tsx:28-41` и `pages/register/ui.tsx:154-167`. Отличаются: в register нет `?? ROUTES.PROFILE` (там строка `"/profile"`), и после регистрации врача/клиники вызывается вообще не `getRoleRedirect`, а голый `ROLE_REDIRECT[...]` (`register/ui.tsx:516, 685`) — мобильная ветка `/clinic-profile/menu` теряется.
**Как надо:** одна функция в `shared/lib` или `shared/config/routes.ts`.

### A13. Мутирование `document.body.style` без счётчика вложенности
`useScrollLock` (`shared/lib/useScrollLock.ts`) и `global-search/ui.tsx:46-52` оба напрямую пишут в `document.body.style`. Если открыты две блокирующие поверхности, cleanup первой закрывшейся снимет блокировку у обеих.
**Как надо:** счётчик блокировок в модуле.

### A14. Модалка без ролей и фокус-ловушки
`shared/ui/modal/ui.tsx:45-88` — нет `role="dialog"`, нет `aria-modal`, нет фокус-трапа, нет возврата фокуса, у кнопки закрытия нет `aria-label`. По всему проекту `aria-modal`/`role="dialog"` — **0 вхождений** (при 57 `aria-label`).
**Как надо:** починить базовый `Modal` один раз — его переиспользуют все.
