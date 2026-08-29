"use client";

import { FC, useEffect, useState } from "react";

/**
 * Текст, который проявляется прокруткой букв — как в CSS-трюке с
 * `@property --num` и `counter(num, lower-alpha)`, где «css» перетекает в «yes».
 *
 * Сам трюк сюда не переносится, и все три причины упираются в реальные
 * сообщения ассистента:
 *
 * 1. `counter(num, lower-alpha)` рисует только латиницу, а ассистент отвечает
 *    по-русски;
 * 2. текст из `content:` нельзя выделить и скопировать — для сообщения в чате
 *    это потеря, а не мелочь, и скринридеру он тоже достаётся плохо;
 * 3. слово целиком кодируется числом 26^n: шесть букв уже упираются в предел
 *    целого, а ответы ассистента — сотни символов.
 *
 * Поэтому символы настоящие и лежат в DOM, а прокрутка считается в JS — но по
 * той же механике, что и в оригинале: индекс буквы едет от смещённого старта к
 * целевому, проходя все буквы между ними.
 */

// Прокручиваем символ только внутри его собственного алфавита: русская буква
// перебирает русские, латинская — латинские, цифра — цифры. Иначе «расшифровка»
// превращается в мусор из чужих письменностей.
const ALPHABETS = [
  "абвгдеёжзийклмнопрстуфхцчшщъыьэюя",
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
  "abcdefghijklmnopqrstuvwxyz",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "0123456789",
];

// Пробелы, переносы и знаки препинания стоят на местах с первого кадра: длина
// строки не меняется, поэтому пузырь не прыгает и лента не дёргает скролл.
const alphabetOf = (char: string): string | undefined =>
  ALPHABETS.find((alphabet) => alphabet.includes(char));

// Сколько один символ крутится, прежде чем встать на место.
const CYCLE_MS = 320;
// Задержка между соседними символами — читается как расшифровка слева направо.
const STAGGER_MS = 14;
// Потолок для всей строки: у длинного ответа задержка сжимается, чтобы
// пользователь не ждал расшифровку дольше, чем читал бы сам текст.
const MAX_TOTAL_MS = 1400;

const staggerFor = (length: number): number =>
  length < 2
    ? 0
    : Math.min(
        STAGGER_MS,
        Math.max(0, (MAX_TOTAL_MS - CYCLE_MS) / (length - 1)),
      );

// Старт у каждого символа свой, иначе все буквы едут одинаковую дистанцию и
// строка колышется одной волной вместо расшифровки. Смещение считается от
// индекса символа, а не случайное: тогда кадр зависит только от времени и
// перерисовка не сбивает картинку.
const startIndexOf = (target: number, index: number, size: number): number =>
  (target + 7 + index * 11) % size;

const frameAt = (text: string, elapsed: number, stagger: number): string => {
  let out = "";

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const alphabet = alphabetOf(char);

    if (!alphabet) {
      out += char;
      continue;
    }

    const progress = (elapsed - i * stagger) / CYCLE_MS;

    if (progress >= 1) {
      out += char;
      continue;
    }

    const target = alphabet.indexOf(char);
    const from = startIndexOf(target, i, alphabet.length);

    if (progress <= 0) {
      out += alphabet[from];
      continue;
    }

    // Замедление к концу: буква быстро проскакивает большую часть алфавита и
    // мягко встаёт на своё место, как транзишен --num в оригинале.
    const eased = 1 - (1 - progress) ** 3;
    const index = Math.round(from + (target - from) * eased);

    out +=
      alphabet[((index % alphabet.length) + alphabet.length) % alphabet.length];
  }

  return out;
};

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type Props = {
  // Анимировать ли появление. Читается один раз при монтировании: решение
  // «это сообщение новое» принимает вызывающий, и перерисовка не должна
  // запускать расшифровку заново.
  animate?: boolean;
  text: string;
};

export const ScrambleText: FC<Props> = ({ animate = true, text }) => {
  // Замораживаем решение на монтировании через useState, а не через ref:
  // читать ref во время рендера нельзя, а начальное состояние ниже зависит
  // от этого флага.
  const [shouldAnimate] = useState(animate);

  // null — «показывай настоящий текст». Держим в состоянии только кадр
  // анимации, а не сам текст: тогда после её конца (и когда анимации нет
  // вовсе) компонент рисует актуальный проп, а не застывшую копию.
  const [frame, setFrame] = useState<null | string>(() =>
    shouldAnimate && !prefersReducedMotion()
      ? frameAt(text, 0, staggerFor(text.length))
      : null,
  );

  useEffect(() => {
    if (!shouldAnimate || prefersReducedMotion()) return;

    const stagger = staggerFor(text.length);
    const total = (text.length - 1) * stagger + CYCLE_MS;
    const startedAt = performance.now();
    let request = 0;

    const tick = (now: number) => {
      const elapsed = now - startedAt;

      if (elapsed >= total) {
        setFrame(null);
        return;
      }

      setFrame(frameAt(text, elapsed, stagger));
      request = requestAnimationFrame(tick);
    };

    request = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(request);
  }, [shouldAnimate, text]);

  return <>{frame ?? text}</>;
};
