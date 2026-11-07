"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionUser } from "@/lib/api/types";

type SessionStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface SessionState {
  user: SessionUser | null;
  status: SessionStatus;
  rememberedEmail: string;
  error: string | null;
  isVerifying: boolean;
  sessionChecked: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  clearError: () => void;
  setRememberedEmail: (email: string) => void;
  login: (email: string, password: string, rememberEmail: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || "Request failed";
  } catch {
    return "Request failed";
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      status: "idle",
      rememberedEmail: "",
      error: null,
      isVerifying: false,
      sessionChecked: false,
      _hasHydrated: false,

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      clearError: () => set({ error: null }),

      setRememberedEmail: (email) => set({ rememberedEmail: email }),

      login: async (email, password, rememberEmail) => {
        set({ status: "loading", error: null, isVerifying: false });
        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const message = await readError(response);
            set({
              status: "unauthenticated",
              error: message,
              user: null,
              sessionChecked: true,
            });
            throw new Error(message);
          }

          const data = (await response.json()) as { user: SessionUser };
          set({
            user: data.user,
            status: "authenticated",
            error: null,
            rememberedEmail: rememberEmail ? email : "",
            isVerifying: false,
            sessionChecked: true,
          });
        } catch (error) {
          if (get().error) throw error;
          const message =
            error instanceof Error ? error.message : "Login failed";
          set({
            status: "unauthenticated",
            error: message,
            user: null,
            sessionChecked: true,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          if (typeof window !== "undefined") {
            Object.keys(window.localStorage)
              .filter((key) => key.startsWith("fmi-query-cache-"))
              .forEach((key) => window.localStorage.removeItem(key));
          }
          set({
            user: null,
            status: "unauthenticated",
            error: null,
            isVerifying: false,
            sessionChecked: true,
          });
        }
      },

      hydrate: async () => {
        const current = get();
        if (current.isVerifying) return;

        const hasCachedUser =
          current.status === "authenticated" && !!current.user;

        set({
          isVerifying: true,
          sessionChecked: false,
          error: null,
          // Keep cached authenticated UI on refresh; only blank-load when unknown.
          status: hasCachedUser ? "authenticated" : "loading",
        });

        try {
          const response = await fetch("/api/auth/session");
          if (response.status === 401) {
            await get().logout();
            return;
          }
          if (!response.ok) {
            set({
              user: hasCachedUser ? current.user : null,
              status: hasCachedUser ? "authenticated" : "unauthenticated",
              isVerifying: false,
              sessionChecked: true,
            });
            return;
          }
          const data = (await response.json()) as { user: SessionUser | null };
          if (!data.user) {
            await get().logout();
            return;
          }
          set({
            user: data.user,
            status: "authenticated",
            isVerifying: false,
            sessionChecked: true,
          });
        } catch {
          set({
            user: hasCachedUser ? current.user : null,
            status: hasCachedUser ? "authenticated" : "unauthenticated",
            isVerifying: false,
            sessionChecked: true,
          });
        }
      },
    }),
    {
      name: "fmi-session",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        rememberedEmail: state.rememberedEmail,
        // Optimistic UI only — tokens stay in httpOnly cookies.
        user: state.user,
        status: state.status === "authenticated" ? "authenticated" : "idle",
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
