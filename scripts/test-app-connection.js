const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Testing App Database Connection...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure your .env file has:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    console.log('\n1. Testing basic connection...');
    
    // Test 1: Simple query to food table
    const { data: foodCount, error: foodError } = await supabase
      .from('food')
      .select('*', { count: 'exact', head: true });

    if (foodError) {
      console.error('❌ Food table error:', foodError);
      return;
    }

    console.log(`✅ Food table accessible: ${foodCount} records`);

    // Test 2: Search for lamb
    console.log('\n2. Testing lamb search...');
    const { data: lambFoods, error: lambError } = await supabase
      .from('food')
      .select('description, fdc_id')
      .ilike('description', '%lamb%')
      .limit(5);

    if (lambError) {
      console.error('❌ Lamb search error:', lambError);
      return;
    }

    console.log(`✅ Found ${lambFoods?.length || 0} lamb foods`);
    if (lambFoods) {
      lambFoods.forEach(food => {
        console.log(`   - ${food.description}`);
      });
    }

    // Test 3: Check nutrition view
    console.log('\n3. Testing nutrition view...');
    const { data: nutritionCount, error: nutritionError } = await supabase
      .from('v_food_macros_100g')
      .select('*', { count: 'exact', head: true });

    if (nutritionError) {
      console.error('❌ Nutrition view error:', nutritionError);
      return;
    }

    console.log(`✅ Nutrition view accessible: ${nutritionCount} records`);

    console.log('\n🎉 All tests passed! Your app should work now.');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testConnection();


