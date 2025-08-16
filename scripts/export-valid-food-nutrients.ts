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

async function exportValidFoodNutrients() {
  console.log('📤 Exporting valid food nutrients to CSV...');
  
  // First, get all valid fdc_ids from the food table
  console.log('🔍 Getting valid food IDs from database...');
  const { data: validFoods, error: foodError } = await supabase
    .from('food')
    .select('fdc_id');
  
  if (foodError) {
    console.error('❌ Error getting valid food IDs:', foodError);
    return;
  }
  
  const validFdcIds = new Set(validFoods.map(f => f.fdc_id));
  console.log(`✅ Found ${validFdcIds.size} valid food IDs in database`);
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ food_nutrient.csv not found');
    return;
  }
  
  console.log('📁 Reading food nutrients CSV...');
  
  const validFoodNutrients: any[] = [];
  let rowCount = 0;
  let validRowCount = 0;
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        // Only add if the fdc_id exists in our food table
        const fdcId = parseInt(row.fdc_id);
        if (validFdcIds.has(fdcId)) {
          validRowCount++;
          validFoodNutrients.push({
            id: validRowCount, // Simple sequential ID
            fdc_id: fdcId,
            nutrient_id: parseInt(row.nutrient_id),
            amount: parseFloat(row.amount) || 0,
          });
        }
        
        if (rowCount % 100000 === 0) {
          console.log(`📊 Processed ${rowCount} rows, found ${validRowCount} valid...`);
        }
      })
      .on('end', async () => {
        console.log(`📊 Found ${validFoodNutrients.length} valid food nutrients`);
        
        if (validFoodNutrients.length === 0) {
          console.log('⚠️  No valid food nutrients found');
          resolve();
          return;
        }
        
        // Write to CSV file
        const outputPath = path.join(__dirname, '../valid_food_nutrients.csv');
        const csvHeader = 'id,fdc_id,nutrient_id,amount\n';
        const csvRows = validFoodNutrients.map(row => 
          `${row.id},${row.fdc_id},${row.nutrient_id},${row.amount}`
        ).join('\n');
        
        fs.writeFileSync(outputPath, csvHeader + csvRows);
        
        console.log(`✅ Exported ${validFoodNutrients.length} food nutrients to: ${outputPath}`);
        console.log(`📊 File size: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB`);
        
        resolve();
      })
      .on('error', (error) => {
        console.error('❌ CSV read error:', error);
        reject(error);
      });
  });
}

// Run the export
exportValidFoodNutrients()
  .then(() => {
    console.log('✅ Export completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Export failed:', error);
    process.exit(1);
  });
