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

async function importNutrients() {
  console.log('🧬 Importing nutrients...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  nutrient.csv not found, skipping...');
    return 0;
  }
  
  const nutrients: any[] = [];
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        nutrients.push({
          id: parseInt(row.id),
          name: row.name,
          unit_name: row.unit_name,
          nutrient_nbr: row.nutrient_nbr || null,
          rank: parseInt(row.rank) || null,
        });
      })
      .on('end', async () => {
        if (nutrients.length === 0) {
          console.log('⚠️  No nutrients found');
          resolve(0);
          return;
        }
        
        try {
          const { error } = await supabase
            .from('nutrient')
            .upsert(nutrients, { onConflict: 'id' });
          
          if (error) {
            console.error('❌ Error importing nutrients:', error);
            resolve(0);
          } else {
            console.log(`✅ Imported ${nutrients.length} nutrients`);
            resolve(nutrients.length);
          }
        } catch (error) {
          console.error('❌ Exception during import:', error);
          resolve(0);
        }
      })
      .on('error', reject);
  });
}

async function importFoods() {
  console.log('🍎 Importing foods...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food.csv not found, skipping...');
    return 0;
  }
  
  const foods: any[] = [];
  let rowCount = 0;
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        foods.push({
          fdc_id: parseInt(row.fdc_id),
          description: row.description,
          data_type: row.data_type || null,
          publication_date: row.publication_date || null,
          all_highlight_fields: row.all_highlight_fields || null,
          all_keywords: row.all_keywords || null,
        });
        
        if (rowCount % 10000 === 0) {
          console.log(`📊 Processed ${rowCount} foods...`);
        }
      })
      .on('end', async () => {
        if (foods.length === 0) {
          console.log('⚠️  No foods found');
          resolve(0);
          return;
        }
        
        console.log(`📊 Processing ${foods.length} foods in batches...`);
        
        // Process in batches to avoid memory issues
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < foods.length; i += batchSize) {
          const batch = foods.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('food')
              .upsert(batch, { onConflict: 'fdc_id' });
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported} total imported`);
            }
          } catch (error) {
            console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
          }
        }
        
        console.log(`🎉 Foods import complete! Total imported: ${imported}`);
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function importFoodNutrients() {
  console.log('🥗 Importing food nutrients...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food_nutrient.csv not found, skipping...');
    return 0;
  }
  
  const foodNutrients: any[] = [];
  let rowCount = 0;
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        foodNutrients.push({
          fdc_id: parseInt(row.fdc_id),
          nutrient_id: parseInt(row.nutrient_id),
          amount: parseFloat(row.amount) || 0,
          data_points: parseInt(row.data_points) || null,
          derivation_id: row.derivation_id || null,
          min: parseFloat(row.min) || null,
          max: parseFloat(row.max) || null,
          median: parseFloat(row.median) || null,
          footnote: row.footnote || null,
          min_year_acquired: parseInt(row.min_year_acquired) || null,
        });
        
        if (rowCount % 10000 === 0) {
          console.log(`📊 Processed ${rowCount} food nutrients...`);
        }
      })
      .on('end', async () => {
        if (foodNutrients.length === 0) {
          console.log('⚠️  No food nutrients found');
          resolve(0);
          return;
        }
        
        console.log(`📊 Processing ${foodNutrients.length} food nutrients in batches...`);
        
        // Process in batches to avoid memory issues
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < foodNutrients.length; i += batchSize) {
          const batch = foodNutrients.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('food_nutrient')
              .upsert(batch, { onConflict: 'fdc_id,nutrient_id' });
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported} total imported`);
            }
          } catch (error) {
            console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
          }
        }
        
        console.log(`🎉 Food nutrients import complete! Total imported: ${imported}`);
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting essential USDA data import...');
  
  try {
    const nutrientCount = await importNutrients();
    const foodCount = await importFoods();
    const foodNutrientCount = await importFoodNutrients();
    
    console.log('\n🎉 Import Summary:');
    console.log(`🧬 Nutrients: ${nutrientCount}`);
    console.log(`🍎 Foods: ${foodCount}`);
    console.log(`🥗 Food Nutrients: ${foodNutrientCount}`);
    
    console.log('\n✅ Essential USDA data import completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Test food search in your app');
    console.log('2. Check if nutrition data is now available');
    console.log('3. Run recipe search to verify real nutrition data');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
main();
