"use client";

import { FC, ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  children: ReactNode;
  // Reserve space so mounting the real content doesn't shift the layout (CLS).
  minHeight: number;
  // How early to mount before the block scrolls into view.
  rootMargin?: string;
  className?: string;
};

// Defers mounting (and therefore hydration + chunk download) of a below-the-fold
// block until it is about to enter the viewport. Cuts initial main-thread work
// (TBT/INP) on heavy pages. The placeholder keeps `minHeight` reserved to avoid
// layout shift.
export const LazyInView: FC<Props> = ({
  children,
  minHeight,
  rootMargin = "300px 0px",
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const node = ref.current;
    if (!node) return;

    // No IntersectionObserver (very old WebView) → just render eagerly.
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setShown(true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {shown ? children : null}
    </div>
  );
};
