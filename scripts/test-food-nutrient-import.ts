import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFoodNutrientImport() {
  console.log('🧪 Testing food nutrient import with first 1000 rows...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ food_nutrient.csv not found');
    return;
  }
  
  console.log(`📁 Reading from: ${filePath}`);
  console.log(`📊 File size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`);
  
  const foodNutrients: any[] = [];
  let rowCount = 0;
  const maxRows = 1000;
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        if (rowCount <= maxRows) {
          foodNutrients.push({
            id: Date.now() + rowCount,
            fdc_id: row.fdc_id,
            nutrient_id: row.nutrient_id,
            amount: row.amount ? parseFloat(row.amount) : 0,
          });
        }
        
        if (rowCount % 100 === 0) {
          console.log(`📊 Processed ${rowCount} rows...`);
        }
        
        if (rowCount >= maxRows) {
          // Stop reading after maxRows
          // Note: We can't easily stop the stream here, but we won't add more data
        }
      })
      .on('end', async () => {
        console.log(`📊 Found ${foodNutrients.length} food nutrients to import`);
        
        if (foodNutrients.length === 0) {
          console.log('⚠️  No food nutrients found');
          resolve();
          return;
        }
        
        try {
          console.log('🚀 Inserting into Supabase...');
          const { error } = await supabase
            .from('food_nutrient')
            .insert(foodNutrients);
          
          if (error) {
            console.error('❌ Error inserting:', error);
          } else {
            console.log(`✅ Successfully inserted ${foodNutrients.length} food nutrients!`);
          }
        } catch (error) {
          console.error('❌ Error:', error);
        }
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        reject(error);
      });
  });
}

// Run the test
testFoodNutrientImport()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
