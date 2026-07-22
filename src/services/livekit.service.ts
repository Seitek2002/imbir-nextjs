import axios from "axios";

import { apiClient } from "@/shared/api/client";
import { extractErrorMessage } from "@/shared/lib/errors";

export type LiveKitCredentials = {
  url: string;
  room: string;
  token: string;
};

export type LiveKitErrorCode =
  | "access_denied"
  | "expired"
  | "invalid_response"
  | "not_started"
  | "request_failed";

export class LiveKitServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly code: LiveKitErrorCode,
    public readonly startsAt?: string,
  ) {
    super(message);
    this.name = "LiveKitServiceError";
  }
}

const isLiveKitCredentials = (value: unknown): value is LiveKitCredentials => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LiveKitCredentials>;
  return (
    typeof candidate.url === "string" &&
    candidate.url.startsWith("wss://") &&
    typeof candidate.room === "string" &&
    candidate.room.length > 0 &&
    typeof candidate.token === "string" &&
    candidate.token.length > 0
  );
};

const getErrorCode = (status: number | null, message: string) => {
  if (status === 403) return "access_denied" as const;

  const normalized = message.toLocaleLowerCase("ru");
  if (normalized.includes("истекло")) return "expired" as const;
  if (
    normalized.includes("слишком рано") ||
    normalized.includes("ещё недоступна") ||
    normalized.includes("еще недоступна")
  ) {
    return "not_started" as const;
  }

  return "request_failed" as const;
};

export const getLiveKitToken = async (
  consultationId: string,
  signal?: AbortSignal,
): Promise<LiveKitCredentials> => {
  try {
    const { data } = await apiClient.get<LiveKitCredentials>(
      "/api/livekit/token/",
      {
        params: { consultation_id: consultationId },
        signal,
      },
    );

    if (!isLiveKitCredentials(data)) {
      throw new LiveKitServiceError(
        "Сервер вернул некорректные данные для подключения",
        200,
        "invalid_response",
      );
    }

    return data;
  } catch (error) {
    if (error instanceof LiveKitServiceError) throw error;
    if (axios.isCancel(error)) throw error;

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      const payload = error.response?.data;
      const backendMessage = extractErrorMessage(payload, "");
      const message =
        status === 403
          ? "Нет доступа к консультации"
          : backendMessage || "Не удалось получить доступ к консультации";
      const startsAt =
        payload &&
        typeof payload === "object" &&
        !Array.isArray(payload) &&
        typeof (payload as { starts_at?: unknown }).starts_at === "string"
          ? (payload as { starts_at: string }).starts_at
          : undefined;

      throw new LiveKitServiceError(
        message,
        status,
        getErrorCode(status, backendMessage),
        startsAt,
      );
    }

    throw new LiveKitServiceError(
      "Не удалось получить доступ к консультации",
      null,
      "request_failed",
    );
  }
};
