import { useRef } from "react";

const CLOSE_DISTANCE = 150;
const CLOSE_VELOCITY = 0.5;
const FLICK_DISTANCE = 40;

export const useDropdownSwipe = (onClose: () => void) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ y: 0, time: 0 });
  const isDragging = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, time: Date.now() };
    isDragging.current = false;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const deltaY = e.touches[0].clientY - touchStart.current.y;

    if (scrollRef.current?.contains(e.target as Node)) {
      if (scrollRef.current.scrollTop > 0 || deltaY < 0) return;
    }

    if (deltaY <= 0) return;

    // Отключаем анимацию только когда палец действительно тянет шит,
    // иначе инлайн-стили ломают закрытие по тапу
    if (!isDragging.current) {
      isDragging.current = true;
      sheet.style.transition = "none";
    }

    sheet.style.transform = `translateY(${deltaY}px)`;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const sheet = sheetRef.current;
    if (!sheet || !isDragging.current) return;

    isDragging.current = false;

    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const timeElapsed = Math.max(Date.now() - touchStart.current.time, 1);
    const velocity = deltaY / timeElapsed;

    // Возвращаем анимацию из классов: она доводит шит либо назад, либо вниз
    sheet.style.transition = "";
    sheet.style.transform = "";

    if (
      deltaY > CLOSE_DISTANCE ||
      (velocity > CLOSE_VELOCITY && deltaY > FLICK_DISTANCE)
    ) {
      onClose();
    }
  };

  return {
    sheetRef,
    scrollRef,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
