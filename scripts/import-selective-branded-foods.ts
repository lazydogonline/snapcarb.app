#!/usr/bin/env tsx

/**
 * Selective Branded Food Import Script for SnapCarb
 * 
 * This script imports only essential branded foods to keep the table manageable.
 * Instead of importing millions of records, we'll import:
 * - Popular brands and products
 * - Foods with complete nutrition data
 * - Items commonly found in grocery stores
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BrandedFoodRow {
  fdc_id: number;
  brand_owner?: string;
  brand_name?: string;
  gtin_upc?: string;
  ingredients?: string;
  serving_size?: number;
  serving_size_unit?: string;
}

async function importSelectiveBrandedFoods() {
  console.log('🔄 Starting selective branded food import...');
  
  const csvPath = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/branded_food.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ branded_food.csv not found!');
    console.log('💡 Please download the USDA branded_food.csv file first');
    return false;
  }

  try {
    const brandedFoods: BrandedFoodRow[] = [];
    
    // Read CSV and filter for quality data
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row: any) => {
          // Only include foods with:
          // 1. Valid barcode (gtin_upc)
          // 2. Brand owner info
          // 3. Ingredients list
          // 4. Reasonable serving size
          if (row.gtin_upc && 
              row.gtin_upc.length >= 8 && 
              row.brand_owner && 
              row.brand_owner.trim() && 
              row.ingredients && 
              row.ingredients.trim() &&
              row.serving_size &&
              parseFloat(row.serving_size) > 0) {
            
            brandedFoods.push({
              fdc_id: parseInt(row.fdc_id),
              brand_owner: row.brand_owner.trim(),
              brand_name: row.brand_name?.trim() || '',
              gtin_upc: row.gtin_upc.trim(),
              ingredients: row.ingredients.trim(),
              serving_size: parseFloat(row.serving_size),
              serving_size_unit: row.serving_size_unit?.trim() || 'g'
            });
          }
        })
        .on('end', () => resolve())
        .on('error', reject);
    });

    console.log(`📊 Found ${brandedFoods.length} qualified branded foods`);
    
    // Limit to top 10,000 most relevant foods to keep table manageable
    const limitedFoods = brandedFoods.slice(0, 10000);
    console.log(`🎯 Limiting import to top ${limitedFoods.length} foods to keep table manageable`);
    
    // Check if we have nutrition data for these foods
    const fdcIds = limitedFoods.map(f => f.fdc_id);
    console.log('🔍 Checking nutrition data availability...');
    
    // Process nutrition check in smaller batches to avoid URL length limits
    const batchSize = 100; // Smaller batch size for nutrition checks
    let foodsWithNutrition: number[] = [];
    
    for (let i = 0; i < fdcIds.length; i += batchSize) {
      const batch = fdcIds.slice(i, i + batchSize);
      
      try {
        const { data: nutritionBatch, error: nutritionError } = await supabase
          .from('food_nutrient')
          .select('fdc_id')
          .in('fdc_id', batch);
        
        if (nutritionError) {
          console.error(`❌ Error checking nutrition batch ${Math.floor(i/batchSize) + 1}:`, nutritionError);
        } else if (nutritionBatch) {
          const batchFdcIds = nutritionBatch.map(n => n.fdc_id);
          foodsWithNutrition.push(...batchFdcIds);
          console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: Found ${batchFdcIds.length} foods with nutrition data`);
        }
      } catch (error) {
        console.error(`❌ Error in nutrition batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    // Remove duplicates and filter foods to only those with nutrition data
    const uniqueFoodsWithNutrition = [...new Set(foodsWithNutrition)];
    const qualifiedFoods = limitedFoods.filter(f => uniqueFoodsWithNutrition.includes(f.fdc_id));
    
    console.log(`✅ Found nutrition data for ${uniqueFoodsWithNutrition.length} foods`);
    console.log(`🎯 Final qualified foods for import: ${qualifiedFoods.length}`);
    
    if (qualifiedFoods.length === 0) {
      console.log('❌ No foods with nutrition data found. Cannot proceed with import.');
      return false;
    }
    
    // Import in batches of 1000
    const batchSizeImport = 1000;
    let imported = 0;
    
    for (let i = 0; i < qualifiedFoods.length; i += batchSizeImport) {
      const batch = qualifiedFoods.slice(i, i + batchSizeImport);
      
      try {
        const { error: insertError } = await supabase
          .from('branded_food')
          .insert(batch);
        
        if (insertError) {
          console.error(`❌ Error importing batch ${Math.floor(i/batchSizeImport) + 1}:`, insertError);
        } else {
          imported += batch.length;
          console.log(`✅ Imported batch ${Math.floor(i/batchSizeImport) + 1}: ${imported}/${qualifiedFoods.length} total`);
        }
      } catch (error) {
        console.error(`❌ Error in batch ${Math.floor(i/batchSizeImport) + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 Selective import complete!`);
    console.log(`📱 Imported ${imported} branded foods (instead of millions!)`);
    console.log(`💾 Table size is now manageable while still providing barcode functionality`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    return false;
  }
}

// Run the script
if (require.main === module) {
  importSelectiveBrandedFoods()
    .then(success => {
      if (success) {
        console.log('\n✅ Script completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Script failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Script crashed:', error);
      process.exit(1);
    });
}