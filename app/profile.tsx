import React from 'react';
import { UserProfile } from '@/components/UserProfile';
import { AuthGuard } from '@/components/AuthGuard';

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/login">
      <UserProfile />
    </AuthGuard>
  );
}
