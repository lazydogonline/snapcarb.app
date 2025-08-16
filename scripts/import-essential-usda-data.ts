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
  console.log('📂 Importing food categories...');
  
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
        categories.push({
          id: parseInt(row.id),
          code: row.code,
          name: row.name,
          description: row.description || null,
        });
      })
      .on('end', async () => {
        if (categories.length === 0) {
          console.log('⚠️  No food categories found');
          resolve(0);
          return;
        }
        
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

async function importMeasureUnits() {
  console.log('📏 Importing measure units...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/measure_unit.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  measure_unit.csv not found, skipping...');
    return 0;
  }
  
  const units: any[] = [];
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        units.push({
          id: parseInt(row.id),
          name: row.name,
          abbreviation: row.abbreviation || null,
        });
      })
      .on('end', async () => {
        if (units.length === 0) {
          console.log('⚠️  No measure units found');
          resolve(0);
          return;
        }
        
        try {
          const { error } = await supabase
            .from('measure_unit')
            .upsert(units, { onConflict: 'id' });
          
          if (error) {
            console.error('❌ Error importing measure units:', error);
            resolve(0);
          } else {
            console.log(`✅ Imported ${units.length} measure units`);
            resolve(units.length);
          }
        } catch (error) {
          console.error('❌ Exception during import:', error);
          resolve(0);
        }
      })
      .on('error', reject);
  });
}

async function importFoodComponents() {
  console.log('🧬 Importing food components...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_component.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food_component.csv not found, skipping...');
    return 0;
  }
  
  const components: any[] = [];
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        components.push({
          id: parseInt(row.id),
          fdc_id: parseInt(row.fdc_id),
          name: row.name,
          data_type: row.data_type || null,
          description: row.description || null,
        });
      })
      .on('end', async () => {
        if (components.length === 0) {
          console.log('⚠️  No food components found');
          resolve(0);
          return;
        }
        
        try {
          const { error } = await supabase
            .from('food_component')
            .upsert(components, { onConflict: 'id' });
          
          if (error) {
            console.error('❌ Error importing food components:', error);
            resolve(0);
          } else {
            console.log(`✅ Imported ${components.length} food components`);
            resolve(components.length);
          }
        } catch (error) {
          console.error('❌ Exception during import:', error);
          resolve(0);
        }
      })
      .on('error', reject);
  });
}

async function importFoodPortions() {
  console.log('🥄 Importing food portions...');
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_portion.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food_portion.csv not found, skipping...');
    return 0;
  }
  
  const portions: any[] = [];
  let rowCount = 0;
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        portions.push({
          id: parseInt(row.id),
          fdc_id: parseInt(row.fdc_id),
          seq_num: parseInt(row.seq_num) || null,
          amount: parseFloat(row.amount) || 0,
          measure_unit_id: parseInt(row.measure_unit_id) || null,
          portion_description: row.portion_description || null,
          gram_weight: parseFloat(row.gram_weight) || null,
          data_points: parseInt(row.data_points) || null,
          footnote: row.footnote || null,
        });
        
        if (rowCount % 10000 === 0) {
          console.log(`📊 Processed ${rowCount} portions...`);
        }
      })
      .on('end', async () => {
        if (portions.length === 0) {
          console.log('⚠️  No food portions found');
          resolve(0);
          return;
        }
        
        console.log(`📊 Processing ${portions.length} portions in batches...`);
        
        // Process in batches to avoid memory issues
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < portions.length; i += batchSize) {
          const batch = portions.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('food_portion')
              .upsert(batch, { onConflict: 'id' });
            
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
        
        console.log(`🎉 Food portions import complete! Total imported: ${imported}`);
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('🚀 Starting essential USDA data import...');
  
  try {
    const categoryCount = await importFoodCategories();
    const unitCount = await importMeasureUnits();
    const componentCount = await importFoodComponents();
    const portionCount = await importFoodPortions();
    
    console.log('\n🎉 Import Summary:');
    console.log(`📂 Food Categories: ${categoryCount}`);
    console.log(`📏 Measure Units: ${unitCount}`);
    console.log(`🧬 Food Components: ${componentCount}`);
    console.log(`🥄 Food Portions: ${portionCount}`);
    
    console.log('\n✅ Essential USDA data import completed!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

// Run the import
main();
