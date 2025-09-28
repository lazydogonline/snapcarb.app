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

// ROBUST Configuration - Handles duplicate IDs
const CHUNK_SIZE = 1000;
const MAX_RECORDS = 1000; // Increased to find records that can actually be imported
const MAX_RETRIES = 3;
const DELAY_BETWEEN_CHUNKS = 1000;
const PROGRESS_INTERVAL = 1000;

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

// Get existing composite keys to avoid conflicts
async function getExistingCompositeKeys() {
  console.log('🔍 Checking existing composite keys to avoid conflicts...');
  
  try {
    const { data: existingNutrition, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id, nutrient_id');
    
    if (nutritionError) throw nutritionError;
    
    // Create a Set of composite keys (fdc_id + nutrient_id)
    const existingCompositeKeys = new Set();
    existingNutrition.forEach(record => {
      existingCompositeKeys.add(`${record.fdc_id}-${record.nutrient_id}`);
    });
    
    console.log(`📊 Found ${existingCompositeKeys.size} existing composite keys`);
    
    // Get existing nutrient IDs
    const { data: existingNutrients, error: nutrientError } = await supabase
      .from('nutrient')
      .select('id');
    
    if (nutrientError) throw nutrientError;
    
    const existingNutrientIds = new Set(existingNutrients.map(r => r.id));
    console.log(`📊 Found ${existingNutrientIds.size} existing nutrients`);
    
    return { existingCompositeKeys, existingNutrientIds };
    
  } catch (error) {
    console.error('❌ Error getting existing data:', error.message);
    throw error;
  }
}

async function importNutritionChunk(nutritionRecords, chunkNumber, totalProcessed, existingCompositeKeys, existingNutrientIds) {
  console.log(`\n📦 Processing Robust Chunk ${chunkNumber} (${nutritionRecords.length} records)...`);
  console.log(`📊 Total processed so far: ${totalProcessed.toLocaleString()}`);
  
  // Clean and filter all nutrition records in the chunk
  const cleanRecords = [];
  let skippedConflicts = 0;
  let skippedMissingNutrients = 0;
  let skippedInvalidData = 0;
  
  for (const record of nutritionRecords) {
    try {
      const csvId = parseInt(record.id);
      const fdcId = parseInt(record.fdc_id);
      const nutrientId = parseInt(record.nutrient_id);
      
      // Skip if missing essential data
      if (!csvId || !fdcId || !nutrientId) {
        skippedInvalidData++;
        continue;
      }
      
      // Create composite key
      const compositeKey = `${fdcId}-${nutrientId}`;
      
      // Skip if this composite key already exists (preserve existing data)
      if (existingCompositeKeys.has(compositeKey)) {
        skippedConflicts++;
        continue;
      }
      
      // Skip if nutrient doesn't exist (maintain referential integrity)
      if (!existingNutrientIds.has(nutrientId)) {
        skippedMissingNutrients++;
        continue;
      }
      
      // Generate a new unique ID that won't conflict
      const newId = Date.now() + Math.floor(Math.random() * 1000000);
      
      // Only map the 4 columns that exist in your table
      const cleanRecord = {
        id: newId, // Generate new unique ID
        fdc_id: fdcId,
        nutrient_id: nutrientId,
        amount: cleanValue(record.amount)
      };
      
      cleanRecords.push(cleanRecord);
      
    } catch (e) {
      console.log(`❌ Record cleaning failed: ${e.message}`);
      skippedInvalidData++;
    }
  }
  
  if (cleanRecords.length === 0) {
    console.log(`⚠️  Chunk ${chunkNumber}: No valid nutrition records to import`);
    console.log(`   Skipped ${skippedConflicts} conflicts, ${skippedMissingNutrients} missing nutrients, ${skippedInvalidData} invalid data`);
    return { successCount: 0, errorCount: 0, skippedConflicts, skippedMissingNutrients, skippedInvalidData };
  }
  
  console.log(`   ✅ ${cleanRecords.length} records ready to import`);
  console.log(`   ⚠️  Skipped ${skippedConflicts} conflicts, ${skippedMissingNutrients} missing nutrients, ${skippedInvalidData} invalid data`);
  
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
          return { successCount: 0, errorCount: cleanRecords.length, skippedConflicts, skippedMissingNutrients, skippedInvalidData };
        }
        
        await delay(1000 * attempt);
        continue;
      }
      
      console.log(`✅ Chunk ${chunkNumber}: Successfully imported ${cleanRecords.length} nutrition records`);
      return { successCount: cleanRecords.length, errorCount: 0, skippedConflicts, skippedMissingNutrients, skippedInvalidData };
      
    } catch (e) {
      console.log(`❌ Chunk ${chunkNumber} attempt ${attempt} crashed: ${e.message}`);
      
      if (attempt === MAX_RETRIES) {
        console.log(`💥 Chunk ${chunkNumber} crashed after ${MAX_RETRIES} attempts`);
        return { successCount: 0, errorCount: cleanRecords.length, skippedConflicts, skippedMissingNutrients, skippedInvalidData };
      }
      
      await delay(1000 * attempt);
    }
  }
}

