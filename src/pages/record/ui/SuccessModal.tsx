"use client";

import { FC, useCallback, useState } from "react";

import Link from "next/link";

import { SuccessCheckIcon, VideoCallIcon } from "@/shared/assets/icons";
import { useScrollLock } from "@/shared/lib/useScrollLock";
import { Button } from "@/shared/ui";

type Props = {
  appointmentId?: null | number;
  isOnline: boolean;
  isOpen: boolean;
  onClose: () => void;
};

const DURATION = 200;

export const SuccessModal: FC<Props> = ({
  isOpen,
  onClose,
  appointmentId,
  isOnline,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  useScrollLock(isOpen);

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
        data-state={state}
        onClick={handleClose}
      />

      <div
        className="modal-panel relative bg-white rounded-3xl border border-border-soft p-8 max-w-sm w-full flex flex-col items-center text-center gap-5 shadow-xl"
        data-state={state}
      >
        <SuccessCheckIcon className="size-50" />
        <div>
          <p className="text-[20px] font-semibold text-foreground leading-[130%]">
            Ваша запись
            <br />
            успешно забронирована!
          </p>
          <p className="text-sm text-secondary mt-2">
            {isOnline
              ? "Подключитесь к онлайн-приёму в назначенное время"
              : "Ожидайте сообщение от вашего специалиста"}
          </p>
        </div>

        {isOnline && appointmentId != null && (
          <Link href={`/consultation/${appointmentId}`} className="w-full">
            <Button
              className="w-full justify-center"
              size="lg"
              IconLeft={VideoCallIcon}
            >
              Открыть консультацию
            </Button>
          </Link>
        )}

        <Button
          variant={isOnline && appointmentId != null ? "outline" : "default"}
          className="w-full justify-center"
          onClick={handleClose}
        >
          Спасибо
        </Button>
      </div>
    </div>
  );
};
