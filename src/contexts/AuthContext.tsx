import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  email: string;
  role: string;
  mustChangePassword: boolean;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isSuperAdmin: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser({ 
              email: data.email, 
              role: data.role, 
              mustChangePassword: data.mustChangePassword 
            });
            setIsAdmin(true);
            setIsSuperAdmin(data.role === 'super_admin');
          } else {
            localStorage.removeItem('token');
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      setUser({ 
        email: data.email, 
        role: data.role, 
        mustChangePassword: data.mustChangePassword 
      });
      setIsAdmin(true);
      setIsSuperAdmin(data.role === 'super_admin');
    } catch (error) {
      console.error('Error signing in', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, loading, login, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
