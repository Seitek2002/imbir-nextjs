/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS-файл для встроенного `node --test`, без сборки */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    compile(read(file)),
    {
      exports,
      File,
      FormData,
      ...globals,
      require: (name) => {
        assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
        return dependencies[name];
      },
    },
    { filename: file },
  );
  return exports;
}

// Достаёт из страницы настоящую функцию (по имени объявления) и исполняет её в
// контексте с подставленными зависимостями — без пересказа логики в тесте.
function extractPageFunction(name, context) {
  const source = read("src/pages/register/ui.tsx");
  const ast = ts.createSourceFile(
    "ui.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let declaration;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === name)
      declaration = node;
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(declaration, `${name} not found in the page`);
  vm.runInNewContext(
    compile(
      `const ${declaration.getText(ast)}; globalThis.extracted = ${name};`,
    ),
    context,
  );
  return context.extracted;
}

// Execute the actual page handler, not a reimplementation of the workflow.
function pageHandler(api = {}) {
  const events = [];
  const delays = [];
  const loginAttempts = [];
  const rejectedLogin = Object.assign(new Error("invalid credentials"), {
    response: {
      status: 400,
      data: { detail: "Неверный email, телефон или пароль" },
    },
  });
  // Настоящий модуль восстановления регистрации: подставлены только сетевые
  // вызовы и таймер (без реального ожидания), остальное исполняется как есть.
  const { registerDoctorWithRecovery } = load(
    "src/pages/register/model/recover-registration.ts",
    {
      "@/shared/api": {
        registerDoctorFn: async (body) => {
          events.push(["register", body]);
          if (api.registrationError) throw api.registrationError;
          return {
            access: "synthetic",
            refresh: "synthetic",
            user: { first_name: "QA", last_name: "Doctor", role: "doctor" },
          };
        },
        loginFn: async (credentials) => {
          loginAttempts.push(JSON.parse(JSON.stringify(credentials)));
          events.push(["login"]);
          if (!api.login) throw rejectedLogin;
          return api.login(credentials);
        },
      },
    },
    {
      setTimeout: (callback, ms) => {
        delays.push(ms);
        callback();
      },
    },
  );
  const context = {
    events,
    inviteClinic: undefined,
    specializationList: [],
    registerDoctorWithRecovery,
    updateDoctorProfile: api.profile ?? (async () => {}),
    uploadDoctorDocument: api.document ?? (async () => {}),
    uploadDoctorPhoto: (...args) => {
      events.push(["photo", ...args]);
      return new Promise(() => {});
    },
    setIsLoadingDoctor: (value) => events.push(["loading", value]),
    setRememberMe: () => {},
    setTokens: () => {},
    setUser: () => {},
    resolveSpecializationIds: () => ({ ids: [7], unmatched: [] }),
    splitFullName: () => ({ firstName: "QA", lastName: "Doctor" }),
    toApiDate: () => "1990-01-01",
    toApiEducation: () => [],
    toast: {
      error: (message) => events.push(["error", message]),
      success: () => {},
      loading: (message) => {
        events.push(["uploading", message]);
        return "uploading";
      },
      dismiss: (id) => events.push(["upload-complete", id]),
    },
    router: { push: (url) => events.push(["redirect", url]) },
    getRoleRedirect: () => "/doctor-profile",
    queryClient: { invalidateQueries: () => Promise.resolve() },
    doctorCabinetKeys: { profile: () => ["profile"] },
    ...load("src/shared/lib/errors.ts"),
  };
  const submit = extractPageFunction("handleSubmitDoctor", context);
  return { submit, events, delays, loginAttempts };
}

// uploadDoctorPhoto страницы с настоящим scheduleProcessedPhotoRefresh из API;
// таймер подменён: задержки записываются, колбэк выполняется сразу.
function photoUploader(api = {}) {
  const events = [];
  const delays = [];
  const { scheduleProcessedPhotoRefresh } = load(
    "src/shared/api/doctor-cabinet/requests.ts",
    { "../client": { FILE_UPLOAD_TIMEOUT_MS: 120000, apiClient: {} } },
    {
      setTimeout: (callback, ms) => {
        delays.push(ms);
        callback();
      },
    },
  );
  const toast = Object.assign((message) => events.push(["toast", message]), {
    error: (message) => events.push(["error", message]),
  });
  const upload = extractPageFunction("uploadDoctorPhoto", {
    toast,
    scheduleProcessedPhotoRefresh,
    updateDoctorProfile: async (...args) => {
      events.push(["upload", ...args]);
      if (api.uploadError) throw api.uploadError;
      return api.updated ?? {};
    },
    getDoctorProfile: async () => api.profileAfterError ?? { photo: null },
    queryClient: {
      invalidateQueries: () => {
        events.push(["refresh"]);
        return Promise.resolve();
      },
    },
    doctorCabinetKeys: { profile: () => ["profile"] },
  });
  const run = (processPhoto = true) =>
    upload(new File(["synthetic"], "photo.png"), processPhoto, {
      first_name: "QA",
      last_name: "Doctor",
      narrow_specialization_ids: [],
      primary_specialization_ids: [7],
    });
  return { run, events, delays };
}

const registeredDoctor = {
  access: "recovered",
  refresh: "recovered",
  user: { first_name: "QA", last_name: "Doctor", role: "doctor" },
};

const form = () => ({
  fullName: "QA Doctor",
  phone: "700000001",
  phoneDialCode: "+996",
  email: "qa@example.invalid",
  gender: "male",
  birthDate: "01.01.1990",
  city: "Бишкек",
  country: "Кыргызстан",
  languages: [],
  specialization: ["Флеболог"],
  additionalSpecialization: [],
  certificates: [],
  password: "Synthetic123!",
  experience: "2",
  about: "  Принимаю взрослых.\nВторой абзац.  ",
  photo: null,
});

test("JSON registration excludes files and preserves API specialization fields", async () => {
  let request;
  const { registerDoctorFn } = load("src/shared/api/auth/requests.ts", {
    "../client": {
      FILE_UPLOAD_TIMEOUT_MS: 120000,
      apiClient: {
        post: async (...args) => {
          request = args;
          return { data: {} };
        },
      },
    },
  });
  await registerDoctorFn({
    password: "Synthetic123!",
    step1: {},
    step2: {},
    step3: {},
    step4: { documents: [new File(["test"], "certificate.pdf")] },
    step5: { primary_specializations: [7], narrow_specializations: [] },
    step6: {},
    step7: {},
  });
  assert.equal(request[0], "/api/auth/register/doctor/");
  assert.equal(request[1] instanceof FormData, false);
  assert.equal(request[1].photo, undefined);
  assert.equal(JSON.parse(request[1].step4).documents, undefined);
  assert.deepEqual(JSON.parse(request[1].step5).primary_specializations, [7]);
});

test("photo and certificate requests use the longer upload timeout", async () => {
  const requests = [];
  const { updateDoctorProfile, uploadDoctorDocument } = load(
    "src/shared/api/doctor-cabinet/requests.ts",
    {
      "../client": {
        FILE_UPLOAD_TIMEOUT_MS: 120000,
        apiClient: {
          request: async (config) => {
            requests.push(config);
            return { data: {} };
          },
          post: async (url, data, config) => {
            requests.push({ url, data, ...config });
            return { data: {} };
          },
        },
      },
    },
  );
  await updateDoctorProfile(
    {
      first_name: "QA",
      last_name: "Doctor",
      primary_specialization_ids: [7, 8],
      photo: new File(["synthetic"], "photo.png"),
    },
    { processPhoto: true },
  );
  await uploadDoctorDocument(new File(["synthetic"], "certificate.pdf"));
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.timeout, 120000);
    assert.ok(request.data instanceof FormData);
  }
  assert.deepEqual(requests[0].data.getAll("primary_specialization_ids"), [
    "7",
    "8",
  ]);
  assert.equal(requests[0].params.process_photo, true);
});

