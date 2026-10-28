import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { User } from "../types/user.types";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  fetchCurrentUser,
  refreshSession,
} from "../services/auth.service";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On first load, there's no access token in memory yet (it's never
  // persisted to storage), so try the httpOnly refresh cookie to restore
  // the session silently before rendering anything auth-dependent.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        await refreshSession();
        const currentUser = await fetchCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await loginRequest({ email, password });
    setUser(loggedInUser);
  }, []);

  const register = useCallback(
    async (input: { firstName: string; lastName: string; email: string; password: string }) => {
      const newUser = await registerRequest(input);
      setUser(newUser);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}