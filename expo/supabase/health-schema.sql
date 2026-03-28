-- SnapCarb Health Tracking Schema
-- Complete health tracking system for DR Davis Infinite Health Program
-- Focuses on NET CARBS tracking, not calories

-- User Health Profiles
CREATE TABLE IF NOT EXISTS public.user_health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
  height_cm DECIMAL(5,2),
  activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active')),
  goals TEXT[],
  dietary_restrictions TEXT[],
  medical_conditions TEXT[],
  medications TEXT[],
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Health Metrics
CREATE TABLE IF NOT EXISTS public.daily_health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Body Measurements
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  water_percentage DECIMAL(4,2),
  waist_cm DECIMAL(5,2),
  hip_cm DECIMAL(5,2),
  neck_cm DECIMAL(4,2),
  chest_cm DECIMAL(5,2),
  biceps_cm DECIMAL(4,2),
  forearms_cm DECIMAL(4,2),
  thighs_cm DECIMAL(4,2),
  calves_cm DECIMAL(4,2),
  
  -- Blood Glucose (Critical for DR Davis Program)
  fasting_glucose_mgdl DECIMAL(4,1),
  postprandial_glucose_mgdl DECIMAL(4,1),
  glucose_notes TEXT,
  
  -- Blood Pressure
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  bp_notes TEXT,
  
  -- Fasting Metrics
  fasting_start_time TIMESTAMP WITH TIME ZONE,
  fasting_end_time TIMESTAMP WITH TIME ZONE,
  fasting_duration_hours DECIMAL(4,2),
  eating_window_start TIMESTAMP WITH TIME ZONE,
  eating_window_end TIMESTAMP WITH TIME ZONE,
  eating_window_duration_hours DECIMAL(4,2),
  
  -- Metabolic Markers
  ketone_level DECIMAL(3,2),
  ketone_type TEXT CHECK (ketone_type IN ('blood', 'urine', 'breath')),
  
  -- Prebiotic Fiber (DR Davis Program)
  prebiotic_fiber_grams DECIMAL(4,1),
  fiber_sources TEXT[],
  
  -- Notes and Observations
  notes TEXT,
  symptoms TEXT[],
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  mood_level INTEGER CHECK (mood_level >= 1 AND energy_level <= 10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Blood Work Results (Quarterly/Annual)
CREATE TABLE IF NOT EXISTS public.blood_work_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  lab_name TEXT,
  
  -- Glucose & Diabetes (DR Davis Critical)
  hba1c_percent DECIMAL(3,2),
  fasting_insulin_miu_l DECIMAL(4,2),
  c_peptide_ng_ml DECIMAL(4,2),
  
  -- Inflammation & Immune
  crp_mg_l DECIMAL(4,2),
  esr_mm_hr DECIMAL(4,2),
  white_blood_cell_count DECIMAL(4,2),
  
  -- Vitamins & Minerals
  vitamin_d_ng_ml DECIMAL(4,2),
  vitamin_b12_pg_ml DECIMAL(5,2),
  folate_ng_ml DECIMAL(4,2),
  iron_ug_dl DECIMAL(4,2),
  ferritin_ng_ml DECIMAL(5,2),
  
  -- Thyroid Function
  tsh_miu_l DECIMAL(4,2),
  free_t3_pg_ml DECIMAL(4,2),
  free_t4_ng_dl DECIMAL(4,2),
  
  -- Liver Function
  alt_u_l INTEGER,
  ast_u_l INTEGER,
  ggt_u_l INTEGER,
  alkaline_phosphatase_u_l INTEGER,
  bilirubin_mg_dl DECIMAL(3,2),
  
  -- Kidney Function
  creatinine_mg_dl DECIMAL(3,2),
  egfr_ml_min DECIMAL(4,2),
  bun_mg_dl INTEGER,
  
  -- Lipids (DR Davis Critical)
  total_cholesterol_mg_dl INTEGER,
  hdl_mg_dl INTEGER,
  ldl_mg_dl INTEGER,
  triglycerides_mg_dl INTEGER,
  
  -- Other Important
  uric_acid_mg_dl DECIMAL(3,2),
  homocysteine_umol_l DECIMAL(3,2),
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplement Tracking
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'evening', 'both', 'as-needed')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Supplement Log
CREATE TABLE IF NOT EXISTS public.daily_supplement_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES public.supplements(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_taken TIMESTAMP WITH TIME ZONE,
  dose_taken TEXT,
  was_taken BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, supplement_id, date)
);

-- Health Goals
CREATE TABLE IF NOT EXISTS public.health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('weight', 'blood_glucose', 'blood_pressure', 'fasting', 'supplements', 'fiber', 'general')),
  target_value DECIMAL(8,2),
  target_unit TEXT,
  start_date DATE NOT NULL,
  target_date DATE,
  current_value DECIMAL(8,2),
  progress_percentage INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DR Davis Program Progress
