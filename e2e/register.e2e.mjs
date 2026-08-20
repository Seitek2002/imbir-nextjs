import { chromium } from "playwright";

// Регистрация врача и клиники: OTP-гейт бэка, полный номер телефона, маска
// даты рождения и ограничение года.
//
// ВАЖНО про page.route: Playwright матчит обработчики в ОБРАТНОМ порядке
// регистрации — последний зарегистрированный выигрывает. Поэтому catch-all
// всегда ставим ПЕРВЫМ, а точечные стабы — после него.

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const results = [];
const ok = (name, pass, note = "") => results.push({ name, pass, note });

const USER = {
  id: 7,
  role: "clinic",
  first_name: "Тест",
  last_name: "Клиника",
  full_name: "Тест Клиника",
  email: "clinic@example.com",
  phone: "+996700111222",
  date_joined: "2026-01-01T00:00:00Z",
  avatar: null,
};
const AUTH_OK = { access: "acc", refresh: "ref", user: USER };
const json = (body, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

// Что реально ушло на бэк — по этим записям и проверяем контракт.
const makeRecorder = () => ({ calls: [] });

const stubBackend = async (page, rec) => {
  // catch-all первым
  await page.route("**/api/**", (r) =>
    r.fulfill(
      json({
        data: [],
        pagination: { page: 1, page_size: 20, total: 0, total_pages: 1 },
      }),
    ),
  );

  // Справочники: отдаём непустые списки, иначе шаги-чекбоксы пустые.
  await page.route("**/api/references/**", (r) =>
    r.fulfill(json({ data: ["Бишкек", "Ош"] })),
  );
  await page.route("**/api/references/specializations/**", (r) =>
    r.fulfill(json({ data: [{ id: 1, name: "Терапевт", photo: null }] })),
  );

  // OTP-гейт
  await page.route("**/api/auth/verify/email/request/**", async (r) => {
    rec.calls.push({
      url: "verify/email/request",
      body: r.request().postDataJSON(),
    });
    await r.fulfill(json({ detail: "Код отправлен" }));
  });
  await page.route("**/api/auth/verify/email/confirm/**", async (r) => {
    rec.calls.push({
      url: "verify/email/confirm",
      body: r.request().postDataJSON(),
    });
    await r.fulfill(json({ detail: "Подтверждено" }));
  });
  await page.route("**/api/auth/verify/phone/request/**", async (r) => {
    rec.calls.push({
      url: "verify/phone/request",
      body: r.request().postDataJSON(),
    });
    await r.fulfill(json({ detail: "Код отправлен" }));
  });

  // Анкеты — multipart, поэтому читаем сырое тело.
  await page.route("**/api/auth/register/clinic/**", async (r) => {
    rec.calls.push({ url: "register/clinic", raw: r.request().postData() });
    await r.fulfill(json(AUTH_OK));
  });
  await page.route("**/api/auth/register/doctor/**", async (r) => {
    rec.calls.push({ url: "register/doctor", raw: r.request().postData() });
    await r.fulfill(json({ ...AUTH_OK, user: { ...USER, role: "doctor" } }));
  });
  await page.route("**/api/clinic/profile/**", async (r) => {
    rec.calls.push({ url: "clinic/profile", raw: r.request().postData() });
    await r.fulfill(json({ id: 7, name: "Тест Клиника", logo: null }));
  });
};

// Мастер рендерится в двух вариантах (мобильный/десктопный), поэтому берём
// видимый элемент, а не первый в DOM.
const visible = (page, selector) =>
  page.locator(selector).locator("visible=true");

const gotoRegister = async (page) => {
  await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  // Подтверждение города перехватывает клики, пока открыто.
  const confirmCity = page.getByRole("button", { name: "Верно" });
  await page.waitForTimeout(1500);
  if (await confirmCity.count()) await confirmCity.first().click();
  await page.waitForTimeout(300);
};

const clickContinue = async (page, label) => {
  await visible(page, `button:has-text("${label}")`)
    .first()
    .click({ force: true });
  await page.waitForTimeout(500);
};

const browser = await chromium.launch();

// ── 1. Клиника: OTP-гейт и полный номер ───────────────────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  const page = await ctx.newPage();
  const rec = makeRecorder();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await stubBackend(page, rec);
  await gotoRegister(page);

  ok(
    "/register: форма видима",
    await visible(page, "form").first().isVisible(),
  );

  // Роль → клиника. force: сам input визуально скрыт, поверх него декоративная
  // плашка, и Playwright иначе считает клик перехваченным.
  await page
    .locator('input[type=radio][value="clinic"]')
    .first()
    .check({ force: true });
  await clickContinue(page, "Продолжить");
  ok(
    "шаг 1 «Основная информация»",
    await page.getByText("Основная информация").first().isVisible(),
  );

  // Шаг 1: название
  await visible(page, 'input[placeholder="Введите название"]')
    .first()
    .fill("Тест Клиника");
  await clickContinue(page, "Продолжить");

  // Шаг 2: адрес, телефон, почта
  await visible(page, 'input[placeholder="Введите полный адрес"]')
    .first()
    .fill("Чуй 219");
  await visible(page, 'input[placeholder="•••••••••"]')
    .first()
    .fill("700111222");
  await visible(page, 'input[placeholder="Введите вашу почту"]')
    .first()
    .fill("clinic@example.com");
  await clickContinue(page, "Продолжить");

  // Шаги 3–6 проходим насквозь
  for (let i = 0; i < 4; i++) await clickContinue(page, "Продолжить");

  ok(
    "дошли до шага 7",
    await page.getByText("Согласия и политики").first().isVisible(),
  );

  // Шаг 7: пароль + согласия
  await visible(page, 'input[placeholder="Придумайте пароль"]')
    .first()
    .fill("Passw0rd!");
  await visible(page, 'input[placeholder="Повторите пароль"]')
    .first()
    .fill("Passw0rd!");
  const boxes = await visible(page, "input[type=checkbox]").all();
  for (const b of boxes) await b.check({ force: true });

  // Первое нажатие «Завершить регистрацию» не должно отправлять анкету —
  // сначала гейт подтверждения.
  await clickContinue(page, "Завершить регистрацию");
  await page.waitForTimeout(1200);

  ok(
    "блок подтверждения появился",
    await page.getByText("Подтвердите контакт").first().isVisible(),
  );
  const requested = rec.calls.find((c) => c.url === "verify/email/request");
  ok(
    "код запрошен на почту из анкеты",
    !!requested,
    JSON.stringify(requested?.body),
  );
  ok(
    "код ушёл на введённый email",
    requested?.body?.email === "clinic@example.com",
    requested?.body?.email,
  );
  ok(
    "анкета НЕ отправлена до подтверждения",
    !rec.calls.some((c) => c.url === "register/clinic"),
  );

  // Вводим код и подтверждаем — анкета должна уйти сама.
  await visible(page, 'input[name="one-time-code"]').first().fill("1234");
  await visible(page, 'button:has-text("Подтвердить код")').first().click();
  await page.waitForTimeout(2500);

  const confirmed = rec.calls.find((c) => c.url === "verify/email/confirm");
  ok(
    "код подтверждён",
    confirmed?.body?.code === "1234",
    JSON.stringify(confirmed?.body),
  );

  const registered = rec.calls.find((c) => c.url === "register/clinic");
  ok("анкета отправлена после подтверждения", !!registered);
  ok(
    "телефон ушёл с кодом страны",
    !!registered?.raw?.includes("+996700111222"),
    registered?.raw?.match(/\+?\d{9,15}/)?.[0] ?? "не найден",
  );

  ok("без JS-ошибок", errors.length === 0, errors[0] ?? "");
  await ctx.close();
}

