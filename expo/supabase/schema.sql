-- Complete USDA Food Database Schema for SnapCarb
-- This creates all tables, views, and functions needed for food tracking

-- 1. Core USDA Tables
CREATE TABLE IF NOT EXISTS public.nutrients (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  unit_name TEXT NOT NULL,
  nutrient_nbr TEXT,
  rank INTEGER
);

CREATE TABLE IF NOT EXISTS public.foods (
  fdc_id BIGINT PRIMARY KEY,
  description TEXT NOT NULL,
  data_type TEXT,
  publication_date DATE,
  all_highlight_fields TEXT,
  all_keywords TEXT
);

CREATE TABLE IF NOT EXISTS public.branded_foods (
  fdc_id BIGINT PRIMARY KEY REFERENCES public.foods(fdc_id),
  brand_owner TEXT,
  brand_name TEXT,
  gtin_upc TEXT,
  ingredients TEXT,
  market_country TEXT,
  modified_date DATE,
  available_date DATE,
  data_source TEXT,
  serving_size DOUBLE PRECISION DEFAULT 100,
  serving_size_unit TEXT DEFAULT 'g'
);

CREATE TABLE IF NOT EXISTS public.food_nutrients (
  fdc_id BIGINT REFERENCES public.foods(fdc_id),
  nutrient_id BIGINT REFERENCES public.nutrients(id),
  amount DOUBLE PRECISION NOT NULL,
  data_points INTEGER,
  derivation_id TEXT,
  min DOUBLE PRECISION,
  max DOUBLE PRECISION,
  median DOUBLE PRECISION,
  footnote TEXT,
  min_year_acquired INTEGER,
  PRIMARY KEY (fdc_id, nutrient_id)
);

-- 2. Recipe Tables
CREATE TABLE IF NOT EXISTS public.recipes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
  id BIGSERIAL PRIMARY KEY,
  recipe_id BIGINT REFERENCES public.recipes(id) ON DELETE CASCADE,
  fdc_id BIGINT NOT NULL REFERENCES public.foods(fdc_id),
  grams DOUBLE PRECISION NOT NULL,  -- store the amount in grams
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_nutrients_name ON public.nutrients(name);
CREATE INDEX IF NOT EXISTS idx_foods_description ON public.foods USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_foods_publication_date ON public.foods(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_branded_foods_barcode ON public.branded_foods(gtin_upc);
CREATE INDEX IF NOT EXISTS idx_food_nutrients_fdc_id ON public.food_nutrients(fdc_id);
CREATE INDEX IF NOT EXISTS idx_food_nutrients_nutrient_id ON public.food_nutrients(nutrient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_fdc_id ON public.recipe_ingredients(fdc_id);

-- 4. Nutrition Views
-- View 1: Macros per 100g for all foods
CREATE OR REPLACE VIEW public.v_food_macros_100g AS
WITH ids AS (
  SELECT
    MAX(id) FILTER (WHERE LOWER(name) = 'energy')                              AS id_kcal,
    MAX(id) FILTER (WHERE LOWER(name) = 'protein')                             AS id_pro,
    MAX(id) FILTER (WHERE LOWER(name) = 'total lipid (fat)')                   AS id_fat,
    MAX(id) FILTER (WHERE LOWER(name) = 'carbohydrate, by difference')         AS id_carb,
    MAX(id) FILTER (WHERE LOWER(name) = 'fiber, total dietary')                AS id_fiber,
    MAX(id) FILTER (WHERE LOWER(name) = 'total sugar alcohols')                AS id_sugar_alc,
    MAX(id) FILTER (WHERE LOWER(name) = 'sugars, total including nleaimf')     AS id_sugar,
    MAX(id) FILTER (WHERE LOWER(name) = 'sodium, na')                          AS id_na
  FROM public.nutrients
)
SELECT
  fn.fdc_id,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_kcal  FROM ids)) AS kcal,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_pro   FROM ids)) AS protein_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fat   FROM ids)) AS fat_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_carb  FROM ids)) AS carb_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fiber FROM ids)) AS fiber_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar FROM ids)) AS sugar_g,
  COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar_alc FROM ids)),0) AS sugar_alc_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_na    FROM ids)) AS sodium_mg,
  GREATEST(
    0,
    COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_carb FROM ids)),0)
    - COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fiber FROM ids)),0)
    - COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar_alc FROM ids)),0)
  ) AS net_carb_g
