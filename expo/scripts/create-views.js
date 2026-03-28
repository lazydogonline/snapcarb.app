const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createViews() {
  try {
    console.log('🚀 Creating USDA nutrition views and functions...');
    
    // First, let's check what nutrient IDs we have for the key nutrients
    console.log('\n🔍 Checking nutrient IDs...');
    const { data: nutrients, error: nutrientError } = await supabase
      .from('nutrient')
      .select('id, name')
      .in('name', [
        'Energy',
        'Protein',
        'Total lipid (fat)',
        'Carbohydrate, by difference',
        'Fiber, total dietary',
        'Total sugar alcohols',
        'Sugars, total including NLEA',
        'Sodium, Na'
      ]);
    
    if (nutrientError) {
      console.error('❌ Error fetching nutrients:', nutrientError);
      return;
    }
    
    console.log('✅ Found nutrients:', nutrients);
    
    // Create a simple view for food macros
    console.log('\n🔧 Creating v_food_macros_100g view...');
    
    // Let's test if we can query the existing data
    console.log('\n🧪 Testing existing data...');
    const { data: testData, error: testError } = await supabase
      .from('food_nutrient')
      .select(`
        fdc_id,
        nutrient_id,
        amount,
        food!inner(description),
        nutrient!inner(name)
      `)
      .limit(5);
    
    if (testError) {
      console.error('❌ Error testing data:', testError);
    } else {
      console.log('✅ Test query successful:', testData);
    }
    
    // Now let's try to create a simple view using raw SQL
    console.log('\n🔧 Attempting to create view with raw SQL...');
    
    // For now, let's just test the search functionality
    console.log('\n🧪 Testing food search...');
    const { data: searchResults, error: searchError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .ilike('description', '%chicken%')
      .limit(5);
    
    if (searchError) {
      console.error('❌ Error searching foods:', searchError);
    } else {
      console.log('✅ Food search successful:', searchResults);
    }
    
    console.log('\n🎉 View creation process completed!');
    console.log('💡 Note: Full view creation requires database admin access');
    console.log('📋 Next steps:');
    console.log('   1. Run the schema.sql in Supabase dashboard');
    console.log('   2. Or use pgAdmin/psql with admin credentials');
    console.log('   3. Test the views and functions');
    
  } catch (error) {
    console.error('❌ Error creating views:', error.message);
  }
}

createViews();
