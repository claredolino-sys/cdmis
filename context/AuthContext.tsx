
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authenticateUser } from '../services/mockApi';
import { authenticateUser as authenticateUserSupabase } from '../services/supabaseApi';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  login: (userId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Safe access to environment variables
  const env = (import.meta as any)?.env || {};
  const isUsingSupabase = !!(env.VITE_SUPABASE_URL);

  const login = useCallback(async (userId: string, password: string): Promise<boolean> => {
    let user: User | null = null;

    if (isUsingSupabase) {
        // Use Supabase backend
        user = await authenticateUserSupabase(userId, password);
    } else {
        // Use Mock Data
        user = authenticateUser(userId, password);
    }
    
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [isUsingSupabase]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!currentUser, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
