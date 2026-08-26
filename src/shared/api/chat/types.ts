// ── User-to-user chat ───────────────────────────────────────────────────────

export type ChatParticipant = {
  full_name: string;
  id: number;
};

export type ChatRoomLastMessage = {
  content: string;
  created_at: string;
};

export type ChatRoom = {
  created_at: string;
  id: number;
  last_message: ChatRoomLastMessage | null;
  participants: ChatParticipant[];
  // Кол-во непрочитанных сообщений в комнате. Заполняется бэком; пока поля нет —
  // счётчик в хедере остаётся 0. См. бейдж в HeaderChatButton.
  unread_count?: number;
};

export type ChatMessage = {
  // Backend пока не отдаёт поле, поэтому для старого контракта оно опционально.
  // Когда появится, frontend перестанет сопоставлять запись по дате/времени.
  appointment_id?: null | number;
  content: string;
  created_at: string;
  id: number;
  is_read: boolean;
  // null — системное уведомление (напр. о созданной онлайн-записи).
  sender: ChatParticipant | null;
};

export type CreateChatRoomRequest = {
  user_id: number;
};

// GET /api/chat/rooms/unread-count/ — общее число непрочитанных входящих
// сообщений по всем комнатам. Отдельный лёгкий эндпоинт для бейджа в хедере.
export type ChatUnreadCountResponse = {
  unread_count: number;
};

// WebSocket payloads. The client sends only the text; the server broadcasts a
// full message object to every participant (including the sender — see echo
// handling in the chat-room hook).
export type OutgoingChatMessage = {
  content: string;
};

export type IncomingChatMessage = {
  appointment_id?: null | number;
  content: string;
  created_at: string;
  id: number;
  // null — системное уведомление (напр. о созданной онлайн-записи).
  sender: ChatParticipant | null;
  // Обычное сообщение приходит без type (или с "message"); typing — отдельно.
  type?: "message";
};

export type ChatConsultation = {
  date: string;
  doctor?: ChatParticipant | null;
  id: number;
  is_online: boolean;
  // Кто вторая сторона записи. /api/doctor/appointments/ отдаёт patient,
  // /api/profile/appointments/ — doctor. Нужно, чтобы отобрать записи именно
  // этого чата: списки возвращают ВСЕ записи пользователя, а не по собеседнику.
  patient?: ChatParticipant | null;
  status: string;
  time: string;
};

// Итог видео-консультации: расшифровка разговора и ссылка на .docx.
// Собирается из GET /api/appointments/{id}/ — в списках записей этих полей нет.
export type ConsultationSummary = {
  appointmentId: number;
  date: string; // YYYY-MM-DD
  // Абсолютная ссылка на .docx (пустая, если бэк отдал только текст).
  docxUrl: string;
  // Имя второй стороны — для заголовка «…разговора с пациентом Имя».
  partnerName: string;
  text: string;
  time: string; // HH:mm
};

// Индикатор «печатает…» — тот же сокет, поле type различает кадр.
export type TypingOutgoing = {
  is_typing: boolean;
  type: "typing";
};

export type TypingIncoming = {
  is_typing: boolean;
  type: "typing";
  user_id: number;
  user_name: string;
};

// Любой кадр из сокета комнаты: сообщение или событие typing.
export type IncomingSocketFrame = IncomingChatMessage | TypingIncoming;

// ── AI assistant chat (room 0) ──────────────────────────────────────────────

export type AiChatRole = "assistant" | "user";

export type AiRecommendedDoctor = {
  full_name: string;
  id: number;
  is_online_available: boolean;
  photo: null | string;
  rating: string;
  specialty: string;
};

export type AiRecommendedClinic = {
  city: string;
  id: number;
  logo: null | string;
  name: string;
  rating: string;
};

export type AiRecommendedService = {
  category: string;
  clinic: { id: number; name: string } | null;
  id: number;
  name: string;
  price: string;
};

// Ассистент может порекомендовать врачей/клиники/услуги в подходящий момент
// разговора — фронт рисует их карточками под текстом сообщения. Поле
// присутствует всегда (не на каждый ответ ассистента есть рекомендации —
// тогда все три массива просто пустые), максимум по 3 записи в каждом.
export type AiRecommendations = {
  clinics: AiRecommendedClinic[];
  doctors: AiRecommendedDoctor[];
  services: AiRecommendedService[];
};

export type AiChatMessage = {
  content: string;
  created_at: string;
  id: number;
  recommendations: AiRecommendations;
  role: AiChatRole;
};

export type SendAiMessageRequest = {
  message: string;
};
