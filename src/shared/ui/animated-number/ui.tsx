"use client";

import { CSSProperties, FC, useEffect, useState } from "react";

import { useInView } from "@/shared/lib/useInView";

// Ограничение, о котором стоит знать: дробная часть не округляется, а
// отбрасывается — 4.999 при decimals=2 покажется как 4.99, а не 5.00. Для наших
// данных это не встречается: бэк отдаёт рейтинг уже с двумя знаками ("4.33"), а
// счётчики целые. Если понадобится точное округление — округлять до передачи
// в value.
type Props = {
  className?: string;
  /** Знаков после запятой: 0, 1 или 2 — больше counter() показать не сможет. */
  decimals?: 0 | 1 | 2;
  /** Длительность, мс. */
  duration?: number;
  /** Число или строка от бэка ("5.00" приходит именно строкой). */
  value: number | string;
};

// Считает браузер, а не JS: @property делает --an-value интерполируемым, а
// transition гонит его к новому значению (см. globals.css). Поэтому нет ни
// таймера, ни перерисовок React на каждом кадре — при смене значения
// достаточно одного ре-рендера с новым inline-стилем.
export const AnimatedNumber: FC<Props> = ({
  value,
  decimals = 0,
  duration = 900,
  className,
}) => {
  const numeric = Number(value);
  const safe = Number.isFinite(numeric) ? numeric : 0;
  const text = safe.toFixed(decimals);

  // Старт по попаданию в экран, а не по монтированию: блоки с числами лежат
  // внизу страницы, и к моменту прокрутки анимация успевала закончиться —
  // пользователь видел уже готовое число. rootMargin нулевой, чтобы отсчёт
  // начинался, когда элемент реально видно, а не за 300px до него.
  const { ref, inView } = useInView<HTMLSpanElement>("0px");

  // Анимируем только если браузер умеет @property. Иначе counter-reset получит
  // невалидное значение и вместо числа будет ноль — поэтому по умолчанию (и на
  // сервере) рисуем обычный текст.
  const [phase, setPhase] = useState<"animating" | "plain" | "priming">(
    "plain",
  );

  useEffect(() => {
    if (!inView) return;

    const supported =
      typeof CSS !== "undefined" && typeof CSS.registerProperty === "function";
    if (!supported) return;

    // Два кадра подряд, а не один: сначала элемент должен быть отрисован
    // со значением 0 и без transition (priming), и только потом есть от чего
    // интерполировать. Если выставить конечное значение сразу, число
    // появится готовым.
    let next = 0;
    const first = requestAnimationFrame(() => {
      setPhase("priming");
      next = requestAnimationFrame(() => setPhase("animating"));
    });

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(next);
    };
  }, [inView]);

  const style = {
    "--an-value": phase === "animating" ? safe : 0,
    "--an-scale": 10 ** decimals,
    "--an-duration": `${duration}ms`,
  } as CSSProperties;

  return (
    <span ref={ref} className={className}>
      {phase === "plain" ? (
        text
      ) : (
        <>
          {/* Само число живёт в ::before, а его screen reader не читает —
              настоящее значение отдаём отдельной строкой. */}
          <span className="sr-only">{text}</span>
          <span
            aria-hidden
            className="animated-number"
            data-decimals={decimals}
            data-static={phase === "priming" ? "true" : undefined}
            style={style}
          />
        </>
      )}
    </span>
  );
};
