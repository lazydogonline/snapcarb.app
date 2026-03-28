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

// TEST Configuration - Safe for testing
const CHUNK_SIZE = 2000; // 2000 records per chunk (smaller for testing)
const MAX_RECORDS = 10000; // Only process first 10K records for testing (reduced from 100K)
const MAX_RETRIES = 3; // Retry failed chunks
const DELAY_BETWEEN_CHUNKS = 500; // 0.5 second delay between chunks
const PROGRESS_INTERVAL = 5000; // Show progress every 5,000 records

// Helper function to clean null values (keep existing logic)
function cleanValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0.0; // Default to 0.0 for missing values
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0.0 : parsed;
  }
  return value;
}

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// No longer needed since we use CSV IDs

async function importNutritionChunk(nutritionRecords, chunkNumber, totalProcessed) {
  console.log(`\n📦 Processing Test Chunk ${chunkNumber} (${nutritionRecords.length} records)...`);
  console.log(`📊 Total processed so far: ${totalProcessed.toLocaleString()}`);
  
  // Clean and filter all nutrition records in the chunk
  const cleanRecords = [];
  
  for (const record of nutritionRecords) {
    try {
      // Only map the 4 columns that exist in your table, including the id
      const cleanRecord = {
        id: parseInt(record.id) || null, // Use the actual ID from the CSV
        fdc_id: parseInt(record.fdc_id) || null,
        nutrient_id: parseInt(record.nutrient_id) || null,
        amount: cleanValue(record.amount)
      };
      
      // Skip if missing essential data
      if (!cleanRecord.fdc_id || !cleanRecord.nutrient_id) {
        continue;
      }
      
      cleanRecords.push(cleanRecord);
      
    } catch (e) {
      console.log(`❌ Record cleaning failed: ${e.message}`);
    }
  }
  
  if (cleanRecords.length === 0) {
    console.log(`⚠️  Chunk ${chunkNumber}: No valid nutrition records to import`);
    return { successCount: 0, errorCount: 0 };
  }
  
  // Retry logic for failed chunks
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { error } = await supabase
        .from('food_nutrient')
        .insert(cleanRecords);
      
      if (error) {
        console.log(`❌ Chunk ${chunkNumber} attempt ${attempt} failed: ${error.message}`);
        
        if (attempt === MAX_RETRIES) {
          console.log(`💥 Chunk ${chunkNumber} failed after ${MAX_RETRIES} attempts`);
          return { successCount: 0, errorCount: cleanRecords.length };
        }
        
        // Wait before retry
        await delay(1000 * attempt); // Exponential backoff
        continue;
      }
      
      console.log(`✅ Chunk ${chunkNumber}: Successfully imported ${cleanRecords.length} nutrition records`);
      return { successCount: cleanRecords.length, errorCount: 0 };
      
    } catch (e) {
      console.log(`❌ Chunk ${chunkNumber} attempt ${attempt} crashed: ${e.message}`);
      
      if (attempt === MAX_RETRIES) {
        console.log(`💥 Chunk ${chunkNumber} crashed after ${MAX_RETRIES} attempts`);
        return { successCount: 0, errorCount: cleanRecords.length };
      }
      
      // Wait before retry
      await delay(1000 * attempt);
    }
  }
}

async function importNutritionTest() {
  console.log('🧪 Starting TEST Nutrition Import (First 100K records only)');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv`);
  console.log(`📦 Chunk Size: ${CHUNK_SIZE} nutrition records per chunk`);
  console.log(`🎯 Target: First ${MAX_RECORDS.toLocaleString()} records only`);
  console.log(`⏱️  Delay between chunks: ${DELAY_BETWEEN_CHUNKS}ms`);
  console.log(`🔄 Max retries per chunk: ${MAX_RETRIES}`);
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    return;
  }
  
  let currentChunk = [];
  let chunkNumber = 1;
  let totalImported = 0;
  let totalErrors = 0;
  let totalProcessed = 0;
  let startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row) => {
        // Skip header row if it exists
        if (row.fdc_id === 'fdc_id') return;
        
        // Stop after reaching max records
        if (totalProcessed >= MAX_RECORDS) {
          stream.destroy(); // Stop reading the file
          return;
        }
        
        currentChunk.push(row);
        totalProcessed++;
        
        // Show progress periodically
        if (totalProcessed % PROGRESS_INTERVAL === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = (totalProcessed / elapsed).toFixed(0);
          console.log(`📈 Progress: ${totalProcessed.toLocaleString()}/${MAX_RECORDS.toLocaleString()} records (${rate} records/sec)`);
        }
        
        // Process chunk when it reaches the target size
        if (currentChunk.length >= CHUNK_SIZE) {
          const chunk = [...currentChunk];
          currentChunk = [];
          
          try {
            const result = await importNutritionChunk(chunk, chunkNumber, totalProcessed);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            
            // Show chunk summary
            const successRate = ((result.successCount / chunk.length) * 100).toFixed(1);
            console.log(`📊 Chunk ${chunkNumber} Summary: ${result.successCount}/${chunk.length} records imported (${successRate}% success)`);
            
            chunkNumber++;
            
            // Delay between chunks to prevent overwhelming the database
            await delay(DELAY_BETWEEN_CHUNKS);
            
          } catch (error) {
            console.error(`💥 Chunk ${chunkNumber} failed catastrophically:`, error.message);
            totalErrors += currentChunk.length;
            reject(error);
            return;
          }
        }
      })
      .on('end', async () => {
        // Process remaining records in the final chunk
        if (currentChunk.length > 0) {
          try {
            const result = await importNutritionChunk(currentChunk, chunkNumber, totalProcessed);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            chunkNumber++;
          } catch (error) {
            console.error(`💥 Final chunk failed:`, error.message);
            totalErrors += currentChunk.length;
          }
        }
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgRate = (totalProcessed / totalTime).toFixed(0);
        
        console.log('\n🎉 TEST Nutrition Import Complete!');
        console.log(`📊 Total Records Processed: ${totalProcessed.toLocaleString()}`);
        console.log(`✅ Total Records Imported: ${totalImported.toLocaleString()}`);
        console.log(`❌ Total Errors: ${totalErrors.toLocaleString()}`);
        console.log(`📦 Total Chunks Processed: ${chunkNumber - 1}`);
        console.log(`⏱️  Total Time: ${totalTime} seconds`);
        console.log(`🚀 Average Rate: ${avgRate} records/second`);
        
        if (totalErrors === 0) {
          console.log('🎯 100% Success Rate! Test import successful.');
          console.log('💡 Ready to run the full production import!');
        } else {
          const errorRate = ((totalErrors / totalProcessed) * 100).toFixed(2);
          console.log(`⚠️  Error Rate: ${errorRate}% (${totalErrors.toLocaleString()} errors)`);
          console.log('💡 Fix any issues before running production import');
        }
        
        resolve({ 
          totalProcessed, 
          totalImported, 
          totalErrors, 
          chunkNumber: chunkNumber - 1,
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

// Run the test import
console.log('🧪 TEST MODE: This will import only the first 100K nutrition records');
console.log('⏳ Estimated time: 5-10 minutes');
console.log('💡 Use this to test before running the full production import\n');

importNutritionTest()
  .then((result) => {
    console.log('\n✅ Test nutrition import completed successfully!');
    if (result.totalErrors === 0) {
      console.log('🚀 Ready for production import! Run: npm run import-nutrition-production');
    } else {
      console.log('⚠️  Fix errors before running production import');
    }
  })
  .catch((error) => {
    console.error('💥 Test nutrition import failed:', error.message);
    console.log('💡 Check the error above and fix before running production');
  });
