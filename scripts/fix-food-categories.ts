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

async function importFoodCategories() {
  console.log('📂 Importing food categories (fixed)...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_category.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food_category.csv not found, skipping...');
    return 0;
  }
  
  const categories: any[] = [];
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        // The CSV has: id, code, description
        // We want: id, code, name (from description), description
        if (row.description && row.description.trim() !== '') {
          categories.push({
            id: parseInt(row.id),
            code: row.code || null,
            name: row.description.trim(), // Use description as name
            description: row.description || null,
          });
        }
      })
      .on('end', async () => {
        if (categories.length === 0) {
          console.log('⚠️  No valid food categories found');
          resolve(0);
          return;
        }
        
        console.log(`📊 Found ${categories.length} valid food categories`);
        
        try {
          const { error } = await supabase
            .from('food_category')
            .upsert(categories, { onConflict: 'id' });
          
          if (error) {
            console.error('❌ Error importing food categories:', error);
            resolve(0);
          } else {
            console.log(`✅ Imported ${categories.length} food categories`);
            resolve(categories.length);
          }
        } catch (error) {
          console.error('❌ Exception during import:', error);
          resolve(0);
        }
      })
      .on('error', reject);
  });
}

// Run the import
importFoodCategories()
  .then((count) => {
    console.log(`✅ Food categories import completed: ${count} imported`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Import failed:', error);
    process.exit(1);
  });
