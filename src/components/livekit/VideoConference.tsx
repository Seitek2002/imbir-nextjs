"use client";

import {
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  StartAudio,
  useConnectionState,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

import { ControlBar } from "./ControlBar";
import styles from "./livekit.module.css";

type VideoConferenceProps = {
  onLeave: () => void;
};

const ConnectionNotice = () => {
  const connectionState = useConnectionState();

  if (connectionState === ConnectionState.Connecting) {
    return <div className={styles.connectionNotice}>Подключение к врачу…</div>;
  }

  if (
    connectionState === ConnectionState.Reconnecting ||
    connectionState === ConnectionState.SignalReconnecting
  ) {
    return (
      <div className={styles.connectionWarning}>
        <strong>Соединение потеряно</strong>
        <span>Переподключение…</span>
      </div>
    );
  }

  if (connectionState === ConnectionState.Disconnected) {
    return (
      <div className={styles.connectionWarning}>
        <strong>Нет соединения</strong>
        <button type="button" onClick={() => window.location.reload()}>
          Подключиться снова
        </button>
      </div>
    );
  }

  return null;
};

export const VideoConference = ({ onLeave }: VideoConferenceProps) => {
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const participants = useParticipants();

  return (
    <div className={styles.conference}>
      <header className={styles.conferenceHeader}>
        <div>
          <span className={styles.liveDot} />
          Онлайн-консультация
        </div>
        <span>{participants.length} из 2 участников</span>
      </header>

      <div className={styles.videoStage}>
        <GridLayout tracks={tracks} className={styles.videoGrid}>
          <ParticipantTile />
        </GridLayout>
        {participants.length < 2 && (
          <div className={styles.waitingParticipant}>
            Ожидаем второго участника…
          </div>
        )}
      </div>

      <StartAudio
        label="Включить звук консультации"
        className={styles.startAudio}
      />
      <RoomAudioRenderer />
      <ConnectionNotice />
      <ControlBar onLeave={onLeave} />
    </div>
  );
};
