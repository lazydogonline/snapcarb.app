const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function debugFoodSearch() {
  console.log('🔍 Debugging Food Search...\n');

  try {
    const query = 'lamb';
    console.log(`1. Searching for: "${query}"`);

    const searchTerm = query.trim().toLowerCase();
    
    // Step 1: Search the food table for matching descriptions
    console.log('2. Searching food table...');
    const { data: foods, error: foodError } = await supabase
      .from('food')
      .select(`
        fdc_id,
        description,
        data_type
      `)
      .ilike('description', `%${searchTerm}%`)
      .limit(100);

    if (foodError) {
      console.error('❌ Food search error:', foodError);
      return;
    }

    if (!foods || foods.length === 0) {
      console.log('ℹ️ No foods found matching description');
      return;
    }

    console.log(`✅ Found ${foods.length} foods matching description`);
    console.log('First 3 foods:');
    foods.slice(0, 3).forEach(food => {
      console.log(`   - ${food.description} (ID: ${food.fdc_id})`);
    });

    // Step 2: Get nutrition data for these foods using the view
    const fdcIds = foods.map(f => f.fdc_id);
    console.log(`\n3. Getting nutrition data for ${fdcIds.length} foods...`);
    
    const { data: nutritionData, error: nutritionError } = await supabase
      .from('v_food_macros_100g')
      .select('*')
      .in('fdc_id', fdcIds);

    if (nutritionError) {
      console.error('❌ Nutrition data error:', nutritionError);
      return;
    }

    console.log(`✅ Found nutrition data for ${nutritionData?.length || 0} foods`);

    if (nutritionData && nutritionData.length > 0) {
      console.log('First nutrition record:');
      console.log(JSON.stringify(nutritionData[0], null, 2));
    }

    // Step 3: Check if foods have nutrition data
    const foodsWithNutrition = foods.filter(food => 
      nutritionData?.some(n => n.fdc_id === food.fdc_id)
    );

    console.log(`\n4. Foods with nutrition data: ${foodsWithNutrition.length}/${foods.length}`);

    if (foodsWithNutrition.length > 0) {
      console.log('First food with nutrition:');
      const firstFood = foodsWithNutrition[0];
      const nutrition = nutritionData.find(n => n.fdc_id === firstFood.fdc_id);
      console.log(`   Food: ${firstFood.description}`);
      console.log(`   Calories: ${nutrition.calories}`);
      console.log(`   Protein: ${nutrition.protein_g}g`);
      console.log(`   Total Carbs: ${nutrition.total_carbs_g}g`);
      console.log(`   Fiber: ${nutrition.fiber_g}g`);
      console.log(`   Net Carbs: ${nutrition.total_carbs_g - nutrition.fiber_g}g`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugFoodSearch();


