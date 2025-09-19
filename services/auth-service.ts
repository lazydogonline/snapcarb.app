import { supabase } from '../config/supabase';
import { config } from '../config/environment';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in: string;
  preferences?: {
    notifications_enabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    health_goals?: string[];
  };
}

export interface AuthState {
  user: UserProfile | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private authState: AuthState = {
    user: null,
    session: null,
    loading: true,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
    this.setupAuthListener();
  }

  // Initialize authentication state
  private async initializeAuth() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        this.updateState({ ...this.authState, loading: false, error: error.message });
        return;
      }

      if (session?.user) {
        await this.setUserProfile(session.user);
      }

      this.updateState({ ...this.authState, session, loading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.updateState({ ...this.authState, loading: false, error: 'Failed to initialize authentication' });
    }
  }

  // Set up auth state listener
  private setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email);
      console.log('🔐 Current auth state before update:', this.authState);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in, updating state...');
        // Update loading state immediately
        this.updateState({ ...this.authState, loading: false, session });
        await this.setUserProfile(session.user);
        await this.sendWelcomeEmail(session.user);
        console.log('✅ Auth state updated after sign in:', this.authState);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out');
        this.updateState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      } else {
        console.log('🔄 Other auth event, ensuring loading is false');
        // For other events, make sure loading is false
        this.updateState({ ...this.authState, loading: false });
      }
    });
  }

  // Google OAuth configuration
  private getGoogleAuthConfig() {
    // Use a consistent redirect URI that doesn't depend on port
    const redirectUri = 'snapcarb://auth/callback';

    console.log('🔐 Google OAuth Config:', {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
      redirectUri,
    });

    return {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    };
  }

  // Sign in with Google using Supabase OAuth (web-based)
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      this.updateState({ ...this.authState, loading: true, error: null });

      console.log('🔐 Starting Google OAuth with Supabase...');

      // Use Supabase's web OAuth - this will open in browser and redirect back
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window?.location?.origin || 'exp://localhost:8082',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('🔐 OAuth error:', error);
        throw error;
      }

      console.log('🔐 OAuth initiated successfully');
      
      // Don't set loading to false here - let the auth state listener handle it
      // when the user returns from OAuth
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Google sign-in failed';
      console.error('🔐 Google sign-in failed:', errorMessage);
      this.updateState({ ...this.authState, loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.updateState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.updateState({ ...this.authState, error: error.message });
    }
  }

  // Set user profile from Supabase user
  private async setUserProfile(supabaseUser: any) {
    try {
      // Get or create user profile
      let { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      if (!profile) {
        // Create new user profile
        const newProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0],
          avatar_url: supabaseUser.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          last_sign_in: new Date().toISOString(),
          preferences: {
            notifications_enabled: true,
            theme: 'auto',
            health_goals: [],
          },
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('users')
          .insert([newProfile])
          .select()
          .single();

        if (createError) throw createError;
        profile = createdProfile;
      } else {
        // Update last sign in
        await supabase
          .from('users')
          .update({ last_sign_in: new Date().toISOString() })
          .eq('id', supabaseUser.id);
      }

      this.updateState({
        ...this.authState,
        user: profile,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error setting user profile:', error);
      this.updateState({ ...this.authState, error: error.message });
    }
  }

  // Send welcome email via Resend
  private async sendWelcomeEmail(user: any): Promise<void> {
    try {
      const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
      if (!resendApiKey) {
        console.warn('Resend API key not configured, skipping welcome email');
        return;
      }

      const welcomeEmail = {
        from: 'welcome@snapcarb.com',
        to: user.email,
        subject: 'Welcome to SnapCarb! 🎉 Your Health Journey Starts Now',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to SnapCarb!</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .highlight { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
              .cta { background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to SnapCarb!</h1>
                <p>Your body is the only place you have to live</p>
              </div>
              
              <div class="content">
                <h2>Hey there, ${user.user_metadata?.full_name || 'Health Warrior'}!</h2>
                
                <p>Welcome to SnapCarb - where we believe that taking care of your body isn't just about looking good, it's about <strong>living well</strong>.</p>
                
                <div class="highlight">
                  <strong>💡 Remember:</strong> Your body is the only place you have to live. There isn't another option if it no longer works as it should, and really, who wants to be an old sick person stuck in a bed or hospital?
                </div>
                
                <h3>🚀 What You Can Do Right Now:</h3>
                <ul>
                  <li><strong>Track Your Nutrition</strong> - Monitor net carbs and make informed food choices</li>
                  <li><strong>Build Healthy Recipes</strong> - Create delicious, SnapCarb-compliant meals</li>
                  <li><strong>Join Challenges</strong> - Take on our 10-day detox challenges</li>
                  <li><strong>Monitor Health Markers</strong> - Track your progress toward optimal health</li>
                  <li><strong>Shop Smart</strong> - Access quality products and supplements</li>
                </ul>
                
                <h3>🎯 Your Health Journey Starts Here</h3>
                <p>Every meal, every choice, every day is an opportunity to invest in the only body you'll ever have. Let's make those investments count!</p>
                
                <a href="snapcarb://open" class="cta">Open SnapCarb App</a>
                
                <p><em>Here's to your health, vitality, and the amazing journey ahead!</em></p>
                
                <p>Best regards,<br>The SnapCarb Team</p>
              </div>
              
              <div class="footer">
                <p>© 2025 SnapCarb. All rights reserved.</p>
                <p>Questions? Contact us at support@snapcarb.com</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(welcomeEmail),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to send welcome email:', error);
      } else {
        console.log('Welcome email sent successfully');
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserProfile['preferences']>): Promise<boolean> {
    try {
      if (!this.authState.user) return false;

      const { error } = await supabase
        .from('users')
        .update({ preferences: { ...this.authState.user.preferences, ...preferences } })
        .eq('id', this.authState.user.id);

      if (error) throw error;

      // Update local state
      if (this.authState.user) {
        this.updateState({
          ...this.authState,
          user: {
            ...this.authState.user,
            preferences: { 
              notifications_enabled: preferences?.notifications_enabled ?? this.authState.user.preferences?.notifications_enabled ?? false,
              theme: preferences?.theme ?? this.authState.user.preferences?.theme ?? 'auto',
              health_goals: preferences?.health_goals ?? this.authState.user.preferences?.health_goals
            },
          },
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      this.updateState({ ...this.authState, error: error.message });
      return false;
    }
  }

  // Get current auth state
  getAuthState(): AuthState {
    return this.authState;
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Update state and notify listeners
  private updateState(newState: AuthState) {
    this.authState = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.authState.user && !!this.authState.session;
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    return this.authState.user;
  }
}

// Create singleton instance
export const authService = new AuthService();

// Types are already exported above
