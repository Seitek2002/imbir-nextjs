"use client";

import { FC } from "react";
import toast from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";

import {
  type ConsultationSummary,
  chatKeys,
  getConsultationSummaries,
} from "@/shared/api";
import { DownloadIcon } from "@/shared/assets/icons";
import { Button, Modal } from "@/shared/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // Отправка ссылки собеседнику сообщением в этот же чат. Есть только у врача.
  onShare?: (text: string) => void;
  partnerName: string;
  // ID собеседника — по нему отбираются записи именно этого чата.
  partnerUserId: number;
  // Роль текущего пользователя: врач видит итоги своих приёмов, пациент — своих.
  role: "doctor" | "patient";
};

// "2026-05-13" + "16:47" → "13 мая 2026 г. • 16:47"
const formatWhen = (date: string, time: string): string => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return `${date} • ${time}`;
  const human = parsed.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `${human} • ${time}`;
};

// Файл лежит на домене API, поэтому атрибут download кросс-доменно не работает
// — браузер просто откроет .docx в новой вкладке и скачает его сам.
const DownloadLink: FC<{
  children: React.ReactNode;
  className?: string;
  url: string;
}> = ({ url, className, children }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    download
    className={className}
  >
    {children}
  </a>
);

export const ConsultationSummaryModal: FC<Props> = ({
  isOpen,
  onClose,
  role,
  partnerUserId,
  partnerName,
  onShare,
}) => {
  // enabled: запрос уходит только при открытой модалке — на каждую запись
  // приходится отдельный GET (см. getConsultationSummaries), незачем греть их
  // при простом открытии чата.
  const {
    data: summaries = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: chatKeys.summaries(partnerUserId),
    queryFn: () => getConsultationSummaries(role, partnerUserId),
    enabled: isOpen,
    staleTime: 30 * 1000,
  });

  const share = (summary: ConsultationSummary) => {
    if (!onShare || !summary.docxUrl) return;
    onShare(
      `Итоги консультации ${formatWhen(summary.date, summary.time)}: ${summary.docxUrl}`,
    );
    toast.success("Ссылка отправлена в чат");
    onClose();
  };

  const body = () => {
    if (isLoading)
      return <p className="text-muted text-sm py-4">Загружаем итоги…</p>;

    if (isError)
      return (
        <p className="text-muted text-sm py-4">
          Не удалось загрузить итоги консультаций
        </p>
      );

    if (summaries.length === 0)
      return (
        <p className="text-muted text-sm py-4">
          Итогов пока нет. Расшифровка появляется после завершённого
          видео-созвона.
        </p>
      );

    // Одна расшифровка — крупная карточка, как в макете.
    if (summaries.length === 1) {
      const only = summaries[0];
      return (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-foreground font-semibold text-lg leading-snug">
              Разговор
              {role === "doctor" ? " с пациентом" : " с врачом"}{" "}
              {only.partnerName || partnerName}
            </p>
            <p className="text-muted text-sm mt-1">
              {formatWhen(only.date, only.time)}
            </p>
          </div>

          {only.docxUrl ? (
            // Ссылку стилизуем под основную кнопку, а не вкладываем в неё
            // <Button>: кнопка внутри ссылки — невалидная вложенность
            // интерактивных элементов.
            <DownloadLink
              url={only.docxUrl}
              className="w-full h-[52px] px-8 flex items-center justify-center gap-2 rounded-full font-medium text-base bg-primary text-white transition-all active:bg-primary-dark hover:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)]"
            >
              <DownloadIcon className="size-5" />
              <span>Скачать docx.</span>
            </DownloadLink>
          ) : (
            <p className="text-muted text-sm">
              Файл ещё не готов — доступен только текст расшифровки.
            </p>
          )}

          {only.text && (
            <div className="rounded-2xl bg-surface p-4 max-h-60 overflow-y-auto">
              <p className="text-secondary text-sm leading-relaxed whitespace-pre-line">
                {only.text}
              </p>
            </div>
          )}

          {onShare && only.docxUrl && (
            <Button
              variant="outline"
              size="lg"
              className="w-full justify-center"
              onClick={() => share(only)}
            >
              Отправить пациенту
            </Button>
          )}
        </div>
      );
    }

    // Несколько — списком с круглой кнопкой скачивания у каждой строки.
    return (
      <div className="flex flex-col">
        {summaries.map((summary) => (
          <div
            key={summary.appointmentId}
            className="flex items-center justify-between gap-3 py-4 border-b border-border-soft last:border-0"
          >
            <div className="min-w-0">
              <p className="text-foreground font-semibold leading-snug">
                AI Транскрибация разговора
              </p>
              <p className="text-muted text-sm mt-0.5">
                {formatWhen(summary.date, summary.time)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onShare && summary.docxUrl && (
                <Button
                  variant="text"
                  size="xs"
                  className="text-primary px-0"
                  onClick={() => share(summary)}
                >
                  Отправить
                </Button>
              )}
              {summary.docxUrl && (
                <DownloadLink url={summary.docxUrl}>
                  <span
                    className="flex items-center justify-center size-10 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                    aria-label={`Скачать расшифровку за ${formatWhen(summary.date, summary.time)}`}
                  >
                    <DownloadIcon className="size-5" />
                  </span>
                </DownloadLink>
              )}
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          size="lg"
          className="w-full justify-center mt-5"
          onClick={onClose}
        >
          Закрыть
        </Button>
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Транскрибация разговора">
      {body()}
    </Modal>
  );
};
