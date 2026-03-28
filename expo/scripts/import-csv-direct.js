const { Client } = require('pg');
const copyFrom = require('pg-copy-streams').from;
const fs = require('fs');
const path = require('path');

// Your Supabase connection string
const connectionString = 'postgresql://postgres:UePKh!CkNJ5uatD@ceeakezbfavqzjnpsdpu.supabase.co:5432/postgres';

async function importCSV() {
  const client = new Client({ connectionString });
  
  try {
    console.log('🔌 Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const csvPath = path.join(__dirname, '..', 'USDA FOOD IMPORT', 'FoodData_Central_csv_2025-04-24', 'food_nutrient.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      return;
    }
    
    console.log('📁 CSV file found:', csvPath);
    console.log('📊 File size:', (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(2), 'MB');
    
    console.log('🚀 Starting CSV import...');
    console.log('⚠️  This may take a while for 1.6GB of data...');
    
    // Create the COPY stream
    const copyStream = client.query(copyFrom('COPY food_nutrient FROM STDIN WITH (FORMAT csv, DELIMITER \',\', HEADER true)'));
    
    // Stream the file content
    const fileStream = fs.createReadStream(csvPath);
    
    return new Promise((resolve, reject) => {
      copyStream.on('finish', () => {
        console.log('✅ CSV import completed successfully!');
        resolve();
      });
      
      copyStream.on('error', (err) => {
        console.error('❌ Import error:', err);
        reject(err);
      });
      
      // Pipe the file to the COPY stream
      fileStream.pipe(copyStream);
    });
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

async function main() {
  await importCSV();
}

if (require.main === module) {
  main();
}

module.exports = { importCSV };
