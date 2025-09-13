-- Test the nutrition view directly
-- Check if the view has data and what the structure looks like

-- 1. Check if view exists and has data
SELECT COUNT(*) as total_records FROM v_food_macros_100g;

-- 2. Look at the first few records to see the structure
SELECT * FROM v_food_macros_100g LIMIT 3;

-- 3. Check if there are any lamb foods in the view
SELECT COUNT(*) as lamb_foods_in_view 
FROM v_food_macros_100g 
WHERE description ILIKE '%lamb%';

-- 4. Look at a specific lamb food to see if nutrition data is there
SELECT * FROM v_food_macros_100g 
WHERE description ILIKE '%lamb%' 
LIMIT 1;

-- 5. Check if the view is accessible to the current user
SELECT current_user, current_database();
