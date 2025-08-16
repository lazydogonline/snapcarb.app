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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testJustFoodNutrients() {
  console.log('🧪 Testing JUST the food nutrients import...');
  
  // First, get all valid fdc_ids from the food table
  console.log('1. Getting valid food IDs from database...');
  const { data: validFoods, error: foodError } = await supabase
    .from('food')
    .select('fdc_id')
    .limit(10); // Just get 10 for testing
  
  if (foodError) {
    console.error('❌ Error getting valid food IDs:', foodError);
    return;
  }
  
  const validFdcIds = new Set(validFoods.map(f => f.fdc_id));
  console.log(`✅ Found ${validFdcIds.size} valid food IDs:`, Array.from(validFdcIds));
  
  const foodNutrients: any[] = [];
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ food_nutrient.csv not found');
    return;
  }
  
  console.log('2. Reading CSV file...');
  
  return new Promise<void>((resolve, reject) => {
    let rowCount = 0;
    let validRowCount = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        // Only add if the fdc_id exists in our food table
        const fdcId = parseInt(row.fdc_id);
        if (validFdcIds.has(fdcId)) {
          validRowCount++;
          foodNutrients.push({
            id: Date.now() + validRowCount, // Simple unique ID
            fdc_id: fdcId,
            nutrient_id: parseInt(row.nutrient_id),
            amount: parseFloat(row.amount) || 0,
          });
          
          if (validRowCount <= 5) {
            console.log(`📝 Row ${validRowCount}: fdc_id=${fdcId}, nutrient_id=${row.nutrient_id}, amount=${row.amount}`);
          }
        }
        
        if (rowCount % 10000 === 0) {
          console.log(`📊 Processed ${rowCount} rows, found ${validRowCount} valid...`);
        }
        
        // Stop after finding 100 valid rows for testing
        if (validRowCount >= 100) {
          console.log('✅ Found enough rows for testing, stopping...');
          // Note: We can't easily stop the stream here
        }
      })
      .on('end', async () => {
        console.log(`3. CSV processing complete. Found ${foodNutrients.length} valid food nutrients`);
        
        if (foodNutrients.length === 0) {
          console.log('⚠️  No valid food nutrients found');
          resolve();
          return;
        }
        
        // Test inserting just the first 5 rows
        const testBatch = foodNutrients.slice(0, 5);
        console.log(`4. Testing insert with ${testBatch.length} rows...`);
        
        try {
          const { data, error } = await supabase
            .from('food_nutrient')
            .insert(testBatch);
          
          if (error) {
            console.error('❌ Insert error:', error);
          } else {
            console.log('✅ Insert successful!', data);
            console.log(`🎉 Successfully inserted ${testBatch.length} food nutrients!`);
          }
        } catch (error) {
          console.error('❌ Exception during insert:', error);
        }
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ CSV read error:', error);
        reject(error);
      });
  });
}

// Run the test
testJustFoodNutrients()
  .then(() => {
    console.log('✅ Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
