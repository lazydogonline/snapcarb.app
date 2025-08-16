-- USDA Food Database Tables for SnapCarb
-- These tables will store downloaded USDA data to eliminate API limits

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USDA Foundation Foods table (core nutritional data)
CREATE TABLE public.usda_foundation_foods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fdc_id TEXT UNIQUE NOT NULL, -- USDA's FDC ID
  description TEXT NOT NULL,
  brand_owner TEXT,
  brand_name TEXT,
  data_type TEXT, -- 'Foundation', 'SR Legacy', 'Survey (FNDDS)', 'Experimental'
  publication_date DATE,
  all_highlight_fields TEXT,
  all_keywords TEXT,
  
  -- Core nutrients (per 100g)
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  total_carbs_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  net_carbs_g DECIMAL(8,2), -- calculated: total_carbs - fiber
  sugar_g DECIMAL(8,2),
  sodium_mg DECIMAL(8,2),
  potassium_mg DECIMAL(8,2),
  calcium_mg DECIMAL(8,2),
  iron_mg DECIMAL(8,2),
  vitamin_c_mg DECIMAL(8,2),
  vitamin_d_iu DECIMAL(8,2),
  
  -- Additional nutrients (stored as JSON for flexibility)
  additional_nutrients JSONB,
  
  -- Serving information
  serving_size DECIMAL(8,2) DEFAULT 100,
  serving_unit TEXT DEFAULT 'g',
  
  -- Metadata
  is_verified BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USDA Branded Foods table (specific products with barcodes)
CREATE TABLE public.usda_branded_foods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  fdc_id TEXT UNIQUE NOT NULL, -- USDA's FDC ID
  description TEXT NOT NULL,
  brand_owner TEXT,
  brand_name TEXT,
  gtin_upc TEXT, -- barcode
  ingredients TEXT,
  market_country TEXT,
  modified_date DATE,
  available_date DATE,
  data_source TEXT,
  
  -- Core nutrients (per 100g)
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  total_carbs_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  net_carbs_g DECIMAL(8,2), -- calculated: total_carbs - fiber
  sugar_g DECIMAL(8,2),
  sodium_mg DECIMAL(8,2),
  potassium_mg DECIMAL(8,2),
  calcium_mg DECIMAL(8,2),
  iron_mg DECIMAL(8,2),
  vitamin_c_mg DECIMAL(8,2),
  vitamin_d_iu DECIMAL(8,2),
  
  -- Additional nutrients (stored as JSON for flexibility)
  additional_nutrients JSONB,
  
  -- Serving information
  serving_size DECIMAL(8,2) DEFAULT 100,
  serving_unit TEXT DEFAULT 'g',
  
  -- Metadata
  is_verified BOOLEAN DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USDA Food Categories for better organization
CREATE TABLE public.usda_food_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES public.usda_food_categories(id),
  usda_category_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food to category assignments
CREATE TABLE public.usda_food_category_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  food_id UUID NOT NULL,
  food_type TEXT NOT NULL CHECK (food_type IN ('foundation', 'branded')),
  category_id UUID REFERENCES public.usda_food_categories(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(food_id, food_type, category_id)
);

-- Search index for fast text search
CREATE INDEX idx_usda_foundation_foods_description ON public.usda_foundation_foods USING gin(to_tsvector('english', description));
CREATE INDEX idx_usda_foundation_foods_brand ON public.usda_foundation_foods(brand_owner, brand_name);
CREATE INDEX idx_usda_foundation_foods_nutrients ON public.usda_foundation_foods(calories, protein_g, fat_g, total_carbs_g, fiber_g);

CREATE INDEX idx_usda_branded_foods_description ON public.usda_branded_foods USING gin(to_tsvector('english', description));
CREATE INDEX idx_usda_branded_foods_barcode ON public.usda_branded_foods(gtin_upc);
CREATE INDEX idx_usda_branded_foods_brand ON public.usda_branded_foods(brand_owner, brand_name);
CREATE INDEX idx_usda_branded_foods_nutrients ON public.usda_branded_foods(calories, protein_g, fat_g, total_carbs_g, fiber_g);

