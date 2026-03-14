import apiClient from "@/api/client";
import { APIEndpoints } from "@/constants/apiEndpoint";
import { AuthState, Business, User } from "@/types";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
export const AUTH_STATE_KEY = 'auth_state'
export async function SecureStoreSave(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return;
  } 
  await SecureStore.setItemAsync(key, value);
}

export async function SecureStoreGet(key: string) {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  let result = await SecureStore.getItemAsync(key);
  return result;
}

interface AuthContextType extends AuthState {
  login: (user: User, token?: string, refreshToken? : string) => void;
  logout: () => void;
  selectBusiness: (business: Business) => void;
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  getUserRoleByTenantId: (tenantId?: string | null) => string | null;
  getCurrentBusinessRole: () => string | null;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthTokenTenant {
  tenantId: string;
  role: string;
}

interface AuthTokenPayload {
  uid?: string;
  phone?: string;
  tenants?: AuthTokenTenant[];
  iat?: number;
  exp?: number;
}


  const decodeAuthTokenPayload = (token?: string | null): AuthTokenPayload | null => {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) return null;

    try {
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');

      if (typeof globalThis.atob === 'function') {
        return JSON.parse(globalThis.atob(paddedBase64));
      }

      const BufferCtor = (globalThis as { Buffer?: { from: (value: string, encoding: string) => { toString: (enc: string) => string } } }).Buffer;
      if (BufferCtor?.from) {
        const decoded = BufferCtor.from(paddedBase64, 'base64').toString('utf8');
        return JSON.parse(decoded);
      }

      return null;
    } catch {
      return null;
    }
  };

const AttemptRefreshTokenIfNeeded = async (token: string | null, refreshToken: string | null) => {
  if (!token || !refreshToken) return null;

  const payload = decodeAuthTokenPayload(token);
  const currentTime = Math.floor(Date.now() / 1000);
  if (payload?.exp && payload.exp - currentTime < (2 * 60 * 60)) { // Consider token expiring if it's expiring in the next 2 hours or already expired
    try {
      const refreshTokenResult = await apiClient.post(APIEndpoints.auth.refreshToken, {
        refreshToken,
        userId: payload?.uid
      });
      return refreshTokenResult.data.data as { token: string; refreshToken: string };
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return null;
    }
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {

  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    currentBusiness: null,
    token: null,
    refreshToken: null,
  });

  const saveAuthState = async () => {
    await SecureStoreSave(AUTH_STATE_KEY, JSON.stringify(authState));
  };
  
  // Load auth state from secure storage on app start
  useEffect(() => {
    const loadAuthState = async () => {
      const storedState = await SecureStoreGet(AUTH_STATE_KEY);
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        setAuthState(parsedState);

        // Attempt to refresh token if it's expired or about to expire
        const refreshTokenResult = await AttemptRefreshTokenIfNeeded(parsedState.token, parsedState.refreshToken);
        if (refreshTokenResult) {
          setAuthState((prev) => ({
            ...prev,
            token: refreshTokenResult.token,
            refreshToken: refreshTokenResult.refreshToken,
          }));

          router.navigate('/auth/business-list');
        }

      }
    };
    loadAuthState();
  }, []);

  // // Set auth state in secure storage whenever it changes
  useEffect(() => {
    saveAuthState();
  }, [authState.token, authState.refreshToken, authState.isAuthenticated, authState.user, authState.currentBusiness]);

  const login = (user: User, token?:string, refreshToken?:string) => {
    setAuthState((prev) => ({
      ...prev,
      isAuthenticated: true,
      user,
      token: token || prev.token,
      refreshToken: refreshToken || prev.refreshToken,
    }));
    // saveAuthState();
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      currentBusiness: null,
      token: null,
      refreshToken: null,
    });
    // saveAuthState();
  };

  const selectBusiness = (business: Business) => {
    setAuthState((prev) => ({
      ...prev,
      currentBusiness: business,
    }));
    // saveAuthState();
  };

  const getToken = () => {
    return authState.token;
  }

  const getRefreshToken = () => {
    return authState.refreshToken;
  }

  const setToken = (token: string) => {
    setAuthState((prev) => ({
      ...prev,
      token,
    }));
  }

  const setRefreshToken = (refreshToken: string) => {
    setAuthState((prev) => ({
      ...prev,
      refreshToken,
    }));
  }


  const getUserRoleByTenantId = (tenantId?: string | null): string | null => {
    if (!tenantId) return null;
    const payload = decodeAuthTokenPayload(authState.token);
    if (!payload?.tenants?.length) return null;

    const tenant = payload.tenants.find((item) => item.tenantId === tenantId);
    return tenant?.role || null;
  };

  const getCurrentBusinessRole = (): string | null => {
    return getUserRoleByTenantId(authState.currentBusiness?.id);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        selectBusiness,
        getToken,
        getRefreshToken,
        getUserRoleByTenantId,
        getCurrentBusinessRole,
        setToken,
        setRefreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
