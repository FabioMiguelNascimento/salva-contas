"use client";

import { apiClient } from "@/lib/api-client";
import * as authService from "@/services/auth";
import type { AuthState, LoginPayload, RegisterPayload, User } from "@/types/auth";
import { useRouter } from "next/navigation";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

const TOKEN_KEY = "salva_contas_token";
const REFRESH_TOKEN_KEY = "salva_contas_refresh_token";
const USER_KEY = "salva_contas_user";
const EXPIRES_AT_KEY = "salva_contas_expires_at";

const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000;

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => void;
  updateUser: (user: User) => void;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const saveTokens = useCallback((accessToken: string, refreshToken: string, expiresAt: number, user: User) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(USER_KEY);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const doRefreshToken = useCallback(async () => {
    if (isRefreshingRef.current) {
      console.log('Refresh already in progress, skipping...');
      return;
    }
    
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      console.log('No refresh token found, cannot refresh');
      return;
    }

    console.log('Starting token refresh...');
    isRefreshingRef.current = true;
    
    try {
      const response = await authService.refreshToken({ refreshToken: storedRefreshToken });
      
      const user = await authService.getMe();
      
      saveTokens(response.accessToken, response.refreshToken, response.expiresAt, user);
      
      setState((prev) => ({
        ...prev,
        user,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
        isAuthenticated: true,
      }));

      scheduleTokenRefresh(response.expiresAt);
      console.log('Token refresh completed successfully');
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      setState({
        user: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
        isAuthenticated: false,
        isLoading: false,
      });
      router.push("/login");
    } finally {
      isRefreshingRef.current = false;
    }
  }, [clearTokens, router, saveTokens]);

  const scheduleTokenRefresh = useCallback((expiresAt: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const expiresAtMs = expiresAt * 1000;
    const refreshAt = expiresAtMs - TOKEN_REFRESH_MARGIN;
    const delay = Math.max(refreshAt - now, 0);

    if (delay > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        doRefreshToken();
      }, delay);
    } else {
      doRefreshToken();
    }
  }, [doRefreshToken]);

  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error?.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          if (storedRefreshToken && !isRefreshingRef.current) {
            try {
              isRefreshingRef.current = true;
              const response = await authService.refreshToken({ refreshToken: storedRefreshToken });
              
              localStorage.setItem(TOKEN_KEY, response.accessToken);
              localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
              localStorage.setItem(EXPIRES_AT_KEY, response.expiresAt.toString());
              
              const user = await authService.getMe();
              localStorage.setItem(USER_KEY, JSON.stringify(user));
              
              setState((prev) => ({
                ...prev,
                user,
                token: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt,
                isAuthenticated: true,
              }));
              
              scheduleTokenRefresh(response.expiresAt);
              
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              isRefreshingRef.current = false;
              
              return apiClient(originalRequest);
            } catch (refreshError) {
              console.error('Refresh token failed:', refreshError);
              isRefreshingRef.current = false;
              
              clearTokens();
              setState({
                user: null,
                token: null,
                refreshToken: null,
                expiresAt: null,
                isAuthenticated: false,
                isLoading: false,
              });
              router.push("/login");
              return Promise.reject(error);
            }
          }
          
          clearTokens();
          setState({
            user: null,
            token: null,
            refreshToken: null,
            expiresAt: null,
            isAuthenticated: false,
            isLoading: false,
          });
          router.push("/login");
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, [clearTokens, router, scheduleTokenRefresh]);

  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const storedExpiresAt = localStorage.getItem(EXPIRES_AT_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedRefreshToken && storedUser) {
          const expiresAt = storedExpiresAt ? parseInt(storedExpiresAt, 10) : 0;
          const now = Date.now();
          const expiresAtMs = expiresAt * 1000;
          
          if (expiresAtMs - TOKEN_REFRESH_MARGIN <= now) {
            console.log('Token expired or expiring soon, attempting refresh...');
            try {
              const response = await authService.refreshToken({ refreshToken: storedRefreshToken });
              const user = await authService.getMe();
              
              saveTokens(response.accessToken, response.refreshToken, response.expiresAt, user);
              
              setState({
                user,
                token: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt,
                isAuthenticated: true,
                isLoading: false,
              });
              
              scheduleTokenRefresh(response.expiresAt);
              console.log('Token refreshed successfully');
            } catch (refreshError) {
              console.error('Failed to refresh token on app load:', refreshError);
              clearTokens();
              setState({
                user: null,
                token: null,
                refreshToken: null,
                expiresAt: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          } else {
            console.log('Token still valid, validating with /me...');
            try {
              const user = JSON.parse(storedUser);
              
              setState({
                user,
                token: storedToken,
                refreshToken: storedRefreshToken,
                expiresAt,
                isAuthenticated: true,
                isLoading: false,
              });
              
              scheduleTokenRefresh(expiresAt);
              console.log('Token validated successfully');
            } catch (meError) {
              console.error('Failed to validate token with /me:', meError);
              clearTokens();
              setState({
                user: null,
                token: null,
                refreshToken: null,
                expiresAt: null,
                isAuthenticated: false,
                isLoading: false,
              });
            }
          }
        } else {
          console.log('No stored auth data found');
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [clearTokens, saveTokens, scheduleTokenRefresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    
    const user: User = {
      id: response.user.id,
      email: response.user.email,
      name: response.user.user_metadata?.name,
    };
    
    saveTokens(response.accessToken, response.refreshToken, response.expiresAt, user);
    
    setState({
      user,
      token: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: response.expiresAt,
      isAuthenticated: true,
      isLoading: false,
    });
    
    scheduleTokenRefresh(response.expiresAt);
  }, [saveTokens, scheduleTokenRefresh]);

  const register = useCallback(async (payload: RegisterPayload): Promise<{ needsEmailConfirmation: boolean }> => {
    const response = await authService.signup(payload);
    
    if (response.session === null) {
      return { needsEmailConfirmation: true };
    }
    
    return { needsEmailConfirmation: false };
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    clearTokens();
    
    setState({
      user: null,
      token: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });
    
    router.push("/login");
  }, [clearTokens, router]);

  const updateUser = useCallback((user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authService.forgotPassword({ email });
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    await authService.updatePassword({ password });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      updateUser,
      forgotPassword,
      updatePassword,
    }),
    [state, login, register, logout, updateUser, forgotPassword, updatePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
