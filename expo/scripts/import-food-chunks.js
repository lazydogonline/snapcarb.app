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
const CHUNK_SIZE = 100; // Import 100 foods at a time
const START_CHUNK = 1; // Start with chunk 1
const MAX_CHUNKS = 10; // Limit to first 10 chunks for testing

// Priority food types (SnapCarb approved)
const PRIORITY_TYPES = [
  'Foundation', // Whole foods
  'Survey (FNDDS)', // Survey foods
  'SR Legacy' // Standard reference
];

// Skip branded foods initially (we'll handle separately)
const SKIP_TYPES = [
  'branded food',
  'Survey (FNDDS)'
];

async function importFoodChunk(foods, chunkNumber) {
  console.log(`\n📦 Processing Chunk ${chunkNumber} (${foods.length} foods)...`);
  
  // Clean and filter all foods in the chunk
  const cleanFoods = [];
  
  for (const food of foods) {
    try {
      // Clean the data
      const cleanFood = {
        fdc_id: parseInt(food.fdc_id) || null,
        description: food.description?.trim() || '',
        data_type: food.data_type?.trim() || '',
        publication_date: food.publication_date || null
      };
      
      // Skip if missing essential data
      if (!cleanFood.fdc_id || !cleanFood.description) {
        continue;
      }
      
      // Skip branded foods for now
      if (SKIP_TYPES.includes(cleanFood.data_type?.toLowerCase())) {
        continue;
      }
      
      cleanFoods.push(cleanFood);
      
    } catch (e) {
      console.log(`❌ Food data cleaning failed: ${e.message}`);
    }
  }
  
  if (cleanFoods.length === 0) {
    console.log(`⚠️  Chunk ${chunkNumber}: No valid foods to import`);
    return { successCount: 0, errorCount: 0 };
  }
  
  // Batch insert all foods at once
  try {
    const { error } = await supabase
      .from('food')
      .upsert(cleanFoods, { onConflict: 'fdc_id' });
    
    if (error) {
      console.log(`❌ Chunk ${chunkNumber} batch insert failed: ${error.message}`);
      return { successCount: 0, errorCount: cleanFoods.length };
    } else {
      console.log(`✅ Chunk ${chunkNumber}: Successfully imported ${cleanFoods.length} foods`);
      return { successCount: cleanFoods.length, errorCount: 0 };
    }
    
  } catch (e) {
    console.log(`❌ Chunk ${chunkNumber} failed: ${e.message}`);
    return { successCount: 0, errorCount: cleanFoods.length };
  }
}

async function importFoodsInChunks() {
  console.log('🚀 Starting Chunked Food Import from USDA CSV');
  console.log(`📁 Reading: USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food.csv`);
  console.log(`📦 Chunk Size: ${CHUNK_SIZE} foods per chunk`);
  console.log(`🎯 Target: First ${MAX_CHUNKS} chunks`);
  
  const csvPath = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food.csv';
  
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
            const result = await importFoodChunk(chunk, chunkNumber);
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
        // Process remaining foods in the last chunk
        if (currentChunk.length > 0 && chunkNumber <= MAX_CHUNKS) {
          try {
            const result = await importFoodChunk(currentChunk, chunkNumber);
            totalImported += result.successCount;
            totalErrors += result.errorCount;
            chunkNumber++;
          } catch (error) {
            console.error(`❌ Final chunk failed:`, error.message);
          }
        }
        
        console.log('\n🎉 Chunked Import Complete!');
        console.log(`📊 Total Foods Imported: ${totalImported}`);
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
importFoodsInChunks()
  .then((result) => {
    console.log('\n✅ Import completed successfully!');
    console.log('💡 Next: Run nutrition import for these foods');
  })
  .catch((error) => {
    console.error('❌ Import failed:', error.message);
  });
