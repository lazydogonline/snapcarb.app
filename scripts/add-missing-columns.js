const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('EXPO_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to food_nutrient table...');
  
  try {
    // Add all the missing columns
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.food_nutrient 
        ADD COLUMN IF NOT EXISTS data_points integer,
        ADD COLUMN IF NOT EXISTS derivation_id integer,
        ADD COLUMN IF NOT EXISTS min numeric,
        ADD COLUMN IF NOT EXISTS max numeric,
        ADD COLUMN IF NOT EXISTS median numeric,
        ADD COLUMN IF NOT EXISTS loq numeric,
        ADD COLUMN IF NOT EXISTS footnote text,
        ADD COLUMN IF NOT EXISTS min_year_acquired integer,
        ADD COLUMN IF NOT EXISTS percent_daily_value numeric;
      `
    });
    
    if (error) {
      console.error('❌ Error adding columns:', error);
      return false;
    }
    
    console.log('✅ All missing columns added successfully!');
    
    // Verify the table structure
    const { data, error: selectError } = await supabase
      .from('food_nutrient')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.error('❌ Error checking table:', selectError);
      return false;
    }
    
    console.log('📋 Current food_nutrient table structure:');
    console.log('Columns:', Object.keys(data[0] || {}));
    
    return true;
    
  } catch (err) {
    console.error('❌ Fatal error:', err);
    return false;
  }
}

async function main() {
  const success = await addMissingColumns();
  if (success) {
    console.log('🎉 food_nutrient table is now ready for USDA import!');
  } else {
    console.log('❌ Failed to add columns');
  }
}

if (require.main === module) {
  main();
}

module.exports = { addMissingColumns };
