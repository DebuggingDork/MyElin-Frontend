"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  api,
  clearSession,
  getStoredUser,
  getToken,
  persistSession,
  type StoredUser,
} from "@/lib/api/client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type AuthState = {
  user: StoredUser | null;
  token: string | null;
  ready: boolean;
};

type AuthContextValue = AuthState & {
  login: (body: LoginRequest) => Promise<AuthResponse>;
  register: (body: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SERVER_SNAPSHOT: AuthState = { user: null, token: null, ready: false };
let snapshot: AuthState = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emit(next: AuthState) {
  snapshot = next;
  listeners.forEach((l) => l());
}

function hydrate() {
  emit({
    user: getStoredUser(),
    token: getToken(),
    ready: true,
  });
}

if (typeof window !== "undefined") {
  hydrate();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot(): AuthState {
  return SERVER_SNAPSHOT;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const login = useCallback(async (body: LoginRequest) => {
    const auth = await api.login(body);
    persistSession(auth);
    emit({ user: { user_id: auth.user_id, email: auth.email }, token: auth.access_token, ready: true });
    return auth;
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    try {
      const auth = await api.register(body);
      persistSession(auth);
      emit({
        user: { user_id: auth.user_id, email: auth.email },
        token: auth.access_token,
        ready: true,
      });
      return auth;
    } catch (err) {
      // Supabase may rate-limit email confirmation; fall back to login if the
      // account already exists from a prior attempt.
      if (err instanceof ApiError && (err.status === 400 || err.status === 500)) {
        try {
          return await login(body);
        } catch {
          throw err;
        }
      }
      throw err;
    }
  }, [login]);

  const logout = useCallback(() => {
    clearSession();
    emit({ user: null, token: null, ready: true });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
