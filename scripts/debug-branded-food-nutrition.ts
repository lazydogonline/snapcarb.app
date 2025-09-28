import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBrandedFoodNutrition() {
  try {
    console.log('🔍 Debugging branded food nutrition data...\n');

    // Step 1: Check what's in the nutrient table
    console.log('1. Checking nutrient table structure...');
    const { data: nutrients, error: nutrientError } = await supabase
      .from('nutrient')
      .select('id, name, unit_name')
      .limit(10);
    
    if (nutrientError) {
      console.error('Error getting nutrients:', nutrientError);
    } else {
      console.log('First 10 nutrients:', nutrients);
    }

    // Step 2: Find some branded foods
    console.log('\n2. Finding some branded foods...');
    const { data: brandedFoods, error: brandedError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .eq('data_type', 'branded_food')
      .limit(5);
    
    if (brandedError) {
      console.error('Error getting branded foods:', brandedError);
    } else {
      console.log('Found branded foods:', brandedFoods?.map(f => ({ fdc_id: f.fdc_id, description: f.description })));
    }

    if (brandedFoods && brandedFoods.length > 0) {
      // Step 3: Check nutrition data for the first branded food
      const firstBrandedFood = brandedFoods[0];
      console.log(`\n3. Checking nutrition data for: ${firstBrandedFood.description} (ID: ${firstBrandedFood.fdc_id})`);
      
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('food_nutrient')
        .select('nutrient_id, amount')
        .eq('fdc_id', firstBrandedFood.fdc_id);
      
      if (nutritionError) {
        console.error('Error getting nutrition data:', nutritionError);
      } else {
        console.log(`Nutrition records found: ${nutritionData?.length || 0}`);
        if (nutritionData && nutritionData.length > 0) {
          console.log('First few nutrition records:', nutritionData.slice(0, 5));
        }
      }

      // Step 4: Check what specific nutrients this food has
      if (nutritionData && nutritionData.length > 0) {
        console.log('\n4. Checking specific nutrients for this food...');
        const nutrientIds = nutritionData.map(n => n.nutrient_id);
        console.log('Nutrient IDs found:', nutrientIds);
        
        const { data: nutrientDetails, error: detailError } = await supabase
          .from('nutrient')
          .select('id, name, unit_name')
          .in('id', nutrientIds);
        
        if (detailError) {
          console.error('Error getting nutrient details:', detailError);
        } else {
          console.log('Nutrient details:', nutrientDetails);
        }
      }
    }

    // Step 5: Check if the specific nutrient IDs we're looking for exist
    console.log('\n5. Checking if our target nutrient IDs exist...');
    const targetNutrientIds = [1008, 1003, 1004, 1005, 1079, 2000, 1093];
    const { data: targetNutrients, error: targetError } = await supabase
      .from('nutrient')
      .select('id, name, unit_name')
      .in('id', targetNutrientIds);
    
    if (targetError) {
      console.error('Error getting target nutrients:', targetError);
    } else {
      console.log('Target nutrients found:', targetNutrients);
      console.log('Missing nutrient IDs:', targetNutrientIds.filter(id => !targetNutrients?.some(n => n.id === id)));
    }

  } catch (error) {
    console.error('Error in debug script:', error);
  }
}

debugBrandedFoodNutrition();
