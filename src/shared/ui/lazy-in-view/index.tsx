"use client";

import { FC, ReactNode } from "react";

import { useInView } from "@/shared/lib/useInView";

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
  const { ref, inView } = useInView<HTMLDivElement>(rootMargin);

  return (
    <div ref={ref} className={className} style={{ minHeight }}>
      {inView ? children : null}
    </div>
  );
};
