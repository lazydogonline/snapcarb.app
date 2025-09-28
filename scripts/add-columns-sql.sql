-- Add all missing columns to food_nutrient table
-- Run this in Supabase SQL Editor

ALTER TABLE public.food_nutrient 
ADD COLUMN IF NOT EXISTS data_points integer,
ADD COLUMN IF NOT EXISTS derivation_id integer,
ADD COLUMN IF NOT EXISTS min numeric,
ADD COLUMN IF NOT EXISTS max numeric,
ADD COLUMN IF NOT EXISTS median numeric,
ADD COLUMN IF NOT EXISTS loq numeric,
ADD COLUMN IF NOT EXISTS footnote text,
ADD COLUMN IF NOT EXISTS min_year_acquired integer,
ADD COLUMN IF NOT EXISTS percent_daily_value numeric;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'food_nutrient' 
AND table_schema = 'public'
ORDER BY ordinal_position;
