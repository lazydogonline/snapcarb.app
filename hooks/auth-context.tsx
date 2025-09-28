import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, UserProfile } from '../services/auth-service';

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<boolean>;
  isAuthenticated: () => boolean;
  getCurrentUser: () => UserProfile | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(authService.getAuthState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe(setAuthState);
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const updatePreferences = async (preferences: Partial<UserProfile['preferences']>) => {
    return await authService.updatePreferences(preferences);
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const getCurrentUser = () => {
    return authService.getCurrentUser();
  };

  const value: AuthContextType = {
    ...authState,
    signInWithGoogle,
    signOut,
    updatePreferences,
    isAuthenticated,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
