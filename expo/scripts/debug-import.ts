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

async function debugImport() {
  console.log('🔍 Debug: Testing food nutrient import...');
  
  // Get valid food IDs first
  console.log('1. Getting valid food IDs...');
  const { data: validFoods, error: foodError } = await supabase
    .from('food')
    .select('fdc_id')
    .limit(5);
  
  if (foodError) {
    console.error('❌ Error getting food IDs:', foodError);
    return;
  }
  
  console.log('✅ Valid food IDs:', validFoods.map(f => f.fdc_id));
  
  // Read CSV and find matching rows
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  console.log('2. Reading CSV file...');
  
  const foodNutrients: any[] = [];
  let rowCount = 0;
  const maxRows = 10;
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        // Check if this fdc_id exists in our valid foods
        const fdcId = parseInt(row.fdc_id);
        if (validFoods.some(f => f.fdc_id === fdcId)) {
          if (foodNutrients.length < maxRows) {
            foodNutrients.push({
              id: Date.now() + rowCount,
              fdc_id: fdcId,
              nutrient_id: parseInt(row.nutrient_id),
              amount: parseFloat(row.amount) || 0,
            });
            console.log(`📝 Found valid row ${foodNutrients.length}: fdc_id=${fdcId}, nutrient_id=${row.nutrient_id}, amount=${row.amount}`);
          }
        }
        
        if (foodNutrients.length >= maxRows) {
          console.log('✅ Found enough rows, stopping...');
          // Note: We can't easily stop the stream here
        }
      })
      .on('end', async () => {
        console.log(`3. Attempting to insert ${foodNutrients.length} rows...`);
        
        if (foodNutrients.length === 0) {
          console.log('⚠️  No valid food nutrients found');
          resolve();
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('food_nutrient')
            .insert(foodNutrients);
          
          if (error) {
            console.error('❌ Insert error:', error);
          } else {
            console.log('✅ Insert successful!', data);
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

debugImport()
  .then(() => {
    console.log('✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  });