-- Function to calculate net carbs
CREATE OR REPLACE FUNCTION calculate_net_carbs()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_carbs_g IS NOT NULL AND NEW.fiber_g IS NOT NULL THEN
    NEW.net_carbs_g = NEW.total_carbs_g - NEW.fiber_g;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically calculate net carbs
CREATE TRIGGER calculate_net_carbs_foundation
  BEFORE INSERT OR UPDATE ON public.usda_foundation_foods
  FOR EACH ROW EXECUTE FUNCTION calculate_net_carbs();

CREATE TRIGGER calculate_net_carbs_branded
  BEFORE INSERT OR UPDATE ON public.usda_branded_foods
  FOR EACH ROW EXECUTE FUNCTION calculate_net_carbs();

-- Function to search foods efficiently
CREATE OR REPLACE FUNCTION search_usda_foods(
  search_query TEXT,
  food_type TEXT DEFAULT 'both',
  limit_count INTEGER DEFAULT 25
)
RETURNS TABLE(
  fdc_id TEXT,
  description TEXT,
  brand_owner TEXT,
  brand_name TEXT,
  food_type TEXT,
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  total_carbs_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  net_carbs_g DECIMAL(8,2),
  similarity_score FLOAT
) AS $$
BEGIN
  IF food_type = 'foundation' THEN
    RETURN QUERY
    SELECT 
      f.fdc_id,
      f.description,
      f.brand_owner,
      f.brand_name,
      'foundation'::TEXT,
      f.calories,
      f.protein_g,
      f.fat_g,
      f.total_carbs_g,
      f.fiber_g,
      f.net_carbs_g,
      similarity(f.description, search_query) as similarity_score
    FROM public.usda_foundation_foods f
    WHERE f.description ILIKE '%' || search_query || '%'
    ORDER BY similarity_score DESC, f.description
    LIMIT limit_count;
  ELSIF food_type = 'branded' THEN
    RETURN QUERY
    SELECT 
      b.fdc_id,
      b.description,
      b.brand_owner,
      b.brand_name,
      'branded'::TEXT,
      b.calories,
      b.protein_g,
      b.fat_g,
      b.total_carbs_g,
      b.fiber_g,
      b.net_carbs_g,
      similarity(b.description, search_query) as similarity_score
    FROM public.usda_branded_foods b
    WHERE b.description ILIKE '%' || search_query || '%'
    ORDER BY similarity_score DESC, b.description
    LIMIT limit_count;
  ELSE
    -- Search both tables and combine results
    RETURN QUERY
    (SELECT 
      f.fdc_id,
      f.description,
      f.brand_owner,
      f.brand_name,
      'foundation'::TEXT,
      f.calories,
      f.protein_g,
      f.fat_g,
      f.total_carbs_g,
      f.fiber_g,
      f.net_carbs_g,
      similarity(f.description, search_query) as similarity_score
    FROM public.usda_foundation_foods f
    WHERE f.description ILIKE '%' || search_query || '%'
    ORDER BY similarity_score DESC, f.description
    LIMIT limit_count / 2)
    UNION ALL
    (SELECT 
      b.fdc_id,
      b.description,
      b.brand_owner,
      b.brand_name,
      'branded'::TEXT,
      b.calories,
      b.protein_g,
      b.fat_g,
      b.total_carbs_g,
      b.fiber_g,
      b.net_carbs_g,
      similarity(b.description, search_query) as similarity_score
    FROM public.usda_branded_foods b
    WHERE b.description ILIKE '%' || search_query || '%'
    ORDER BY similarity_score DESC, b.description
    LIMIT limit_count / 2)
    ORDER BY similarity_score DESC
    LIMIT limit_count;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get nutrition by FDC ID
