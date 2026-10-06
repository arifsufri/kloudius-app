import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '@/services/authService';
import type { User } from '@/types/user';

type AuthContextValue = {
  /** The currently logged-in user, or null when signed out. */
  user: User | null;
  /** True while the persisted session is being restored on app launch. */
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // Restore the persisted session so the user stays logged in across app restarts.
  useEffect(() => {
    authService
      .getSession()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await authService.login(email, password));
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setUser(await authService.signup(name, email, password));
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, login, signup, logout }),
    [user, isRestoring, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
