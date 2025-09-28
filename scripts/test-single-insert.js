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

async function testSingleInsert() {
  try {
    console.log('🧪 Testing single insert to understand table structure...');
    
    // Try to insert with just the basic fields
    const { data, error } = await supabase
      .from('food_nutrient')
      .insert({
        id: 1, // Try explicit ID
        fdc_id: 1006, // Spinach from our test
        nutrient_id: 1008, // Energy
        amount: 23.0
      });
    
    if (error) {
      console.log('❌ Insert failed:', error.message);
      console.log('🔍 Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Insert successful!');
      console.log('📊 Inserted data:', data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSingleInsert();
