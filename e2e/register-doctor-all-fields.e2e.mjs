import { chromium } from "playwright";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const checks = [];
const check = (name, pass, note = "") => checks.push({ name, pass, note });

const json = (body, status = 200) => ({
  status,
  contentType: "application/json",
  body: JSON.stringify(body),
});

const authResponse = {
  access: "doctor-access",
  refresh: "doctor-refresh",
  user: {
    id: 101,
    role: "doctor",
    // Специально не полагаемся на это ФИО: проверяем, что профиль использует
    // значение, введённое в анкете, а не потенциально неверную разбивку API.
    first_name: "API",
    last_name: "User",
    full_name: "API User",
    email: "doctor-all-fields@example.com",
    phone: "+996700123456",
    date_joined: "2026-01-01T00:00:00Z",
    avatar: null,
  },
};

const profileResponse = {
  first_name: "Имя",
  last_name: "Фамилия Отчество",
  phone: "+996700123456",
  gender: "female",
  birth_date: "1990-01-02",
  city: "Бишкек",
  languages: ["Русский", "Кыргызский"],
  photo: null,
  primary_specializations: [{ id: 1, name: "Терапевт", photo: null }],
  narrow_specializations: [{ id: 2, name: "Кардиолог", photo: null }],
  experience_years: 12,
  education: [],
  work_experience: [],
  license_number: "LIC-123",
  is_published: false,
};