CREATE TABLE IF NOT EXISTS public.dr_davis_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  program_start_date DATE NOT NULL,
  current_phase TEXT CHECK (current_phase IN ('10-day-detox', '42-day-consolidation', 'maintenance')),
  current_day INTEGER,
  total_days_completed INTEGER DEFAULT 0,
  
  -- Detox Phase Tracking
  detox_start_date DATE,
  detox_completed_date DATE,
  withdrawal_symptoms TEXT[],
  withdrawal_severity INTEGER CHECK (withdrawal_severity >= 1 AND withdrawal_severity <= 10),
  
  -- Supplement Compliance
  vitamin_d_compliant BOOLEAN DEFAULT false,
  fish_oil_compliant BOOLEAN DEFAULT false,
  magnesium_compliant BOOLEAN DEFAULT false,
  iodine_compliant BOOLEAN DEFAULT false,
  probiotic_compliant BOOLEAN DEFAULT false,
  
  -- Prebiotic Fiber Progress
  fiber_start_date DATE,
  current_fiber_grams DECIMAL(4,1),
  fiber_target_grams DECIMAL(4,1) DEFAULT 20,
  fiber_symptoms TEXT[],
  
  -- Program Success Indicators
  weight_loss_kg DECIMAL(4,2),
  waist_reduction_cm DECIMAL(4,2),
  blood_glucose_improvement BOOLEAN,
  energy_improvement BOOLEAN,
  symptom_improvement BOOLEAN,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal Tracking (Focus on NET CARBS, not calories)
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_time TIMESTAMP WITH TIME ZONE,
  
  -- DR Davis Focus: NET CARBS
  total_carbs_g DECIMAL(5,2),
  fiber_g DECIMAL(5,2),
  net_carbs_g DECIMAL(5,2), -- Calculated: total_carbs - fiber
  is_within_15g_limit BOOLEAN, -- DR Davis rule: 15g net carbs max per meal
  
  -- Other macros (for reference, not focus)
  protein_g DECIMAL(5,2),
  fat_g DECIMAL(5,2),
  
  -- Food items
  food_items TEXT[],
  ingredients TEXT[],
  
  -- DR Davis Compliance
  contains_grains BOOLEAN DEFAULT false,
  contains_added_sugars BOOLEAN DEFAULT false,
  contains_seed_oils BOOLEAN DEFAULT false,
  is_dr_davis_compliant BOOLEAN,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Reminders
CREATE TABLE IF NOT EXISTS public.health_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT CHECK (reminder_type IN ('supplement', 'fasting', 'blood_test', 'measurement', 'general')),
  time_of_day TIME,
  days_of_week INTEGER[], -- 0=Sunday, 1=Monday, etc.
  is_active BOOLEAN DEFAULT true,
  last_sent TIMESTAMP WITH TIME ZONE,
  next_send TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_health_metrics_user_date ON public.daily_health_metrics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_health_metrics_glucose ON public.daily_health_metrics(fasting_glucose_mgdl, postprandial_glucose_mgdl);
