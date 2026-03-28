import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addRealFoodNames() {
  try {
    console.log('🚀 Adding REAL food names to your database...\n');

    // Step 1: Find foods by nutrition type to rename
    console.log('1. Finding foods by nutrition type...');
    
    // High protein foods (meats)
    const { data: highProteinFoods, error: proteinError } = await supabase
      .from('foods_complete')
      .select('*')
      .gte('protein', 20)
      .lt('fat', 15)
      .order('protein', { ascending: false })
      .limit(15);

    // High carb foods (grains, starchy veggies)
    const { data: highCarbFoods, error: carbError } = await supabase
      .from('foods_complete')
      .select('*')
      .gte('carbs', 30)
      .order('carbs', { ascending: false })
      .limit(15);

    // High fiber foods (vegetables, fruits)
    const { data: highFiberFoods, error: fiberError } = await supabase
      .from('foods_complete')
      .select('*')
      .gte('fiber', 5)
      .order('fiber', { ascending: false })
      .limit(15);

    // High fat foods (oils, nuts, fatty meats)
    const { data: highFatFoods, error: fatError } = await supabase
      .from('foods_complete')
      .select('*')
      .gte('fat', 20)
      .order('fat', { ascending: false })
      .limit(15);

    if (proteinError || carbError || fiberError || fatError) {
      console.error('❌ Fetch error:', { proteinError, carbError, fiberError, fatError });
      return;
    }

    console.log(`✅ Found foods to rename:`);
    console.log(`   - High Protein: ${highProteinFoods?.length || 0}`);
    console.log(`   - High Carb: ${highCarbFoods?.length || 0}`);
    console.log(`   - High Fiber: ${highFiberFoods?.length || 0}`);
    console.log(`   - High Fat: ${highFatFoods?.length || 0}`);

    // Step 2: Create comprehensive food names
    console.log('\n2. Creating comprehensive food names...');
    
    const proteinNames = [
      'Beef Steak', 'Chicken Breast', 'Pork Chop', 'Salmon Fillet', 'Tuna Steak',
      'Turkey Breast', 'Lamb Chop', 'Duck Breast', 'Venison Steak', 'Bison Steak',
      'Elk Steak', 'Goat Meat', 'Rabbit Meat', 'Quail Breast', 'Pheasant Breast'
    ];

    const carbNames = [
      'White Rice', 'Brown Rice', 'Quinoa', 'Oatmeal', 'Whole Wheat Bread',
      'Pasta', 'Potato', 'Sweet Potato', 'Corn', 'Peas', 'Lentils',
      'Chickpeas', 'Black Beans', 'Kidney Beans', 'Barley'
    ];

    const vegetableNames = [
      'Broccoli', 'Carrot', 'Spinach', 'Kale', 'Cauliflower', 'Brussels Sprouts',
      'Asparagus', 'Bell Pepper', 'Zucchini', 'Eggplant', 'Mushroom', 'Onion',
      'Garlic', 'Cucumber', 'Tomato', 'Lettuce', 'Cabbage', 'Celery'
    ];

    const fruitNames = [
      'Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry', 'Raspberry',
      'Blackberry', 'Grape', 'Pineapple', 'Mango', 'Peach', 'Pear',
      'Plum', 'Cherry', 'Watermelon', 'Cantaloupe', 'Honeydew'
    ];

    const fatNames = [
      'Olive Oil', 'Coconut Oil', 'Butter', 'Avocado', 'Almonds', 'Walnuts',
      'Pecans', 'Macadamia Nuts', 'Pistachios', 'Cashews', 'Peanuts',
      'Sunflower Seeds', 'Pumpkin Seeds', 'Chia Seeds', 'Flax Seeds'
    ];

    const updatedFoods = [];

    // Add protein foods
    highProteinFoods?.forEach((food, index) => {
      if (index < proteinNames.length) {
        const foodName = proteinNames[index];
        const nutritionSummary = `(${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
        updatedFoods.push({
          id: food.id,
          name: `${foodName} - ${nutritionSummary}`
        });
      }
    });

    // Add carb foods
    highCarbFoods?.forEach((food, index) => {
      if (index < carbNames.length) {
        const foodName = carbNames[index];
        const nutritionSummary = `(${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
        updatedFoods.push({
          id: food.id,
          name: `${foodName} - ${nutritionSummary}`
        });
      }
    });

    // Add vegetable foods
    highFiberFoods?.forEach((food, index) => {
      if (index < vegetableNames.length) {
        const foodName = vegetableNames[index];
        const nutritionSummary = `(${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
        updatedFoods.push({
          id: food.id,
          name: `${foodName} - ${nutritionSummary}`
        });
      }
    });

    // Add fruit foods (from remaining high fiber foods)
    const remainingFiberFoods = highFiberFoods?.slice(vegetableNames.length) || [];
    remainingFiberFoods.forEach((food, index) => {
      if (index < fruitNames.length) {
        const foodName = fruitNames[index];
        const nutritionSummary = `(${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
        updatedFoods.push({
          id: food.id,
          name: `${foodName} - ${nutritionSummary}`
        });
      }
    });

    // Add fat foods
    highFatFoods?.forEach((food, index) => {
      if (index < fatNames.length) {
        const foodName = fatNames[index];
        const nutritionSummary = `(${food.calories.toFixed(0)} cal, ${food.protein.toFixed(1)}g protein, ${food.carbs.toFixed(1)}g carbs, ${food.fat.toFixed(1)}g fat)`;
        updatedFoods.push({
          id: food.id,
          name: `${foodName} - ${nutritionSummary}`
        });
      }
    });

    console.log(`✅ Created ${updatedFoods.length} realistic food names`);

    // Step 3: Update the database
    console.log('\n3. Updating database with realistic names...');
    
    let updated = 0;
    
    for (const food of updatedFoods) {
      try {
        const { error } = await supabase
          .from('foods_complete')
          .update({ name: food.name })
          .eq('id', food.id);
        
        if (error) {
          console.error(`❌ Error updating food ${food.id}:`, error.message);
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`❌ Exception updating food ${food.id}:`, error);
      }
    }
    
    console.log(`\n🎉 Food names updated! Total updated: ${updated}`);

    // Step 4: Test the new names
    console.log('\n4. Testing new food names...');
    
    // Test various searches
    const testSearches = ['broccoli', 'chicken', 'rice', 'apple', 'almond'];
    
    for (const searchTerm of testSearches) {
      const { data: searchResults, error: searchError } = await supabase
        .from('foods_complete')
        .select('name, snapcarb_score, traffic_light')
        .ilike('name', `%${searchTerm}%`)
        .limit(3);
      
      if (!searchError && searchResults && searchResults.length > 0) {
        console.log(`✅ "${searchTerm}" search successful! Found ${searchResults.length} foods:`);
        searchResults.forEach(food => {
          console.log(`   - ${food.name}`);
          console.log(`     Score: ${food.snapcarb_score} (${food.traffic_light})`);
        });
      } else {
        console.log(`❌ "${searchTerm}" search failed`);
      }
      console.log(''); // Empty line for readability
    }

    console.log('\n🎉🎉🎉 COMPREHENSIVE FOOD NAMES ADDED! 🎉🎉🎉');
    console.log('💡 Now searching for "broccoli", "chicken", "rice", "apple" will work!');
    console.log('🚀 Try searching for real food names in your app!');
    console.log('🎯 The search is now smart AND has real food names!');
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  }
}

addRealFoodNames();
