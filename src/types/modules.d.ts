// External libraries
declare module 'date-fns';
declare module 'bcryptjs';
declare module 'sqlite' {
  export interface Database {
    get<T>(sql: string, params?: any[]): Promise<T | undefined>;
    all<T>(sql: string, params?: any[]): Promise<T[]>;
    run(sql: string, params?: any[]): Promise<any>;
    exec(sql: string): Promise<void>;
    close(): Promise<void>;
  }
}
declare module 'sqlite3';
declare module 'react-dom';
declare module 'react-dom/client';

// Context modules
declare module '@/contexts/AuthContext' {
  import { User } from '@/models/types';
  
  export interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
  }
  
  export function useAuth(): AuthContextType;
}

declare module '@/contexts/ThemeContext' {
  export type ThemeType = 'light' | 'dark';
  
  export interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
  }
  
  export function useTheme(): ThemeContextType;
} 