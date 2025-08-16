#!/usr/bin/env tsx

/**
 * Sample USDA Data Import Script for SnapCarb
 * 
 * This script imports a small sample of USDA data to test the system.
 * Run this first to make sure everything works before doing the full import.
 * 
 * Usage:
 * 1. Make sure your .env has EXPO_PUBLIC_USDA_API_KEY
 * 2. Run: npx tsx scripts/import-sample-usda-data.ts
 */

import { USDADataImportService } from '../services/usda-data-import-service';

async function main() {
  console.log('🧪 Starting Sample USDA Data Import for SnapCarb...\n');
  
  try {
    // Check current database status
    console.log('📊 Checking current database status...');
    const progress = await USDADataImportService.getImportProgress();
    
    console.log(`Foundation Foods: ${progress.foundationFoods.imported}/${progress.foundationFoods.total}`);
    console.log(`Branded Foods: ${progress.brandedFoods.imported}/${progress.brandedFoods.total}\n`);
    
    // Import just a small sample of Foundation Foods (first 100)
    console.log('🥕 Importing sample Foundation Foods (first 100)...');
    console.log('This will test the system with basic ingredients...\n');
    
    // We'll modify the service to import just a sample
    const sampleResult = await importSampleFoundationFoods();
    
    if (sampleResult.success) {
      console.log(`✅ Sample Foundation Foods import completed! Imported: ${sampleResult.count} foods\n`);
    } else {
      console.log(`❌ Sample Foundation Foods import failed: ${sampleResult.error}\n`);
    }
    
    // Test the search functionality
    console.log('🔍 Testing search functionality...');
    await testSearchFunctionality();
    
    // Final status
    console.log('📊 Final Database Status:');
    const finalProgress = await USDADataImportService.getImportProgress();
    console.log(`Foundation Foods: ${finalProgress.foundationFoods.imported}/${finalProgress.foundationFoods.total}`);
    console.log(`Branded Foods: ${finalProgress.brandedFoods.imported}/${finalProgress.brandedFoods.total}`);
    
    console.log('\n🎉 Sample import completed!');
    console.log('Your SnapCarb app now has sample USDA data to test with!');
    console.log('Try searching for "carrot" or "chicken" in your recipe search.');
    
  } catch (error) {
    console.error('❌ Sample import script failed:', error);
    process.exit(1);
  }
}

// Import just a small sample of foundation foods
async function importSampleFoundationFoods(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('Fetching first 100 foundation foods...');
    
    // Get just the first 100 foods
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY'}&dataType=Foundation&pageSize=100&pageNumber=1`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const foods = data.foods || [];
    
    console.log(`Found ${foods.length} foods to import...`);
    
    // Import them using our service
    let importedCount = 0;
    for (const food of foods) {
      try {
        // Get detailed nutrition for this food
        const nutritionResponse = await fetch(
          `https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY'}`,
          { method: 'GET' }
        );
        
        if (nutritionResponse.ok) {
          const nutritionData = await nutritionResponse.json();
          
          // Insert into database
          const { error } = await USDADataImportService['insertFoundationFoods']([{
            fdcId: food.fdcId,
            description: food.description,
            brandOwner: food.brandOwner,
            brandName: food.brandName,
            dataType: food.dataType,
            publicationDate: food.publicationDate,
            allHighlightFields: food.allHighlightFields,
            allKeywords: food.allKeywords,
            nutrients: nutritionData.foodNutrients || [],
            servingSize: 100,
            servingUnit: 'g'
          }]);
          
          if (!error) {
            importedCount++;
            console.log(`✅ Imported: ${food.description}`);
          }
        }
        
        // Small delay to be respectful to USDA API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`⚠️  Skipped ${food.description}: ${error}`);
      }
    }
    
    return { success: true, count: importedCount };
    
  } catch (error) {
    console.error('Error importing sample foundation foods:', error);
    return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Test the search functionality
async function testSearchFunctionality() {
  try {
    console.log('Testing search for "carrot"...');
    const results = await USDADataImportService['searchFoods']('carrot', 5);
    console.log(`Found ${results.length} carrot results`);
    
    if (results.length > 0) {
      console.log('First result:', results[0]);
      
      // Test getting nutrition details
      const nutrition = await USDADataImportService['getFoodNutrition'](results[0].fdcId);
      if (nutrition) {
        console.log('Nutrition data retrieved successfully!');
        console.log(`Calories: ${nutrition.calories}, Net Carbs: ${nutrition.net_carbs_g}g`);
      }
    }
    
  } catch (error) {
    console.log('Search test failed:', error);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}


