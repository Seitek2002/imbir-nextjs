"use client";

import type { FC } from "react";

import { colors } from "@/shared/config";
import { Button, Input, SegmentedControl } from "@/shared/ui";

import {
  CODE_LENGTH,
  type VerifyChannel,
  type VerifyContactState,
} from "./model";

const CHANNEL_OPTIONS: { label: string; value: VerifyChannel }[] = [
  { value: "email", label: "Почта" },
  { value: "phone", label: "Телефон" },
];

const CheckIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="shrink-0"
  >
    <circle cx="9" cy="9" r="8" fill={colors.primary} />
    <path
      d="M5.5 9.2l2.3 2.3 4.7-4.7"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Props = {
  // Вызывается после успешного подтверждения: мастер сразу отправляет анкету,
  // чтобы пользователь не жал «Завершить регистрацию» второй раз.
  onConfirmed?: () => void;
  state: VerifyContactState;
};

// Блок подтверждения контакта на последнем шаге анкеты. Появляется только
// после первой попытки отправить форму: до этого он был бы шумом — большинство
// полей ещё не заполнено, и код успел бы истечь.
export const VerifyContactBlock: FC<Props> = ({ state, onConfirmed }) => {
  const {
    channel,
    changeChannel,
    target,
    code,
    setCode,
    isSent,
    isVerified,
    isRequesting,
    isVerifying,
    timer,
    requestCode,
    confirmCode,
  } = state;

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl bg-primary-tint border border-primary/30">
        <CheckIcon />
        <span className="text-sm text-foreground">
          {channel === "email" ? "Почта" : "Телефон"}{" "}
          <span className="font-medium">{target}</span> подтверждён — можно
          завершать регистрацию
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-overlay">
          Подтвердите контакт
        </span>
        <span className="text-sm text-muted">
          Мы отправим код, чтобы убедиться, что контакт ваш. Без подтверждения
          регистрацию завершить не получится. Достаточно одного канала — почты
          или телефона.
        </span>
      </div>

      <SegmentedControl
        options={CHANNEL_OPTIONS}
        value={channel}
        onChange={changeChannel}
      />

      <div className="text-sm text-muted">
        Код придёт на{" "}
        <span className="text-foreground font-medium">
          {target ||
            (channel === "email"
              ? "— почта не указана"
              : "— телефон не указан")}
        </span>
      </div>

      {isSent && (
        <div className="flex flex-col gap-1.5">
          <Input
            label="Код подтверждения"
            placeholder={`Введите ${CODE_LENGTH}-значный код`}
            name="one-time-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "");
              if (digits.length <= CODE_LENGTH) setCode(digits);
            }}
          />
          <div className="flex justify-end text-sm">
            {timer > 0 ? (
              <span className="text-muted">
                Отправить код повторно через {timer} с
              </span>
            ) : (
              <button
                type="button"
                onClick={requestCode}
                disabled={isRequesting}
                className="text-primary hover:text-primary-dark font-medium transition-colors"
              >
                Отправить код повторно
              </button>
            )}
          </div>
        </div>
      )}

      {/* type="button" обязателен: блок живёт внутри <form> мастера, и submit
          отсюда запустил бы переход шага вместо отправки кода. */}
      {isSent ? (
        <Button
          type="button"
          size="sm"
          className="w-full justify-center"
          onClick={async () => {
            if (await confirmCode()) onConfirmed?.();
          }}
          disabled={code.length !== CODE_LENGTH}
          loading={isVerifying}
        >
          Подтвердить код
        </Button>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full justify-center"
          onClick={requestCode}
          disabled={!target}
          loading={isRequesting}
        >
          Отправить код
        </Button>
      )}
    </div>
  );
};