const main = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1800 },
  });
  const page = await context.newPage();
  const calls = { register: null, profile: [], documents: [] };

  // Catch-all ставим первым: Playwright применяет последний зарегистрированный
  // обработчик первым.
  await page.route("**/api/**", (route) =>
    route.fulfill(
      json({
        data: [],
        pagination: { page: 1, page_size: 20, total: 0, total_pages: 1 },
      }),
    ),
  );
  await page.route("**/api/references/cities/**", (route) =>
    route.fulfill(json({ data: ["Бишкек", "Ош"] })),
  );
  await page.route("**/api/references/languages/**", (route) =>
    route.fulfill(json({ data: ["Русский", "Кыргызский"] })),
  );
  await page.route("**/api/references/specializations/**", (route) =>
    route.fulfill(
      json({
        data: [
          { id: 1, name: "Терапевт", photo: null },
          { id: 2, name: "Кардиолог", photo: null },
        ],
      }),
    ),
  );
  await page.route("**/api/auth/verify/email/request/**", (route) =>
    route.fulfill(json({ detail: "Код отправлен" })),
  );
  await page.route("**/api/auth/verify/email/confirm/**", (route) =>
    route.fulfill(json({ detail: "Подтверждено" })),
  );
  await page.route("**/api/auth/register/doctor/**", async (route) => {
    calls.register = route.request().postDataJSON();
    await route.fulfill(json(authResponse, 201));
  });
  await page.route("**/api/doctor/profile/**", async (route) => {
    if (route.request().method() === "PUT") {
      const contentType = route.request().headers()["content-type"] ?? "";
      calls.profile.push({
        contentType,
        body: contentType.includes("application/json")
          ? route.request().postDataJSON()
          : null,
        raw: route.request().postData() ?? "",
      });
    }
    await route.fulfill(json(profileResponse));
  });
  await page.route("**/api/doctor/documents/**", async (route) => {
    if (route.request().method() === "POST") {
      calls.documents.push({
        contentType: route.request().headers()["content-type"] ?? "",
        raw: route.request().postData() ?? "",
      });
    }
    await route.fulfill(
      json({ id: calls.documents.length, url: "/media/cert.pdf" }, 201),
    );
  });

  await page.goto(`${BASE}/register`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
  const confirmCity = page.getByRole("button", { name: "Верно" });
  if (await confirmCity.count()) await confirmCity.first().click();

  const visible = (selector) => page.locator(selector).locator("visible=true");
  const continueButton = () => visible('button:has-text("Продолжить")').first();

  await page.locator('input[type="radio"][value="doctor"]').first().check({
    force: true,
  });
  await continueButton().click({ force: true });

  // Этап 1: все поля, включая фото.
  await visible('input[placeholder="Введите ваше полное имя"]')
    .first()
    .fill("Имя Фамилия Отчество");
  await page.locator('input[type="radio"][value="female"]').first().check({
    force: true,
  });
  await visible('input[placeholder="ДД.ММ.ГГГГ"]').first().fill("02.01.1990");
  const dropdowns = () => page.locator("div.cursor-pointer");
  await dropdowns().filter({ hasText: "Выберите из списка" }).first().click();
  await page.getByText("Бишкек", { exact: true }).last().click();
  await dropdowns().filter({ hasText: "Выберите из списка" }).first().click();
  await page.getByText("Русский", { exact: true }).last().click();
  await page.getByText("Кыргызский", { exact: true }).last().click();
  await visible('input[placeholder="•••••••••"]').first().fill("700123456");
  await visible('input[placeholder="Введите вашу почту"]')
    .first()
    .fill("doctor-all-fields@example.com");
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: "doctor.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake-image"),
    });
  await continueButton().click({ force: true });

  // Этап 2: все профессиональные поля.
  await dropdowns().filter({ hasText: "Выберите из списка" }).first().click();
  await page.getByText("Терапевт", { exact: true }).last().click();
  await dropdowns().filter({ hasText: "Выберите из списка" }).first().click();
  await page.getByText("Кардиолог", { exact: true }).last().click();
  await visible('input[placeholder="0"]').first().fill("12");
  await visible('input[placeholder="Введите должность"]')
    .first()
    .fill("Заведующий отделением");
  await visible('input[placeholder="Введите название клиники"]')
    .first()
    .fill("Клиника Солнечная");
  await visible('input[placeholder="Введите категорию/квалификацию"]')
    .first()
    .fill("Высшая");
  await visible('input[placeholder="Введите научную степень"]')
    .first()
    .fill("Кандидат медицинских наук");
  await continueButton().click({ force: true });

  // Этап 3: все поля образования.
  await visible('input[placeholder="Введите название"]').first().fill("КГМА");
  await visible('input[placeholder="ГГГГ"]').first().fill("2010");
  await visible('input[placeholder="Введите интернатуру"]')
    .first()
    .fill("Терапия");
  await visible('input[placeholder="Введите ординатуру"]')
    .first()
    .fill("Кардиология");
  await visible('input[placeholder="Введите специализацию по диплому"]')
    .first()
    .fill("Лечебное дело");
  await visible(
    'textarea[placeholder="Курсы повышения квалификации, сертификаты..."]',
  )
    .first()
    .fill("УЗИ сердца, 2024");
  await continueButton().click({ force: true });

  // Этап 4: документ, лицензия и пароль.
  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: "certificate.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("fake-pdf"),
    });
  await visible('input[placeholder="Введите номер лицензии"]')
    .first()
    .fill("LIC-123");
  await visible('input[placeholder="Придумайте пароль"]')
    .first()
    .fill("Passw0rd!");
  await visible('input[placeholder="Повторите пароль"]')
    .first()
    .fill("Passw0rd!");
  await visible('button:has-text("Завершить регистрацию")')
    .first()
    .click({ force: true });
  await page.waitForTimeout(800);
  await visible('input[name="one-time-code"]').first().fill("1234");
  await visible('button:has-text("Подтвердить код")').first().click();
  await page.waitForTimeout(2200);

  const step1 = JSON.parse(calls.register?.step1 ?? "null");
  const step2 = JSON.parse(calls.register?.step2 ?? "null");
  const step4 = JSON.parse(calls.register?.step4 ?? "null");
  const step5 = JSON.parse(calls.register?.step5 ?? "null");
  const profile = calls.profile.find((call) => call.body);
  const photoUpload = calls.profile.find((call) =>
    call.contentType.includes("multipart/form-data"),
  );
  const education = profile?.body?.education ?? [];

  check("регистрация врача отправлена", !!calls.register);
  check("этап 1: ФИО", step1?.full_name === "Имя Фамилия Отчество");
  check("этап 1: пол", step1?.gender === "female");
  check("этап 1: дата рождения", step1?.birth_date === "1990-01-02");
  check("этап 1: город", step1?.city === "Бишкек");
  check(
    "этап 1: языки",
    step1?.languages?.join(",") === "Русский,Кыргызский",
    JSON.stringify(step1?.languages),
  );
  check("этап 1: телефон", step1?.phone === "+996700123456");
  check("этап 1: почта", step1?.email === "doctor-all-fields@example.com");
  check("этап 1: фото вынесено в отдельную загрузку", !step1?.photo);
  check(
    "этап 2: город/телефон/почта",
    step2?.city === "Бишкек" &&
      step2?.phone === "+996700123456" &&
      step2?.email === "doctor-all-fields@example.com",
  );
  check(
    "этап 2: специализации",
    step5?.primary_specialization_ids?.[0] === 1 &&
      step5?.narrow_specialization_ids?.[0] === 2,
  );
  check(
    "пароль отправлен только в регистрацию",
    calls.register?.password === "Passw0rd!",
  );
  check("этап 4: лицензия в регистрации", step4?.license_number === "LIC-123");
  check("этап 4: файлы вынесены из регистрации", !step4?.documents);
  check(
    "этап 2: должность",
    profile?.body?.additional_services === "Заведующий отделением",
  );
  check("этап 2: стаж", profile?.body?.experience_years === 12);
  check(
    "этап 2: место/категория/степень",
    profile?.body?.work_experience?.[0]?.clinic === "Клиника Солнечная" &&
      profile?.body?.work_experience?.[0]?.qualification === "Высшая" &&
      profile?.body?.work_experience?.[0]?.scientific_degree ===
        "Кандидат медицинских наук",
  );
  check(
    "этап 3: образование",
    education.some(
      (entry) =>
        entry.institution === "КГМА" &&
        entry.year === 2010 &&
        entry.degree === "Лечебное дело",
    ),
  );
  check(
    "этап 3: интернатура",
    education.some(
      (entry) =>
        entry.institution === "Терапия" && entry.degree === "Интернатура",
    ),
  );
  check(
    "этап 3: ординатура",
    education.some(
      (entry) =>
        entry.institution === "Кардиология" && entry.degree === "Ординатура",
    ),
  );
  check(
    "этап 3: дополнительное образование",
    education.some((entry) => entry.institution === "УЗИ сердца, 2024"),
  );
  check(
    "профиль: ФИО",
    profile?.body?.first_name === "Имя" &&
      profile?.body?.last_name === "Фамилия Отчество",
  );
  check(
    "профиль: базовые данные",
    profile?.body?.gender === "female" &&
      profile?.body?.birth_date === "1990-01-02" &&
      profile?.body?.city === "Бишкек" &&
      profile?.body?.phone === "+996700123456",
  );
  check(
    "профиль: языки",
    profile?.body?.languages?.join(",") === "Русский,Кыргызский",
  );
  check("этап 4: лицензия", profile?.body?.license_number === "LIC-123");
  check(
    "этап 4: фото загружено отдельно",
    !!photoUpload && photoUpload.raw.includes("doctor.jpg"),
  );
  check(
    "этап 4: сертификат загружен отдельно",
    calls.documents.length === 1 &&
      calls.documents[0].raw.includes("certificate.pdf"),
  );

  await context.close();
  await browser.close();
};

try {
  await main();
} catch (error) {
  checks.push({
    name: "сквозной прогон без исключений",
    pass: false,
    note: String(error),
  });
}

for (const result of checks) {
  console.log(
    `${result.pass ? "PASS" : "FAIL"}  ${result.name}${result.note ? `  — ${result.note}` : ""}`,
  );
}
const failed = checks.filter((result) => !result.pass);
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
process.exit(failed.length ? 1 : 0);
