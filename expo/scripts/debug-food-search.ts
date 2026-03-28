import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFoodSearch() {
  try {
    console.log('🔍 Debugging food search...\n');

    // Step 1: Check what foods exist for "chicken"
    console.log('1. Searching for foods with "chicken" in description...');
    const { data: chickenFoods, error: foodError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', '%chicken%')
      .limit(10);
    
    if (foodError) {
      console.error('❌ Error searching foods:', foodError);
      return;
    }
    
    console.log(`✅ Found ${chickenFoods?.length || 0} foods with "chicken":`);
    chickenFoods?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
    });

    if (!chickenFoods || chickenFoods.length === 0) {
      console.log('❌ No foods found with "chicken" in description!');
      return;
    }

    // Step 2: Check if these foods have nutrition data
    console.log('\n2. Checking nutrition data for found foods...');
    const foodIds = chickenFoods.map(f => f.fdc_id);
    
    const { data: nutritionData, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id, nutrient_id, amount')
      .in('fdc_id', foodIds)
      .limit(20);
    
    if (nutritionError) {
      console.error('❌ Error checking nutrition:', nutritionError);
      return;
    }
    
    console.log(`✅ Found ${nutritionData?.length || 0} nutrition records for chicken foods`);
    
    if (nutritionData && nutritionData.length > 0) {
      // Group by fdc_id
      const nutritionByFood = nutritionData.reduce((acc, record) => {
        if (!acc[record.fdc_id]) acc[record.fdc_id] = [];
        acc[record.fdc_id].push(record);
        return acc;
      }, {} as any);
      
      Object.entries(nutritionByFood).forEach(([fdcId, records]: [string, any]) => {
        console.log(`   - Food ID ${fdcId}: ${records.length} nutrient records`);
      });
    } else {
      console.log('❌ No nutrition data found for chicken foods!');
    }

    // Step 3: Check what fdc_ids exist in food_nutrient table
    console.log('\n3. Checking what fdc_ids exist in food_nutrient table...');
    const { data: allNutritionIds, error: allNutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(10);
    
    if (allNutritionError) {
      console.error('❌ Error checking all nutrition IDs:', allNutritionError);
      return;
    }
    
    console.log(`✅ Sample fdc_ids in food_nutrient table:`, allNutritionIds?.map(r => r.fdc_id));

    // Step 4: Check if there's a mismatch
    console.log('\n4. Analyzing the mismatch...');
    if (chickenFoods && nutritionData) {
      const foodFdcIds = new Set(chickenFoods.map(f => f.fdc_id));
      const nutritionFdcIds = new Set(nutritionData.map(n => n.fdc_id));
      
      const matchingIds = [...foodFdcIds].filter(id => nutritionFdcIds.has(id));
      console.log(`✅ Matching fdc_ids: ${matchingIds.length}`);
      
      if (matchingIds.length === 0) {
        console.log('❌ NO MATCHING fdc_ids! This is the problem!');
        console.log('💡 The foods exist but have different IDs than the nutrition data');
      } else {
        console.log('✅ Some foods have matching nutrition data');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugFoodSearch();
