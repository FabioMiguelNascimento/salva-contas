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

// Margem de 5 minutos para renovar o token antes de expirar
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

  // Função para salvar os tokens no localStorage
  const saveTokens = useCallback((accessToken: string, refreshToken: string, expiresAt: number, user: User) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }, []);

  // Função para limpar os tokens
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

  // Função para renovar o token
  const doRefreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;
    
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) return;

    isRefreshingRef.current = true;
    
    try {
      const response = await authService.refreshToken({ refreshToken: storedRefreshToken });
      
      // Buscar dados do usuário atualizados
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

      // Agendar próxima renovação
      scheduleTokenRefresh(response.expiresAt);
    } catch {
      // Refresh falhou, desloga o usuário
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

  // Função para agendar a renovação do token
  const scheduleTokenRefresh = useCallback((expiresAt: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Date.now();
    const expiresAtMs = expiresAt * 1000; // Converter de segundos para ms
    const refreshAt = expiresAtMs - TOKEN_REFRESH_MARGIN;
    const delay = Math.max(refreshAt - now, 0);

    if (delay > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        doRefreshToken();
      }, delay);
    } else {
      // Token já expirou ou está prestes a expirar, renova imediatamente
      doRefreshToken();
    }
  }, [doRefreshToken]);

  // Configura o interceptor do axios para incluir o token e tratar 401
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
        
        // Se receber 401 e não é uma requisição de refresh, tenta renovar
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
              
              // Atualiza o header e retenta a requisição
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              isRefreshingRef.current = false;
              
              // Agendar próxima renovação
              scheduleTokenRefresh(response.expiresAt);
              
              return apiClient(originalRequest);
            } catch {
              isRefreshingRef.current = false;
            }
          }
          
          // Refresh falhou ou não há refresh token, desloga
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

  // Carrega o token do localStorage na inicialização
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
          
          // Se o token expirou, tenta renovar
          if (expiresAtMs <= now) {
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
            } catch {
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
            // Token ainda válido, valida com /me
            try {
              const user = await authService.getMe();
              localStorage.setItem(USER_KEY, JSON.stringify(user));
              
              setState({
                user,
                token: storedToken,
                refreshToken: storedRefreshToken,
                expiresAt,
                isAuthenticated: true,
                isLoading: false,
              });
              
              scheduleTokenRefresh(expiresAt);
            } catch {
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
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
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
    
    // Se session é null, precisa confirmar email
    if (response.session === null) {
      return { needsEmailConfirmation: true };
    }
    
    // Se tiver session (raro, mas pode acontecer se confirmação estiver desabilitada)
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
