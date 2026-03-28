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

// SAFE Configuration - Preserves existing data
const CHUNK_SIZE = 1000; // Smaller chunks for safety
const MAX_RECORDS = 50000; // Increased to 50K records for larger test
const MAX_RETRIES = 3;
const DELAY_BETWEEN_CHUNKS = 1000; // 1 second delay between chunks
const PROGRESS_INTERVAL = 1000; // Show progress every 1K records

// Helper function to clean null values
function cleanValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0.0;
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

// Get existing IDs to avoid conflicts
async function getExistingIds() {
  console.log('🔍 Checking existing data to avoid conflicts...');
  
  try {
    // Get existing food_nutrient IDs
    const { data: existingNutrition, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('id');
    
    if (nutritionError) throw nutritionError;
    
    const existingNutritionIds = new Set(existingNutrition.map(r => r.id));
    console.log(`📊 Found ${existingNutritionIds.size} existing food_nutrient records`);
    
    // Get existing nutrient IDs
    const { data: existingNutrients, error: nutrientError } = await supabase
      .from('nutrient')
      .select('id');
    
    if (nutrientError) throw nutrientError;
    
    const existingNutrientIds = new Set(existingNutrients.map(r => r.id));
    console.log(`📊 Found ${existingNutrientIds.size} existing nutrients`);
    
    return { existingNutritionIds, existingNutrientIds };
    
  } catch (error) {
    console.error('❌ Error getting existing IDs:', error.message);
    throw error;
  }
}

async function importNutritionChunk(nutritionRecords, chunkNumber, totalProcessed, existingNutritionIds, existingNutrientIds) {
  console.log(`\n📦 Processing Safe Chunk ${chunkNumber} (${nutritionRecords.length} records)...`);
  console.log(`📊 Total processed so far: ${totalProcessed.toLocaleString()}`);
  
  // Clean and filter all nutrition records in the chunk
  const cleanRecords = [];
  let skippedConflicts = 0;
  let skippedMissingNutrients = 0;
  
  for (const record of nutritionRecords) {
    try {
      const csvId = parseInt(record.id);
      const fdcId = parseInt(record.fdc_id);
      const nutrientId = parseInt(record.nutrient_id);
      
      // Skip if missing essential data
      if (!csvId || !fdcId || !nutrientId) {
        continue;
      }
      
      // Skip if this ID already exists (preserve existing data)
      if (existingNutritionIds.has(csvId)) {
        skippedConflicts++;
        continue;
      }
      
      // Skip if nutrient doesn't exist (maintain referential integrity)
      if (!existingNutrientIds.has(nutrientId)) {
        skippedMissingNutrients++;
        continue;
      }
      
      // Only map the 4 columns that exist in your table
      const cleanRecord = {
        id: csvId, // Use the actual ID from the CSV
        fdc_id: fdcId,
        nutrient_id: nutrientId,
        amount: cleanValue(record.amount)
      };
      
      cleanRecords.push(cleanRecord);
      
    } catch (e) {
      console.log(`❌ Record cleaning failed: ${e.message}`);
    }
  }
  
  if (cleanRecords.length === 0) {
    console.log(`⚠️  Chunk ${chunkNumber}: No valid nutrition records to import`);
    console.log(`   Skipped ${skippedConflicts} conflicts, ${skippedMissingNutrients} missing nutrients`);
    return { successCount: 0, errorCount: 0, skippedConflicts, skippedMissingNutrients };
  }
  
  console.log(`   ✅ ${cleanRecords.length} records ready to import`);
  console.log(`   ⚠️  Skipped ${skippedConflicts} conflicts, ${skippedMissingNutrients} missing nutrients`);
  
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
          return { successCount: 0, errorCount: cleanRecords.length, skippedConflicts, skippedMissingNutrients };
        }
        
        await delay(1000 * attempt);
        continue;
      }
      
      console.log(`✅ Chunk ${chunkNumber}: Successfully imported ${cleanRecords.length} nutrition records`);
      return { successCount: cleanRecords.length, errorCount: 0, skippedConflicts, skippedMissingNutrients };
      
    } catch (e) {
      console.log(`❌ Chunk ${chunkNumber} attempt ${attempt} crashed: ${e.message}`);
      
      if (attempt === MAX_RETRIES) {
        console.log(`💥 Chunk ${chunkNumber} crashed after ${MAX_RETRIES} attempts`);
        return { successCount: 0, errorCount: cleanRecords.length, skippedConflicts, skippedMissingNutrients };
      }
      
      await delay(1000 * attempt);
    }
  }
}

