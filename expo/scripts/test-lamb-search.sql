-- Test search for actual lamb meat products
-- Search for different variations of lamb meat

-- Search for "lamb" in description
SELECT fdc_id, description, data_type, calories, protein_g, total_carbs_g, fiber_g, net_carbs_g
FROM v_food_macros_100g 
WHERE description ILIKE '%lamb%' 
AND description NOT LIKE '%lambsquarters%'
LIMIT 10;

-- Search for "lamb" with meat-related terms
SELECT fdc_id, description, data_type, calories, protein_g, total_carbs_g, fiber_g, net_carbs_g
FROM v_food_macros_100g 
WHERE description ILIKE '%lamb%' 
AND (description ILIKE '%meat%' OR description ILIKE '%chop%' OR description ILIKE '%loin%' OR description ILIKE '%shoulder%')
LIMIT 10;

-- Search for "lamb" in the original food table to see what's available
SELECT fdc_id, description, data_type
FROM food 
WHERE description ILIKE '%lamb%' 
AND description NOT LIKE '%lambsquarters%'
LIMIT 10;

-- Check total count of foods with nutrition data
SELECT COUNT(*) as total_foods_with_nutrition FROM v_food_macros_100g;