FROM public.food_nutrients fn
GROUP BY fn.fdc_id;

-- View 2: Macros per actual serving for branded foods
CREATE OR REPLACE VIEW public.v_food_macros_serving AS
SELECT
  b.fdc_id,
  b.serving_size,
  b.serving_size_unit,
  m100.kcal        * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS kcal,
  m100.protein_g   * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS protein_g,
  m100.fat_g       * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS fat_g,
  m100.carb_g      * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS carb_g,
  m100.fiber_g     * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS fiber_g,
  m100.sugar_g     * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sugar_g,
  m100.sugar_alc_g * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sugar_alc_g,
  m100.sodium_mg   * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sodium_mg,
  m100.net_carb_g  * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS net_carb_g
FROM public.branded_foods b
JOIN public.v_food_macros_100g m100 USING (fdc_id);

-- View 3: Recipe totals with per-serving breakdown
CREATE OR REPLACE VIEW public.v_recipe_totals AS
WITH per_ing AS (
  SELECT
    ri.recipe_id,
    ri.fdc_id,
    ri.grams,
    m.kcal      * (ri.grams/100.0) AS kcal,
    m.protein_g * (ri.grams/100.0) AS protein_g,
    m.fat_g     * (ri.grams/100.0) AS fat_g,
    m.carb_g    * (ri.grams/100.0) AS carb_g,
    m.fiber_g   * (ri.grams/100.0) AS fiber_g,
    m.sugar_g   * (ri.grams/100.0) AS sugar_g,
    m.sugar_alc_g * (ri.grams/100.0) AS sugar_alc_g,
    m.sodium_mg * (ri.grams/100.0) AS sodium_mg,
    m.net_carb_g * (ri.grams/100.0) AS net_carb_g
  FROM public.recipe_ingredients ri
  JOIN public.v_food_macros_100g m USING (fdc_id)
)
SELECT
  r.id AS recipe_id,
  r.name,
  r.servings,
  SUM(grams)                        AS total_grams,
  SUM(kcal)                         AS total_kcal,
  SUM(protein_g)                    AS total_protein_g,
  SUM(fat_g)                        AS total_fat_g,
  SUM(carb_g)                       AS total_carb_g,
  SUM(fiber_g)                      AS total_fiber_g,
  SUM(sugar_g)                      AS total_sugar_g,
  SUM(sugar_alc_g)                  AS total_sugar_alc_g,
  SUM(sodium_mg)                    AS total_sodium_mg,
  SUM(net_carb_g)                   AS total_net_carb_g,
  -- per-serving
  ROUND(SUM(kcal)/r.servings, 1)           AS kcal_per_serving,
  ROUND(SUM(protein_g)/r.servings, 2)      AS protein_g_per_serving,
  ROUND(SUM(fat_g)/r.servings, 2)          AS fat_g_per_serving,
  ROUND(SUM(carb_g)/r.servings, 2)         AS carb_g_per_serving,
  ROUND(SUM(fiber_g)/r.servings, 2)        AS fiber_g_per_serving,
  ROUND(SUM(net_carb_g)/r.servings, 2)     AS net_carb_g_per_serving
FROM per_ing
JOIN public.recipes r ON r.id = per_ing.recipe_id
GROUP BY r.id, r.name, r.servings;

-- 5. Row Level Security (RLS)
ALTER TABLE public.nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branded_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_nutrients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Public read access for food data
CREATE POLICY "Allow public read access to nutrients" ON public.nutrients FOR SELECT USING (true);
CREATE POLICY "Allow public read access to foods" ON public.foods FOR SELECT USING (true);
CREATE POLICY "Allow public read access to branded_foods" ON public.branded_foods FOR SELECT USING (true);
CREATE POLICY "Allow public read access to food_nutrients" ON public.food_nutrients FOR SELECT USING (true);

