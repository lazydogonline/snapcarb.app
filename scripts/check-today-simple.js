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
    
    // Check total count
    console.log('1. Checking total record count...');
    const { count: totalCount, error: countError } = await supabase
      .from('food_nutrient')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }
    
    console.log(`📊 Total records in food_nutrient: ${totalCount?.toLocaleString()}`);
    
    // Check for any recent records by looking at the highest IDs
    console.log('\n2. Checking for recent records (highest IDs)...');
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from('food_nutrient')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (maxIdError) {
      console.error('❌ Error getting max ID:', maxIdError);
      return;
    }
    
    const maxId = maxIdResult?.[0]?.id || 0;
    console.log(`🔢 Highest ID in table: ${maxId.toLocaleString()}`);
    
    // Check last 1000 records to see if they're recent
    const { data: recentRecords, error: recentError } = await supabase
      .from('food_nutrient')
      .select('id, fdc_id, nutrient_id, amount')
      .order('id', { ascending: false })
      .limit(1000);
    
    if (recentError) {
      console.error('❌ Error getting recent records:', recentError);
      return;
    }
    
    console.log(`📋 Last 1000 records (IDs ${(maxId - 999).toLocaleString()} to ${maxId.toLocaleString()})`);
    console.log('   Sample recent records:');
    recentRecords.slice(0, 5).forEach(record => {
      console.log(`   - ID: ${record.id}, Food: ${record.fdc_id}, Nutrient: ${record.nutrient_id}, Amount: ${record.amount}`);
    });
    
    // Check staging table count
    console.log('\n3. Checking staging table...');
    try {
      const { data: stagingData, error: stagingError } = await supabase
        .from('staging_food_nutrient')
        .select('*', { count: 'exact', head: true });
      
      if (stagingError) {
        console.log('   ⚠️  Staging table error:', stagingError.message);
      } else {
        const stagingCount = stagingData?.length || 0;
        console.log(`   📊 Staging table: ${stagingCount.toLocaleString()} records`);
        
        if (stagingCount > 0) {
          console.log('   ⚠️  Data still in staging - needs migration!');
        } else {
          console.log('   ✅ Staging table is empty');
        }
      }
    } catch (err) {
      console.log('   ⚠️  Staging table not accessible:', err.message);
    }
    
    // Check if there are any timestamp columns
    console.log('\n4. Checking for timestamp columns...');
    try {
      const { data: sampleRecord } = await supabase
        .from('food_nutrient')
        .select('*')
        .limit(1);
      
      if (sampleRecord && sampleRecord.length > 0) {
        const record = sampleRecord[0];
        console.log('📋 Sample record columns:');
        Object.keys(record).forEach(key => {
          const value = record[key];
          const type = typeof value;
          console.log(`   - ${key}: ${type} (${value})`);
        });
        
        // Look for any date-like columns
        const dateColumns = Object.keys(record).filter(key => 
          key.includes('created') || 
          key.includes('updated') || 
          key.includes('imported') ||
          key.includes('date') ||
          key.includes('time')
        );
        
        if (dateColumns.length > 0) {
          console.log(`\n⏰ Found ${dateColumns.length} potential date columns: ${dateColumns.join(', ')}`);
        } else {
          console.log('\n⏰ No obvious timestamp columns found');
        }
      }
    } catch (err) {
      console.log('   ⚠️  Error checking sample record:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

checkTodayRecords();