test("registration with a photo completes while its upload is still pending", async () => {
  const { submit, events } = pageHandler();
  await submit({
    ...form(),
    photo: new File(["synthetic"], "photo.png"),
    processPhoto: true,
  });
  const payload = events.find(([name]) => name === "register")[1];
  assert.equal(payload.photo, undefined);
  assert.equal(payload.process_photo, undefined);
  assert.equal(events.filter(([name]) => name === "register").length, 1);
  assert.equal(events.find(([name]) => name === "photo")[2], true);
  assert.ok(events.some(([name]) => name === "redirect"));
});

test("slow certificates cannot hold an already created account on registration", async () => {
  let finish;
  const pending = new Promise((resolve) => {
    finish = resolve;
  });
  const { submit, events } = pageHandler({ document: () => pending });
  const submission = submit({
    ...form(),
    certificates: [new File(["test"], "certificate.pdf")],
  });
  // Flush async registration/profile continuations without waiting for the file.
  for (let i = 0; i < 10; i++) await Promise.resolve();
  try {
    assert.ok(
      events.some(([name]) => name === "redirect"),
      "Cabinet must open before certificate upload finishes",
    );
    assert.ok(events.some(([name]) => name === "uploading"));
    assert.equal(
      events.some(([name]) => name === "upload-complete"),
      false,
    );
  } finally {
    finish();
    await submission;
    for (let i = 0; i < 10; i++) await Promise.resolve();
  }
  assert.ok(events.some(([name]) => name === "upload-complete"));
});