async function importNutritionRobust() {
  console.log('🛡️  Starting ROBUST Nutrition Import (Handles duplicate IDs)');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv`);
  console.log(`📦 Chunk Size: ${CHUNK_SIZE} nutrition records per chunk`);
  console.log(`🎯 Target: First ${MAX_RECORDS.toLocaleString()} records only`);
  console.log(`⏱️  Delay between chunks: ${DELAY_BETWEEN_CHUNKS}ms`);
  console.log(`🔄 Max retries per chunk: ${MAX_RETRIES}`);
  console.log('🛡️  This script handles duplicate IDs by generating new unique IDs');
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    return;
  }
  
  // Get existing composite keys to avoid conflicts
  const { existingCompositeKeys, existingNutrientIds } = await getExistingCompositeKeys();
  
  let currentChunk = [];
  let chunkNumber = 1;
  let totalImported = 0;
  let totalErrors = 0;
  let totalSkippedConflicts = 0;
  let totalSkippedMissingNutrients = 0;
  let totalSkippedInvalidData = 0;
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
            const result = await importNutritionChunk(chunk, chunkNumber, totalProcessed, existingCompositeKeys, existingNutrientIds);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            totalSkippedConflicts += result.skippedConflicts;
            totalSkippedMissingNutrients += result.skippedMissingNutrients;
            totalSkippedInvalidData += result.skippedInvalidData;
            
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
            const result = await importNutritionChunk(currentChunk, chunkNumber, totalProcessed, existingCompositeKeys, existingNutrientIds);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            totalSkippedConflicts += result.skippedConflicts;
            totalSkippedMissingNutrients += result.skippedMissingNutrients;
            totalSkippedInvalidData += result.skippedInvalidData;
            chunkNumber++;
          } catch (error) {
            console.error(`💥 Final chunk failed:`, error.message);
            totalErrors += currentChunk.length;
          }
        }
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const avgRate = (totalProcessed / totalTime).toFixed(0);
        
        console.log('\n🎉 ROBUST Nutrition Import Complete!');
        console.log(`📊 Total Records Processed: ${totalProcessed.toLocaleString()}`);
        console.log(`✅ Total Records Imported: ${totalImported.toLocaleString()}`);
        console.log(`❌ Total Errors: ${totalErrors.toLocaleString()}`);
        console.log(`🛡️  Total Skipped (Conflicts): ${totalSkippedConflicts.toLocaleString()}`);
        console.log(`🛡️  Total Skipped (Missing Nutrients): ${totalSkippedMissingNutrients.toLocaleString()}`);
        console.log(`🛡️  Total Skipped (Invalid Data): ${totalSkippedInvalidData.toLocaleString()}`);
        console.log(`📦 Total Chunks Processed: ${chunkNumber - 1}`);
        console.log(`⏱️  Total Time: ${totalTime} seconds`);
        console.log(`🚀 Average Rate: ${avgRate} records/second`);
        
        if (totalErrors === 0) {
          console.log('🎯 100% Success Rate! Robust import successful.');
          console.log('💡 Your existing data is preserved and duplicate IDs handled!');
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
          totalSkippedInvalidData,
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

// Run the robust import
console.log('🛡️  ROBUST MODE: This handles duplicate IDs by generating new unique IDs');
console.log('⏳ Estimated time: 3-5 minutes');
console.log('💡 This approach handles CSV data quality issues\n');

importNutritionRobust()
  .then((result) => {
    console.log('\n✅ Robust nutrition import completed successfully!');
    if (result.totalErrors === 0) {
      console.log('🚀 Ready for larger import! Duplicate ID issues resolved.');
    } else {
      console.log('⚠️  Some errors occurred, but duplicate ID handling is working');
    }
  })
  .catch((error) => {
    console.error('💥 Robust nutrition import failed:', error.message);
    console.log('💡 Your existing data is still safe');
  });
