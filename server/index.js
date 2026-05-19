const express = require("express");
const expressWs = require("express-ws");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require("fs");
const path = require("path");

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ── Data ─────────────────────────────────────────────────────────────────────

const load = (file) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, "data", file), "utf-8"));

const doctors = load("doctors.json");
const clinics = load("clinics.json");
const services = load("services.json");
const reviews = load("reviews.json");
const appointments = []; // in-memory

// ── WebSocket chat state ──────────────────────────────────────────────────────

/** @type {Map<string, Array<{id:number, content:string, timestamp:string}>>} */
const chatMessages = new Map();

/** @type {Map<string, Set<import('ws')>>} */
const chatRooms = new Map();

// ── Swagger ───────────────────────────────────────────────────────────────────

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "IMBIR API",
      version: "1.0.0",
      description:
        "Локальный бэкенд для разработки IMBIR. Полностью повторяет контракт продакшн API.",
    },
    servers: [{ url: `http://localhost:${PORT}`, description: "Local dev" }],
  },
  apis: [__filename],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── REST: Doctors ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/doctors:
 *   get:
 *     summary: Список всех врачей
 *     tags: [Doctors]
 *     responses:
 *       200:
 *         description: Массив врачей
 */
app.get("/api/doctors", (_req, res) => res.json(doctors));

/**
 * @openapi
 * /api/doctors/{id}:
 *   get:
 *     summary: Врач по ID
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Объект врача
 *       404:
 *         description: Не найден
 */
app.get("/api/doctors/:id", (req, res) => {
  const doctor = doctors.find((d) => String(d.id) === req.params.id);
  if (!doctor) return res.status(404).json({ message: "Врач не найден" });
  res.json(doctor);
});

// ── REST: Clinics ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/clinics:
 *   get:
 *     summary: Список всех клиник
 *     tags: [Clinics]
 *     responses:
 *       200:
 *         description: Массив клиник
 */
app.get("/api/clinics", (_req, res) => res.json(clinics));

/**
 * @openapi
 * /api/clinics/{id}:
 *   get:
 *     summary: Клиника по ID
 *     tags: [Clinics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Объект клиники
 *       404:
 *         description: Не найдена
 */
app.get("/api/clinics/:id", (req, res) => {
  const clinic = clinics.find((c) => String(c.id) === req.params.id);
  if (!clinic) return res.status(404).json({ message: "Клиника не найдена" });
  res.json(clinic);
});

// ── REST: Services ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/services:
 *   get:
 *     summary: Список всех услуг
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Массив услуг
 */
app.get("/api/services", (_req, res) => res.json(services));

/**
 * @openapi
 * /api/services/{id}:
 *   get:
 *     summary: Услуга по ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Объект услуги
 *       404:
 *         description: Не найдена
 */
app.get("/api/services/:id", (req, res) => {
  const service = services.find((s) => String(s.id) === req.params.id);
  if (!service) return res.status(404).json({ message: "Услуга не найдена" });
  res.json(service);
});

// ── REST: Reviews ─────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/reviews:
 *   get:
 *     summary: Отзывы (с фильтрацией)
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         schema: { type: string }
 *         description: Фильтр по врачу
 *       - in: query
 *         name: clinicId
 *         schema: { type: string }
 *         description: Фильтр по клинике
 *     responses:
 *       200:
 *         description: Массив отзывов
 */
app.get("/api/reviews", (req, res) => {
  const { doctorId, clinicId } = req.query;
  let result = reviews;
  if (doctorId) result = result.filter((r) => String(r.doctorId) === doctorId);
  if (clinicId) result = result.filter((r) => String(r.clinicId) === clinicId);
  res.json(result);
});

// ── REST: Appointments ────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/appointments:
 *   post:
 *     summary: Создать запись на приём
 *     tags: [Appointments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, date, time]
 *             properties:
 *               doctorId:  { type: string, example: "1" }
 *               clinicId:  { type: string, example: "1" }
 *               serviceId: { type: string, example: "1" }
 *               date:      { type: string, example: "2026-06-01" }
 *               time:      { type: string, example: "10:00" }
 *               patientName: { type: string, example: "Айгуль" }
 *               phone:     { type: string, example: "+996 700 123 456" }
 *     responses:
 *       201:
 *         description: Запись создана
 */
app.post("/api/appointments", (req, res) => {
  const body = req.body;
  if (!body.doctorId || !body.date || !body.time) {
    return res
      .status(400)
      .json({ message: "Обязательные поля: doctorId, date, time" });
  }
  const appointment = {
    id: String(appointments.length + 1),
    ...body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  appointments.push(appointment);
  res.status(201).json(appointment);
});

/**
 * @openapi
 * /api/appointments:
 *   get:
 *     summary: Все записи (для отладки)
 *     tags: [Appointments]
 *     responses:
 *       200:
 *         description: Массив записей
 */
app.get("/api/appointments", (_req, res) => res.json(appointments));

// ── REST: Chat history ────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/messages/{roomName}:
 *   get:
 *     summary: История сообщений комнаты
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: roomName
 *         required: true
 *         schema: { type: string }
 *         example: general
 *     responses:
 *       200:
 *         description: Массив сообщений от старых к новым
 */
app.get("/api/messages/:roomName", (req, res) => {
  const msgs = chatMessages.get(req.params.roomName) ?? [];
  res.json(msgs);
});

// ── WebSocket: Chat ───────────────────────────────────────────────────────────

app.ws("/ws/chat/:roomName", (ws, req) => {
  const { roomName } = req.params;

  // Register client in the room
  if (!chatRooms.has(roomName)) chatRooms.set(roomName, new Set());
  chatRooms.get(roomName).add(ws);

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (!data.message) return;

    const msg = {
      id: Date.now(),
      content: data.message,
      timestamp: new Date().toISOString(),
    };

    // Persist to in-memory history
    if (!chatMessages.has(roomName)) chatMessages.set(roomName, []);
    chatMessages.get(roomName).push(msg);

    // Broadcast to everyone in the room (including sender — same as Django Channels)
    const payload = JSON.stringify({
      message: msg.content,
      timestamp: msg.timestamp,
    });

    chatRooms.get(roomName).forEach((client) => {
      if (client.readyState === 1 /* OPEN */) {
        client.send(payload);
      }
    });
  });

  ws.on("close", () => {
    chatRooms.get(roomName)?.delete(ws);
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`\n🚀  IMBIR local server running`);
  console.log(`   REST API  →  http://localhost:${PORT}/api`);
  console.log(`   Swagger   →  http://localhost:${PORT}/api-docs`);
  console.log(`   WebSocket →  ws://localhost:${PORT}/ws/chat/<room>\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n❌  Порт ${PORT} уже занят.`);
    console.error(`   Останови процесс на этом порту и попробуй снова.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
