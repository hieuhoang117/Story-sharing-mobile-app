import { createContext, type ReactNode, useContext, useState } from 'react';

type AuthContextType = {
  token: string | null;
  isLoggedIn: boolean;
  setToken: (token: string) => void;
  logout: () => void;
};

const TOKEN_KEY = 'adminToken';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));

  const setToken = (value: string) => {
    localStorage.setItem(TOKEN_KEY, value);
    setTokenState(value);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setTokenState(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn: Boolean(token), setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}