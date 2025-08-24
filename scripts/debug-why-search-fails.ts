import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWhySearchFails() {
  try {
    console.log('🔍 Debugging why search still fails...\n');

    // Step 1: Check what we actually have in the database
    console.log('1. Checking database contents...');
    
    const { data: foodCount, error: foodError } = await supabase
      .from('food')
      .select('fdc_id', { count: 'exact' });
    
    const { data: nutritionCount, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id', { count: 'exact' });
    
    if (foodError) {
      console.error('❌ Food table error:', foodError.message);
    } else {
      console.log(`✅ Food table: ${foodCount?.length || 0} records`);
    }
    
    if (nutritionError) {
      console.error('❌ Nutrition table error:', nutritionError.message);
    } else {
      console.log(`✅ Nutrition table: ${nutritionCount?.length || 0} records`);
    }

    // Step 2: Test the exact search your app uses
    console.log('\n2. Testing the exact search query...');
    const searchTerm = 'chicken';
    
    const { data: searchResults, error: searchError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', `%${searchTerm}%`)
      .limit(10);
    
    if (searchError) {
      console.error('❌ Search error:', searchError.message);
    } else {
      console.log(`✅ Search for "${searchTerm}" found ${searchResults?.length || 0} foods:`);
      searchResults?.forEach(food => {
        console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
      });
    }

    // Step 3: Check if ANY foods have nutrition data
    console.log('\n3. Checking if ANY foods have nutrition data...');
    const { data: allFoods, error: allFoodsError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .limit(10);
    
    if (!allFoodsError && allFoods && allFoods.length > 0) {
      console.log('✅ Sample foods in database:', allFoods.map(f => `${f.description} (ID: ${f.fdc_id})`));
      
      // Check if these foods have nutrition data
      const sampleIds = allFoods.map(f => f.fdc_id);
      const { data: sampleNutrition, error: sampleNutritionError } = await supabase
        .from('food_nutrient')
        .select('fdc_id, nutrient_id, amount')
        .in('fdc_id', sampleIds)
        .limit(20);
      
      if (sampleNutritionError) {
        console.error('❌ Sample nutrition error:', sampleNutritionError.message);
      } else {
        console.log(`✅ Sample nutrition data: ${sampleNutrition?.length || 0} records found`);
        
        if (sampleNutrition && sampleNutrition.length > 0) {
          // Group by fdc_id
          const nutritionByFood = sampleNutrition.reduce((acc, record) => {
            if (!acc[record.fdc_id]) acc[record.fdc_id] = [];
            acc[record.fdc_id].push(record);
            return acc;
          }, {} as any);
          
          Object.entries(nutritionByFood).forEach(([fdcId, records]: [string, any]) => {
            console.log(`   - Food ID ${fdcId}: ${records.length} nutrient records`);
          });
        }
      }
    }

    // Step 4: Check what's in your app's search logic
    console.log('\n4. Checking your app\'s search logic...');
    console.log('💡 Your app might be filtering out foods without nutrition data');
    console.log('💡 Or there might be a mismatch in the search query');
    
    // Step 5: Test a simple search without filters
    console.log('\n5. Testing simple search without filters...');
    const { data: simpleSearch, error: simpleError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .limit(5);
    
    if (!simpleError && simpleSearch && simpleSearch.length > 0) {
      console.log('✅ Simple search works, found foods:', simpleSearch.map(f => f.description));
      
      // Check if these have nutrition
      const simpleIds = simpleSearch.map(f => f.fdc_id);
      const { data: simpleNutrition, error: simpleNutritionError } = await supabase
        .from('food_nutrient')
        .select('fdc_id')
        .in('fdc_id', simpleIds)
        .limit(10);
      
      if (!simpleNutritionError && simpleNutrition) {
        console.log(`✅ Simple nutrition check: ${simpleNutrition.length} nutrition records found`);
      }
    }

    console.log('\n🎯 Debug complete!');
    console.log('💡 The issue might be in your app\'s search logic, not the database');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugWhySearchFails();
