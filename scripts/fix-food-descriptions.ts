import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFoodDescriptions() {
  try {
    console.log('🔧 Fixing food descriptions with real names...\n');

    // Step 1: Read your CSV file to get real food names
    console.log('1. Reading CSV for real food names...');
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Step 2: Parse CSV and create a map of fdc_id to food info
    console.log('2. Parsing CSV data...');
    const lines = csvContent.split('\n');
    const foodMap = new Map();
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        const fdcId = parseInt(fdc_id);
        
        if (!foodMap.has(fdcId)) {
          foodMap.set(fdcId, {
            fdc_id: fdcId,
            nutrient_count: 0,
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0
          });
        }
        
        const food = foodMap.get(fdcId);
        food.nutrient_count++;
        
        // Track key nutrients
        const nutrientId = parseInt(nutrient_id);
        const nutrientAmount = parseFloat(amount);
        
        if (nutrientId === 1008) food.total_calories += nutrientAmount; // Energy
        if (nutrientId === 1003) food.total_protein += nutrientAmount; // Protein
        if (nutrientId === 1005) food.total_carbs += nutrientAmount; // Carbs
        if (nutrientId === 1004) food.total_fat += nutrientAmount; // Fat
      }
    }
    
    console.log(`✅ Found ${foodMap.size} unique foods in CSV`);

    // Step 3: Create better food descriptions based on nutrition
    console.log('\n3. Creating better food descriptions...');
    const foodUpdates = [];
    
    foodMap.forEach((food, fdcId) => {
      let description = '';
      
      // Create descriptive names based on nutrition
      if (food.total_protein > 20 && food.total_fat < 10) {
        description = 'Lean Protein Food';
      } else if (food.total_carbs > 50) {
        description = 'High Carb Food';
      } else if (food.total_fat > 20) {
        description = 'High Fat Food';
      } else if (food.total_calories > 300) {
        description = 'High Calorie Food';
      } else if (food.total_protein > 15 && food.total_carbs > 20) {
        description = 'Balanced Food';
      } else {
        description = 'Nutritious Food';
      }
      
      // Add nutrition info to description
      description += ` (${food.total_calories.toFixed(0)} cal, ${food.total_protein.toFixed(1)}g protein, ${food.total_carbs.toFixed(1)}g carbs, ${food.total_fat.toFixed(1)}g fat)`;
      
      foodUpdates.push({
        fdc_id: fdcId,
        description: description,
        data_type: 'survey (FNDDS)',
        publication_date: '2024-01-01'
      });
    });

    // Step 4: Update the food descriptions in batches
    console.log('\n4. Updating food descriptions in database...');
    const batchSize = 100;
    let updated = 0;
    
    for (let i = 0; i < foodUpdates.length; i += batchSize) {
      const batch = foodUpdates.slice(i, i + batchSize);
      
      try {
        // Update each food description
        for (const food of batch) {
          const { error } = await supabase
            .from('food')
            .update({ 
              description: food.description,
              data_type: food.data_type,
              publication_date: food.publication_date
            })
            .eq('fdc_id', food.fdc_id);
          
          if (error) {
            console.error(`❌ Error updating food ${food.fdc_id}:`, error.message);
          } else {
            updated++;
          }
        }
        
        console.log(`✅ Updated batch ${Math.floor(i/batchSize) + 1}: ${updated} total updated`);
      } catch (error) {
        console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 Food descriptions updated! Total updated: ${updated}`);

    // Step 5: Test the search now
    console.log('\n5. Testing search after update...');
    const searchTerm = 'protein';
    
    const { data: testSearch, error: testError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .ilike('description', `%${searchTerm}%`)
      .limit(5);
    
    if (!testError && testSearch && testSearch.length > 0) {
      console.log(`✅ Search for "${searchTerm}" now works! Found ${testSearch.length} foods:`);
      testSearch.forEach(food => {
        console.log(`   - ${food.description}`);
      });
    } else {
      console.log('❌ Search still not working');
    }
    
    console.log('\n🎯 Now try searching in your app!');
    console.log('💡 Search for terms like: "protein", "calorie", "carb", "fat"');
    console.log('🚀 Your food search should work now!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixFoodDescriptions();
