import { chromium } from "playwright";

// ВАЖНО про page.route: Playwright матчит обработчики в ОБРАТНОМ порядке
// регистрации — последний зарегистрированный выигрывает. Поэтому catch-all
// всегда ставим ПЕРВЫМ, а точечные стабы — после него.

const BASE = "http://localhost:3001";
const results = [];
const ok = (name, pass, note = "") => results.push({ name, pass, note });

const USER = {
  id: 1, role: "patient", first_name: "Тест", last_name: "Тестов",
  full_name: "Тест Тестов", email: "t@example.com", phone: "+996700000000",
  date_joined: "2026-01-01T00:00:00Z", avatar: null,
};
const AUTH_OK = { access: "acc", refresh: "ref", user: USER };
const json = (body) => ({ status: 200, contentType: "application/json", body: JSON.stringify(body) });

// Глушим весь бэкенд, чтобы 401 от реального API не выкидывал нас логаутом.
const stubBackend = (page) =>
  page.route("**/api/**", (r) => r.fulfill(json({
    data: [], pagination: { page: 1, page_size: 8, total: 0, total_pages: 1 },
  })));

const browser = await chromium.launch();

// ── 1. /login: чисто грузится, без перезагрузок ────────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors = [];
  let docRequests = 0;
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
  page.on("request", (r) => r.resourceType() === "document" && docRequests++);
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(5000);

  ok("/login без JS-ошибок", errors.length === 0, errors[0] ?? "");
  ok("/login не перезагружается (1 запрос документа)", docRequests === 1, `${docRequests}`);
  ok("/login: есть <form>", (await page.locator("form").count()) === 1);
  ok("/login: ровно одна submit-кнопка", (await page.locator('button[type="submit"]').count()) === 1);
  await ctx.close();
}

// ── 2. Tab-навигация и видимый фокус ───────────────────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });

  const describe = () => page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return "none";
    const t = el.tagName.toLowerCase();
    if (t === "input") return `input[${el.getAttribute("name") || el.type}]`;
    if (t === "button") return `button[${el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 18)}]`;
    if (t === "a") return `a[${el.textContent?.trim().slice(0, 14)}]`;
    return t;
  });

  // Заполняем поля: пока форма не валидна, кнопка disabled и в таб-порядок
  // не попадает в принципе (это корректное поведение HTML).
  await page.locator('input[name="email"]').fill("t@example.com");
  await page.locator('input[name="password"]').fill("secret123");

  await page.locator('input[name="email"]').focus();
  const seq = [];
  let reachedSubmit = false;
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
    seq.push(await describe());
    if (await page.evaluate(() => document.activeElement?.getAttribute("type") === "submit")) {
      reachedSubmit = true; break;
    }
  }
  ok("Tab доходит от почты до кнопки «Продолжить»", reachedSubmit, seq.join(" → "));

  // focus-visible срабатывает ТОЛЬКО при клавиатурном фокусе — меряем кольцо
  // после реального Tab, а не после .focus() (иначе проверка соврёт).
  const shadow = reachedSubmit
    ? await page.evaluate(() => getComputedStyle(document.activeElement).boxShadow)
    : "none";
  ok("у кнопки видно кольцо фокуса при Tab", shadow !== "none" && shadow !== "", shadow.slice(0, 40));
  await ctx.close();
}

// ── 3. Enter отправляет логин и уводит в кабинет ───────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let loginCalls = 0;
  await stubBackend(page);
  await page.route("**/api/auth/login/", (r) => { loginCalls++; r.fulfill(json(AUTH_OK)); });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.evaluate(() => { window.__alive = true; });

  await page.locator('input[name="email"]').fill("t@example.com");
  await page.locator('input[name="password"]').fill("secret123");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(3500);

  ok("Enter отправляет форму логина", loginCalls === 1, `вызовов: ${loginCalls}`);
  ok("Enter не перезагружает страницу", await page.evaluate(() => window.__alive === true));
  ok("после логина попадаем в кабинет", page.url().includes("/profile"), page.url());
  await ctx.close();
}

// ── 4. Клик по кнопке эквивалентен Enter ───────────────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let loginCalls = 0;
  await stubBackend(page);
  await page.route("**/api/auth/login/", (r) => { loginCalls++; r.fulfill(json(AUTH_OK)); });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill("t@example.com");
  await page.locator('input[name="password"]').fill("secret123");
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);
  ok("клик по кнопке тоже логинит", loginCalls === 1 && page.url().includes("/profile"),
     `вызовов: ${loginCalls}, ${page.url()}`);
  await ctx.close();
}

// ── 5. Глаз «показать пароль» ──────────────────────────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let loginCalls = 0;
  await stubBackend(page);
  await page.route("**/api/auth/login/", (r) => { loginCalls++; r.fulfill(json(AUTH_OK)); });
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="password"]').fill("secret123");
  const eye = page.locator('button[aria-label="Показать пароль"]');
  ok("«Показать пароль» — доступная кнопка", (await eye.count()) === 1);
  await eye.click();
  await page.waitForTimeout(300);
  ok("глаз раскрывает пароль",
     (await page.locator('input[name="password"]').getAttribute("type")) === "text");
  ok("глаз НЕ сабмитит форму", loginCalls === 0, `вызовов: ${loginCalls}`);
  await ctx.close();
}

