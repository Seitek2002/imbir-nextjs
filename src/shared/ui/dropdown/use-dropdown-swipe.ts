import { useRef } from 'react';

export const useDropdownSwipe = (onClose: () => void) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef({ y: 0, time: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, time: Date.now() };
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = e.touches[0].clientY - touchStart.current.y;

    if (scrollRef.current?.contains(e.target as Node)) {
      if (scrollRef.current.scrollTop > 0 || deltaY < 0) return;
    }

    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = e.changedTouches[0].clientY - touchStart.current.y;
    const timeElapsed = Date.now() - touchStart.current.time;
    const velocity = deltaY / timeElapsed;

    sheetRef.current.style.transition =
      'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
    sheetRef.current.style.transform = '';

    if (deltaY > 150 || velocity > 0.5) onClose();
  };

  return {
    sheetRef,
    scrollRef,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
};