test("failed profile update does not prevent certificate uploads or cabinet access", async () => {
  let uploads = 0;
  const { submit, events } = pageHandler({
    profile: async () => {
      throw new Error("offline");
    },
    document: async () => {
      uploads++;
      throw new Error("offline");
    },
  });
  await submit({
    ...form(),
    certificates: [new File(["test"], "certificate.pdf")],
  });
  for (let i = 0; i < 10; i++) await Promise.resolve();
  assert.equal(uploads, 1);
  assert.ok(events.some(([name]) => name === "redirect"));
  assert.ok(
    events.some(
      ([name, text]) => name === "error" && text.includes("сертификаты"),
    ),
  );
  assert.ok(
    events
      .filter(([name]) => name === "error")
      .every(([, text]) => text.startsWith("Аккаунт создан")),
  );
});

test("registration network failure does not automatically retry account creation", async () => {
  const { submit, events, loginAttempts, delays } = pageHandler({
    registrationError: { code: "ECONNABORTED" },
  });
  await submit(form());
  assert.equal(events.filter(([name]) => name === "register").length, 1);
  assert.equal(
    events.some(([name]) => name === "redirect"),
    false,
  );
  assert.ok(events.find(([name]) => name === "error")[1].includes("войти"));
  assert.equal(events.at(-1)[1], false);
  // Аккаунта нет: две пробы входа (сразу и через 4 с) и исходная ошибка.
  assert.equal(loginAttempts.length, 2);
  assert.deepEqual([...delays], [4000]);
});

const lostReplies = [
  ["client timeout", { code: "ECONNABORTED" }],
  ["dropped connection", { code: "ERR_NETWORK" }],
  ["gateway timeout", { response: { status: 504, data: "<html>" } }],
  ["server error", { response: { status: 500, data: "<html>" } }],
];

for (const [name, registrationError] of lostReplies) {
  test(`lost registration reply (${name}) with an existing account signs in instead of failing`, async () => {
    const { submit, events, loginAttempts } = pageHandler({
      registrationError,
      login: async () => registeredDoctor,
    });
    await submit(form());
    // Анкета отправлена один раз; дальше только вход теми же данными.
    assert.equal(events.filter(([n]) => n === "register").length, 1);
    assert.deepEqual(loginAttempts, [
      { email: "qa@example.invalid", password: "Synthetic123!" },
    ]);
    assert.ok(events.some(([n]) => n === "redirect"));
    assert.equal(
      events.some(([n]) => n === "error"),
      false,
    );
  });
}

test("recovered registration still saves profile fields and starts the photo upload", async () => {
  let profileSaved = 0;
  let profileBody;
  const { submit, events } = pageHandler({
    registrationError: { code: "ECONNABORTED" },
    login: async () => registeredDoctor,
    profile: async (body) => {
      profileSaved++;
      profileBody = body;
    },
  });
  await submit({ ...form(), photo: new File(["synthetic"], "photo.png") });
  assert.equal(profileSaved, 1);
  // «О себе» из анкеты уходит в профиль, без лишних пробелов по краям.
  assert.equal(profileBody.about, "Принимаю взрослых.\nВторой абзац.");
  assert.ok(events.some(([n]) => n === "photo"));
  assert.ok(events.some(([n]) => n === "redirect"));
});

