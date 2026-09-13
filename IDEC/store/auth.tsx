import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler } from '@/api/client';
import { loginRequest, logoutRequest, meRequest } from '@/api/logistics';
import { clearToken, getToken, saveToken } from '@/services/secureToken';
import { AuthUser } from '@/types';

type AuthContextValue = {
  user: AuthUser | null;
  bootstrapping: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Token may already be invalid.
    }
    await clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const current = await meRequest();
        if (mounted) setUser(current);
      } catch {
        await clearToken();
        if (mounted) setUser(null);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    await saveToken(result.token);
    setUser(result.user);
  }, []);

  const value = useMemo(
    () => ({ user, bootstrapping, login, logout }),
    [user, bootstrapping, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
