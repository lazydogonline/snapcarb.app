const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
const { createWriteStream } = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getExistingNutrients() {
  console.log('🔍 Getting existing nutrients from database...');
  
  try {
    const { data: nutrients, error } = await supabase
      .from('nutrient')
      .select('id');
    
    if (error) throw error;
    
    const nutrientIds = new Set(nutrients.map(n => n.id));
    console.log(`📊 Found ${nutrientIds.size} existing nutrients in database`);
    
    return nutrientIds;
  } catch (error) {
    console.error('❌ Error getting nutrients:', error.message);
    throw error;
  }
}

async function filterFoodNutrientCSV() {
  console.log('🚀 Filtering food_nutrient CSV to match existing nutrients...');
  
  const inputPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient_CLEANED.csv';
  const outputPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient_FILTERED.csv';
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    return;
  }
  
  // Get existing nutrients from database
  const existingNutrientIds = await getExistingNutrients();
  
  const writeStream = createWriteStream(outputPath);
  let totalRows = 0;
  let filteredRows = 0;
  let skippedRows = 0;
  let startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => {
        totalRows++;
        
        // Skip header row
        if (row.nutrient_id === 'nutrient_id') {
          writeStream.write(Object.keys(row).join(',') + '\n');
          return;
        }
        
        const nutrientId = parseInt(row.nutrient_id);
        
        // Only keep rows where nutrient_id exists in database
        if (existingNutrientIds.has(nutrientId)) {
          // Write the row to output file
          writeStream.write(Object.values(row).map(v => `"${v}"`).join(',') + '\n');
          filteredRows++;
        } else {
          skippedRows++;
        }
        
        // Show progress
        if (totalRows % 100000 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = (totalRows / elapsed).toFixed(0);
          console.log(`📈 Processed ${totalRows.toLocaleString()} rows (${rate} rows/sec) - Kept: ${filteredRows.toLocaleString()}, Skipped: ${skippedRows.toLocaleString()}`);
        }
      })
      .on('end', () => {
        writeStream.end();
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log(`✅ CSV filtering complete!`);
        console.log(`📊 Total rows processed: ${totalRows.toLocaleString()}`);
        console.log(`✅ Rows kept (valid nutrients): ${filteredRows.toLocaleString()}`);
        console.log(`❌ Rows skipped (missing nutrients): ${skippedRows.toLocaleString()}`);
        console.log(`📈 Success rate: ${((filteredRows / totalRows) * 100).toFixed(1)}%`);
        console.log(`⏱️  Total time: ${totalTime} seconds`);
        console.log(`💾 Filtered data saved to: ${outputPath}`);
        
        resolve({ totalRows, filteredRows, skippedRows, totalTime });
      })
      .on('error', (error) => {
        writeStream.end();
        console.error('💥 Error filtering CSV:', error.message);
        reject(error);
      });
  });
}

// Main execution
async function main() {
  console.log('🔧 USDA Food_Nutrient CSV Filter');
  console.log('This script filters the food_nutrient CSV to only include records with valid nutrient references\n');
  
  try {
    await filterFoodNutrientCSV();
    
    console.log('\n🎉 Filtering completed successfully!');
    console.log('💡 You can now run the import with the FILTERED CSV file');
    console.log('📝 Next step: Update your import script to use food_nutrient_FILTERED.csv');
    
  } catch (error) {
    console.error('💥 Filtering failed:', error.message);
    process.exit(1);
  }
}

// Run the filter
main();
