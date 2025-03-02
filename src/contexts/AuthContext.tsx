import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/models/types';
import { getUserByEmail, verifyPassword } from '@/services/userService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const user = await getUserByEmail(email);
      
      if (!user) {
        setError('Invalid email or password');
        setLoading(false);
        return false;
      }
      
      const isValid = await verifyPassword(user, password);
      
      if (!isValid) {
        setError('Invalid email or password');
        setLoading(false);
        return false;
      }
      
      // Remove password hash before storing in state/localStorage
      const { password_hash, ...safeUser } = user;
      setUser(safeUser as User);
      localStorage.setItem('user', JSON.stringify(safeUser));
      
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 