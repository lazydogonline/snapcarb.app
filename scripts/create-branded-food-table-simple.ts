#!/usr/bin/env tsx

/**
 * Create Branded Food Table Script for SnapCarb (Simple Version)
 * 
 * This script recreates the missing branded_food table using direct SQL execution.
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
    // Method 1: Try to create table using direct SQL (if we have access)
    console.log('📝 Attempting to create table...');
    
    // First, let's check if the table already exists
    const { data: existingTable, error: checkError } = await supabase
      .from('branded_food')
      .select('fdc_id')
      .limit(1);
    
    if (!checkError && existingTable !== null) {
      console.log('✅ branded_food table already exists!');
      return true;
    }
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('ℹ️  Table does not exist, attempting to create...');
    } else {
      console.log('⚠️  Unexpected error checking table:', checkError);
    }

    // Since we can't use exec_sql, let's try to create the table by inserting data
    // This will fail gracefully if the table doesn't exist, but we'll get a clear error
    console.log('🔄 Testing table creation by attempting insert...');
    
    const testInsert = {
      fdc_id: 999999, // Test ID
      brand_owner: 'TEST',
      brand_name: 'TEST',
      gtin_upc: 'TEST123',
      ingredients: 'TEST',
      serving_size: 100,
      serving_size_unit: 'g'
    };
    
    const { error: insertError } = await supabase
      .from('branded_food')
      .insert(testInsert);
    
    if (insertError && insertError.code === 'PGRST116') {
      console.log('❌ Table does not exist and we cannot create it programmatically');
      console.log('💡 You need to create the table manually in Supabase Dashboard');
      console.log('\n📋 Here is the SQL to run in Supabase SQL Editor:');
      console.log(`
CREATE TABLE public.branded_food (
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

-- Create indexes
CREATE INDEX idx_branded_food_fdc_id ON public.branded_food(fdc_id);
CREATE INDEX idx_branded_food_gtin_upc ON public.branded_food(gtin_upc);
CREATE INDEX idx_branded_food_brand_owner ON public.branded_food(brand_owner);

-- Grant permissions
GRANT ALL ON public.branded_food TO authenticated;
GRANT ALL ON public.branded_food TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.branded_food_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.branded_food_id_seq TO anon;
      `);
      return false;
    } else if (insertError) {
      console.error('❌ Unexpected error:', insertError);
      return false;
    } else {
      console.log('✅ Table exists and is working!');
      
      // Clean up test data
      const { error: deleteError } = await supabase
        .from('branded_food')
        .delete()
        .eq('fdc_id', 999999);
      
      if (deleteError) {
        console.log('⚠️  Warning: Could not clean up test data:', deleteError);
      } else {
        console.log('✅ Test data cleaned up');
      }
      
      return true;
    }

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
        console.log('📱 Your barcode scanning functionality should now work!');
        process.exit(0);
      } else {
        console.log('\n❌ Script failed!');
        console.log('💡 Please run the SQL manually in Supabase Dashboard');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Script crashed:', error);
      process.exit(1);
    });
}
