-- Test search for pork sausages to see why they're getting 10/10
-- This will help us understand the nutrition data quality issue

-- First, let's see what pork sausages exist in our database
SELECT 
  f.fdc_id,
  f.description,
  f.data_type,
  v.calories,
  v.protein_g,
  v.fat_g,
  v.total_carbs_g,
  v.fiber_g,
  v.sugar_g,
  v.net_carbs_g
FROM food f
LEFT JOIN v_food_macros_100g v ON f.fdc_id = v.fdc_id
WHERE f.description ILIKE '%pork%' 
  AND f.description ILIKE '%sausage%'
ORDER BY f.description
LIMIT 20;

-- Let's also check the raw nutrient data for a specific sausage
-- This will show us if the nutrition view is missing data
SELECT 
  f.fdc_id,
  f.description,
  n.name as nutrient_name,
  fn.amount,
  n.unit_name
FROM food f
JOIN food_nutrient fn ON f.fdc_id = fn.fdc_id
JOIN nutrient n ON fn.nutrient_id = n.id
WHERE f.description ILIKE '%pork%' 
  AND f.description ILIKE '%sausage%'
  AND n.name IN ('Carbohydrate, by difference', 'Fiber, total dietary', 'Sugars, total including NLEA')
ORDER BY f.description, n.name
LIMIT 30;

-- Check if there are any branded sausages with ingredients
SELECT 
  f.fdc_id,
  f.description,
  bf.brand_owner,
  bf.ingredients
FROM food f
JOIN branded_food bf ON f.fdc_id = bf.fdc_id
WHERE f.description ILIKE '%pork%' 
  AND f.description ILIKE '%sausage%'
ORDER BY f.description
LIMIT 10;

