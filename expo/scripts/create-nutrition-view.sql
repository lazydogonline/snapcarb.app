-- Create the missing nutrition view for FoodSearchService
-- This view aggregates nutrition data per 100g for all foods

CREATE OR REPLACE VIEW v_food_macros_100g AS
SELECT 
  f.fdc_id,
  f.description,
  f.data_type,
  -- Calories (kcal)
  COALESCE(MAX(CASE WHEN n.name = 'Energy' THEN fn.amount END), 0) as calories,
  -- Protein (g)
  COALESCE(MAX(CASE WHEN n.name = 'Protein' THEN fn.amount END), 0) as protein_g,
  -- Total Fat (g)
  COALESCE(MAX(CASE WHEN n.name = 'Total lipid (fat)' THEN fn.amount END), 0) as fat_g,
  -- Total Carbohydrates (g)
  COALESCE(MAX(CASE WHEN n.name = 'Carbohydrate, by difference' THEN fn.amount END), 0) as total_carbs_g,
  -- Fiber (g)
  COALESCE(MAX(CASE WHEN n.name = 'Fiber, total dietary' THEN fn.amount END), 0) as fiber_g,
  -- Sugar (g)
  COALESCE(MAX(CASE WHEN n.name = 'Sugars, total including NLEA' THEN fn.amount END), 0) as sugar_g,
  -- Sodium (mg)
  COALESCE(MAX(CASE WHEN n.name = 'Sodium, Na' THEN fn.amount END), 0) as sodium_mg,
  -- Calculate Net Carbs (Total Carbs - Fiber)
  COALESCE(MAX(CASE WHEN n.name = 'Carbohydrate, by difference' THEN fn.amount END), 0) - 
  COALESCE(MAX(CASE WHEN n.name = 'Fiber, total dietary' THEN fn.amount END), 0) as net_carbs_g
FROM 
  food f
LEFT JOIN 
  food_nutrient fn ON f.fdc_id = fn.fdc_id
LEFT JOIN 
  nutrient n ON fn.nutrient_id = n.id
WHERE 
  n.name IN (
    'Energy',
    'Protein', 
    'Total lipid (fat)',
    'Carbohydrate, by difference',
    'Fiber, total dietary',
    'Sugars, total including NLEA',
    'Sodium, Na'
  )
GROUP BY 
  f.fdc_id, f.description, f.data_type
HAVING 
  -- Only include foods that have at least some nutrition data
  COUNT(CASE WHEN fn.amount IS NOT NULL THEN 1 END) > 0;

-- Test the view
SELECT COUNT(*) as total_foods FROM v_food_macros_100g;
SELECT * FROM v_food_macros_100g WHERE description ILIKE '%lamb%' LIMIT 3;
