import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { createContext, useContext, ReactNode } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, error } = useGetMe({ query: { retry: false } });

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, error: error as Error | null }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