-- Users can manage their own recipes
CREATE POLICY "Users can manage their own recipes" ON public.recipes FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can manage their own recipe ingredients" ON public.recipe_ingredients FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Sample Data for Testing
INSERT INTO public.nutrients (id, name, unit_name) VALUES 
  (1008, 'Energy', 'KCAL'),
  (1003, 'Protein', 'G'),
  (1004, 'Total lipid (fat)', 'G'),
  (1005, 'Carbohydrate, by difference', 'G'),
  (1079, 'Fiber, total dietary', 'G'),
  (1086, 'Total sugar alcohols', 'G'),
  (2000, 'Sugars, total including NLEA', 'G'),
  (1093, 'Sodium, Na', 'MG')
ON CONFLICT (id) DO NOTHING;

-- 7. Helper Functions
-- Function to search foods by text
CREATE OR REPLACE FUNCTION public.search_foods(search_term TEXT)
RETURNS TABLE(fdc_id BIGINT, description TEXT, data_type TEXT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT f.fdc_id, f.description, f.data_type
  FROM public.foods f
  WHERE to_tsvector('english', f.description) @@ plainto_tsquery(search_term)
  ORDER BY f.publication_date DESC NULLS LAST
  LIMIT 25;
$$;

-- Function to get macros for a food (generic)
CREATE OR REPLACE FUNCTION public.get_food_macros_100g(food_fdc_id BIGINT)
RETURNS TABLE(
  fdc_id BIGINT, description TEXT, kcal DOUBLE PRECISION, 
  protein_g DOUBLE PRECISION, fat_g DOUBLE PRECISION, carb_g DOUBLE PRECISION,
  fiber_g DOUBLE PRECISION, sugar_g DOUBLE PRECISION, sugar_alc_g DOUBLE PRECISION,
  sodium_mg DOUBLE PRECISION, net_carb_g DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT m.*, f.description
  FROM public.v_food_macros_100g m
  JOIN public.foods f USING (fdc_id)
  WHERE m.fdc_id = food_fdc_id;
$$;

-- Function to get macros for a branded food (per serving)
CREATE OR REPLACE FUNCTION public.get_branded_food_macros(food_fdc_id BIGINT)
RETURNS TABLE(
  fdc_id BIGINT, description TEXT, brand_owner TEXT, brand_name TEXT,
  serving_size DOUBLE PRECISION, serving_size_unit TEXT,
  kcal DOUBLE PRECISION, protein_g DOUBLE PRECISION, fat_g DOUBLE PRECISION, 
  carb_g DOUBLE PRECISION, fiber_g DOUBLE PRECISION, sugar_g DOUBLE PRECISION,
  sugar_alc_g DOUBLE PRECISION, sodium_mg DOUBLE PRECISION, net_carb_g DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT m.*, f.description, b.brand_owner, b.brand_name, b.serving_size, b.serving_size_unit
  FROM public.v_food_macros_serving m
  JOIN public.foods f USING (fdc_id)
  JOIN public.branded_foods b USING (fdc_id)
  WHERE m.fdc_id = food_fdc_id;
$$;

-- Function to lookup food by barcode
CREATE OR REPLACE FUNCTION public.lookup_food_by_barcode(barcode TEXT)
RETURNS TABLE(
  fdc_id BIGINT, description TEXT, brand_owner TEXT, brand_name TEXT, gtin_upc TEXT,
  serving_size DOUBLE PRECISION, serving_size_unit TEXT,
  kcal DOUBLE PRECISION, protein_g DOUBLE PRECISION, fat_g DOUBLE PRECISION, 
  carb_g DOUBLE PRECISION, fiber_g DOUBLE PRECISION, sugar_g DOUBLE PRECISION,
  sugar_alc_g DOUBLE PRECISION, sodium_mg DOUBLE PRECISION, net_carb_g DOUBLE PRECISION
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT m.*, f.description, b.brand_owner, b.brand_name, b.gtin_upc, b.serving_size, b.serving_size_unit
  FROM public.branded_foods b
  JOIN public.foods f USING (fdc_id)
  JOIN public.v_food_macros_serving m USING (fdc_id)
  WHERE b.gtin_upc IN (barcode, lpad(barcode,13,'0'), ltrim(barcode,'0'));
$$;



