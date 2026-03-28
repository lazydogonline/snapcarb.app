const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// USDA API configuration
const USDA_API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const API_BASE = 'https://api.nal.usda.gov/fdc/v1';

async function importFoundationFoods() {
  try {
    console.log('🚀 Starting Foundation Foods import...');
    
    // First, let's check what's in the existing food table
    const { data: existing, error: checkError } = await supabase
      .from('food')
      .select('data_type', { count: 'exact' })
      .eq('data_type', 'Foundation');
    
    if (checkError) {
      console.log('❌ Error checking existing food table:', checkError);
    } else {
      console.log(`📊 Found ${existing?.length || 0} existing Foundation foods`);
    }
    
    // Get a small batch of foundation foods to test
    console.log('🔍 Fetching sample foundation foods...');
    
    const response = await fetch(
      `${API_BASE}/foods/search?api_key=${USDA_API_KEY}&dataType=Foundation&pageSize=10&pageNumber=1`,
      { method: 'GET' }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const foods = data.foods || [];
    
    console.log(`✅ Found ${foods.length} foundation foods in sample`);
    
    if (foods.length === 0) {
      console.log('⚠️ No foundation foods found. Check your USDA API key.');
      return;
    }
    
    // Process and insert the foods
    const foodsToInsert = foods.map(food => {
      // Extract nutrition data
      const nutrients = food.foodNutrients || [];
      
      const extractNutrient = (name, unit) => {
        const nutrient = nutrients.find(n => 
          n.nutrient && 
          n.nutrient.name && 
          n.nutrient.name.toLowerCase().includes(name.toLowerCase()) && 
          n.nutrient.unitName === unit
        );
        return nutrient ? Number(nutrient.amount) : 0;
      };
      
      const calories = extractNutrient('Energy', 'KCAL');
      const protein = extractNutrient('Protein', 'G');
      const fat = extractNutrient('Total lipid (fat)', 'G');
      const carbs = extractNutrient('Carbohydrate, by difference', 'G');
      const fiber = extractNutrient('Fiber, total dietary', 'G');
      const sugar = extractNutrient('Sugars, total including NLEA', 'G');
      const sodium = extractNutrient('Sodium, Na', 'MG');
      
      // Calculate net carbs
      const netCarbs = Math.max(0, carbs - fiber);
      
      // Calculate SnapCarb score
      let snapcarbScore = 50; // Base score
      if (netCarbs <= 5) snapcarbScore += 30;
      else if (netCarbs <= 10) snapcarbScore += 20;
      else if (netCarbs <= 15) snapcarbScore += 10;
      else if (netCarbs <= 25) snapcarbScore -= 10;
      else snapcarbScore -= 30;
      
      if (protein >= 20) snapcarbScore += 20;
      else if (protein >= 15) snapcarbScore += 15;
      else if (protein >= 10) snapcarbScore += 10;
      else if (protein >= 5) snapcarbScore += 5;
      else snapcarbScore -= 10;
      
      if (fiber >= 5) snapcarbScore += 15;
      else if (fiber >= 3) snapcarbScore += 10;
      else if (fiber >= 1) snapcarbScore += 5;
      
      if (sugar >= 10) snapcarbScore -= 20;
      else if (sugar >= 5) snapcarbScore -= 10;
      
      snapcarbScore = Math.max(0, Math.min(100, snapcarbScore));
      
      // Determine traffic light
      let trafficLight = 'red';
      if (snapcarbScore >= 80) trafficLight = 'green';
      else if (snapcarbScore >= 60) trafficLight = 'yellow';
      
      return {
        fdc_id: food.fdcId,
        name: food.description,
        data_type: 'Foundation',
        calories: calories,
        protein: protein,
        fat: fat,
        carbs: carbs,
        fiber: fiber,
        sugar: sugar,
        sodium: sodium,
        net_carbs: netCarbs,
        snapcarb_score: snapcarbScore,
        traffic_light: trafficLight
      };
    });
    
    console.log('💾 Inserting foundation foods into Supabase...');
    
    // Insert into Supabase
    const { data: inserted, error: insertError } = await supabase
      .from('food')
      .upsert(foodsToInsert, { onConflict: 'fdc_id' });
    
    if (insertError) {
      console.error('❌ Error inserting foundation foods:', insertError);
      return;
    }
    
    console.log(`✅ Successfully imported ${foodsToInsert.length} foundation foods!`);
    
    // Show some examples
    console.log('\n📋 Sample imported foods:');
    foodsToInsert.slice(0, 3).forEach(food => {
      console.log(`  • ${food.name}`);
      console.log(`    Calories: ${food.calories}, Protein: ${food.protein}g, Net Carbs: ${food.net_carbs}g`);
      console.log(`    SnapCarb Score: ${food.snapcarb_score}, Traffic Light: ${food.traffic_light}`);
      console.log('');
    });
    
    console.log('🎉 Foundation foods import completed successfully!');
    console.log('💡 Your FoodSearchService will now find raw ingredients with accurate nutrition data');
    
  } catch (error) {
    console.error('❌ Error importing foundation foods:', error);
  }
}

// Run the import
importFoundationFoods();
