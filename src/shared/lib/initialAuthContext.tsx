"use client";

import { type ReactNode, createContext, useContext } from "react";

import type { UserRole } from "@/shared/store";

export type InitialAuth = { isAuthed: boolean; role?: UserRole };

const InitialAuthContext = createContext<InitialAuth>({ isAuthed: false });

// Засеивается один раз в app/layout.tsx значением, прочитанным из cookie
// (is_authed/role — см. authStore.ts) на сервере. Даёт клиентским
// компонентам под ним источник правды для первого рендера, пока
// useAuthStore ещё не гидратировался — без этого они либо читают
// "замороженный" getInitialState() через useSyncExternalStore (см.
// AuthGuard), либо рисуют гостя до гидратации.
export const InitialAuthProvider = ({
  value,
  children,
}: {
  children: ReactNode;
  value: InitialAuth;
}) => (
  <InitialAuthContext.Provider value={value}>
    {children}
  </InitialAuthContext.Provider>
);

export const useInitialAuth = () => useContext(InitialAuthContext);
