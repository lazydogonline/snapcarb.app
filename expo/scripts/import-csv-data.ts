#!/usr/bin/env tsx

// Load environment variables from .env file
import 'dotenv/config';

/**
 * USDA CSV Data Import Script for SnapCarb
 * 
 * This script imports the downloaded USDA CSV files directly into Supabase.
 * Focus on branded foods for barcode scanning functionality.
 * 
 * Usage:
 * 1. Download the USDA CSV files (food.csv, branded_food.csv, food_nutrient.csv, nutrient.csv)
 * 2. Place them in a 'data' folder in your project
 * 3. Run: npx tsx scripts/import-csv-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface FoodRow {
  fdc_id: string;
  description: string;
  data_type?: string;
  publication_date?: string;
}

interface BrandedFoodRow {
  fdc_id: string;
  brand_owner?: string;
  brand_name?: string;
  gtin_upc?: string;
  ingredients?: string;
  serving_size?: string;
  serving_size_unit?: string;
}

interface NutrientRow {
  id: string;
  name: string;
  unit_name: string;
  nutrient_nbr?: string;
  rank?: string;
}

interface FoodNutrientRow {
  fdc_id: string;
  nutrient_id: string;
  amount: string;
}

async function importNutrients() {
  console.log('🍎 Importing nutrients...');
  
  const nutrients: NutrientRow[] = [];
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  nutrient.csv not found in data folder, skipping...');
    return 0;
  }
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        nutrients.push({
          id: row.id,
          name: row.name,
          unit_name: row.unit_name,
          nutrient_nbr: row.nutrient_nbr,
          rank: row.rank,
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${nutrients.length} nutrients to import`);
        
        // Import in batches
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < nutrients.length; i += batchSize) {
          const batch = nutrients.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('nutrient')
              .upsert(batch.map(nutrient => ({
                id: nutrient.id,
                name: nutrient.name,
                unit_name: nutrient.unit_name,
                nutrient_nbr: nutrient.nutrient_nbr || null,
                rank: nutrient.rank ? parseInt(nutrient.rank) : null,
              })), { onConflict: 'id' });
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${imported}/${nutrients.length}`);
            }
          } catch (error) {
            console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
          }
        }
        
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function importFoodNutrients() {
  console.log('🍎 Importing food nutrients...');
  
  // First, get all valid fdc_ids from the food table
  console.log('🔍 Getting valid food IDs from database...');
  const { data: validFoods, error: foodError } = await supabase
    .from('food')
    .select('fdc_id');
  
  if (foodError) {
    console.error('❌ Error getting valid food IDs:', foodError);
    return 0;
  }
  
  const validFdcIds = new Set(validFoods.map(f => f.fdc_id));
  console.log(`✅ Found ${validFdcIds.size} valid food IDs in database`);
  
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food_nutrient.csv not found in data folder, skipping...');
    return 0;
  }
  
  console.log(`📁 Reading food nutrients from: ${filePath}`);
  console.log(`📊 File size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB`);
  
  return new Promise<number>((resolve, reject) => {
    let rowCount = 0;
    let validRowCount = 0;
    let imported = 0;
    const allFoodNutrients: any[] = [];
    const batchSize = 100;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        rowCount++;
        
        // Only process if the fdc_id exists in our food table
        const fdcId = parseInt(row.fdc_id);
        if (validFdcIds.has(fdcId)) {
          validRowCount++;
          
          allFoodNutrients.push({
            id: Date.now() + validRowCount, // Simple unique ID
            fdc_id: fdcId,
            nutrient_id: parseInt(row.nutrient_id),
            amount: parseFloat(row.amount) || 0,
          });
        }
        
        if (rowCount % 10000 === 0) {
          console.log(`📊 Processed ${rowCount} rows, found ${validRowCount} valid...`);
        }
      })
      .on('end', async () => {
        console.log(`📊 CSV processing complete. Found ${validRowCount} valid food nutrients`);
        
        // Now process all batches at once
        const allBatches: any[] = [];
        let currentIndex = 0;
        
        // Split all collected data into batches
        while (currentIndex < allFoodNutrients.length) {
          const batch = allFoodNutrients.slice(currentIndex, currentIndex + batchSize);
          allBatches.push(batch);
          currentIndex += batchSize;
        }
        
        console.log(`📦 Processing ${allBatches.length} batches...`);
        
        // Insert all batches
        for (let i = 0; i < allBatches.length; i++) {
          const batch = allBatches[i];
          try {
            const { error } = await supabase
              .from('food_nutrient')
              .insert(batch);
            
            if (error) {
              console.error(`❌ Error importing batch ${i + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${i + 1}: ${imported} total imported`);
            }
          } catch (error) {
            console.error(`❌ Error in batch ${i + 1}:`, error);
          }
        }
        
        console.log(`🎉 Food nutrients import complete! Total imported: ${imported}`);
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function createNutritionView() {
  console.log('�� Creating nutrition views...');
  
  try {
    // First create the 100g macros view
    const view100gSQL = `
      -- grab nutrient_ids once so this survives updates
      WITH ids AS (
        SELECT
          MAX(id) FILTER (WHERE LOWER(name) = 'energy')                              AS id_kcal,
          MAX(id) FILTER (WHERE LOWER(name) = 'protein')                             AS id_pro,
          MAX(id) FILTER (WHERE LOWER(name) = 'total lipid (fat)')                   AS id_fat,
          MAX(id) FILTER (WHERE LOWER(name) = 'carbohydrate, by difference')         AS id_carb,
          MAX(id) FILTER (WHERE LOWER(name) = 'fiber, total dietary')                AS id_fiber,
          MAX(id) FILTER (WHERE LOWER(name) = 'total sugar alcohols')                AS id_sugar_alc,
          MAX(id) FILTER (WHERE LOWER(name) = 'sugars, total including nleaimf')     AS id_sugar,
          MAX(id) FILTER (WHERE LOWER(name) = 'sodium, na')                          AS id_na
        FROM public.nutrient
      )
      CREATE OR REPLACE VIEW public.v_food_macros_100g AS
      SELECT
        fn.fdc_id,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_kcal  FROM ids)) AS kcal,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_pro   FROM ids)) AS protein_g,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fat   FROM ids)) AS fat_g,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_carb  FROM ids)) AS carb_g,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fiber FROM ids)) AS fiber_g,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar FROM ids)) AS sugar_g,
        COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar_alc FROM ids)),0) AS sugar_alc_g,
        SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_na    FROM ids)) AS sodium_mg,
        GREATEST(
          0,
          COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_carb FROM ids)),0)
          - COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_fiber FROM ids)),0)
          - COALESCE(SUM(fn.amount) FILTER (WHERE fn.nutrient_id = (SELECT id_sugar_alc FROM ids)),0)
        ) AS net_carb_g
      FROM public.food_nutrient fn
      GROUP BY fn.fdc_id;
    `;
    
    // Then create the serving-size view
    const viewServingSQL = `
      CREATE OR REPLACE VIEW public.v_food_macros_serving AS
      SELECT
        b.fdc_id,
        b.serving_size,
        b.serving_size_unit,
        m100.kcal        * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS kcal,
        m100.protein_g   * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS protein_g,
        m100.fat_g       * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS fat_g,
        m100.carb_g      * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS carb_g,
        m100.fiber_g     * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS fiber_g,
        m100.sugar_g     * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sugar_g,
        m100.sugar_alc_g * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sugar_alc_g,
        m100.sodium_mg   * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS sodium_mg,
        m100.net_carb_g  * (COALESCE(NULLIF(b.serving_size,0),100)/100.0) AS net_carb_g
      FROM public.branded_food b
      JOIN public.v_food_macros_100g m100 USING (fdc_id);
    `;
    
    // Execute both views
    const { error: error100g } = await supabase.rpc('exec_sql', { sql: view100gSQL });
    if (error100g) {
      console.error('❌ Error creating 100g macros view:', error100g);
    } else {
      console.log('✅ 100g macros view created successfully!');
    }
    
    const { error: errorServing } = await supabase.rpc('exec_sql', { sql: viewServingSQL });
    if (errorServing) {
      console.error('❌ Error creating serving macros view:', errorServing);
    } else {
      console.log('✅ Serving macros view created successfully!');
    }
    
    if (error100g || errorServing) {
      console.log('⚠️  You may need to create the views manually in Supabase SQL editor');
    }
  } catch (error) {
    console.error('❌ Error creating nutrition views:', error);
    console.log('⚠️  You may need to create the views manually in Supabase SQL editor');
  }
}

async function importFoods() {
  console.log('�� Importing foods...');
  
  const foods: FoodRow[] = [];
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  food.csv not found in data folder, skipping...');
    return 0;
  }
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        foods.push({
          fdc_id: row.fdc_id,
          description: row.description,
          data_type: row.data_type,
          publication_date: row.publication_date,
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${foods.length} foods to import`);
        
        // Import in batches
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < foods.length; i += batchSize) {
          const batch = foods.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('food')
              .upsert(batch.map(food => ({
                fdc_id: food.fdc_id,
                description: food.description,
                data_type: food.data_type || 'Foundation',
                publication_date: food.publication_date ? new Date(food.publication_date) : null,
              })), { onConflict: 'fdc_id' });
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${imported}/${foods.length}`);
            }
          } catch (error) {
            console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
          }
        }
        
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function importBrandedFoods() {
  console.log('🏷️  Importing branded foods...');
  
  const brandedFoods: BrandedFoodRow[] = [];
  const filePath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/branded_food.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  branded_food.csv not found in data folder, skipping...');
    return 0;
  }
  
  return new Promise<number>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        brandedFoods.push({
          fdc_id: row.fdc_id,
          brand_owner: row.brand_owner,
          brand_name: row.brand_name,
          gtin_upc: row.gtin_upc,
          ingredients: row.ingredients,
          serving_size: row.serving_size,
          serving_size_unit: row.serving_size_unit,
        });
      })
      .on('end', async () => {
        console.log(`📊 Found ${brandedFoods.length} branded foods to import`);
        
        // Import in batches
        const batchSize = 1000;
        let imported = 0;
        
        for (let i = 0; i < brandedFoods.length; i += batchSize) {
          const batch = brandedFoods.slice(i, i + batchSize);
          
          try {
            const { error } = await supabase
              .from('branded_food')
              .upsert(batch.map(food => ({
                fdc_id: food.fdc_id,
                brand_owner: food.brand_owner || null,
                brand_name: food.brand_name || null,
                gtin_upc: food.gtin_upc || null,
                ingredients: food.ingredients || null,
                serving_size: food.serving_size ? parseFloat(food.serving_size) : 100,
                serving_size_unit: food.serving_size_unit || 'g',
              })), { onConflict: 'fdc_id' });
            
            if (error) {
              console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, error);
            } else {
              imported += batch.length;
              console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${imported}/${brandedFoods.length}`);
            }
          } catch (error) {
            console.error(`❌ Error in batch ${Math.floor(i / batchSize) + 1}:`, error);
          }
        }
        
        resolve(imported);
      })
      .on('error', reject);
  });
}

async function testBarcodeLookup() {
  console.log('\n🔍 Testing barcode lookup...');
  
  try {
    // Test with a sample barcode (replace with a real one you have)
    const testBarcode = '0123456789012';
    
    const { data, error } = await supabase
      .from('branded_food')
      .select(`
        *,
        food!inner(description)
      `)
      .eq('gtin_upc', testBarcode)
      .limit(1);
    
    if (error) {
      console.error('❌ Error testing barcode lookup:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Barcode lookup working! Found:', data[0].food?.description);
    } else {
      console.log('⚠️  No test barcode found, but lookup is working');
    }
  } catch (error) {
    console.error('❌ Error testing barcode lookup:', error);
  }
}

async function main() {
  console.log('🚀 Starting USDA CSV Data Import for SnapCarb...\n');
  
  try {
    // Check if USDA FOOD IMPORT folder exists
    const usdaFolder = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24');
    if (!fs.existsSync(usdaFolder)) {
      console.error('❌ USDA FOOD IMPORT folder not found!');
      console.error('Please make sure the USDA CSV files are in:');
      console.error('USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/');
      console.error('Required files:');
      console.error('- nutrient.csv');
      console.error('- food.csv');
      console.error('- branded_food.csv');
      console.error('- food_nutrient.csv');
      process.exit(1);
    }
    
    console.log('📁 Found USDA CSV files in:');
    console.log('   USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/');
    console.log('   - nutrient.csv');
    console.log('   - food.csv');
    console.log('   - branded_food.csv');
    console.log('   - food_nutrient.csv\n');
    
    // Check what files are available
    const files = fs.readdirSync(usdaFolder).filter(file => file.endsWith('.csv'));
    console.log(`📋 Found CSV files: ${files.join(', ')}\n`);
    
    // Import data in the correct order
    const nutrientsImported = await importNutrients();
    const foodsImported = await importFoods();
    const brandedFoodsImported = await importBrandedFoods();
    const foodNutrientsImported = await importFoodNutrients();
    
    // Create the nutrition view
    await createNutritionView();
    
    // Test functionality
    await testBarcodeLookup();
    
    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`Nutrients: ${nutrientsImported}`);
    console.log(`Foods: ${foodsImported}`);
    console.log(`Branded Foods: ${brandedFoodsImported}`);
    console.log(`Food Nutrients: ${foodNutrientsImported}`);
    
    if (brandedFoodsImported > 0) {
      console.log('\n🎉 Branded foods imported successfully!');
      console.log('Your barcode scanner should now work with real USDA data!');
      console.log('Try scanning a barcode from any food package.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}