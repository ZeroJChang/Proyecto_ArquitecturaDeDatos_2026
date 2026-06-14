import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { AuthUser, LoginRequest, LoginResponse } from '../interfaces/Auth';
import { getToken, getUser, removeToken, removeUser, setToken, setUser } from '../utils/auth-storage.util';
import { API_URL, URLS } from '../constants/urls';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setUserState(storedUser);
    } else {
      setUserState(null);
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const fullUrl =
      process.env.NODE_ENV === 'production'
        ? `/api${URLS.AUTH_LOGIN}`
        : `${API_URL}${URLS.AUTH_LOGIN}`;

    const response = await axios.post<LoginResponse>(fullUrl, credentials);
    const { accessToken, user: loggedUser } = response.data;

    setToken(accessToken);
    setUser(loggedUser);
    setUserState(loggedUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    removeUser();
    setUserState(null);
  }, []);

  const isAuthenticated = user !== null && getToken() !== null;

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated, login, logout }),
    [user, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
