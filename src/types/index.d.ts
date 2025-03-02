/// <reference path="./global.d.ts" />
/// <reference path="./modules.d.ts" />
/// <reference path="./components.d.ts" />

// Re-export AuthContext types to ensure they're available
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