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

// Configuration
const CHUNK_SIZE = 50; // Import 50 nutrition records at a time (smaller for testing)
const START_CHUNK = 1; // Start with chunk 1
const MAX_CHUNKS = 5; // Limit to first 5 chunks for testing

// Helper function to clean null values
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

async function importNutritionChunk(nutritionRecords, chunkNumber) {
  console.log(`\n📦 Processing Nutrition Chunk ${chunkNumber} (${nutritionRecords.length} records)...`);
  
  // Clean and filter all nutrition records in the chunk
  const cleanRecords = [];
  let recordId = chunkNumber * 1000000; // Start with unique IDs for each chunk
  
  for (const record of nutritionRecords) {
    try {
      // Clean the data - only use columns that exist in the table
      const cleanRecord = {
        id: recordId++,
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
      console.log(`❌ Nutrition record cleaning failed: ${e.message}`);
    }
  }
  
  if (cleanRecords.length === 0) {
    console.log(`⚠️  Chunk ${chunkNumber}: No valid nutrition records to import`);
    return { successCount: 0, errorCount: 0 };
  }
  
  // Batch insert all nutrition records at once
  try {
    const { error } = await supabase
      .from('food_nutrient')
      .insert(cleanRecords);
    
    if (error) {
      console.log(`❌ Chunk ${chunkNumber} batch insert failed: ${error.message}`);
      return { successCount: 0, errorCount: cleanRecords.length };
    } else {
      console.log(`✅ Chunk ${chunkNumber}: Successfully imported ${cleanRecords.length} nutrition records`);
      return { successCount: cleanRecords.length, errorCount: 0 };
    }
    
  } catch (e) {
    console.log(`❌ Chunk ${chunkNumber} failed: ${e.message}`);
    return { successCount: 0, errorCount: cleanRecords.length };
  }
}

async function importNutritionInChunks() {
  console.log('🚀 Starting Chunked Nutrition Import from USDA CSV');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv`);
  console.log(`📦 Chunk Size: ${CHUNK_SIZE} nutrition records per chunk`);
  console.log(`🎯 Target: First ${MAX_CHUNKS} chunks`);
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found: ${csvPath}`);
    return;
  }
  
  let currentChunk = [];
  let chunkNumber = START_CHUNK;
  let totalImported = 0;
  let totalErrors = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', async (row) => {
        // Skip header row if it exists
        if (row.fdc_id === 'fdc_id') return;
        
        currentChunk.push(row);
        
        // Process chunk when it reaches the target size
        if (currentChunk.length >= CHUNK_SIZE) {
          const chunk = [...currentChunk];
          currentChunk = [];
          
          try {
            const result = await importNutritionChunk(chunk, chunkNumber);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            
            chunkNumber++;
            
            // Stop after max chunks
            if (chunkNumber > MAX_CHUNKS) {
              console.log('\n🎯 Reached maximum chunks limit');
              resolve({ totalImported, totalErrors, chunkNumber: chunkNumber - 1 });
            }
            
          } catch (error) {
            console.error(`❌ Chunk ${chunkNumber} failed:`, error.message);
            reject(error);
          }
        }
      })
      .on('end', async () => {
        // Process remaining records in the last chunk
        if (currentChunk.length > 0 && chunkNumber <= MAX_CHUNKS) {
          try {
            const result = await importNutritionChunk(currentChunk, chunkNumber);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            chunkNumber++;
          } catch (error) {
            console.error(`❌ Final chunk failed:`, error.message);
          }
        }
        
        console.log('\n🎉 Chunked Nutrition Import Complete!');
        console.log(`📊 Total Nutrition Records Imported: ${totalImported}`);
        console.log(`❌ Total Errors: ${totalErrors}`);
        console.log(`📦 Chunks Processed: ${chunkNumber - 1}`);
        
        resolve({ totalImported, totalErrors, chunkNumber: chunkNumber - 1 });
      })
      .on('error', (error) => {
        console.error('❌ CSV read error:', error.message);
        reject(error);
      });
  });
}

// Run the import
importNutritionInChunks()
  .then((result) => {
    console.log('\n✅ Nutrition import completed successfully!');
    console.log('💡 Next: Test the LEFT JOIN views with real nutrition data!');
  })
  .catch((error) => {
    console.error('❌ Nutrition import failed:', error.message);
  });