CREATE INDEX IF NOT EXISTS idx_blood_work_user_date ON public.blood_work_results(user_id, test_date);
CREATE INDEX IF NOT EXISTS idx_supplements_user_active ON public.supplements(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_daily_supplement_log_user_date ON public.daily_supplement_log(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON public.meals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meals_net_carbs ON public.meals(net_carbs_g);
CREATE INDEX IF NOT EXISTS idx_health_goals_user_status ON public.health_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_dr_davis_progress_user ON public.dr_davis_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_work_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_supplement_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dr_davis_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only access their own data
CREATE POLICY "Users can manage their own health profiles" ON public.user_health_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily metrics" ON public.daily_health_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own blood work" ON public.blood_work_results
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own supplements" ON public.supplements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own supplement logs" ON public.daily_supplement_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own health goals" ON public.health_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own DR Davis progress" ON public.dr_davis_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own meals" ON public.meals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reminders" ON public.health_reminders
  FOR ALL USING (auth.uid() = user_id);

-- Functions for health tracking

-- Function to calculate net carbs
CREATE OR REPLACE FUNCTION calculate_net_carbs(
  p_total_carbs DECIMAL,
  p_fiber DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(p_total_carbs, 0) - COALESCE(p_fiber, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if meal is DR Davis compliant
CREATE OR REPLACE FUNCTION check_dr_davis_compliance(
  p_net_carbs DECIMAL,
  p_contains_grains BOOLEAN,
  p_contains_added_sugars BOOLEAN,
  p_contains_seed_oils BOOLEAN
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN p_net_carbs <= 15 
    AND NOT p_contains_grains 
    AND NOT p_contains_added_sugars 
    AND NOT p_contains_seed_oils;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get user's current DR Davis phase
CREATE OR REPLACE FUNCTION get_current_dr_davis_phase(p_user_id UUID)
RETURNS TABLE(
  current_phase TEXT,
  current_day INTEGER,
  days_completed INTEGER,
  program_start_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    drp.current_phase,
    drp.current_day,
    drp.total_days_completed,
    drp.program_start_date
  FROM public.dr_davis_progress drp
  WHERE drp.user_id = p_user_id
  ORDER BY drp.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily health summary
CREATE OR REPLACE FUNCTION get_daily_health_summary(p_user_id UUID, p_date DATE)
RETURNS TABLE(
  weight_kg DECIMAL,
  fasting_glucose DECIMAL,
  postprandial_glucose DECIMAL,
  net_carbs_total DECIMAL,
  meals_within_limit INTEGER,
  supplements_taken INTEGER,
  fasting_hours DECIMAL,
  fiber_grams DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dhm.weight_kg,
    dhm.fasting_glucose_mgdl,
    dhm.postprandial_glucose_mgdl,
    COALESCE(SUM(m.net_carbs_g), 0) as net_carbs_total,
    COUNT(CASE WHEN m.is_within_15g_limit THEN 1 END) as meals_within_limit,
    COUNT(CASE WHEN dsl.was_taken THEN 1 END) as supplements_taken,
    dhm.fasting_duration_hours,
    dhm.prebiotic_fiber_grams
  FROM public.daily_health_metrics dhm
  LEFT JOIN public.meals m ON m.user_id = dhm.user_id AND m.date = dhm.date
  LEFT JOIN public.daily_supplement_log dsl ON dsl.user_id = dhm.user_id AND dsl.date = dhm.date
  WHERE dhm.user_id = p_user_id AND dhm.date = p_date
  GROUP BY dhm.weight_kg, dhm.fasting_glucose_mgdl, dhm.postprandial_glucose_mgdl, 
           dhm.fasting_duration_hours, dhm.prebiotic_fiber_grams;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_health_profiles TO anon, authenticated;
GRANT ALL ON public.daily_health_metrics TO anon, authenticated;
GRANT ALL ON public.blood_work_results TO anon, authenticated;
GRANT ALL ON public.supplements TO anon, authenticated;
GRANT ALL ON public.daily_supplement_log TO anon, authenticated;
GRANT ALL ON public.health_goals TO anon, authenticated;
GRANT ALL ON public.dr_davis_progress TO anon, authenticated;
GRANT ALL ON public.meals TO anon, authenticated;
GRANT ALL ON public.health_reminders TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Insert default supplements for DR Davis program
INSERT INTO public.supplements (user_id, name, dose, frequency, time_of_day, notes) VALUES
  (NULL, 'Vitamin D', '4000-6000 IU', 'daily', 'morning', 'DR Davis Essential Four - adjust to blood level 60-70 ng/mL'),
  (NULL, 'Fish Oil', '1800 mg EPA+DHA total', 'daily', 'both', 'DR Davis Essential Four - split AM/PM'),
  (NULL, 'Magnesium Malate', '1250 mg (140 mg elemental)', 'daily', 'both', 'DR Davis Essential Four - split AM/PM'),
  (NULL, 'Iodine', '400-500 mcg', 'daily', 'morning', 'DR Davis Essential Four - kelp tablets or drops'),
  (NULL, 'High-Potency Probiotic', '50+ billion CFU', 'daily', 'evening', 'DR Davis Essential Four - 6-8 weeks minimum')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE public.user_health_profiles IS 'User health profiles and personal information for DR Davis program';
COMMENT ON TABLE public.daily_health_metrics IS 'Daily health tracking including body measurements, glucose, fasting, and fiber';
COMMENT ON TABLE public.blood_work_results IS 'Blood test results for monitoring DR Davis program markers';
COMMENT ON TABLE public.supplements IS 'Supplement tracking for DR Davis Essential Four and other supplements';
COMMENT ON TABLE public.daily_supplement_log IS 'Daily log of supplement intake for compliance tracking';
COMMENT ON TABLE public.health_goals IS 'Health goals and progress tracking for DR Davis program';
COMMENT ON TABLE public.dr_davis_progress IS 'DR Davis Infinite Health program progress and phase tracking';
COMMENT ON TABLE public.meals IS 'Meal tracking focused on NET CARBS (DR Davis rule: 15g max per meal)';
COMMENT ON TABLE public.health_reminders IS 'Health reminders for supplements, fasting, and health checks';
