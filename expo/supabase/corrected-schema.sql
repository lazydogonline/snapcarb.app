-- Corrected USDA Food Database Schema for SnapCarb
-- This creates all views and functions needed for food tracking using the correct table names

-- 1. Nutrition Views
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
  FROM public.nutrient
)
SELECT
  fn.fdc_id,
  f.description,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_kcal  FROM ids)) AS kcal,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_pro   FROM ids)) AS protein_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fat   FROM ids)) AS fat_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_carb  FROM ids)) AS carb_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fiber FROM ids)) AS fiber_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar FROM ids)) AS sugar_g,
  COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar_alc FROM ids)),0) AS sugar_alc_g,
  SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_na    FROM ids)) AS sodium_mg
FROM public.food_nutrient fn
LEFT JOIN public.food f ON fn.fdc_id = f.fdc_id
GROUP BY fn.fdc_id, f.description;

-- View 2: Macros per serving for branded foods
CREATE OR REPLACE VIEW public.v_food_macros_serving AS
SELECT
  bf.fdc_id,
  bf.brand_name,
  bf.gtin_upc,
  bf.serving_size,
  bf.serving_size_unit,
  vm.kcal * (bf.serving_size / 100.0) AS kcal_per_serving,
  vm.protein_g * (bf.serving_size / 100.0) AS protein_g_per_serving,
  vm.fat_g * (bf.serving_size / 100.0) AS fat_g_per_serving,
  vm.carb_g * (bf.serving_size / 100.0) AS carb_g_per_serving,
  vm.fiber_g * (bf.serving_size / 100.0) AS fiber_g_per_serving,
  vm.sugar_g * (bf.serving_size / 100.0) AS sugar_g_per_serving
FROM public.branded_food bf
LEFT JOIN public.v_food_macros_100g vm ON bf.fdc_id = vm.fdc_id;

-- View 3: Recipe totals with LEFT JOINs
CREATE OR REPLACE VIEW public.v_recipe_totals AS
SELECT
  r.id AS recipe_id,
  r.name AS recipe_name,
  r.servings,
  SUM(vm.kcal * (ri.grams / 100.0)) AS total_kcal,
  SUM(vm.protein_g * (ri.grams / 100.0)) AS total_protein_g,
  SUM(vm.fat_g * (ri.grams / 100.0)) AS total_fat_g,
  SUM(vm.carb_g * (ri.grams / 100.0)) AS total_carb_g,
  SUM(vm.fiber_g * (ri.grams / 100.0)) AS total_fiber_g,
  SUM(vm.sugar_g * (ri.grams / 100.0)) AS total_sugar_g,
  SUM(ri.grams) AS total_grams
FROM public.recipe r
LEFT JOIN public.recipe_ingredient ri ON r.id = ri.recipe_id
LEFT JOIN public.v_food_macros_100g vm ON ri.fdc_id = vm.fdc_id
GROUP BY r.id, r.name, r.servings;

-- 2. Helper Functions
-- Function 1: Search foods with LEFT JOINs
CREATE OR REPLACE FUNCTION public.search_foods(search_term TEXT)
RETURNS TABLE(
  fdc_id BIGINT,
  description TEXT,
  kcal DOUBLE PRECISION,
  protein_g DOUBLE PRECISION,
  fat_g DOUBLE PRECISION,
  carb_g DOUBLE PRECISION,
  fiber_g DOUBLE PRECISION,
  sugar_g DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vm.fdc_id,
    vm.description,
    vm.kcal,
    vm.protein_g,
    vm.fat_g,
    vm.carb_g,
    vm.fiber_g,
    vm.sugar_g
  FROM public.v_food_macros_100g vm
  WHERE vm.description ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN vm.description ILIKE search_term THEN 1
      WHEN vm.description ILIKE search_term || '%' THEN 2
      WHEN vm.description ILIKE '%' || search_term || '%' THEN 3
      ELSE 4
    END,
    vm.description;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Get food macros for 100g
CREATE OR REPLACE FUNCTION public.get_food_macros_100g(food_fdc_id BIGINT)
RETURNS TABLE(
  fdc_id BIGINT,
  description TEXT,
  kcal DOUBLE PRECISION,
  protein_g DOUBLE PRECISION,
  fat_g DOUBLE PRECISION,
  carb_g DOUBLE PRECISION,
  fiber_g DOUBLE PRECISION,
  sugar_g DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.v_food_macros_100g
  WHERE fdc_id = food_fdc_id;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get branded food macros per serving
CREATE OR REPLACE FUNCTION public.get_branded_food_macros(barcode TEXT)
RETURNS TABLE(
  fdc_id BIGINT,
  brand_name TEXT,
  description TEXT,
  serving_size DOUBLE PRECISION,
  serving_size_unit TEXT,
  kcal_per_serving DOUBLE PRECISION,
  protein_g_per_serving DOUBLE PRECISION,
  fat_g_per_serving DOUBLE PRECISION,
  carb_g_per_serving DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.fdc_id,
    bf.brand_name,
    f.description,
    bf.serving_size,
    bf.serving_size_unit,
    vm.kcal * (bf.serving_size / 100.0) AS kcal_per_serving,
    vm.protein_g * (bf.serving_size / 100.0) AS protein_g_per_serving,
    vm.fat_g * (bf.serving_size / 100.0) AS fat_g_per_serving,
    vm.carb_g * (bf.serving_size / 100.0) AS carb_g_per_serving
  FROM public.branded_food bf
  LEFT JOIN public.food f ON bf.fdc_id = f.fdc_id
  LEFT JOIN public.v_food_macros_100g vm ON bf.fdc_id = vm.fdc_id
  WHERE bf.gtin_upc = barcode;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Lookup food by barcode with LEFT JOINs
CREATE OR REPLACE FUNCTION public.lookup_food_by_barcode(barcode TEXT)
RETURNS TABLE(
  fdc_id BIGINT,
  brand_name TEXT,
  description TEXT,
  serving_size DOUBLE PRECISION,
  serving_size_unit TEXT,
  kcal DOUBLE PRECISION,
  protein_g DOUBLE PRECISION,
  fat_g DOUBLE PRECISION,
  carb_g DOUBLE PRECISION,
  fiber_g DOUBLE PRECISION,
  sugar_g DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bf.fdc_id,
    bf.brand_name,
    f.description,
    bf.serving_size,
    bf.serving_size_unit,
    vm.kcal,
    vm.protein_g,
    vm.fat_g,
    vm.carb_g,
    vm.fiber_g,
    vm.sugar_g
  FROM public.branded_food bf
  LEFT JOIN public.food f ON bf.fdc_id = f.fdc_id
  LEFT JOIN public.v_food_macros_100g vm ON bf.fdc_id = vm.fdc_id
  WHERE bf.gtin_upc = barcode;
END;
$$ LANGUAGE plpgsql;
