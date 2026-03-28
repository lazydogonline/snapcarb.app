const { Client } = require('pg');

// Your Supabase connection string
const connectionString = 'postgresql://postgres:UePKh!CkNJ5uatD@db.ceeakezbfavqzjnpsdpu.supabase.co:5432/postgres';

async function addMissingColumns() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    console.log('🔧 Adding missing columns to food_nutrient table...');
    
    // Add all the missing columns
    const alterResult = await client.query(`
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
    `);
    
    console.log('✅ All missing columns added successfully!');
    
    // Verify the table structure
    const verifyResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'food_nutrient' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Current food_nutrient table structure:');
    verifyResult.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log(`\n🎉 Total columns: ${verifyResult.rows.length}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

async function main() {
  await addMissingColumns();
}

if (require.main === module) {
  main();
}

module.exports = { addMissingColumns };
