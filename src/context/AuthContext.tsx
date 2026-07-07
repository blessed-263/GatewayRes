import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { findDemoUser } from "@/data/demoUsers";
import type { AuthSession, UserRole } from "@/types/auth";

const AUTH_KEY = "gateway-auth-session";

interface AuthContextValue {
  user: AuthSession | null;
  isReady: boolean;
  login: (username: string, password: string) => boolean;
  loginAs: (session: AuthSession) => void;
  logout: () => void;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setUser(loadSession());
    setIsReady(true);
  }, []);

  const persist = useCallback((session: AuthSession | null) => {
    if (session) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
    setUser(session);
  }, []);

  const login = useCallback(
    (username: string, password: string) => {
      const match = findDemoUser(username, password);
      if (!match) return false;
      const session: AuthSession = {
        userId: match.id,
        username: match.username,
        name: match.name,
        role: match.role,
        assigneeName: match.assigneeName,
      };
      persist(session);
      return true;
    },
    [persist]
  );

  const loginAs = useCallback(
    (session: AuthSession) => {
      persist(session);
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const isRole = useCallback(
    (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const value = useMemo(
    () => ({ user, isReady, login, loginAs, logout, isRole }),
    [user, isReady, login, loginAs, logout, isRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
