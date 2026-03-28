#!/usr/bin/env tsx

/**
 * Create Branded Food Table Script for SnapCarb
 * 
 * This script recreates the missing branded_food table that's needed for barcode scanning.
 * Run this to restore the barcode functionality.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBrandedFoodTable() {
  console.log('🔄 Creating branded_food table...');

  try {
    // Create the branded_food table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.branded_food (
        id bigserial primary key,
        fdc_id int not null unique,
        brand_owner text,
        brand_name text,
        gtin_upc text,
        ingredients text,
        serving_size numeric,
        serving_size_unit text,
        created_at timestamp with time zone default timezone('utc'::text, now()) not null,
        updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.error('❌ Error creating branded_food table:', createError);
      return false;
    }

    console.log('✅ branded_food table created successfully!');

    // Create indexes for performance
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_branded_food_fdc_id ON public.branded_food(fdc_id);
      CREATE INDEX IF NOT EXISTS idx_branded_food_gtin_upc ON public.branded_food(gtin_upc);
      CREATE INDEX IF NOT EXISTS idx_branded_food_brand_owner ON public.branded_food(brand_owner);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexesSQL });
    
    if (indexError) {
      console.error('❌ Error creating indexes:', indexError);
    } else {
      console.log('✅ Indexes created successfully!');
    }

    // Add foreign key constraint to food table
    const addForeignKeySQL = `
      ALTER TABLE public.branded_food 
      ADD CONSTRAINT fk_branded_food_fdc_id 
      FOREIGN KEY (fdc_id) REFERENCES public.food(fdc_id) ON DELETE CASCADE;
    `;

    const { error: fkError } = await supabase.rpc('exec_sql', { sql: addForeignKeySQL });
    
    if (fkError) {
      console.error('⚠️  Warning: Could not add foreign key constraint (table might be empty):', fkError);
    } else {
      console.log('✅ Foreign key constraint added successfully!');
    }

    // Create trigger for updated_at timestamp
    const createTriggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = timezone('utc'::text, now());
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_branded_food_updated_at ON public.branded_food;
      
      CREATE TRIGGER update_branded_food_updated_at 
          BEFORE UPDATE ON public.branded_food 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', { sql: createTriggerSQL });
    
    if (triggerError) {
      console.error('❌ Error creating trigger:', triggerError);
    } else {
      console.log('✅ Trigger created successfully!');
    }

    // Grant permissions
    const grantPermissionsSQL = `
      GRANT ALL ON public.branded_food TO authenticated;
      GRANT ALL ON public.branded_food TO anon;
      GRANT USAGE, SELECT ON SEQUENCE public.branded_food_id_seq TO authenticated;
      GRANT USAGE, SELECT ON SEQUENCE public.branded_food_id_seq TO anon;
    `;

    const { error: grantError } = await supabase.rpc('exec_sql', { sql: grantPermissionsSQL });
    
    if (grantError) {
      console.error('❌ Error granting permissions:', grantError);
    } else {
      console.log('✅ Permissions granted successfully!');
    }

    console.log('\n🎉 branded_food table creation complete!');
    console.log('📱 Your barcode scanning functionality should now work!');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the script
if (require.main === module) {
  createBrandedFoodTable()
    .then(success => {
      if (success) {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Script failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Script crashed:', error);
      process.exit(1);
    });
}
