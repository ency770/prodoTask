// Auth context types
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

// Theme context types
declare module '@/contexts/ThemeContext' {
  export type ThemeType = 'light' | 'dark';
  
  export interface ThemeContextType {
    theme: ThemeType;
    toggleTheme: () => void;
  }
  
  export function useTheme(): ThemeContextType;
} 