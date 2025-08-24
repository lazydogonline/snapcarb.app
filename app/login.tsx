import React from 'react';
import { LoginScreen } from '@/components/LoginScreen';
import { AuthGuard } from '@/components/AuthGuard';

export default function LoginPage() {
  return (
    <AuthGuard requireAuth={false} redirectTo="/">
      <LoginScreen />
    </AuthGuard>
  );
}
