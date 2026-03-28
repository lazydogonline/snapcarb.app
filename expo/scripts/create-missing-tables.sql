-- Add missing tables for essential USDA data

-- 1. Food Categories table
CREATE TABLE IF NOT EXISTS public.food_category (
  id BIGINT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT
);

-- 2. Measure Units table
CREATE TABLE IF NOT EXISTS public.measure_unit (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  abbreviation TEXT
);

-- 3. Food Components table
CREATE TABLE IF NOT EXISTS public.food_component (
  id BIGINT PRIMARY KEY,
  fdc_id BIGINT REFERENCES public.food(fdc_id),
  name TEXT NOT NULL,
  data_type TEXT,
  description TEXT
);

-- 4. Food Portions table
CREATE TABLE IF NOT EXISTS public.food_portion (
  id BIGINT PRIMARY KEY,
  fdc_id BIGINT REFERENCES public.food(fdc_id),
  seq_num INTEGER,
  amount DOUBLE PRECISION NOT NULL,
  measure_unit_id BIGINT REFERENCES public.measure_unit(id),
  portion_description TEXT,
  gram_weight DOUBLE PRECISION,
  data_points INTEGER,
  footnote TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_category_name ON public.food_category(name);
CREATE INDEX IF NOT EXISTS idx_measure_unit_name ON public.measure_unit(name);
CREATE INDEX IF NOT EXISTS idx_food_component_fdc_id ON public.food_component(fdc_id);
CREATE INDEX IF NOT EXISTS idx_food_portion_fdc_id ON public.food_portion(fdc_id);
CREATE INDEX IF NOT EXISTS idx_food_portion_measure_unit ON public.food_portion(measure_unit_id);

-- Enable RLS
ALTER TABLE public.food_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measure_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_component ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_portion ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read access to food_category" ON public.food_category FOR SELECT USING (true);
CREATE POLICY "Allow public read access to measure_unit" ON public.measure_unit FOR SELECT USING (true);
CREATE POLICY "Allow public read access to food_component" ON public.food_component FOR SELECT USING (true);
CREATE POLICY "Allow public read access to food_portion" ON public.food_portion FOR SELECT USING (true);
