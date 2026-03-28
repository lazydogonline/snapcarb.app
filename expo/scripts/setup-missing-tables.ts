import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMissingTables() {
  console.log('🔧 Setting up missing USDA tables...');
  
  const sqlScript = `
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
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: sqlScript });
    
    if (error) {
      console.error('❌ Error setting up tables:', error);
      console.log('\n💡 You may need to run this SQL manually in your Supabase dashboard:');
      console.log('📁 Go to SQL Editor and run the contents of scripts/create-missing-tables.sql');
    } else {
      console.log('✅ Tables created successfully!');
    }
  } catch (error) {
    console.error('❌ Exception during table setup:', error);
    console.log('\n💡 You may need to run this SQL manually in your Supabase dashboard:');
    console.log('📁 Go to SQL Editor and run the contents of scripts/create-missing-tables.sql');
  }
}

// Run the setup
setupMissingTables()
  .then(() => {
    console.log('✅ Setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