// ── 2. Врач: маска даты рождения и ограничение года ───────────────────────
{
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  const page = await ctx.newPage();
  const rec = makeRecorder();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await stubBackend(page, rec);
  await gotoRegister(page);

  await page
    .locator('input[type=radio][value="doctor"]')
    .first()
    .check({ force: true });
  await clickContinue(page, "Продолжить");

  // Дата рождения: вводим только цифры, точки должен поставить компонент.
  const birth = visible(page, 'input[placeholder="ДД.ММ.ГГГГ"]').first();
  await birth.fill("");
  await birth.type("18022003", { delay: 20 });
  ok(
    "маска даты: 18022003 -> 18.02.2003",
    (await birth.inputValue()) === "18.02.2003",
    await birth.inputValue(),
  );

  // Лишние цифры игнорируются.
  await birth.fill("");
  await birth.type("1802200399", { delay: 10 });
  ok(
    "дата не длиннее 8 цифр",
    (await birth.inputValue()) === "18.02.2003",
    await birth.inputValue(),
  );

  // Несуществующая дата подсвечивается.
  await birth.fill("");
  await birth.type("31022003", { delay: 10 });
  await page.waitForTimeout(300);
  ok(
    "31.02 помечена как несуществующая",
    await page.getByText("Такой даты не существует").first().isVisible(),
  );

  await birth.fill("");
  await birth.type("18022003", { delay: 10 });

  // Кнопка календаря присутствует и доступна
  ok(
    "есть кнопка календаря",
    (await page.getByRole("button", { name: "Открыть календарь" }).count()) > 0,
  );

  // Остальные обязательные поля шага 1
  await page.locator("input[type=radio]").first().check({ force: true });
  await visible(page, 'input[placeholder="Введите ваше полное имя"]')
    .first()
    .fill("Айдар Маматов");
  await visible(page, 'input[placeholder="•••••••••"]')
    .first()
    .fill("700111222");
  await visible(page, 'input[placeholder="Введите вашу почту"]')
    .first()
    .fill("doc@example.com");

  // Город — Dropdown: его триггер это div с onClick, а не button.
  const cityBtn = page
    .locator("div.cursor-pointer")
    .filter({ hasText: "Выберите из списка" })
    .first();
  await cityBtn.click({ force: true });
  await page.waitForTimeout(400);
  await page.getByText("Бишкек", { exact: true }).last().click({ force: true });
  await page.waitForTimeout(400);

  ok(
    "шаг 1 врача заполнен — кнопка активна",
    await visible(page, 'button:has-text("Продолжить")').first().isEnabled(),
  );

  await clickContinue(page, "Продолжить"); // -> шаг 2
  await clickContinue(page, "Продолжить"); // -> шаг 3
  ok(
    "дошли до шага 3 «Образование»",
    await page.getByText("Год окончания").first().isVisible(),
  );

  // Шаг 3: год окончания
  const year = visible(page, 'input[placeholder="ГГГГ"]').first();
  if (await year.count()) {
    await year.fill("");
    await year.type("121212121212", { delay: 10 });
    ok(
      "год обрезается до 4 цифр",
      (await year.inputValue()) === "1212",
      await year.inputValue(),
    );
    await year.fill("");
    await year.type("2018", { delay: 10 });
    ok("нормальный год принимается", (await year.inputValue()) === "2018");
  } else {
    ok("поле года найдено", false, "input[placeholder=ГГГГ] не найден");
  }

  ok("без JS-ошибок (врач)", errors.length === 0, errors[0] ?? "");
  await ctx.close();
}

await browser.close();

const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(
    `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.note ? `  — ${r.note}` : ""}`,
  );
}
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