test("a 400 after a lost first reply (email already taken) signs in without waiting", async () => {
  const { submit, events, delays, loginAttempts } = pageHandler({
    registrationError: {
      response: {
        status: 400,
        data: {
          step1: { email: ["Пользователь с таким email уже существует"] },
        },
      },
    },
    login: async () => registeredDoctor,
  });
  await submit(form());
  assert.equal(loginAttempts.length, 1);
  assert.deepEqual([...delays], []);
  assert.ok(events.some(([n]) => n === "redirect"));
  assert.equal(
    events.some(([n]) => n === "error"),
    false,
  );
});

test("a genuine validation error keeps the server message after a single sign-in probe", async () => {
  const { submit, events, delays, loginAttempts } = pageHandler({
    registrationError: {
      response: {
        status: 400,
        data: { step1: { phone: ["Номер уже зарегистрирован"] } },
      },
    },
  });
  await submit(form());
  assert.equal(loginAttempts.length, 1);
  assert.deepEqual([...delays], []);
  assert.equal(
    events.some(([n]) => n === "redirect"),
    false,
  );
  assert.equal(
    events.find(([n]) => n === "error")[1],
    "Номер уже зарегистрирован",
  );
});

for (const status of [401, 403, 413, 422, 429]) {
  test(`definite refusal ${status} never triggers a sign-in attempt`, async () => {
    const { submit, events, loginAttempts } = pageHandler({
      registrationError: { response: { status, data: { detail: "no" } } },
      login: async () => registeredDoctor,
    });
    await submit(form());
    assert.equal(loginAttempts.length, 0);
    assert.equal(
      events.some(([n]) => n === "redirect"),
      false,
    );
    assert.ok(events.some(([n]) => n === "error"));
  });
}

test("signing in to an account of another type is not treated as our registration", async () => {
  const { submit, events, loginAttempts } = pageHandler({
    registrationError: { code: "ECONNABORTED" },
    login: async () => ({
      ...registeredDoctor,
      user: { ...registeredDoctor.user, role: "client" },
    }),
  });
  await submit(form());
  assert.equal(loginAttempts.length, 1);
  assert.equal(
    events.some(([n]) => n === "redirect"),
    false,
  );
  assert.ok(events.some(([n]) => n === "error"));
});

test("no sign-in is attempted without credentials", async () => {
  const { submit, loginAttempts } = pageHandler({
    registrationError: { code: "ECONNABORTED" },
    login: async () => registeredDoctor,
  });
  await submit({ ...form(), password: "" });
  assert.equal(loginAttempts.length, 0);
});

test("only an unknown outcome or 400 is ambiguous", () => {
  const { isAmbiguousRegistrationFailure } = load(
    "src/pages/register/model/recover-registration.ts",
    { "@/shared/api": {} },
  );
  for (const error of [
    null,
    {},
    { code: "ECONNABORTED" },
    { response: { status: 400 } },
    { response: { status: 500 } },
    { response: { status: 502 } },
    { response: { status: 504 } },
  ])
    assert.equal(isAmbiguousRegistrationFailure(error), true);
  for (const status of [401, 403, 404, 413, 422, 429])
    assert.equal(
      isAmbiguousRegistrationFailure({ response: { status } }),
      false,
    );
});

test("patient avatar upload uses the longer file timeout, JSON updates keep the default", async () => {
  const calls = [];
  const { updateProfile } = load("src/shared/api/profile/requests.ts", {
    "../client": {
      FILE_UPLOAD_TIMEOUT_MS: 120000,
      apiClient: {
        put: async (url, data, config) => {
          calls.push({ url, data, config });
          return { data: {} };
        },
      },
    },
  });
  await updateProfile({
    first_name: "QA",
    avatar_upload: new File(["synthetic"], "me.png"),
  });
  await updateProfile({ first_name: "QA" });
  assert.equal(calls[0].url, "/api/profile/");
  assert.ok(calls[0].data instanceof FormData);
  assert.equal(calls[0].config.timeout, 120000);
  assert.equal(calls[1].config, undefined);
});

