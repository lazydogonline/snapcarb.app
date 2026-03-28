const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function splitAndImportCSV() {
  const csvPath = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    return;
  }
  
  console.log('📁 CSV file found:', csvPath);
  console.log('📊 File size:', (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(2), 'MB');
  
  // Split into chunks of ~50MB (well under the 100MB limit)
  const chunkSize = 50 * 1024 * 1024; // 50MB in bytes
  const fileSize = fs.statSync(csvPath).size;
  const totalChunks = Math.ceil(fileSize / chunkSize);
  
  console.log(`🔄 Splitting into ${totalChunks} chunks...`);
  
  let currentChunk = [];
  let chunkNumber = 1;
  let totalProcessed = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        currentChunk.push({
          fdc_id: row.fdc_id || null,
          nutrient_id: row.nutrient_id || null,
          amount: row.amount || null,
          data_points: row.data_points || null,
          derivation_id: row.derivation_id || null,
          min: row.min || null,
          max: row.max || null,
          median: row.median || null,
          loq: row.loq || null,
          footnote: row.footnote || null,
          min_year_acquired: row.min_year_acquired || null,
          percent_daily_value: row.percent_daily_value || null
        });
        
        // When chunk reaches size limit, import it
        if (currentChunk.length >= 10000) { // 10k rows per chunk
          importChunk(currentChunk, chunkNumber);
          currentChunk = [];
          chunkNumber++;
        }
      })
      .on('end', async () => {
        // Import remaining chunk
        if (currentChunk.length > 0) {
          await importChunk(currentChunk, chunkNumber);
        }
        
        console.log(`\n🎉 All chunks imported successfully!`);
        console.log(`📊 Total chunks processed: ${chunkNumber}`);
        console.log(`📊 Total records imported: ${totalProcessed}`);
        resolve();
      })
      .on('error', reject);
  });
  
  async function importChunk(chunk, chunkNum) {
    try {
      console.log(`📦 Importing chunk ${chunkNum} (${chunk.length} records)...`);
      
      const { error } = await supabase
        .from('food_nutrient')
        .insert(chunk);
      
      if (error) {
        console.error(`❌ Error importing chunk ${chunkNum}:`, error);
        return;
      }
      
      totalProcessed += chunk.length;
      console.log(`✅ Chunk ${chunkNum} imported successfully (${chunk.length} records)`);
      
    } catch (err) {
      console.error(`❌ Error importing chunk ${chunkNum}:`, err);
    }
  }
}

async function main() {
  try {
    await splitAndImportCSV();
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { splitAndImportCSV };
