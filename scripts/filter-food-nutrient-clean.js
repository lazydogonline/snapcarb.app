#!/usr/bin/env node

/**
 * FAST Food Nutrient Filter - SnapCarb
 * 
 * Filters food_nutrient.csv to only include rows with valid nutrient IDs
 * that exist in your nutrient table (IDs 1-477)
 * 
 * Usage: node scripts/filter-food-nutrient-clean.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const INPUT_FILE = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
const OUTPUT_FILE = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient_FILTERED.csv';
const VALID_NUTRIENT_IDS = new Set();

async function main() {
  console.log('🚀 Starting FAST Food Nutrient Filter...\n');
  
  try {
    // Step 1: Get valid nutrient IDs from your nutrient table
    console.log('📊 Getting valid nutrient IDs from your nutrient table...');
    
    // Connect to Supabase to get valid nutrient IDs
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv/config');
    
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all nutrient IDs from your table
    const { data: nutrients, error } = await supabase
      .from('nutrient')
      .select('id');
    
    if (error) {
      throw new Error(`Failed to get nutrients: ${error.message}`);
    }
    
    // Build set of valid IDs for fast lookup
    nutrients.forEach(n => VALID_NUTRIENT_IDS.add(n.id));
    
    console.log(`✅ Found ${VALID_NUTRIENT_IDS.size} valid nutrient IDs (${Math.min(...VALID_NUTRIENT_IDS)}-${Math.max(...VALID_NUTRIENT_IDS)})\n`);
    
    // Step 2: Filter food_nutrient.csv in one pass
    console.log('🔍 Filtering food_nutrient.csv...');
    
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`Input file not found: ${INPUT_FILE}`);
    }
    
    const inputStream = fs.createReadStream(INPUT_FILE, 'utf8');
    const outputStream = fs.createWriteStream(OUTPUT_FILE);
    
    let lineCount = 0;
    let validCount = 0;
    let skippedCount = 0;
    
    // Write header
    outputStream.write('fdc_id,nutrient_id,amount,data_points,derivation_id,min,max,median,footnote,min_year_acquired\n');
    
    // Process file line by line (memory efficient)
    inputStream.on('data', (chunk) => {
      const lines = chunk.split('\n');
      
      lines.forEach((line, index) => {
        // Skip header and empty lines
        if (lineCount === 0 || !line.trim()) {
          lineCount++;
          return;
        }
        
        // Parse CSV line (simple split, no complex parsing)
        const parts = line.split(',');
        if (parts.length >= 2) {
          const nutrientId = parseInt(parts[1]);
          
          // Check if nutrient ID is valid
          if (VALID_NUTRIENT_IDS.has(nutrientId)) {
            outputStream.write(line + '\n');
            validCount++;
          } else {
            skippedCount++;
          }
        }
        
        lineCount++;
        
        // Progress update every 100,000 lines
        if (lineCount % 100000 === 0) {
          console.log(`📊 Processed ${lineCount.toLocaleString()} lines...`);
        }
      });
    });
    
    inputStream.on('end', () => {
      outputStream.end();
      
      console.log('\n🎉 Filtering Complete!');
      console.log(`📊 Total lines processed: ${lineCount.toLocaleString()}`);
      console.log(`✅ Valid records kept: ${validCount.toLocaleString()}`);
      console.log(`❌ Skipped records: ${skippedCount.toLocaleString()}`);
      console.log(`📁 Output file: ${OUTPUT_FILE}`);
      
      // Calculate file sizes
      const inputSize = fs.statSync(INPUT_FILE).size;
      const outputSize = fs.statSync(OUTPUT_FILE).size;
      const compression = ((1 - outputSize / inputSize) * 100).toFixed(1);
      
      console.log(`💾 Input size: ${(inputSize / 1024 / 1024).toFixed(1)} MB`);
      console.log(`💾 Output size: ${(outputSize / 1024 / 1024).toFixed(1)} MB`);
      console.log(`📉 Compression: ${compression}% smaller`);
      
      console.log('\n🚀 Now you can import the filtered CSV without foreign key errors!');
    });
    
    inputStream.on('error', (error) => {
      throw new Error(`Error reading input file: ${error.message}`);
    });
    
    outputStream.on('error', (error) => {
      throw new Error(`Error writing output file: ${error.message}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
