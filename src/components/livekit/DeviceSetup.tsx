"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  LocalUserChoices,
  usePreviewTracks,
  useTrackVolume,
} from "@livekit/components-react";
import { LocalAudioTrack, LocalVideoTrack, Room, Track } from "livekit-client";

import styles from "./livekit.module.css";

type DeviceSetupProps = {
  onJoin: (choices: LocalUserChoices) => void;
};

const CameraIcon = ({ off = false }: { off?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M14.5 7H5.75A2.75 2.75 0 0 0 3 9.75v4.5A2.75 2.75 0 0 0 5.75 17h8.75a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 14.5 7Zm2.5 3 4-2v8l-4-2"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {off && (
      <path
        d="m4 4 16 16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    )}
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
      strokeWidth="1.7"
    />
    <path
      d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v4m-3 0h6"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
    {off && (
      <path
        d="m4 4 16 16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    )}
  </svg>
);

export const DeviceSetup = ({ onJoin }: DeviceSetupProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoDeviceId, setVideoDeviceId] = useState("");
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceError, setDeviceError] = useState<null | string>(null);

  const handlePreviewError = useCallback((error: Error) => {
    if (error.name === "NotAllowedError") {
      setDeviceError(
        "Разрешите доступ к камере и микрофону в настройках браузера",
      );
      return;
    }
    setDeviceError("Не удалось подключить камеру или микрофон");
  }, []);

  const previewOptions = useMemo(
    () => ({
      audio: audioEnabled ? { deviceId: audioDeviceId || undefined } : false,
      video: videoEnabled ? { deviceId: videoDeviceId || undefined } : false,
    }),
    [audioDeviceId, audioEnabled, videoDeviceId, videoEnabled],
  );

  const tracks = usePreviewTracks(previewOptions, handlePreviewError);
  const videoTrack = tracks?.find(
    (track) => track.kind === Track.Kind.Video,
  ) as LocalVideoTrack | undefined;
  const audioTrack = tracks?.find(
    (track) => track.kind === Track.Kind.Audio,
  ) as LocalAudioTrack | undefined;
  const microphoneLevel = useTrackVolume(audioTrack);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !videoTrack) return;

    videoTrack.attach(element);
    return () => {
      videoTrack.detach(element);
    };
  }, [videoTrack]);

  useEffect(() => {
    if (!tracks) return;
    let active = true;

    void Promise.all([
      Room.getLocalDevices("videoinput"),
      Room.getLocalDevices("audioinput"),
    ]).then(([cameras, microphones]) => {
      if (!active) return;
      setVideoDevices(cameras);
      setAudioDevices(microphones);
    });

    return () => {
      active = false;
    };
  }, [tracks]);

  const join = () => {
    onJoin({
      videoEnabled,
      audioEnabled,
      videoDeviceId,
      audioDeviceId,
      username: "Участник",
    });
  };

  return (
    <main className={styles.setupScreen}>
      <section className={styles.setupCard}>
        <div className={styles.setupHeading}>
          <span className={styles.eyebrow}>Онлайн-приём</span>
          <h1>Подготовка к консультации</h1>
          <p>Проверьте изображение и звук перед входом в комнату</p>
        </div>

        <div className={styles.preview}>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={styles.previewVideo}
          />
          {!videoEnabled && (
            <div className={styles.cameraDisabled}>
              <CameraIcon off />
              <span>Камера выключена</span>
            </div>
          )}
          {!tracks && !deviceError && (
            <div className={styles.previewLoading}>Подключаем устройства…</div>
          )}
        </div>

        <div className={styles.deviceControls}>
          <div className={styles.deviceRow}>
            <button
              type="button"
              className={
                videoEnabled ? styles.deviceToggleOn : styles.deviceToggle
              }
              onClick={() => setVideoEnabled((enabled) => !enabled)}
              aria-pressed={videoEnabled}
            >
              <CameraIcon off={!videoEnabled} />
              <span>
                {videoEnabled ? "Камера включена" : "Камера выключена"}
              </span>
            </button>
            <select
              aria-label="Выбор камеры"
              value={videoDeviceId}
              onChange={(event) => setVideoDeviceId(event.target.value)}
              disabled={!videoEnabled || videoDevices.length === 0}
            >
              <option value="">Камера по умолчанию</option>
              {videoDevices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Камера ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.deviceRow}>
            <button
              type="button"
              className={
                audioEnabled ? styles.deviceToggleOn : styles.deviceToggle
              }
              onClick={() => setAudioEnabled((enabled) => !enabled)}
              aria-pressed={audioEnabled}
            >
              <MicrophoneIcon off={!audioEnabled} />
              <span>
                {audioEnabled ? "Микрофон включён" : "Микрофон выключен"}
              </span>
            </button>
            <select
              aria-label="Выбор микрофона"
              value={audioDeviceId}
              onChange={(event) => setAudioDeviceId(event.target.value)}
              disabled={!audioEnabled || audioDevices.length === 0}
            >
              <option value="">Микрофон по умолчанию</option>
              {audioDevices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Микрофон ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.meterBlock}>
            <span>Уровень микрофона</span>
            <div className={styles.meter} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <i
                  key={index}
                  className={
                    audioEnabled && microphoneLevel * 12 > index
                      ? styles.meterActive
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>

        {deviceError && <p className={styles.deviceError}>{deviceError}</p>}

        <button type="button" className={styles.joinButton} onClick={join}>
          Войти в консультацию
        </button>
        <p className={styles.privacyNote}>
          Камера и микрофон используются только во время консультации
        </p>
      </section>
    </main>
  );
};
