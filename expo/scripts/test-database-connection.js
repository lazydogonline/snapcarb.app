const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('nutrient')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const tables = ['nutrient', 'food', 'food_nutrient'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error(`❌ Table ${table} not accessible:`, tableError);
        } else {
          console.log(`✅ Table ${table} accessible`);
        }
      } catch (err) {
        console.error(`❌ Error accessing table ${table}:`, err);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing database setup...');
  
  const success = await testConnection();
  
  if (success) {
    console.log('\n🎉 Database is ready for import!');
    console.log('Run: npm run import-foods');
  } else {
    console.log('\n💥 Database setup issues found.');
    console.log('Please check your Supabase configuration and try again.');
  }
}

// Run the test
main().catch(console.error);
