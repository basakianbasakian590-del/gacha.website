import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey, setAuthTokenGetter } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { getStoredToken, storeToken } from "@/lib/token";

setAuthTokenGetter(getStoredToken);

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const hasToken = !!getStoredToken();

  const { data, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
      enabled: hasToken,
    }
  });

  useEffect(() => {
    if (data) {
      setUserState(data);
    } else if (error) {
      storeToken(null);
      setUserState(null);
    }
  }, [data, error]);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (!u) storeToken(null);
  };

  const setToken = (token: string | null) => {
    storeToken(token);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: hasToken && isLoading, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
