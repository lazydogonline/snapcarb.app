import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChickenSearch() {
  try {
    console.log('🍗 Testing chicken search with nutrition data...\n');

    // Step 1: Search for chicken foods
    console.log('1. Searching for chicken foods...');
    const { data: chickenFoods, error: searchError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', '%chicken%')
      .limit(10);
    
    if (searchError) {
      console.error('❌ Error searching:', searchError);
      return;
    }
    
    console.log(`✅ Found ${chickenFoods?.length || 0} chicken foods:`);
    chickenFoods?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}, Type: ${food.data_type}`);
    });

    // Step 2: Check which of these have nutrition data
    if (chickenFoods && chickenFoods.length > 0) {
      console.log('\n2. Checking nutrition data for chicken foods...');
      const foodIds = chickenFoods.map(f => f.fdc_id);
      
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('food_nutrient')
        .select('fdc_id, nutrient_id, amount')
        .in('fdc_id', foodIds)
        .limit(100);
      
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
          
          // Show nutrient details
          records.forEach((record: any) => {
            let nutrientName = 'Unknown';
            if (record.nutrient_id === 1008) nutrientName = 'Calories';
            else if (record.nutrient_id === 1003) nutrientName = 'Protein';
            else if (record.nutrient_id === 1004) nutrientName = 'Fat';
            else if (record.nutrient_id === 1005) nutrientName = 'Carbs';
            
            console.log(`     * ${nutrientName}: ${record.amount}`);
          });
        });
      } else {
        console.log('❌ No nutrition data found for chicken foods!');
      }
    }

    // Step 3: Test the specific chicken foods we created
    console.log('\n3. Testing our created chicken foods...');
    const { data: createdFoods, error: createdError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .in('fdc_id', [9999001, 9999002, 9999003])
      .limit(10);
    
    if (createdError) {
      console.error('❌ Error checking created foods:', createdError);
      return;
    }
    
    console.log(`✅ Found ${createdFoods?.length || 0} created chicken foods:`);
    createdFoods?.forEach(food => {
      console.log(`   - ID: ${food.fdc_id}, Description: ${food.description}`);
    });

    // Step 4: Check nutrition for created foods
    if (createdFoods && createdFoods.length > 0) {
      console.log('\n4. Checking nutrition for created chicken foods...');
      const createdIds = createdFoods.map(f => f.fdc_id);
      
      const { data: createdNutrition, error: createdNutritionError } = await supabase
        .from('food_nutrient')
        .select('fdc_id, nutrient_id, amount')
        .in('fdc_id', createdIds)
        .limit(50);
      
      if (createdNutritionError) {
        console.error('❌ Error checking created nutrition:', createdNutritionError);
        return;
      }
      
      console.log(`✅ Found ${createdNutrition?.length || 0} nutrition records for created foods`);
      
      if (createdNutrition && createdNutrition.length > 0) {
        // Group by fdc_id
        const nutritionByFood = createdNutrition.reduce((acc, record) => {
          if (!acc[record.fdc_id]) acc[record.fdc_id] = [];
          acc[record.fdc_id].push(record);
          return acc;
        }, {} as any);
        
        Object.entries(nutritionByFood).forEach(([fdcId, records]: [string, any]) => {
          console.log(`   - Food ID ${fdcId}: ${records.length} nutrient records`);
          
          // Calculate totals
          let calories = 0, protein = 0, fat = 0, carbs = 0;
          records.forEach((record: any) => {
            if (record.nutrient_id === 1008) calories = record.amount;
            else if (record.nutrient_id === 1003) protein = record.amount;
            else if (record.nutrient_id === 1004) fat = record.amount;
            else if (record.nutrient_id === 1005) carbs = record.amount;
          });
          
          console.log(`     * Calories: ${calories}, Protein: ${protein}g, Fat: ${fat}g, Carbs: ${carbs}g`);
        });
      }
    }
    
    console.log('\n🎯 Chicken search test complete!');
    console.log('💡 Your app should now find chicken foods with nutrition data!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testChickenSearch();
