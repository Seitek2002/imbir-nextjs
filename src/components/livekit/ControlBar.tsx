"use client";

import { useState } from "react";

import { useLocalParticipant, useRoomContext } from "@livekit/components-react";

import styles from "./livekit.module.css";

type ControlBarProps = {
  onLeave: () => void;
};

const CameraIcon = ({ off = false }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.5 7H5.75A2.75 2.75 0 0 0 3 9.75v4.5A2.75 2.75 0 0 0 5.75 17h8.75a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 14.5 7Zm2.5 3 4-2v8l-4-2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {off && <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.8" />}
  </svg>
);

const MicrophoneIcon = ({ off = false }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="9"
      y="3"
      width="6"
      height="11"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4m-3 0h6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {off && <path d="m4 4 16 16" stroke="currentColor" strokeWidth="1.8" />}
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5.2 4.5c.5-.5 1.3-.6 1.9-.1l2.1 1.7c.5.4.7 1.2.3 1.8L8.3 9.8a14.2 14.2 0 0 0 5.9 5.9l1.9-1.2c.6-.4 1.4-.2 1.8.3l1.7 2.1c.5.6.4 1.4-.1 1.9l-1.2 1.1c-.7.7-1.8 1-2.8.7A18 18 0 0 1 3.4 8.5c-.3-1 .1-2.1.7-2.8l1.1-1.2Z"
      fill="currentColor"
    />
  </svg>
);

export const ControlBar = ({ onLeave }: ControlBarProps) => {
  const room = useRoomContext();
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled } =
    useLocalParticipant();
  const [pending, setPending] = useState<
    "camera" | "microphone" | "leave" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const toggleCamera = async () => {
    setPending("camera");
    setError(null);
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch {
      setError("Не удалось переключить камеру");
    } finally {
      setPending(null);
    }
  };

  const toggleMicrophone = async () => {
    setPending("microphone");
    setError(null);
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch {
      setError("Не удалось переключить микрофон");
    } finally {
      setPending(null);
    }
  };

  const leave = async () => {
    setPending("leave");
    try {
      await room.disconnect();
    } finally {
      onLeave();
    }
  };

  return (
    <div className={styles.controlsWrap}>
      {error && <p className={styles.controlError}>{error}</p>}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={toggleMicrophone}
          disabled={pending !== null}
          className={
            isMicrophoneEnabled ? styles.controlButton : styles.controlOff
          }
          aria-label={
            isMicrophoneEnabled ? "Выключить микрофон" : "Включить микрофон"
          }
          aria-pressed={isMicrophoneEnabled}
        >
          <MicrophoneIcon off={!isMicrophoneEnabled} />
          <span>Микрофон</span>
        </button>
        <button
          type="button"
          onClick={toggleCamera}
          disabled={pending !== null}
          className={isCameraEnabled ? styles.controlButton : styles.controlOff}
          aria-label={isCameraEnabled ? "Выключить камеру" : "Включить камеру"}
          aria-pressed={isCameraEnabled}
        >
          <CameraIcon off={!isCameraEnabled} />
          <span>Камера</span>
        </button>
        <button
          type="button"
          onClick={leave}
          disabled={pending !== null}
          className={styles.leaveButton}
          aria-label="Завершить консультацию"
        >
          <PhoneIcon />
          <span>{pending === "leave" ? "Завершаем…" : "Завершить"}</span>
        </button>
      </div>
    </div>
  );
};
