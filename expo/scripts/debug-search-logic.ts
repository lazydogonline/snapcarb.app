import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSearchLogic() {
  try {
    console.log('🔍 Debugging search logic...\n');

    // Step 1: Check what foods exist with nutrition data
    console.log('1. Checking foods with nutrition data...');
    const { data: foodsWithNutrition, error: nutritionError } = await supabase
      .from('food')
      .select(`
        fdc_id,
        description,
        data_type
      `)
      .in('fdc_id', [1506638, 168482, 168483, 168484, 168485])
      .limit(10);
    
    if (nutritionError) {
      console.error('❌ Error getting foods with nutrition:', nutritionError);
      return;
    }
    
    console.log(`✅ Found ${foodsWithNutrition?.length || 0} foods with nutrition data:`);
    foodsWithNutrition?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
    });

    // Step 2: Test the actual search query from your app
    console.log('\n2. Testing the actual search query...');
    const searchTerm = 'chicken';
    
    // This is the query your app uses
    const { data: searchResults, error: searchError } = await supabase
      .from('food')
      .select(`
        fdc_id,
        description,
        data_type
      `)
      .ilike('description', `%${searchTerm}%`)
      .limit(20);
    
    if (searchError) {
      console.error('❌ Error in search:', searchError);
      return;
    }
    
    console.log(`✅ Search for "${searchTerm}" found ${searchResults?.length || 0} foods:`);
    searchResults?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
    });

    // Step 3: Check if any of these search results have nutrition data
    if (searchResults && searchResults.length > 0) {
      console.log('\n3. Checking nutrition data for search results...');
      const searchFoodIds = searchResults.map(f => f.fdc_id);
      
      const { data: searchNutrition, error: searchNutritionError } = await supabase
        .from('food_nutrient')
        .select('fdc_id, nutrient_id, amount')
        .in('fdc_id', searchFoodIds)
        .limit(50);
      
      if (searchNutritionError) {
        console.error('❌ Error checking search nutrition:', searchNutritionError);
        return;
      }
      
      console.log(`✅ Found ${searchNutrition?.length || 0} nutrition records for search results`);
      
      if (searchNutrition && searchNutrition.length > 0) {
        // Group by fdc_id
        const nutritionByFood = searchNutrition.reduce((acc, record) => {
          if (!acc[record.fdc_id]) acc[record.fdc_id] = [];
          acc[record.fdc_id].push(record);
          return acc;
        }, {} as any);
        
        Object.entries(nutritionByFood).forEach(([fdcId, records]: [string, any]) => {
          console.log(`   - Food ID ${fdcId}: ${records.length} nutrient records`);
        });
      } else {
        console.log('❌ No nutrition data found for search results!');
      }
    }

    // Step 4: Check what foods DO have nutrition data
    console.log('\n4. Checking what foods actually have nutrition data...');
    const { data: allNutrition, error: allNutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(100);
    
    if (allNutritionError) {
      console.error('❌ Error getting all nutrition:', allNutritionError);
      return;
    }
    
    const nutritionFdcIds = [...new Set(allNutrition?.map(r => r.fdc_id))];
    console.log(`✅ Found ${nutritionFdcIds.length} unique fdc_ids with nutrition data`);
    console.log('Sample nutrition fdc_ids:', nutritionFdcIds.slice(0, 10));

    // Step 5: Check if any of these nutrition foods match the search
    console.log('\n5. Checking if nutrition foods match search...');
    const { data: nutritionFoods, error: nutritionFoodsError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .in('fdc_id', nutritionFdcIds.slice(0, 20))
      .ilike('description', `%${searchTerm}%`)
      .limit(10);
    
    if (nutritionFoodsError) {
      console.error('❌ Error checking nutrition foods:', nutritionFoodsError);
      return;
    }
    
    console.log(`✅ Found ${nutritionFoods?.length || 0} nutrition foods matching "${searchTerm}":`);
    nutritionFoods?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
    });

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSearchLogic();
