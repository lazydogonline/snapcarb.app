#!/usr/bin/env tsx

/**
 * USDA Data Import Script for SnapCarb
 * 
 * This script downloads the complete USDA food database and stores it locally in Supabase.
 * Run this once to eliminate API limits forever!
 * 
 * Usage:
 * 1. Make sure your .env has EXPO_PUBLIC_USDA_API_KEY
 * 2. Run: npx tsx scripts/import-usda-data.ts
 * 
 * The script will:
 * - Download Foundation Foods (core ingredients like carrots, potatoes, etc.)
 * - Download Branded Foods (specific products with barcodes)
 * - Store everything in your Supabase database
 * - Handle rate limiting automatically
 */

import { USDADataImportService } from '../services/usda-data-import-service';

async function main() {
  console.log('🚀 Starting USDA Data Import for SnapCarb...\n');
  
  try {
    // Check current database status
    console.log('📊 Checking current database status...');
    const progress = await USDADataImportService.getImportProgress();
    
    console.log(`Foundation Foods: ${progress.foundationFoods.imported}/${progress.foundationFoods.total}`);
    console.log(`Branded Foods: ${progress.brandedFoods.imported}/${progress.brandedFoods.total}\n`);
    
    if (progress.foundationFoods.imported > 0 || progress.brandedFoods.imported > 0) {
      console.log('⚠️  Database already has some USDA data!');
      const answer = await askQuestion('Do you want to continue and add more data? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Import cancelled.');
        return;
      }
    }
    
    // Import Foundation Foods (core ingredients)
    console.log('🥕 Starting Foundation Foods import...');
    console.log('This includes basic ingredients like vegetables, fruits, meats, etc.');
    console.log('This may take several hours due to USDA rate limiting...\n');
    
    const foundationResult = await USDADataImportService.importFoundationFoods();
    
    if (foundationResult.success) {
      console.log(`✅ Foundation Foods import completed! Imported: ${foundationResult.count} foods\n`);
    } else {
      console.log(`❌ Foundation Foods import failed: ${foundationResult.error}\n`);
    }
    
    // Import Branded Foods (products with barcodes)
    console.log('🏷️  Starting Branded Foods import...');
    console.log('This includes specific products like "Kraft Mac and Cheese", "Coca Cola", etc.');
    console.log('This may take several hours due to USDA rate limiting...\n');
    
    const brandedResult = await USDADataImportService.importBrandedFoods();
    
    if (brandedResult.success) {
      console.log(`✅ Branded Foods import completed! Imported: ${brandedResult.count} foods\n`);
    } else {
      console.log(`❌ Branded Foods import failed: ${brandedResult.error}\n`);
    }
    
    // Final status
    console.log('📊 Final Database Status:');
    const finalProgress = await USDADataImportService.getImportProgress();
    console.log(`Foundation Foods: ${finalProgress.foundationFoods.imported}/${finalProgress.foundationFoods.total}`);
    console.log(`Branded Foods: ${finalProgress.brandedFoods.imported}/${finalProgress.brandedFoods.total}`);
    console.log(`Total Foods: ${finalProgress.foundationFoods.imported + finalProgress.brandedFoods.imported}`);
    
    console.log('\n🎉 Import process completed!');
    console.log('Your SnapCarb app now has unlimited access to USDA nutrition data!');
    console.log('No more API limits - all nutrition calculations will be instant.');
    
  } catch (error) {
    console.error('❌ Import script failed:', error);
    process.exit(1);
  }
}

// Helper function to ask user questions (for CLI interaction)
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}


