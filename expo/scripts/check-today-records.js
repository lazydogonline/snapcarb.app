const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTodayRecords() {
  try {
    console.log('🔍 Checking for records with today\'s timestamp...\n');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Looking for records from: ${today}\n`);
    
    // Check if there's a timestamp column
    console.log('1. Checking table structure...');
    const { data: columns, error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'food_nutrient' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (columnError) {
      console.error('❌ Error checking columns:', columnError);
      return;
    }
    
    console.log('📋 Table columns:');
    columns.data?.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check for any timestamp-like columns
    const timestampColumns = columns.data?.filter(col => 
      col.data_type.includes('timestamp') || 
      col.data_type.includes('date') ||
      col.column_name.includes('created') ||
      col.column_name.includes('updated') ||
      col.column_name.includes('imported')
    ) || [];
    
    console.log(`\n⏰ Found ${timestampColumns.length} timestamp columns:`);
    timestampColumns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check total count
    console.log('\n2. Checking total record count...');
    const { count: totalCount, error: countError } = await supabase
      .from('food_nutrient')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total records in food_nutrient: ${totalCount?.toLocaleString()}`);
    
    // If we have timestamp columns, check for today's records
    if (timestampColumns.length > 0) {
      console.log('\n3. Checking for today\'s records...');
      
      for (const col of timestampColumns) {
        try {
          const { data: todayRecords, error: todayError } = await supabase.rpc('exec_sql', {
            sql: `
              SELECT COUNT(*) as count 
              FROM food_nutrient 
              WHERE DATE(${col.column_name}) = '${today}'
            `
          });
          
          if (todayError) {
            console.log(`   ⚠️  ${col.column_name}: Error checking (${todayError.message})`);
          } else {
            const count = todayRecords.data?.[0]?.count || 0;
            console.log(`   📅 ${col.column_name}: ${count.toLocaleString()} records from today`);
          }
        } catch (err) {
          console.log(`   ⚠️  ${col.column_name}: Error (${err.message})`);
        }
      }
    }
    
    // Check for any recent records (last 24 hours)
    console.log('\n4. Checking for recent records (last 24 hours)...');
    const { data: recentRecords, error: recentError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT COUNT(*) as count 
        FROM food_nutrient 
        WHERE id > (SELECT MAX(id) - 1000000 FROM food_nutrient)
      `
    });
    
    if (recentError) {
      console.log('   ⚠️  Error checking recent records:', recentError.message);
    } else {
      const recentCount = recentRecords.data?.[0]?.count || 0;
      console.log(`   🔍 Recent records (last ~1M IDs): ${recentCount.toLocaleString()}`);
    }
    
    // Check staging table
    console.log('\n5. Checking staging table...');
    const { data: stagingCount, error: stagingError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT COUNT(*) as count FROM staging_food_nutrient'
    });
    
    if (stagingError) {
      console.log('   ⚠️  Staging table error:', stagingError.message);
    } else {
      const stagingRecords = stagingCount.data?.[0]?.count || 0;
      console.log(`   📊 Staging table: ${stagingRecords.toLocaleString()} records`);
      
      if (stagingRecords > 0) {
        console.log('   ⚠️  Data still in staging - needs migration!');
      }
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

checkTodayRecords();

