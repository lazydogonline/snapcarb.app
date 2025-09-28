import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importAllFoods() {
  try {
    console.log('🚀 Importing ALL foods from your CSV...\n');

    // Step 1: Read the CSV and count everything
    console.log('1. Reading CSV file...');
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvContent.split('\n');
    console.log(`   Total lines: ${lines.length}`);
    console.log(`   Header line: ${lines[0]}`);
    console.log(`   Data lines: ${lines.length - 1}`);
    
    // Step 2: Parse ALL nutrition data
    console.log('\n2. Parsing nutrition data...');
    const foodMap = new Map();
    let totalRecords = 0;
    let skippedRecords = 0;
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      totalRecords++;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        const fdcId = parseInt(fdc_id);
        const nutrientId = parseInt(nutrient_id);
        const nutrientAmount = parseFloat(amount);
        
        if (!foodMap.has(fdcId)) {
          foodMap.set(fdcId, {
            fdc_id: fdcId,
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            nutrient_count: 0
          });
        }
        
        const food = foodMap.get(fdcId);
        food.nutrient_count++;
        
        // Map nutrient IDs to nutrition values
        switch (nutrientId) {
          case 1008: food.calories = nutrientAmount; break; // Energy
          case 1003: food.protein = nutrientAmount; break; // Protein
          case 1004: food.fat = nutrientAmount; break; // Total lipid (fat)
          case 1005: food.carbs = nutrientAmount; break; // Carbohydrate
          case 1079: food.fiber = nutrientAmount; break; // Fiber
          case 2000: food.sugar = nutrientAmount; break; // Total Sugars
          case 1093: food.sodium = nutrientAmount; break; // Sodium
        }
      } else {
        skippedRecords++;
      }
    }
    
    console.log(`✅ Parsed ${totalRecords} total records`);
    console.log(`✅ Found ${foodMap.size} unique foods`);
    console.log(`❌ Skipped ${skippedRecords} invalid records`);
    
    // Step 3: Show nutrition distribution
    console.log('\n3. Nutrition data distribution:');
    const foodsWithProtein = Array.from(foodMap.values()).filter(f => f.protein > 0).length;
    const foodsWithCarbs = Array.from(foodMap.values()).filter(f => f.carbs > 0).length;
    const foodsWithFat = Array.from(foodMap.values()).filter(f => f.fat > 0).length;
    const foodsWithFiber = Array.from(foodMap.values()).filter(f => f.fiber > 0).length;
    
    console.log(`   Foods with protein: ${foodsWithProtein}`);
    console.log(`   Foods with carbs: ${foodsWithCarbs}`);
    console.log(`   Foods with fat: ${foodsWithFat}`);
    console.log(`   Foods with fiber: ${foodsWithFiber}`);
    
    // Step 4: Show some sample foods
    console.log('\n4. Sample foods found:');
    let count = 0;
    for (const [fdcId, food] of foodMap) {
      if (count < 5) {
        console.log(`   - Food ${fdcId}: ${food.protein}g protein, ${food.carbs}g carbs, ${food.fat}g fat`);
        count++;
      } else {
        break;
      }
    }
    
    console.log('\n🎉🎉🎉 CSV ANALYSIS COMPLETE! 🎉🎉🎉');
    console.log(`💡 Your CSV contains ${foodMap.size} unique foods`);
    console.log(`🚀 That's ${foodMap.size - 999} MORE foods than we imported!`);
    console.log(`🎯 We need to import ALL of these, not just 999!`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

importAllFoods();
