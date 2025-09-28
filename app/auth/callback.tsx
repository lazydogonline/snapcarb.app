import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../config/supabase';

export default function AuthCallback() {
  const router = useRouter();

  console.log('🔄 AuthCallback - Component mounted');
  console.log('🔄 AuthCallback - Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');
  console.log('🔄 AuthCallback - URL search params:', typeof window !== 'undefined' ? window.location.search : 'N/A');
  console.log('🔄 AuthCallback - URL hash:', typeof window !== 'undefined' ? window.location.hash : 'N/A');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 AuthCallback - Processing OAuth callback...');
        
        // Wait a moment for Supabase to process the OAuth response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if session is established
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ AuthCallback - Session error:', error);
          router.replace('/login');
          return;
        }
        
        if (session?.user) {
          console.log('✅ AuthCallback - User authenticated, redirecting to tabs');
          router.replace('/(tabs)');
        } else {
          console.log('🚪 AuthCallback - No session, redirecting to login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('💥 AuthCallback - Error:', error);
        router.replace('/login');
      }
    };

    // Process with a small delay to ensure OAuth is complete
    const timer = setTimeout(handleAuthCallback, 500);
    
    // Fallback timeout - if nothing happens in 10 seconds, go to login
    const fallbackTimer = setTimeout(() => {
      console.log('⏰ AuthCallback - Timeout, redirecting to login');
      router.replace('/login');
    }, 10000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={{ marginTop: 20, fontSize: 16 }}>Completing sign in...</Text>
    </View>
  );
}
