import { createClient } from '@supabase/supabase-js';
import { config } from './environment';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database table names
export const TABLES = {
  USERS: 'users',
  MEALS: 'meals',
  SUPPLEMENTS: 'supplements',
  CHALLENGE_DAYS: 'challenge_days',
  EVENTS: 'events',
  COMMUNITY_POSTS: 'community_posts',
  RECIPES: 'recipes',
  FASTING_SESSIONS: 'fasting_sessions',
} as const;

// Storage bucket names
export const STORAGE_BUCKETS = {
  MEAL_PHOTOS: 'meal-photos',
  PROFILE_PHOTOS: 'profile-photos',
  RECIPE_IMAGES: 'recipe-images',
} as const;

export default supabase;



