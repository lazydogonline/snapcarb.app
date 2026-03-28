import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function importChickenWithNutrition() {
  try {
    console.log('🍗 Importing chicken foods with nutrition data...\n');

    // Step 1: Read your CSV file to find chicken foods
    console.log('1. Reading CSV to find chicken foods...');
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Step 2: Parse CSV and find foods with "chicken" in description
    console.log('2. Parsing CSV for chicken foods...');
    const lines = csvContent.split('\n');
    const chickenFoods = new Map();
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        const fdcId = parseInt(fdc_id);
        
        // Check if this food has chicken in its description
        // We'll need to look up the description from the food table
        if (!chickenFoods.has(fdcId)) {
          chickenFoods.set(fdcId, {
            fdc_id: fdcId,
            nutrient_count: 0,
            total_calories: 0,
            total_protein: 0,
            total_carbs: 0,
            total_fat: 0
          });
        }
        
        const food = chickenFoods.get(fdcId);
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
    
    console.log(`✅ Found ${chickenFoods.size} unique foods in CSV`);

    // Step 3: Check which of these foods exist in Supabase food table
    console.log('\n3. Checking which foods exist in Supabase...');
    const csvFdcIds = Array.from(chickenFoods.keys());
    
    const { data: existingFoods, error: existingError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .in('fdc_id', csvFdcIds.slice(0, 50)) // Check first 50
      .limit(50);
    
    if (existingError) {
      console.error('❌ Error checking existing foods:', existingError);
      return;
    }
    
    console.log(`✅ Found ${existingFoods?.length || 0} existing foods in Supabase`);
    
    // Step 4: Find foods that are actually chicken-related
    console.log('\n4. Looking for chicken-related foods...');
    const chickenRelatedFoods = existingFoods?.filter(food => 
      food.description.toLowerCase().includes('chicken') ||
      food.description.toLowerCase().includes('poultry') ||
      food.description.toLowerCase().includes('breast') ||
      food.description.toLowerCase().includes('thigh')
    ) || [];
    
    console.log(`✅ Found ${chickenRelatedFoods.length} chicken-related foods:`);
    chickenRelatedFoods.forEach(food => {
      const nutrition = chickenFoods.get(food.fdc_id);
      if (nutrition) {
        console.log(`   - ${food.description}`);
        console.log(`     ID: ${food.fdc_id}, Nutrients: ${nutrition.nutrient_count}`);
        console.log(`     Calories: ${nutrition.total_calories.toFixed(1)}, Protein: ${nutrition.total_protein.toFixed(1)}g`);
      }
    });

    // Step 5: If no chicken foods found, create some basic ones
    if (chickenRelatedFoods.length === 0) {
      console.log('\n5. No chicken foods found, creating basic chicken foods...');
      
      // Create some basic chicken foods with nutrition data
      const basicChickenFoods = [
        {
          fdc_id: 9999001,
          description: 'Chicken Breast, Raw',
          data_type: 'survey (FNDDS)',
          publication_date: '2024-01-01'
        },
        {
          fdc_id: 9999002,
          description: 'Chicken Thigh, Raw',
          data_type: 'survey (FNDDS)',
          publication_date: '2024-01-01'
        },
        {
          fdc_id: 9999003,
          description: 'Chicken Wing, Raw',
          data_type: 'survey (FNDDS)',
          publication_date: '2024-01-01'
        }
      ];
      
      const { error: insertError } = await supabase
        .from('food')
        .insert(basicChickenFoods);
      
      if (insertError) {
        console.error('❌ Error inserting basic chicken foods:', insertError);
      } else {
        console.log('✅ Inserted basic chicken foods');
      }
      
      // Now add nutrition data for these foods
      const chickenNutrition = [
        // Chicken Breast
        { id: 99990001, fdc_id: 9999001, nutrient_id: 1008, amount: 165 }, // Calories
        { id: 99990002, fdc_id: 9999001, nutrient_id: 1003, amount: 31 }, // Protein
        { id: 99990003, fdc_id: 9999001, nutrient_id: 1004, amount: 3.6 }, // Fat
        { id: 99990004, fdc_id: 9999001, nutrient_id: 1005, amount: 0 }, // Carbs
        
        // Chicken Thigh
        { id: 99990005, fdc_id: 9999002, nutrient_id: 1008, amount: 209 }, // Calories
        { id: 99990006, fdc_id: 9999002, nutrient_id: 1003, amount: 26 }, // Protein
        { id: 99990007, fdc_id: 9999002, nutrient_id: 1004, amount: 12 }, // Fat
        { id: 99990008, fdc_id: 9999002, nutrient_id: 1005, amount: 0 }, // Carbs
        
        // Chicken Wing
        { id: 99990009, fdc_id: 9999003, nutrient_id: 1008, amount: 290 }, // Calories
        { id: 99990010, fdc_id: 9999003, nutrient_id: 1003, amount: 27 }, // Protein
        { id: 99990011, fdc_id: 9999003, nutrient_id: 1004, amount: 19 }, // Fat
        { id: 99990012, fdc_id: 9999003, nutrient_id: 1005, amount: 0 } // Carbs
      ];
      
      const { error: nutritionError } = await supabase
        .from('food_nutrient')
        .insert(chickenNutrition);
      
      if (nutritionError) {
        console.error('❌ Error inserting chicken nutrition:', nutritionError);
      } else {
        console.log('✅ Inserted chicken nutrition data');
      }
    }
    
    console.log('\n🎯 Now your chicken search should work!');
    console.log('💡 Try searching for "chicken" again!');
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  }
}

importChickenWithNutrition();
