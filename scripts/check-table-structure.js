const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Checking actual table structure in database...');
    
    // Check food_nutrient table structure
    console.log('\n📋 food_nutrient table structure:');
    const { data: foodNutrientData, error: foodNutrientError } = await supabase
      .from('food_nutrient')
      .select('*')
      .limit(1);
    
    if (foodNutrientError) {
      console.log('❌ Error accessing food_nutrient:', foodNutrientError.message);
    } else if (foodNutrientData && foodNutrientData.length > 0) {
      console.log('✅ Sample row:', JSON.stringify(foodNutrientData[0], null, 2));
    } else {
      console.log('ℹ️  food_nutrient table is empty');
    }
    
    // Check food table structure
    console.log('\n📋 food table structure:');
    const { data: foodData, error: foodError } = await supabase
      .from('food')
      .select('*')
      .limit(1);
    
    if (foodError) {
      console.log('❌ Error accessing food:', foodError.message);
    } else if (foodData && foodData.length > 0) {
      console.log('✅ Sample row:', JSON.stringify(foodData[0], null, 2));
    } else {
      console.log('ℹ️  food table is empty');
    }
    
    // Check nutrient table structure
    console.log('\n📋 nutrient table structure:');
    const { data: nutrientData, error: nutrientError } = await supabase
      .from('nutrient')
      .select('*')
      .limit(1);
    
    if (nutrientError) {
      console.log('❌ Error accessing nutrient:', nutrientError.message);
    } else if (nutrientData && nutrientData.length > 0) {
      console.log('✅ Sample row:', JSON.stringify(nutrientData[0], null, 2));
    } else {
      console.log('ℹ️  nutrient table is empty');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkTableStructure();