async function importNutritionSafe() {
  console.log('🛡️  Starting SAFE Nutrition Import (Preserves existing data)');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv`);
  console.log(`📦 Chunk Size: ${CHUNK_SIZE} nutrition records per chunk`);
  console.log(`🎯 Target: First ${MAX_RECORDS.toLocaleString()} records only`);
  console.log(`⏱️  Delay between chunks: ${DELAY_BETWEEN_CHUNKS}ms`);
  console.log(`🔄 Max retries per chunk: ${MAX_RETRIES}`);
  console.log('🛡️  This script will NOT overwrite existing data');
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    return;
  }
  
  // Get existing IDs to avoid conflicts
  const { existingNutritionIds, existingNutrientIds } = await getExistingIds();
  
  let currentChunk = [];
  let chunkNumber = 1;
  let totalImported = 0;
  let totalErrors = 0;
  let totalSkippedConflicts = 0;
  let totalSkippedMissingNutrients = 0;
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
          stream.destroy();
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
            const result = await importNutritionChunk(chunk, chunkNumber, totalProcessed, existingNutritionIds, existingNutrientIds);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            totalSkippedConflicts += result.skippedConflicts;
            totalSkippedMissingNutrients += result.skippedMissingNutrients;
            
            // Show chunk summary
            const successRate = ((result.successCount / chunk.length) * 100).toFixed(1);
            console.log(`📊 Chunk ${chunkNumber} Summary: ${result.successCount}/${chunk.length} records imported (${successRate}% success)`);
            
            chunkNumber++;
            
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
            const result = await importNutritionChunk(currentChunk, chunkNumber, totalProcessed, existingNutritionIds, existingNutrientIds);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            totalSkippedConflicts += result.skippedConflicts;
            totalSkippedMissingNutrients += result.skippedMissingNutrients;
            chunkNumber++;
          } catch (error) {
            console.error(`💥 Final chunk failed:`, error.message);
            totalErrors += currentChunk.length;
          }
        }
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgRate = (totalProcessed / totalTime).toFixed(0);
        
        console.log('\n🎉 SAFE Nutrition Import Complete!');
        console.log(`📊 Total Records Processed: ${totalProcessed.toLocaleString()}`);
        console.log(`✅ Total Records Imported: ${totalImported.toLocaleString()}`);
        console.log(`❌ Total Errors: ${totalErrors.toLocaleString()}`);
        console.log(`🛡️  Total Skipped (Conflicts): ${totalSkippedConflicts.toLocaleString()}`);
        console.log(`🛡️  Total Skipped (Missing Nutrients): ${totalSkippedMissingNutrients.toLocaleString()}`);
        console.log(`📦 Total Chunks Processed: ${chunkNumber - 1}`);
        console.log(`⏱️  Total Time: ${totalTime} seconds`);
        console.log(`🚀 Average Rate: ${avgRate} records/second`);
        
        if (totalErrors === 0) {
          console.log('🎯 100% Success Rate! Safe import successful.');
          console.log('💡 Your existing data is preserved!');
        } else {
          const errorRate = ((totalErrors / totalProcessed) * 100).toFixed(2);
          console.log(`⚠️  Error Rate: ${errorRate}% (${totalErrors.toLocaleString()} errors)`);
        }
        
        resolve({ 
          totalProcessed, 
          totalImported, 
          totalErrors, 
          totalSkippedConflicts,
          totalSkippedMissingNutrients,
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

// Run the safe import
console.log('🛡️  SAFE MODE: This will import nutrition records WITHOUT overwriting existing data');
console.log('⏳ Estimated time: 2-5 minutes');
console.log('💡 This is the safest approach - your existing data will be preserved\n');

importNutritionSafe()
  .then((result) => {
    console.log('\n✅ Safe nutrition import completed successfully!');
    if (result.totalErrors === 0) {
      console.log('🚀 Ready for larger import! Your data is safe.');
    } else {
      console.log('⚠️  Some errors occurred, but your existing data is preserved');
    }
  })
  .catch((error) => {
    console.error('💥 Safe nutrition import failed:', error.message);
    console.log('💡 Your existing data is still safe');
  });
