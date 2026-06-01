"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { usePathname } from "next/navigation";

export function useSidebarIndicator() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('[data-active="true"]') as HTMLElement;
    if (!active) return;
    setIndicator({ top: active.offsetTop, height: active.offsetHeight });
  }, [pathname]);

  return { navRef, indicator, pathname };
}
