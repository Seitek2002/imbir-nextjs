"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useLiveKitToken } from "@/hooks/useLiveKitToken";
import { LiveKitRoom, LocalUserChoices } from "@livekit/components-react";

import { DeviceSetup } from "./DeviceSetup";
import { VideoConference } from "./VideoConference";
import styles from "./livekit.module.css";

type ConsultationRoomProps = {
  consultationId: string;
};

const formatStartsAt = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function ConsultationRoom({
  consultationId,
}: ConsultationRoomProps) {
  const router = useRouter();
  const { data, error, isLoading, retry } = useLiveKitToken(consultationId);
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className={styles.stateScreen}>
        <span className={styles.spinner} />
        <h1>Подключение к консультации…</h1>
        <p>Проверяем доступ к видеокомнате</p>
      </main>
    );
  }

  if (error || !data) {
    const startTime = formatStartsAt(error?.startsAt);
    return (
      <main className={styles.stateScreen}>
        <div className={styles.stateIcon}>!</div>
        <h1>
          {error?.code === "access_denied"
            ? "Нет доступа к консультации"
            : error?.code === "not_started" && startTime
              ? `Консультация начнётся в ${startTime}`
              : "Не удалось войти в консультацию"}
        </h1>
        <p>{error?.message ?? "Попробуйте ещё раз"}</p>
        <div className={styles.stateActions}>
          <button type="button" onClick={retry}>
            Повторить
          </button>
          <button type="button" onClick={() => router.back()}>
            Назад
          </button>
        </div>
      </main>
    );
  }

  if (!choices) {
    return <DeviceSetup onJoin={setChoices} />;
  }

  return (
    <main className={styles.roomScreen} data-lk-theme="default">
      {connectionError && (
        <div className={styles.roomError}>{connectionError}</div>
      )}
      <LiveKitRoom
        serverUrl={data.url}
        token={data.token}
        connect
        audio={
          choices.audioEnabled
            ? { deviceId: choices.audioDeviceId || undefined }
            : false
        }
        video={
          choices.videoEnabled
            ? { deviceId: choices.videoDeviceId || undefined }
            : false
        }
        options={{ adaptiveStream: true, dynacast: true }}
        onConnected={() => setConnectionError(null)}
        onError={(roomError) => setConnectionError(roomError.message)}
        onMediaDeviceFailure={() =>
          setConnectionError("Проверьте доступ к камере и микрофону")
        }
        className={styles.liveKitRoom}
      >
        <VideoConference
          onLeave={() =>
            router.replace(`/consultation/${consultationId}/finished`)
          }
        />
      </LiveKitRoom>
    </main>
  );
}
