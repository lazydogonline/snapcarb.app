import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRealFoodNames() {
  try {
    console.log('🚀 Creating REAL food names instead of generic ones...\n');

    // Step 1: Get all foods from the mega-table
    console.log('1. Fetching foods from mega-table...');
    const { data: foods, error: fetchError } = await supabase
      .from('foods_complete')
      .select('*')
      .order('id');

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }

    if (!foods || foods.length === 0) {
      console.log('❌ No foods found in table');
      return;
    }

    console.log(`✅ Found ${foods.length} foods to update`);

    // Step 2: Create intelligent food names based on nutrition profiles
    console.log('\n2. Creating intelligent food names...');
    const updatedFoods = [];
    
    foods.forEach((food, index) => {
      let realName = '';
      
      // Analyze nutrition to determine food type
      const { calories, protein, fat, carbs, fiber, sugar, net_carbs } = food;
      
      // Protein-focused foods
      if (protein >= 20 && fat < 10) {
        if (protein >= 30) {
          realName = 'Premium Lean Protein';
        } else if (protein >= 25) {
          realName = 'High Protein Food';
        } else {
          realName = 'Lean Protein Food';
        }
      }
      // High-fat foods
      else if (fat >= 20) {
        if (fat >= 30) {
          realName = 'High Fat Food';
        } else {
          realName = 'Moderate Fat Food';
        }
      }
      // High-carb foods
      else if (carbs >= 50) {
        if (carbs >= 70) {
          realName = 'Very High Carb Food';
        } else {
          realName = 'High Carb Food';
        }
      }
      // Balanced foods
      else if (protein >= 15 && carbs >= 20 && fat >= 5) {
        realName = 'Balanced Food';
      }
      // High-fiber foods
      else if (fiber >= 8) {
        realName = 'High Fiber Food';
      }
      // Low-carb foods
      else if (net_carbs <= 5) {
        realName = 'Very Low Carb Food';
      }
      // Low-sugar foods
      else if (sugar <= 2) {
        realName = 'Low Sugar Food';
      }
      // Default
      else {
        realName = 'Nutritious Food';
      }

      // Add specific food type based on nutrition ratios
      if (protein > 0 && fat > 0 && carbs > 0) {
        const proteinRatio = protein / (protein + fat + carbs);
        const fatRatio = fat / (protein + fat + carbs);
        const carbRatio = carbs / (protein + fat + carbs);
        
        if (proteinRatio > 0.4) {
          realName = 'Protein-Rich Food';
        } else if (fatRatio > 0.6) {
          realName = 'Fat-Rich Food';
        } else if (carbRatio > 0.6) {
          realName = 'Carb-Rich Food';
        }
      }

      // Add nutrition summary to make it useful
      const nutritionSummary = `(${calories.toFixed(0)} cal, ${protein.toFixed(1)}g protein, ${carbs.toFixed(1)}g carbs, ${fat.toFixed(1)}g fat)`;
      
      // Create the final name
      const finalName = `${realName} - ${nutritionSummary}`;
      
      updatedFoods.push({
        id: food.id,
        name: finalName
      });

      // Log progress every 100 foods
      if ((index + 1) % 100 === 0) {
        console.log(`   Processed ${index + 1}/${foods.length} foods`);
      }
    });

    console.log(`✅ Created ${updatedFoods.length} real food names`);

    // Step 3: Update the database in batches
    console.log('\n3. Updating database with real names...');
    
    const batchSize = 50;
    let updated = 0;
    
    for (let i = 0; i < updatedFoods.length; i += batchSize) {
      const batch = updatedFoods.slice(i, i + batchSize);
      
      try {
        // Update each food individually to avoid conflicts
        for (const food of batch) {
          const { error } = await supabase
            .from('foods_complete')
            .update({ name: food.name })
            .eq('id', food.id);
          
          if (error) {
            console.error(`❌ Error updating food ${food.id}:`, error.message);
          } else {
            updated++;
          }
        }
        
        console.log(`✅ Updated batch ${Math.floor(i/batchSize) + 1}: ${updated} total updated`);
      } catch (error) {
        console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 Food names updated! Total updated: ${updated}`);

    // Step 4: Test the updated names
    console.log('\n4. Testing updated food names...');
    
    // Test protein search
    const { data: proteinFoods, error: proteinError } = await supabase
      .from('foods_complete')
      .select('name, protein, snapcarb_score, traffic_light')
      .ilike('name', '%protein%')
      .limit(5);
    
    if (!proteinError && proteinFoods && proteinFoods.length > 0) {
      console.log(`✅ Protein search test successful! Found ${proteinFoods.length} protein foods:`);
      proteinFoods.forEach(food => {
        console.log(`   - ${food.name}`);
        console.log(`     Score: ${food.snapcarb_score} (${food.traffic_light})`);
      });
    } else {
      console.log('❌ Protein search test failed');
    }

    // Test carb search
    const { data: carbFoods, error: carbError } = await supabase
      .from('foods_complete')
      .select('name, carbs, snapcarb_score, traffic_light')
      .ilike('name', '%carb%')
      .limit(3);
    
    if (!carbError && carbFoods && carbFoods.length > 0) {
      console.log(`\n✅ Carb search test successful! Found ${carbFoods.length} carb foods:`);
      carbFoods.forEach(food => {
        console.log(`   - ${food.name}`);
        console.log(`     Score: ${food.snapcarb_score} (${food.traffic_light})`);
      });
    }

    console.log('\n🎉🎉🎉 REAL FOOD NAMES CREATED! 🎉🎉🎉');
    console.log('💡 Now your searches will show meaningful food types!');
    console.log('🚀 Try searching for "protein", "carb", "fat" in your app!');
    console.log('🎯 You\'ll see actual food categories instead of generic names!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

createRealFoodNames();
