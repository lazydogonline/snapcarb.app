-- SnapCarb Recipes Schema
-- This schema supports AI-generated recipes with save, share, and print functionality

-- Enhanced recipes table for AI-generated recipes
CREATE TABLE IF NOT EXISTS public.recipes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  total_time INTEGER, -- in minutes
  servings INTEGER DEFAULT 1,
  net_carbs DECIMAL(6,2), -- net carbs per serving
  fiber DECIMAL(6,2),
  protein DECIMAL(6,2),
  fat DECIMAL(6,2),
  calories INTEGER,
  ingredients TEXT[], -- array of ingredient strings
  instructions TEXT[], -- array of instruction steps
  tags TEXT[], -- array of tags
  source TEXT DEFAULT 'ai-generated',
  is_ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT,
  cool_facts TEXT[],
  compliance_score INTEGER CHECK (compliance_score >= 1 AND compliance_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User recipe collections (favorites, notes, ratings)
CREATE TABLE IF NOT EXISTS public.user_recipe_collections (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id BIGINT REFERENCES public.recipes(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  cooked_count INTEGER DEFAULT 0,
  last_cooked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Recipe categories for organization
CREATE TABLE IF NOT EXISTS public.recipe_categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe-category relationships
CREATE TABLE IF NOT EXISTS public.recipe_category_relations (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES public.recipes(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES public.recipe_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, category_id)
);

-- Recipe sharing and social features
CREATE TABLE IF NOT EXISTS public.recipe_shares (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES public.recipes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_type TEXT CHECK (share_type IN ('direct', 'public', 'social')),
  share_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe analytics and engagement
CREATE TABLE IF NOT EXISTS public.recipe_analytics (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES public.recipes(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  prints INTEGER DEFAULT 0,
  last_viewed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON public.recipes USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_recipes_description ON public.recipes USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON public.recipes USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_net_carbs ON public.recipes(net_carbs);
CREATE INDEX IF NOT EXISTS idx_recipes_compliance_score ON public.recipes(compliance_score);
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON public.recipes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_recipe_collections_user_id ON public.user_recipe_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_collections_recipe_id ON public.user_recipe_collections(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_recipe_collections_favorite ON public.user_recipe_collections(is_favorite);

CREATE INDEX IF NOT EXISTS idx_recipe_shares_recipe_id ON public.recipe_shares(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_by ON public.recipe_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_recipe_shares_shared_with ON public.recipe_shares(shared_with);

CREATE INDEX IF NOT EXISTS idx_recipe_analytics_recipe_id ON public.recipe_analytics(recipe_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Users can view public recipes" ON public.recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own recipes" ON public.recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert recipes" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user recipe collections
CREATE POLICY "Users can manage their own collections" ON public.user_recipe_collections
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for recipe shares
CREATE POLICY "Users can view shared recipes" ON public.recipe_shares
  FOR SELECT USING (auth.uid() = shared_with OR auth.uid() = shared_by);

CREATE POLICY "Users can create shares" ON public.recipe_shares
  FOR INSERT WITH CHECK (auth.uid() = shared_by);

-- RLS Policies for recipe analytics
CREATE POLICY "Users can view analytics for their recipes" ON public.recipe_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.recipes 
      WHERE id = recipe_analytics.recipe_id 
      AND user_id = auth.uid()
    )
  );

-- Functions for recipe management

-- Function to create a new recipe
CREATE OR REPLACE FUNCTION create_recipe(
  p_title TEXT,
  p_description TEXT,
  p_difficulty TEXT,
  p_prep_time INTEGER,
  p_cook_time INTEGER,
  p_servings INTEGER,
  p_net_carbs DECIMAL,
  p_ingredients TEXT[],
  p_instructions TEXT[],
  p_tags TEXT[],
  p_compliance_score INTEGER
) RETURNS BIGINT AS $$
DECLARE
  recipe_id BIGINT;
BEGIN
  INSERT INTO public.recipes (
    user_id,
    title,
    description,
    difficulty,
    prep_time,
    cook_time,
    total_time,
    servings,
    net_carbs,
    ingredients,
    instructions,
    tags,
    compliance_score,
    is_ai_generated,
    ai_model
  ) VALUES (
    auth.uid(),
    p_title,
    p_description,
    p_difficulty,
    p_prep_time,
    p_cook_time,
    COALESCE(p_prep_time, 0) + COALESCE(p_cook_time, 0),
    p_servings,
    p_net_carbs,
    p_ingredients,
    p_instructions,
    p_tags,
    p_compliance_score,
    true,
    'gemini-1.5-flash'
  ) RETURNING id INTO recipe_id;

  -- Initialize analytics
  INSERT INTO public.recipe_analytics (recipe_id) VALUES (recipe_id);

  RETURN recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add recipe to user collection
CREATE OR REPLACE FUNCTION add_recipe_to_collection(
  p_recipe_id BIGINT,
  p_is_favorite BOOLEAN DEFAULT false,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_recipe_collections (
    user_id,
    recipe_id,
    is_favorite,
    notes
  ) VALUES (
    auth.uid(),
    p_recipe_id,
    p_is_favorite,
    p_notes
  )
  ON CONFLICT (user_id, recipe_id) 
  DO UPDATE SET 
    is_favorite = EXCLUDED.is_favorite,
    notes = EXCLUDED.notes,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment recipe analytics
CREATE OR REPLACE FUNCTION increment_recipe_analytics(
  p_recipe_id BIGINT,
  p_action TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE public.recipe_analytics
  SET 
    views = CASE WHEN p_action = 'view' THEN views + 1 ELSE views END,
    saves = CASE WHEN p_action = 'save' THEN saves + 1 ELSE saves END,
    shares = CASE WHEN p_action = 'share' THEN shares + 1 ELSE shares END,
    prints = CASE WHEN p_action = 'print' THEN prints + 1 ELSE prints END,
    last_viewed = CASE WHEN p_action = 'view' THEN NOW() ELSE last_viewed END,
    updated_at = NOW()
  WHERE recipe_id = p_recipe_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's recipe collection
CREATE OR REPLACE FUNCTION get_user_recipe_collection()
RETURNS TABLE(
  recipe_id BIGINT,
  title TEXT,
  description TEXT,
  difficulty TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  net_carbs DECIMAL,
  is_favorite BOOLEAN,
  notes TEXT,
  rating INTEGER,
  cooked_count INTEGER,
  last_cooked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.difficulty,
    r.prep_time,
    r.cook_time,
    r.servings,
    r.net_carbs,
    urc.is_favorite,
    urc.notes,
    urc.rating,
    urc.cooked_count,
    urc.last_cooked,
    r.created_at
  FROM public.recipes r
  JOIN public.user_recipe_collections urc ON r.id = urc.recipe_id
  WHERE urc.user_id = auth.uid()
  ORDER BY urc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.recipes TO anon, authenticated;
GRANT ALL ON public.user_recipe_collections TO anon, authenticated;
GRANT ALL ON public.recipe_categories TO anon, authenticated;
GRANT ALL ON public.recipe_category_relations TO anon, authenticated;
GRANT ALL ON public.recipe_shares TO anon, authenticated;
GRANT ALL ON public.recipe_analytics TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert default recipe categories
INSERT INTO public.recipe_categories (name, description, icon, color) VALUES
  ('Breakfast', 'Morning meals to start your day', '🌅', '#FF6B6B'),
  ('Lunch', 'Midday meals for energy', '☀️', '#4ECDC4'),
  ('Dinner', 'Evening meals to end your day', '🌙', '#45B7D1'),
  ('Snacks', 'Quick bites between meals', '🍎', '#96CEB4'),
  ('Desserts', 'Sweet treats (SnapCarb approved)', '🍰', '#FFEAA7'),
  ('Fermented', 'Gut-healthy fermented foods', '🥬', '#DDA0DD'),
  ('High-Protein', 'Protein-rich meals', '💪', '#98D8C8'),
  ('Low-Carb', 'Carb-conscious meals', '🥗', '#F7DC6F')
ON CONFLICT (name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.recipes IS 'AI-generated and user-created recipes with full nutrition data';
COMMENT ON TABLE public.user_recipe_collections IS 'User recipe collections with favorites, notes, and ratings';
COMMENT ON TABLE public.recipe_categories IS 'Recipe categories for organization';
COMMENT ON TABLE public.recipe_shares IS 'Recipe sharing between users';
COMMENT ON TABLE public.recipe_analytics IS 'Recipe engagement and usage analytics';