// ── 6. Регистрация пациента: Enter по всем шагам ───────────────────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  let regCalls = 0;
  await stubBackend(page);
  await page.route("**/api/auth/register/client/", (r) => { regCalls++; r.fulfill(json(AUTH_OK)); });
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await page.evaluate(() => { window.__alive = true; });

  await page.getByText("Пациент", { exact: true }).click();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  ok("Enter: выбор роли → форма пациента",
     (await page.locator('input[name="given-name"]').count()) === 1);

  await page.locator('input[name="given-name"]').fill("Тест");
  await page.locator('input[name="family-name"]').fill("Тестов");
  await page.locator('input[name="email"]').fill("t@example.com");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  const step2 = (await page.locator('input[name="new-password"]').count()) === 1;
  ok("Enter: шаг 1 → шаг 2 (пароль)", step2);

  if (step2) {
    await page.locator('input[name="new-password"]').fill("Secret123");
    await page.locator('input[name="confirm-password"]').fill("Secret123");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(3000);
    ok("Enter создаёт аккаунт", regCalls === 1, `вызовов: ${regCalls}`);
    ok("регистрация не перезагрузила страницу",
       await page.evaluate(() => window.__alive === true));
  }
  await ctx.close();
}

// ── 7. Регистрация клиники: Enter не должен «проваливать» шаги ─────────────
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await stubBackend(page);
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await page.getByText("Клиника", { exact: true }).click();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  const title = await page.locator("h2").last().innerText();
  ok("Enter: выбор роли «Клиника» → шаг 1", /Основн|Информац|данны/i.test(title), title);
  await ctx.close();
}

// ── 8. Чат: «Перейти в чат» и «Описать симптомы» с главной ─────────────────
{
  const ctx = await browser.newContext();
  await ctx.addInitScript((user) => {
    localStorage.setItem("auth-storage", JSON.stringify({
      state: { accessToken: "acc", refreshToken: "ref", user, rememberMe: true }, version: 0,
    }));
    document.cookie = "is_authed=1; path=/";
  }, USER);
  const page = await ctx.newPage();

  let aiSend = null;
  await stubBackend(page);                                        // catch-all первым
  await page.route("**/api/chat/rooms/", (r) => r.fulfill(json([])));
  await page.route("**/api/chat/ai/", (r) => r.fulfill(json([])));
  await page.route("**/api/chat/ai/send/", (r) => {
    aiSend = r.request().postDataJSON();
    r.fulfill(json({ id: 2, role: "assistant", content: "Ответ ассистента",
                     created_at: new Date().toISOString(),
                     recommendations: { doctors: [], clinics: [], services: [] } }));
  });

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Перейти в чат" }).click();
  await page.waitForTimeout(3000);
  ok("«Перейти в чат» открывает ИИ-помощника",
     (await page.getByText("Виртуальный ассистент").count()) > 0, page.url());

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Опишите, что вас беспокоит…").fill("болит голова");
  await page.getByRole("button", { name: "Описать симптомы" }).click();
  await page.waitForTimeout(4000);
  ok("«Описать симптомы» открывает диалог с ИИ",
     (await page.getByText("Виртуальный ассистент").count()) > 0, page.url());
  ok("симптом уходит в /api/chat/ai/send/", aiSend?.message === "болит голова", JSON.stringify(aiSend));
  ok("ответ ассистента виден в ленте",
     (await page.getByText("Ответ ассистента").count()) > 0);
  ok("одноразовые параметры вычищены из URL",
     !page.url().includes("ask=") && !page.url().includes("ai="), page.url());
  await ctx.close();
}

// ── 9. Кривой ответ бэка не роняет чат в error boundary ────────────────────
{
  const ctx = await browser.newContext();
  await ctx.addInitScript((user) => {
    localStorage.setItem("auth-storage", JSON.stringify({
      state: { accessToken: "acc", refreshToken: "ref", user, rememberMe: true }, version: 0,
    }));
  }, USER);
  const page = await ctx.newPage();
  await stubBackend(page);
  await page.route("**/api/chat/rooms/", (r) => r.fulfill(json([])));
  await page.route("**/api/chat/ai/", (r) => r.fulfill(json([])));
  // recommendations пустым СПИСКОМ вместо объекта — обычная форма у DRF.
  await page.route("**/api/chat/ai/send/", (r) =>
    r.fulfill(json({ id: 2, role: "assistant", content: "Ответ ассистента",
                     created_at: new Date().toISOString(), recommendations: [] })));

  await page.goto(`${BASE}/chat?ask=${encodeURIComponent("болит горло")}`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);
  const text = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  ok("кривой recommendations не роняет чат", !text.includes("Что-то пошло не так"), text.slice(0, 90));
  ok("ответ ассистента отрисован", text.includes("Ответ ассистента"));
  await ctx.close();
}

await browser.close();

let failed = 0;
console.log("");
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? "✓" : "✗"} ${r.name}${r.note ? `  — ${r.note}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} прошло`);
process.exit(failed ? 1 : 0);
