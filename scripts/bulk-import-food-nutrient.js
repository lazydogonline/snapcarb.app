const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const supabase = createClient('https://ceeakezbfavqzjnpsdpu.supabase.co', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function bulkImport() {
  console.log('🚀 Starting BULK import of 26.8M records...');
  
  let count = 0;
  let imported = 0;
  let batch = [];
  const BATCH_SIZE = 1000;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient_FILTERED.csv')
      .pipe(csv())
      .on('data', async (row) => {
        count++;
        
        try {
          const csvId = parseInt(Object.values(row)[4]);
          const fdcId = parseInt(Object.values(row)[3]);
          const nutrientId = parseInt(Object.values(row)[2]);
          const amount = parseFloat(Object.values(row)[5]) || 0.0;
          
          if (csvId && fdcId && nutrientId) {
            const newId = Date.now() + Math.floor(Math.random() * 1000000) + count;
            
            batch.push({
              id: newId,
              fdc_id: fdcId,
              nutrient_id: nutrientId,
              amount: amount
            });
            
            if (batch.length >= BATCH_SIZE) {
              await insertBatch(batch);
              imported += batch.length;
              batch = [];
              console.log(`✅ Imported batch: ${imported.toLocaleString()} total records`);
            }
          }
          
        } catch (e) {
          console.log(`❌ Record ${count} failed: ${e.message}`);
        }
      })
      .on('end', async () => {
        if (batch.length > 0) {
          await insertBatch(batch);
          imported += batch.length;
        }
        console.log(`🎉 Import complete: ${imported.toLocaleString()}/${count.toLocaleString()} records imported`);
        resolve();
      })
      .on('error', reject);
  });
}

async function insertBatch(batch) {
  const { error } = await supabase
    .from('food_nutrient')
    .insert(batch);
    
  if (error) {
    console.error('❌ Batch insert failed:', error.message);
    throw error;
  }
}

bulkImport()
  .then(() => console.log('✅ Bulk import completed'))
  .catch(e => console.error('�� Bulk import failed:', e.message));