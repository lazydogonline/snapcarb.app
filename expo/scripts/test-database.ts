#!/usr/bin/env tsx

/**
 * Database Test Script for SnapCarb
 * 
 * This script tests the database schema, views, and functions after importing USDA data.
 * Run this after importing the CSV data to verify everything works.
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

async function testDatabase() {
  console.log('🔍 Testing database connection and data...\n');

  try {
    // Test 1: Check if tables exist and have data
    console.log('📊 Checking table data...');
    
    const { data: foodCount, error: foodError } = await supabase
      .from('food')
      .select('fdc_id', { count: 'exact' });
    
    if (foodError) {
      console.error('❌ Error checking food table:', foodError);
    } else {
      console.log(`✅ Food table: ${foodCount?.length || 0} records`);
    }

    const { data: nutrientCount, error: nutrientError } = await supabase
      .from('nutrient')
      .select('id', { count: 'exact' });
    
    if (nutrientError) {
      console.error('❌ Error checking nutrient table:', nutrientError);
    } else {
      console.log(`✅ Nutrient table: ${nutrientCount?.length || 0} records`);
    }

    const { data: foodNutrientCount, error: foodNutrientError } = await supabase
      .from('food_nutrient')
      .select('fdc_id', { count: 'exact' });
    
    if (foodNutrientError) {
      console.error('❌ Error checking food_nutrient table:', foodNutrientError);
    } else {
      console.log(`✅ Food_nutrient table: ${foodNutrientCount?.length || 0} records`);
    }

    // Test 2: Try a simple search
    console.log('\n🔍 Testing food search...');
    
    const { data: searchResults, error: searchError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .ilike('description', '%steak%')
      .limit(5);

    if (searchError) {
      console.error('❌ Error searching foods:', searchError);
    } else {
      console.log(`✅ Search test: Found ${searchResults?.length || 0} steak results`);
      if (searchResults && searchResults.length > 0) {
        searchResults.forEach((food, index) => {
          console.log(`   ${index + 1}. ${food.description} (ID: ${food.fdc_id})`);
        });
      }
    }

    // Test 3: Check if nutrition data exists
    if (searchResults && searchResults.length > 0) {
      console.log('\n🥗 Testing nutrition lookup...');
      
      const firstFood = searchResults[0];
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('food_nutrient')
        .select(`
          nutrient_id,
          amount,
          nutrients!inner(name, unit_name)
        `)
        .eq('fdc_id', firstFood.fdc_id)
        .limit(5);

      if (nutritionError) {
        console.error('❌ Error getting nutrition:', nutritionError);
      } else {
        console.log(`✅ Nutrition test: Found ${nutritionData?.length || 0} nutrition records for ${firstFood.description}`);
        if (nutritionData && nutritionData.length > 0) {
          nutritionData.forEach((item: any, index) => {
            const nutrientName = item.nutrients?.name || 'Unknown';
            const unitName = item.nutrients?.unit_name || 'Unknown';
            console.log(`   ${index + 1}. ${nutrientName}: ${item.amount} ${unitName}`);
          });
        }
      }
    }

    // Test nutrition lookup
    console.log('\n🧪 Testing nutrition lookup...');
    try {
      const { data: nutrients, error: nutrientsError } = await supabase
        .from('nutrient')
        .select('id, name, unit_name')
        .limit(10);
      
      if (nutrientsError) {
        console.error('❌ Error getting nutrients:', nutrientsError);
      } else {
        console.log('✅ Nutrients found:', nutrients);
      }

      // Test food_nutrient join
      const { data: foodNutrients, error: foodNutrientsError } = await supabase
        .from('food_nutrient')
        .select(`
          nutrient_id,
          amount,
          nutrients!inner(name, unit_name)
        `)
        .eq('fdc_id', 1100001) // Test with a specific FDC ID
        .limit(5);
      
      if (foodNutrientsError) {
        console.error('❌ Error getting food nutrients:', foodNutrientsError);
      } else {
        console.log('✅ Food nutrients found:', foodNutrients);
      }

      // Find specific nutrient IDs we need
      console.log('\n🔍 Looking for specific nutrients...');
      const { data: energyNutrients, error: energyError } = await supabase
        .from('nutrient')
        .select('id, name, unit_name')
        .or('name.ilike.%energy%,name.ilike.%protein%,name.ilike.%fat%,name.ilike.%carbohydrate%,name.ilike.%fiber%,name.ilike.%sugar%,name.ilike.%sodium%');
      
      if (energyError) {
        console.error('❌ Error getting energy nutrients:', energyError);
      } else {
        console.log('✅ Energy-related nutrients found:', energyNutrients);
      }
    } catch (error) {
      console.error('❌ Error in nutrition test:', error);
    }

    console.log('\n📋 Summary:');
    if ((foodCount?.length || 0) === 0) {
      console.log('❌ Food table is empty - you need to run the USDA import script');
      console.log('💡 Run: npm run ts-node scripts/import-essential-usda-data.ts');
    } else if ((nutrientCount?.length || 0) === 0) {
      console.log('❌ Nutrient table is empty - you need to run the USDA import script');
      console.log('💡 Run: npm run ts-node scripts/import-essential-usda-data.ts');
    } else if ((foodNutrientCount?.length || 0) === 0) {
      console.log('❌ Food_nutrient table is empty - you need to run the USDA import script');
      console.log('💡 Run: npm run ts-node scripts/import-essential-usda-data.ts');
    } else {
      console.log('✅ All tables have data - the issue might be elsewhere');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabase();