CREATE OR REPLACE FUNCTION get_usda_nutrition(fdc_id_param TEXT)
RETURNS TABLE(
  fdc_id TEXT,
  description TEXT,
  brand_owner TEXT,
  brand_name TEXT,
  food_type TEXT,
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  total_carbs_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  net_carbs_g DECIMAL(8,2),
  sugar_g DECIMAL(8,2),
  sodium_mg DECIMAL(8,2),
  potassium_mg DECIMAL(8,2),
  calcium_mg DECIMAL(8,2),
  iron_mg DECIMAL(8,2),
  vitamin_c_mg DECIMAL(8,2),
  vitamin_d_iu DECIMAL(8,2),
  additional_nutrients JSONB,
  serving_size DECIMAL(8,2),
  serving_unit TEXT
) AS $$
BEGIN
  -- Try foundation foods first
  RETURN QUERY
  SELECT 
    f.fdc_id,
    f.description,
    f.brand_owner,
    f.brand_name,
    'foundation'::TEXT,
    f.calories,
    f.protein_g,
    f.fat_g,
    f.total_carbs_g,
    f.fiber_g,
    f.net_carbs_g,
    f.sugar_g,
    f.sodium_mg,
    f.potassium_mg,
    f.calcium_mg,
    f.iron_mg,
    f.vitamin_c_mg,
    f.vitamin_d_iu,
    f.additional_nutrients,
    f.serving_size,
    f.serving_unit
  FROM public.usda_foundation_foods f
  WHERE f.fdc_id = fdc_id_param;
  
  -- If not found in foundation, try branded foods
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      b.fdc_id,
      b.description,
      b.brand_owner,
      b.brand_name,
      'branded'::TEXT,
      b.calories,
      b.protein_g,
      b.fat_g,
      b.total_carbs_g,
      b.fiber_g,
      b.net_carbs_g,
      b.sugar_g,
      b.sodium_mg,
      b.potassium_mg,
      b.calcium_mg,
      b.iron_mg,
      b.vitamin_c_mg,
      b.vitamin_d_iu,
      b.additional_nutrients,
      b.serving_size,
      b.serving_unit
    FROM public.usda_branded_foods b
    WHERE b.fdc_id = fdc_id_param;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample food categories
INSERT INTO public.usda_food_categories (name, description, usda_category_code) VALUES
('Vegetables', 'Fresh and cooked vegetables', '0100'),
('Fruits', 'Fresh and dried fruits', '0900'),
('Grains', 'Cereals, breads, and grains', '2000'),
('Protein Foods', 'Meat, poultry, fish, eggs, nuts, seeds', '0500'),
('Dairy', 'Milk, cheese, yogurt', '0100'),
('Fats and Oils', 'Butter, oils, dressings', '0400'),
('Beverages', 'Drinks and liquid foods', '1400'),
('Snacks', 'Snack foods and treats', '3500'),
('Condiments', 'Sauces, spreads, seasonings', '0600'),
('Baked Goods', 'Breads, pastries, desserts', '1800');

-- Enable Row Level Security (these tables are read-only for all users)
ALTER TABLE public.usda_foundation_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usda_branded_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usda_food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usda_food_category_assignments ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read USDA data
CREATE POLICY "Anyone can view USDA foundation foods" ON public.usda_foundation_foods
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view USDA branded foods" ON public.usda_branded_foods
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view USDA food categories" ON public.usda_food_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view USDA food category assignments" ON public.usda_food_category_assignments
  FOR SELECT USING (true);

-- Only allow admins to insert/update USDA data (for data imports)
CREATE POLICY "Only admins can modify USDA data" ON public.usda_foundation_foods
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can modify USDA data" ON public.usda_branded_foods
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can modify USDA data" ON public.usda_food_categories
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can modify USDA data" ON public.usda_food_category_assignments
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');


