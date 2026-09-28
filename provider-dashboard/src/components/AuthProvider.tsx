'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  name: string;
  email: string;
  avatar: string;
  role: string;
  verified: boolean;
  online: boolean;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleOnline: () => void;
}

const DEFAULT_USER: User = {
  name: 'Ahmed Khan',
  email: 'ahmed@example.com',
  avatar: 'AK',
  role: 'Auto Mechanic',
  verified: true,
  online: true,
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
  toggleOnline: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_USER);
  const router = useRouter();

  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    setUser({ ...DEFAULT_USER, email });
    return true;
  };

  const logout = () => {
    setUser(null);
    router.push('/login');
  };

  const toggleOnline = () => {
    setUser(u => u ? { ...u, online: !u.online } : u);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      toggleOnline,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
