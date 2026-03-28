const { Client } = require('pg');

const connectionString = 'postgresql://postgres:UePKh!CkNJ5uatD@ceeakezbfavqzjnpsdpu.supabase.co:5432/postgres';

async function testConnection() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Testing database connection...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT COUNT(*) as count FROM food_nutrient');
    console.log(`📊 Food Nutrient Table: ${result.rows[0].count} rows`);
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
  } finally {
    await client.end();
  }
}

testConnection();
