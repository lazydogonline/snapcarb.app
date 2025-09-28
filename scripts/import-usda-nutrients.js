const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importUSDANutrients() {
  console.log('🚀 Starting USDA Nutrients Import');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/nutrient.csv`);
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    return;
  }
  
  // Get file size for progress tracking
  const stats = fs.statSync(csvPath);
  const fileSizeKB = (stats.size / 1024).toFixed(1);
  console.log(`📏 File size: ${fileSizeKB} KB`);
  
  let totalProcessed = 0;
  let totalImported = 0;
  let totalErrors = 0;
  let startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row) => {
        // Skip header row if it exists
        if (row.id === 'id') return;
        
        totalProcessed++;
        
        try {
          // Clean and prepare the nutrient record
          const cleanRecord = {
            id: parseInt(row.id) || null,
            name: row.name || '',
            unit_name: row.unit_name || '',
            nutrient_nbr: row.nutrient_nbr || null
          };
          
          // Skip if missing essential data
          if (!cleanRecord.id || !cleanRecord.name) {
            console.log(`⚠️  Skipping invalid nutrient: ID=${cleanRecord.id}, Name=${cleanRecord.name}`);
            totalErrors++;
            return;
          }
          
          // Insert the nutrient record
          const { error } = await supabase
            .from('nutrient')
            .upsert(cleanRecord, { onConflict: 'id' }); // Use upsert to handle duplicates
          
          if (error) {
            console.log(`❌ Failed to import nutrient ${cleanRecord.id}: ${error.message}`);
            totalErrors++;
          } else {
            totalImported++;
            if (totalProcessed % 50 === 0) {
              console.log(`📈 Progress: ${totalProcessed} nutrients processed, ${totalImported} imported`);
            }
          }
          
        } catch (e) {
          console.log(`❌ Nutrient processing failed: ${e.message}`);
          totalErrors++;
        }
      })
      .on('end', async () => {
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgRate = (totalProcessed / totalTime).toFixed(0);
        
        console.log('\n🎉 USDA Nutrients Import Complete!');
        console.log(`📊 Total Nutrients Processed: ${totalProcessed}`);
        console.log(`✅ Total Nutrients Imported: ${totalImported}`);
        console.log(`❌ Total Errors: ${totalErrors}`);
        console.log(`⏱️  Total Time: ${totalTime} seconds`);
        console.log(`🚀 Average Rate: ${avgRate} nutrients/second`);
        
        if (totalErrors === 0) {
          console.log('🎯 100% Success Rate! All nutrients imported successfully.');
          console.log('💡 Next: You can now import the food_nutrient.csv data!');
        } else {
          const errorRate = ((totalErrors / totalProcessed) * 100).toFixed(2);
          console.log(`⚠️  Error Rate: ${errorRate}% (${totalErrors} errors)`);
        }
        
        resolve({ 
          totalProcessed, 
          totalImported, 
          totalErrors, 
          totalTime,
          avgRate
        });
      })
      .on('error', (error) => {
        console.error('💥 CSV read error:', error.message);
        reject(error);
      });
  });
}

// Run the nutrients import
console.log('🧪 This will import ALL 479 USDA nutrients to populate your nutrient table');
console.log('⏳ Estimated time: 1-2 minutes');
console.log('💡 This must be done BEFORE importing food_nutrient.csv\n');

importUSDANutrients()
  .then((result) => {
    console.log('\n✅ USDA nutrients import completed successfully!');
    if (result.totalErrors === 0) {
      console.log('🚀 Ready for nutrition data import! Run: npm run import-nutrition-test');
    } else {
      console.log('⚠️  Fix any errors before proceeding with nutrition import');
    }
  })
  .catch((error) => {
    console.error('💥 USDA nutrients import failed:', error.message);
    console.log('💡 Check the error above and try again');
  });
