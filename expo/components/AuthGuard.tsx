import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/auth-context';
import { colors } from '../constants/colors';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Add a small delay to ensure router is ready
      setTimeout(() => {
        if (requireAuth && !user) {
          // User is not authenticated and auth is required
          router.replace(redirectTo as any);
        } else if (!requireAuth && user) {
          // User is authenticated but auth is not required (e.g., login page)
          router.replace('/');
        }
      }, 100);
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // If auth is required and user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If auth is not required and user is authenticated, don't render children
  if (!requireAuth && user) {
    return null;
  }

  // Render children when authentication state matches requirements
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AuthGuard;
