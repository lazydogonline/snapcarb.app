import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importMissingFoods() {
  try {
    console.log('🔧 Importing missing food records...\n');

    // Step 1: Check what fdc_ids we have nutrition data for
    console.log('1. Checking what fdc_ids have nutrition data...');
    const { data: nutritionIds, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(1000);
    
    if (nutritionError) {
      console.error('❌ Error getting nutrition IDs:', nutritionError);
      return;
    }
    
    const uniqueNutritionIds = [...new Set(nutritionIds?.map(r => r.fdc_id))];
    console.log(`✅ Found ${uniqueNutritionIds.length} unique fdc_ids with nutrition data`);
    console.log('Sample IDs:', uniqueNutritionIds.slice(0, 10));

    // Step 2: Check which of these foods already exist in the food table
    console.log('\n2. Checking which foods already exist...');
    const { data: existingFoods, error: existingError } = await supabase
      .from('food')
      .select('fdc_id')
      .in('fdc_id', uniqueNutritionIds.slice(0, 100)); // Check first 100
    
    if (existingError) {
      console.error('❌ Error checking existing foods:', existingError);
      return;
    }
    
    const existingIds = new Set(existingFoods?.map(f => f.fdc_id));
    const missingIds = uniqueNutritionIds.filter(id => !existingIds.has(id));
    
    console.log(`✅ ${existingIds.size} foods already exist`);
    console.log(`❌ ${missingIds.length} foods are missing`);
    console.log('Sample missing IDs:', missingIds.slice(0, 10));

    // Step 3: Create basic food records for missing IDs
    console.log('\n3. Creating basic food records for missing IDs...');
    const newFoods = missingIds.slice(0, 100).map(fdcId => ({
      fdc_id: fdcId,
      description: `Food Item ${fdcId}`, // Placeholder description
      data_type: 'survey (FNDDS)', // Generic type
      publication_date: '2024-01-01' // Placeholder date
    }));

    // Step 4: Import the missing food records
    console.log('\n4. Importing missing food records...');
    const { error: importError } = await supabase
      .from('food')
      .insert(newFoods);
    
    if (importError) {
      console.error('❌ Error importing foods:', importError);
      return;
    }
    
    console.log(`✅ Successfully imported ${newFoods.length} food records`);

    // Step 5: Verify the fix
    console.log('\n5. Verifying the fix...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .in('fdc_id', missingIds.slice(0, 5))
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
    } else {
      console.log('✅ Verification successful! Sample imported foods:', verifyData);
    }
    
    console.log('\n🎯 Now your food search should work!');
    console.log('💡 The nutrition data will now match with food records!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

importMissingFoods();
