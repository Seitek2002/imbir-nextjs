# Правила проекта и принципы совместной работы

## 1. Принцип работы над задачами

Мы придерживаемся строгого и безопасного цикла разработки:

1. **Создание изолированной ветки**: Под каждую задачу создаётся новая локальная ветка (например, `feature/chat-figma-layout`, `feature/fix-modal-autofill`). Это гарантирует, что незавершённый код не сломает основную сборку.
2. **Исследование дизайна и кодовой базы**: Анализ макетов Figma и логики в текущих файлах, при необходимости запуск фоновых скриптов для сверки ключей API.
3. **Локальный Dev-сервер**: В фоновом режиме всегда запущен сервер (`npm run dev`), на котором происходят все изменения.
4. **Автономное тестирование (Было / Стало)**: Запуск специального браузерного субагента (Web Browser Agent). Он автоматически авторизуется под тестовым пользователем, открывает нужную страницу на `localhost:3000`, делает скриншоты до и после изменений и сохраняет их в отчёты для наглядного сравнения.
5. **Валидация сборки**: Перед мерджем обязательно выполняется `npm run build`, чтобы исключить любые ошибки компиляции Next.js или несоответствия типов TypeScript.
6. **Мердж и Пуш**: После одобрения пользователя (словом *«одобряю»*):
   * Переключиться на ветку `master`.
   * Слить feature-ветку с мастером (`git merge`).
   * Пушить изменения на GitHub (`git push origin master`).
   * Удалить временную локальную ветку.

---

## 2. Структура проекта (Feature-Sliced Design - FSD)

Весь код структурирован по слоям от глобального к локальному:

* [app/](file:///c:/Users/laby/Desktop/imbir-nextjs/app) — Роутинг Next.js (точки входа для страниц). Содержит файлы `page.tsx` и `layout.tsx`, которые просто подключают страницы из слоя `pages`.
* [src/pages/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/pages) — Полноценные страницы приложения. Разметка основных экранов:
  * [/chat](file:///c:/Users/laby/Desktop/imbir-nextjs/src/pages/chat) — страница переписки (с чат-листом, сообщениями и ИИ-Ассистентом).
  * [/record](file:///c:/Users/laby/Desktop/imbir-nextjs/src/pages/record) — страница оформления записи на приём (содержит шаги формы и карточку сводки `SummaryCard`).
  * [/specialist-details](file:///c:/Users/laby/Desktop/imbir-nextjs/src/pages/specialist-details) — страница врача (включая модальное окно офлайн-записи).
* [src/widgets/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/widgets) — Крупные независимые блоки интерфейса, объединяющие фичи и сущности (например, шапка сайта `Header`, подвал).
* [src/features/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/features) — Интерактивные действия пользователя, несущие бизнес-ценность (например, авторизация, запись на приём).
* [src/entities/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/entities) — Бизнес-сущности приложения (врачи, клиники, услуги, отзывы). Содержат их карточки и простые UI-компоненты.
* [src/shared/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/shared) — Переиспользуемые утилиты и компоненты общего назначения:
  * [/assets/icons/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/shared/assets/icons) — Все SVG-иконки проекта.
  * [/ui/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/shared/ui) — Базовые компоненты UI-kit (кнопки `Button`, поля ввода `Input`, модальные окна `Modal`).
  * [/api/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/shared/api) — Настройки HTTP-клиента, типы запросов к бэкенду и эндпоинты.
  * [/store/](file:///c:/Users/laby/Desktop/imbir-nextjs/src/shared/store) — Глобальные стейт-менеджеры (например, Zustand стор для авторизации `useAuthStore`).

---

## 3. Ключевые файлы конфигурации и артефакты

* [package.json](file:///c:/Users/laby/Desktop/imbir-nextjs/package.json) — Версии зависимостей, библиотек и скрипты запуска.
* [next.config.ts](file:///c:/Users/laby/Desktop/imbir-nextjs/next.config.ts) — Настройки сборщика Next.js.
* [tsconfig.json](file:///c:/Users/laby/Desktop/imbir-nextjs/tsconfig.json) — Настройки TypeScript.
* [eslint.config.mjs](file:///c:/Users/laby/Desktop/imbir-nextjs/eslint.config.mjs) — Правила ESLint.
* [steiger.config.ts](file:///c:/Users/laby/Desktop/imbir-nextjs/steiger.config.ts) — Валидатор FSD архитектуры.
* [middleware.ts](file:///c:/Users/laby/Desktop/imbir-nextjs/middleware.ts) — Промежуточное ПО Next.js.
* `.env.local` — Локальные переменные окружения.
* [walkthrough.md](file:///C:/Users/laby/.gemini/antigravity/brain/ce671e2d-411c-4e3e-b835-f6b1e0c0b998/walkthrough.md) — Живой отчёт по ходу работы.
* [task.md](file:///C:/Users/laby/.gemini/antigravity/brain/ce671e2d-411c-4e3e-b835-f6b1e0c0b998/task.md) — TODO-лист с чекпоинтами.
