-- SnapCarb Health Companion - Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  age INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  goals TEXT[],
  dietary_restrictions TEXT[],
  fasting_window INTEGER DEFAULT 16,
  eating_window INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meals table
CREATE TABLE public.meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  net_carbs DECIMAL(6,2) NOT NULL,
  total_carbs DECIMAL(6,2),
  fiber DECIMAL(6,2),
  protein DECIMAL(6,2),
  fat DECIMAL(6,2),
  calories INTEGER,
  ingredients TEXT[],
  photo_url TEXT,
  ai_analysis TEXT,
  compliance_score INTEGER CHECK (compliance_score >= 1 AND compliance_score <= 10),
  has_disallowed_foods BOOLEAN DEFAULT FALSE,
  disallowed_foods TEXT[],
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplements table
CREATE TABLE public.supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  recommended_form TEXT,
  timing TEXT,
  target_blood_level TEXT,
  taken BOOLEAN DEFAULT FALSE,
  taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge days table
CREATE TABLE public.challenge_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  day INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  meals_logged INTEGER DEFAULT 0,
  symptoms_noted BOOLEAN DEFAULT FALSE,
  symptoms TEXT[],
  notes TEXT,
  net_carbs_total DECIMAL(6,2),
  adherence_score INTEGER,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'fair', 'poor')),
  energy TEXT CHECK (energy IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT DEFAULT '1 hour',
  type TEXT CHECK (type IN ('webinar', 'workshop', 'challenge', 'meetup', 'consultation', 'course')) DEFAULT 'webinar',
  category TEXT DEFAULT 'general',
  link TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  price TEXT,
  benefits TEXT[],
  status TEXT CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')) DEFAULT 'upcoming',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community posts table
CREATE TABLE public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('story', 'progress', 'question', 'tip', 'challenge')) DEFAULT 'story',
  tags TEXT[],
  likes UUID[],
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table (separate from posts for better structure)
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table (enhanced for AI-generated SnapCarb recipes)
CREATE TABLE public.recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  total_time INTEGER, -- in minutes
  servings INTEGER,
  net_carbs DECIMAL(6,2) NOT NULL,
  fiber DECIMAL(6,2),
  protein DECIMAL(6,2),
  fat DECIMAL(6,2),
  calories INTEGER,
  ingredients JSONB, -- Store as JSON for flexibility
  instructions TEXT[],
  tags TEXT[],
  source TEXT DEFAULT 'SnapCarb Chef Collection',
  compliance_score INTEGER CHECK (compliance_score >= 1 AND compliance_score <= 10),
  author_id UUID REFERENCES public.users(id),
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_model TEXT DEFAULT 'gemini-1.5-flash',
  cool_facts JSONB, -- Store cool facts as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User recipe collections table
CREATE TABLE public.user_recipe_collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cooked_count INTEGER DEFAULT 0,
  last_cooked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Recipe categories table
CREATE TABLE public.recipe_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe category assignments
CREATE TABLE public.recipe_category_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.recipe_categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, category_id)
);

-- Fasting sessions table
CREATE TABLE public.fasting_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration DECIMAL(5,2), -- in hours
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  mood TEXT,
  energy TEXT,
  hunger TEXT CHECK (hunger IN ('none', 'mild', 'moderate', 'strong')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Meals policies
CREATE POLICY "Users can manage own meals" ON public.meals
  FOR ALL USING (auth.uid() = user_id);

-- Supplements policies
CREATE POLICY "Users can manage own supplements" ON public.supplements
  FOR ALL USING (auth.uid() = user_id);

-- Challenge days policies
CREATE POLICY "Users can manage own challenge days" ON public.challenge_days
  FOR ALL USING (auth.uid() = user_id);

-- Events are public for reading
CREATE POLICY "Anyone can view events" ON public.events
  FOR SELECT USING (true);

-- Only authenticated users can create events
CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Community posts policies
CREATE POLICY "Anyone can view community posts" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Anyone can view approved recipes" ON public.recipes
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can create recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.recipes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);

-- User recipe collections policies
CREATE POLICY "Users can manage own recipe collections" ON public.user_recipe_collections
  FOR ALL USING (auth.uid() = user_id);

-- Recipe categories are public for reading
CREATE POLICY "Anyone can view recipe categories" ON public.recipe_categories
  FOR SELECT USING (true);

-- Recipe category assignments policies
CREATE POLICY "Users can view recipe category assignments" ON public.recipe_category_assignments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create category assignments" ON public.recipe_category_assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fasting sessions policies
CREATE POLICY "Users can manage own fasting sessions" ON public.fasting_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_meals_user_id_timestamp ON public.meals(user_id, timestamp);
CREATE INDEX idx_supplements_user_id ON public.supplements(user_id);
CREATE INDEX idx_challenge_days_user_id_date ON public.challenge_days(user_id, date);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at);
CREATE INDEX idx_recipes_net_carbs ON public.recipes(net_carbs);
CREATE INDEX idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX idx_recipes_ai_generated ON public.recipes(is_ai_generated);
CREATE INDEX idx_user_recipe_collections_user_id ON public.user_recipe_collections(user_id);
CREATE INDEX idx_user_recipe_collections_recipe_id ON public.user_recipe_collections(recipe_id);
CREATE INDEX idx_recipe_category_assignments_recipe_id ON public.recipe_category_assignments(recipe_id);
CREATE INDEX idx_fasting_sessions_user_id_active ON public.fasting_sessions(user_id, is_active);

-- Insert sample recipe categories
INSERT INTO public.recipe_categories (name, description, icon, color) VALUES
('Breakfast', 'Morning meals to start your day', 'sunrise', '#FFD700'),
('Lunch', 'Midday nourishment', 'sun', '#FFA500'),
('Dinner', 'Evening feasts', 'moon', '#4169E1'),
('Snacks', 'Quick bites and treats', 'coffee', '#32CD32'),
('Fermented Foods', 'Gut-healthy probiotic recipes', 'leaf', '#8FBC8F'),
('High Protein', 'Muscle-building meals', 'zap', '#FF6347'),
('Low Carb', 'SnapCarb approved', 'target', '#9370DB'),
('Quick Meals', 'Under 30 minutes', 'clock', '#20B2AA'),
('Gourmet', 'Restaurant-quality dishes', 'star', '#FF69B4'),
('Budget Friendly', 'Affordable ingredients', 'dollar-sign', '#90EE90');

-- Functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();



