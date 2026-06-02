"use client";

import { useEffect } from "react";

import { useAuthStore } from "./authStore";

// Triggers Zustand persist rehydration from localStorage on the client.
// Must be rendered inside the app tree (in providers or root layout).
export function StoreHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
