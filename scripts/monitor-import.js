const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UePKh!CkNJ5uatD@ceeakezbfavqzjnpsdpu.supabase.co:5432/postgres';

async function monitorImport() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('🔍 Monitoring USDA Nutrition Import Progress...\n');
    
    // Check food_nutrient table count
    const foodNutrientResult = await client.query('SELECT COUNT(*) as count FROM food_nutrient');
    const foodNutrientCount = foodNutrientResult.rows[0].count;
    console.log(`✅ Food Nutrient Table: ${foodNutrientCount.toLocaleString()} rows`);
    
    // Check staging table count
    const stagingResult = await client.query('SELECT COUNT(*) as count FROM staging_food_nutrient');
    const stagingCount = stagingResult.rows[0].count;
    console.log(`📊 Staging Table: ${stagingCount.toLocaleString()} rows`);
    
    // Check recent chunks
    const chunksResult = await client.query(`
      SELECT 
        chunk_imported_at, 
        COUNT(*) as chunk_size 
      FROM food_nutrient 
      WHERE chunk_imported_at IS NOT NULL
      GROUP BY chunk_imported_at 
      ORDER BY chunk_imported_at DESC 
      LIMIT 5
    `);
    
    if (chunksResult.rows.length > 0) {
      console.log('\n📅 Recent Chunks:');
      chunksResult.rows.forEach(row => {
        const timestamp = new Date(row.chunk_imported_at).toLocaleString();
        console.log(`  ${timestamp}: ${row.chunk_size.toLocaleString()} rows`);
      });
    }
    
    // Calculate progress
    const totalExpected = 27000000; // ~27M total expected
    const progress = ((foodNutrientCount / totalExpected) * 100).toFixed(1);
    console.log(`\n📈 Overall Progress: ${progress}% (${foodNutrientCount.toLocaleString()} / ${totalExpected.toLocaleString()})`);
    
    if (stagingCount > 0) {
      console.log(`\n⚠️  Note: ${stagingCount.toLocaleString()} rows still in staging table`);
      console.log('   Run the transformation SQL to move them to the final table');
    }
    
  } catch (err) {
    console.error('❌ Error monitoring import:', err.message);
  } finally {
    await client.end();
  }
}

monitorImport();