test("registration errors distinguish validation from an unknown network outcome", () => {
  const { getRegistrationErrorMessage } = load("src/shared/lib/errors.ts");
  assert.match(
    getRegistrationErrorMessage({ code: "ECONNABORTED" }),
    /время ожидания/i,
  );
  assert.match(
    getRegistrationErrorMessage({ code: "ERR_NETWORK" }),
    /соединение/i,
  );
  assert.match(
    getRegistrationErrorMessage({ response: { status: 400, data: "" } }),
    /связь/i,
  );
  assert.equal(
    getRegistrationErrorMessage({
      response: {
        status: 400,
        data: { step1: { email: ["Email уже занят"] } },
      },
    }),
    "Email уже занят",
  );
  assert.match(
    getRegistrationErrorMessage({
      response: { status: 504, data: "<html>upstream timeout</html>" },
    }),
    /войти/i,
  );
});

test("background AI photo processing: the profile is re-read at 60 and 120 seconds", () => {
  const delays = [];
  let refreshed = 0;
  const { AI_PHOTO_REFRESH_DELAYS_MS, scheduleProcessedPhotoRefresh } = load(
    "src/shared/api/doctor-cabinet/requests.ts",
    { "../client": { FILE_UPLOAD_TIMEOUT_MS: 120000, apiClient: {} } },
    {
      setTimeout: (callback, ms) => {
        delays.push(ms);
        callback();
      },
    },
  );
  scheduleProcessedPhotoRefresh(() => refreshed++);
  assert.deepEqual([...AI_PHOTO_REFRESH_DELAYS_MS], [60000, 120000]);
  assert.deepEqual([...delays], [60000, 120000]);
  assert.equal(refreshed, 2);
});

test("queued AI photo after registration tells the doctor and refreshes the profile later", async () => {
  const { run, events, delays } = photoUploader({
    updated: { photo_ai_processing: "queued" },
  });
  await run();
  assert.match(events.find(([n]) => n === "toast")[1], /обрабатывается/);
  // сразу и ещё два раза, когда обработка обычно заканчивается
  assert.equal(events.filter(([n]) => n === "refresh").length, 3);
  assert.deepEqual([...delays], [60000, 120000]);
  assert.equal(
    events.some(([n]) => n === "error"),
    false,
  );
  const [, , options] = events.find(([n]) => n === "upload");
  assert.deepEqual(JSON.parse(JSON.stringify(options)), { processPhoto: true });
});

test("photo without AI is refreshed once and shows nothing", async () => {
  const { run, events, delays } = photoUploader({ updated: {} });
  await run(false);
  assert.equal(events.filter(([n]) => n === "refresh").length, 1);
  assert.deepEqual([...delays], []);
  assert.equal(
    events.some(([n]) => n === "toast" || n === "error"),
    false,
  );
});

test("disabled AI keeps the original and says so, without delayed refreshes", async () => {
  const { run, events, delays } = photoUploader({
    updated: { photo_ai_processing: "disabled" },
  });
  await run();
  assert.match(events.find(([n]) => n === "error")[1], /недоступна/);
  assert.deepEqual([...delays], []);
});

test("lost reply after the photo arrived: processing is assumed and the profile re-read later", async () => {
  const { run, events, delays } = photoUploader({
    uploadError: { code: "ERR_NETWORK" },
    profileAfterError: { photo: "https://api.test/media/doctors/photos/p.png" },
  });
  await run();
  assert.match(events.find(([n]) => n === "toast")[1], /обрабатывается/);
  assert.deepEqual([...delays], [60000, 120000]);
  assert.equal(
    events.some(([n]) => n === "error"),
    false,
  );
});

test("photo that never arrived is reported and nothing is scheduled", async () => {
  const { run, events, delays } = photoUploader({
    uploadError: { code: "ERR_NETWORK" },
    profileAfterError: { photo: null },
  });
  await run();
  assert.match(events.find(([n]) => n === "error")[1], /фото не загрузилось/);
  assert.deepEqual([...delays], []);
});
