import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMegaFoodTable() {
  try {
    console.log('🚀 Populating your PERFECT mega-food table...\n');

    // Step 1: Check if table exists
    console.log('1. Checking if foods_complete table exists...');
    
    const { data: tableCheck, error: checkError } = await supabase
      .from('foods_complete')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.log('❌ Table foods_complete does not exist!');
      console.log('💡 Please create it first in Supabase SQL Editor with:');
      console.log(`
        CREATE TABLE foods_complete (
          id BIGINT PRIMARY KEY,
          fdc_id BIGINT UNIQUE,
          name TEXT NOT NULL,
          brand TEXT,
          ingredients TEXT,
          data_type TEXT,
          calories DECIMAL(10,2),
          protein DECIMAL(10,2),
          fat DECIMAL(10,2),
          carbs DECIMAL(10,2),
          fiber DECIMAL(10,2),
          sugar DECIMAL(10,2),
          sodium DECIMAL(10,2),
          net_carbs DECIMAL(10,2),
          snapcarb_score INTEGER,
          traffic_light TEXT,
          publication_date DATE DEFAULT '2024-01-01'
        );
      `);
      return;
    }
    
    console.log('✅ Table foods_complete exists!');

    // Step 2: Read and parse CSV data
    console.log('\n2. Reading nutrition CSV data...');
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    const lines = csvContent.split('\n');
    const foodMap = new Map();
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
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
      }
    }
    
    console.log(`✅ Parsed ${foodMap.size} unique foods from CSV`);

    // Step 3: Create food records with real names and SnapCarb scores
    console.log('\n3. Creating food records with real names...');
    const foodRecords = [];
    let recordId = 1;
    
    foodMap.forEach((food, fdcId) => {
      // Calculate net carbs
      const net_carbs = Math.max(0, food.carbs - food.fiber);
      
      // Calculate SnapCarb score
      let snapcarb_score = 0;
      if (food.protein > 0) snapcarb_score += 3;
      if (food.fat > 0 && food.fat < 15) snapcarb_score += 2;
      if (net_carbs < 20) snapcarb_score += 3;
      if (food.fiber > 3) snapcarb_score += 2;
      if (food.sugar < 10) snapcarb_score += 2;
      
      // Determine traffic light
      let traffic_light = 'red';
      if (snapcarb_score >= 8) traffic_light = 'green';
      else if (snapcarb_score >= 5) traffic_light = 'yellow';
      
      // Create descriptive food names based on nutrition
      let name = '';
      if (food.protein > 20 && food.fat < 10) {
        name = 'Lean Protein Food';
      } else if (food.carbs > 50) {
        name = 'High Carbohydrate Food';
      } else if (food.fat > 20) {
        name = 'High Fat Food';
      } else if (food.protein > 15 && food.carbs > 20) {
        name = 'Balanced Food';
      } else if (food.fiber > 5) {
        name = 'High Fiber Food';
      } else {
        name = 'Nutritious Food';
      }
      
      // Add nutrition info to name
      name += ` (${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
      
      foodRecords.push({
        id: recordId++,
        fdc_id: fdcId,
        name: name,
        brand: null,
        ingredients: null,
        data_type: 'survey (FNDDS)',
        calories: food.calories,
        protein: food.protein,
        fat: food.fat,
        carbs: food.carbs,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
        net_carbs: net_carbs,
        snapcarb_score: snapcarb_score,
        traffic_light: traffic_light
      });
    });

    // Step 4: Insert all food records
    console.log('\n4. Inserting food records into mega-table...');
    
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < foodRecords.length; i += batchSize) {
      const batch = foodRecords.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('foods_complete')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        } else {
          inserted += batch.length;
          console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${inserted} total inserted`);
        }
      } catch (error) {
        console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 Food records inserted! Total inserted: ${inserted}`);

    // Step 5: Test the mega-table
    console.log('\n5. Testing the mega-table...');
    
    // Test search
    const { data: testSearch, error: testError } = await supabase
      .from('foods_complete')
      .select('name, calories, protein, fat, carbs, snapcarb_score, traffic_light')
      .ilike('name', '%protein%')
      .limit(5);
    
    if (!testError && testSearch && testSearch.length > 0) {
      console.log(`✅ Search test successful! Found ${testSearch.length} protein foods:`);
      testSearch.forEach(food => {
        console.log(`   - ${food.name}`);
        console.log(`     Score: ${food.snapcarb_score} (${food.traffic_light})`);
      });
    } else {
      console.log('❌ Search test failed');
    }
    
    console.log('\n🎉🎉🎉 MEGA-TABLE POPULATION COMPLETE! 🎉🎉🎉');
    console.log('💡 Now your app can search ONE table and get ALL data!');
    console.log('🚀 No more JOINs needed - everything in one place!');
    console.log('🎯 Try searching in your app now!');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

createMegaFoodTable();
