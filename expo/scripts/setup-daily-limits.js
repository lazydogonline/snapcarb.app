const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDailyLimits() {
  console.log('🔧 Setting up daily recipe search limits...\n');
  
  try {
    // Create the daily_recipe_searches table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS daily_recipe_searches (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );
      `
    });
    
    if (createError) {
      console.log('ℹ️ Table might already exist, continuing...');
    } else {
      console.log('✅ Created daily_recipe_searches table');
    }
    
    // Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_daily_recipe_searches_user_date 
        ON daily_recipe_searches(user_id, date);
      `
    });
    
    if (indexError) {
      console.log('ℹ️ Index might already exist, continuing...');
    } else {
      console.log('✅ Created index for fast lookups');
    }
    
    // Enable RLS
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE daily_recipe_searches ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.log('ℹ️ RLS might already be enabled, continuing...');
    } else {
      console.log('✅ Enabled Row Level Security');
    }
    
    console.log('\n🎉 Daily recipe search limits setup complete!');
    console.log('📊 Users will be limited to 3 recipe searches per day');
    console.log('🛡️ This prevents Gemini API abuse and controls costs');
    
  } catch (error) {
    console.error('❌ Error setting up daily limits:', error);
    console.log('\n💡 You may need to run this SQL manually in your Supabase dashboard:');
    console.log(`
CREATE TABLE IF NOT EXISTS daily_recipe_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_recipe_searches_user_date 
ON daily_recipe_searches(user_id, date);

ALTER TABLE daily_recipe_searches ENABLE ROW LEVEL SECURITY;
    `);
  }
}

setupDailyLimits();
