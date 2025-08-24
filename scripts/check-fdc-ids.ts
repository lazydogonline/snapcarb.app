import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFdcIds() {
  try {
    console.log('🔍 Checking fdc_id mismatch between food and food_nutrient tables...\n');

    // Get some fdc_ids from food_nutrient table
    console.log('1. Checking food_nutrient table fdc_ids...');
    const { data: foodNutrientIds, error: fnError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(10);
    
    if (fnError) {
      console.error('Error getting food_nutrient fdc_ids:', fnError);
      return;
    }
    
    console.log('First 10 fdc_ids with nutrition data:', foodNutrientIds?.map(r => r.fdc_id));

    // Get some fdc_ids from food table
    console.log('\n2. Checking food table fdc_ids...');
    const { data: foodIds, error: foodError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .limit(10);
    
    if (foodError) {
      console.error('Error getting food fdc_ids:', foodError);
      return;
    }
    
    console.log('First 10 fdc_ids from food table:', foodIds?.map(f => ({ fdc_id: f.fdc_id, description: f.description })));

    // Check if any food_nutrient fdc_ids exist in food table
    if (foodNutrientIds && foodIds) {
      const nutritionFdcIds = foodNutrientIds.map(r => r.fdc_id);
      const foodFdcIds = foodIds.map(f => f.fdc_id);
      
      const matchingIds = nutritionFdcIds.filter(id => foodFdcIds.includes(id));
      console.log('\n3. Matching fdc_ids found:', matchingIds.length);
      
      if (matchingIds.length === 0) {
        console.log('❌ NO MATCHING fdc_ids found! This explains why nutrition lookup fails.');
        console.log('💡 The food and food_nutrient tables have completely different fdc_ids.');
      } else {
        console.log('✅ Some matching fdc_ids found:', matchingIds);
      }
    }

  } catch (error) {
    console.error('Error in checkFdcIds:', error);
  }
}

checkFdcIds();
