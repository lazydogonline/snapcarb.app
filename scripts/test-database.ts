#!/usr/bin/env tsx

/**
 * Database Test Script for SnapCarb
 * 
 * This script tests the database schema, views, and functions after importing USDA data.
 * Run this after importing the CSV data to verify everything works.
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema...\n');
  
  try {
    // Test 1: Check if tables exist and have data
    console.log('📊 Table Data Counts:');
    
    const { count: nutrientsCount } = await supabase
      .from('nutrients')
      .select('*', { count: 'exact', head: true });
    
    const { count: foodsCount } = await supabase
      .from('foods')
      .select('*', { count: 'exact', head: true });
    
    const { count: brandedFoodsCount } = await supabase
      .from('branded_foods')
      .select('*', { count: 'exact', head: true });
    
    const { count: foodNutrientsCount } = await supabase
      .from('food_nutrients')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Nutrients: ${nutrientsCount || 0}`);
    console.log(`   Foods: ${foodsCount || 0}`);
    console.log(`   Branded Foods: ${brandedFoodsCount || 0}`);
    console.log(`   Food Nutrients: ${foodNutrientsCount || 0}\n`);
    
    // Test 2: Check if views exist and work
    console.log('🔬 Testing Views:');
    
    // Test v_food_macros_100g view
    const { data: macros100g, error: error100g } = await supabase
      .from('v_food_macros_100g')
      .select('*')
      .limit(5);
    
    if (error100g) {
      console.log('   ❌ v_food_macros_100g view error:', error100g.message);
    } else {
      console.log(`   ✅ v_food_macros_100g view working (${macros100g?.length || 0} rows)`);
    }
    
    // Test v_food_macros_serving view
    const { data: macrosServing, error: errorServing } = await supabase
      .from('v_food_macros_serving')
      .select('*')
      .limit(5);
    
    if (errorServing) {
      console.log('   ❌ v_food_macros_serving view error:', errorServing.message);
    } else {
      console.log(`   ✅ v_food_macros_serving view working (${macrosServing?.length || 0} rows)`);
    }
    
    // Test v_recipe_totals view
    const { data: recipeTotals, error: errorRecipe } = await supabase
      .from('v_recipe_totals')
      .select('*')
      .limit(5);
    
    if (errorRecipe) {
      console.log('   ❌ v_recipe_totals view error:', errorRecipe.message);
    } else {
      console.log(`   ✅ v_recipe_totals view working (${recipeTotals?.length || 0} rows)\n`);
    }
    
    // Test 3: Test helper functions
    console.log('⚡ Testing Helper Functions:');
    
    // Test search_foods function
    const { data: searchResults, error: errorSearch } = await supabase
      .rpc('search_foods', { search_term: 'apple' });
    
    if (errorSearch) {
      console.log('   ❌ search_foods function error:', errorSearch.message);
    } else {
      console.log(`   ✅ search_foods function working (${searchResults?.length || 0} results for 'apple')`);
    }
    
    // Test get_food_macros_100g function (if we have food data)
    if (foodsCount && foodNutrientsCount) {
      const { data: macros, error: errorMacros } = await supabase
        .rpc('get_food_macros_100g', { food_fdc_id: 1 });
      
      if (errorMacros) {
        console.log('   ❌ get_food_macros_100g function error:', errorMacros.message);
      } else {
        console.log(`   ✅ get_food_macros_100g function working`);
      }
    }
    
    // Test 4: Test barcode lookup (if we have branded foods)
    if (brandedFoodsCount) {
      console.log('\n🏷️  Testing Barcode Lookup:');
      
      // Get a sample barcode from branded foods
      const { data: sampleBranded, error: errorSample } = await supabase
        .from('branded_foods')
        .select('gtin_upc')
        .not('gtin_upc', 'is', null)
        .limit(1);
      
      if (sampleBranded && sampleBranded.length > 0) {
        const testBarcode = sampleBranded[0].gtin_upc;
        console.log(`   Testing with barcode: ${testBarcode}`);
        
        const { data: barcodeResult, error: errorBarcode } = await supabase
          .rpc('lookup_food_by_barcode', { barcode: testBarcode });
        
        if (errorBarcode) {
          console.log('   ❌ barcode lookup error:', errorBarcode.message);
        } else if (barcodeResult && barcodeResult.length > 0) {
          console.log(`   ✅ Barcode lookup working! Found: ${barcodeResult[0].description}`);
        } else {
          console.log('   ⚠️  Barcode lookup working but no results found');
        }
      } else {
        console.log('   ⚠️  No barcodes found in branded foods to test');
      }
    }
    
    // Test 5: Create a test recipe
    console.log('\n👨‍🍳 Testing Recipe System:');
    
    try {
      // Create a test recipe
      const { data: recipe, error: errorRecipeCreate } = await supabase
        .from('recipes')
        .insert({
          name: 'Test Recipe - SnapCarb',
          servings: 2
        })
        .select()
        .single();
      
      if (errorRecipeCreate) {
        console.log('   ❌ Recipe creation error:', errorRecipeCreate.message);
      } else {
        console.log(`   ✅ Recipe created: ${recipe.name} (ID: ${recipe.id})`);
        
        // Add test ingredients if we have food data
        if (foodsCount && foodNutrientsCount) {
          const { data: ingredients, error: errorIngredients } = await supabase
            .from('recipe_ingredients')
            .insert([
              { recipe_id: recipe.id, fdc_id: 1, grams: 100 },
              { recipe_id: recipe.id, fdc_id: 2, grams: 50 }
            ])
            .select();
          
          if (errorIngredients) {
            console.log('   ❌ Recipe ingredients error:', errorIngredients.message);
          } else {
            console.log(`   ✅ Recipe ingredients added (${ingredients?.length || 0} ingredients)`);
            
            // Test recipe totals view
            const { data: totals, error: errorTotals } = await supabase
              .from('v_recipe_totals')
              .select('*')
              .eq('recipe_id', recipe.id)
              .single();
            
            if (errorTotals) {
              console.log('   ❌ Recipe totals error:', errorTotals.message);
            } else {
              console.log(`   ✅ Recipe totals calculated: ${totals.total_grams}g total, ${totals.total_kcal} kcal`);
            }
          }
        }
        
        // Clean up test recipe
        await supabase.from('recipes').delete().eq('id', recipe.id);
        console.log('   🧹 Test recipe cleaned up');
      }
    } catch (error) {
      console.log('   ❌ Recipe system test failed:', error);
    }
    
    console.log('\n🎉 Database testing completed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testDatabaseSchema().catch(console.error);
}


