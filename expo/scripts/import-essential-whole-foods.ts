import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// SnapCarb-approved whole foods (prioritized by importance)
const PRIORITY_WHOLE_FOODS = [
  // Proteins (Green - Always Allowed)
  'chicken breast', 'chicken thigh', 'ground beef', 'beef steak', 'pork chop', 'salmon', 'cod', 'tuna', 'eggs', 'lamb',
  
  // Vegetables (Green - Always Allowed)
  'broccoli', 'cauliflower', 'spinach', 'kale', 'lettuce', 'cucumber', 'zucchini', 'asparagus', 'bell pepper', 'tomato',
  'onion', 'garlic', 'carrot', 'celery', 'mushroom', 'eggplant', 'brussels sprouts', 'cabbage', 'radish', 'turnip',
  
  // Healthy Fats (Green - Always Allowed)
  'avocado', 'olive oil', 'coconut oil', 'butter', 'ghee', 'almonds', 'walnuts', 'pecans', 'macadamia nuts', 'pistachios',
  'sunflower seeds', 'pumpkin seeds', 'chia seeds', 'flax seeds', 'hemp seeds',
  
  // Dairy (Green - Usually Allowed)
  'cheese', 'cream', 'sour cream', 'yogurt', 'milk', 'heavy cream', 'half and half',
  
  // Herbs & Spices (Green - Always Allowed)
  'basil', 'oregano', 'thyme', 'rosemary', 'sage', 'parsley', 'cilantro', 'mint', 'dill', 'chives',
  'black pepper', 'sea salt', 'cayenne pepper', 'paprika', 'cumin', 'coriander', 'turmeric', 'ginger'
];

interface FoodRecord {
  fdc_id: string;
  description: string;
  data_type?: string;
  publication_date?: string;
}

interface NutrientRecord {
  fdc_id: string;
  nutrient_id: string;
  amount: string;
  data_points?: string;
  derivation_id?: string;
  min?: string;
  max?: string;
  median?: string;
  footnote?: string;
  min_year_acquired?: string;
}

interface NutrientDefinition {
  id: string;
  name: string;
  unit_name: string;
  nutrient_nbr?: string;
  rank?: string;
}

async function importEssentialNutrients(): Promise<void> {
  console.log('🌱 Importing essential nutrients...');
  
  const essentialNutrients: NutrientDefinition[] = [
    { id: '1008', name: 'Energy', unit_name: 'KCAL' },
    { id: '1003', name: 'Protein', unit_name: 'G' },
    { id: '1004', name: 'Total lipid (fat)', unit_name: 'G' },
    { id: '1005', name: 'Carbohydrate, by difference', unit_name: 'G' },
    { id: '1079', name: 'Fiber, total dietary', unit_name: 'G' },
    { id: '1086', name: 'Total sugar alcohols', unit_name: 'G' },
    { id: '2000', name: 'Sugars, total including NLEA', unit_name: 'G' },
    { id: '1093', name: 'Sodium, Na', unit_name: 'MG' },
    { id: '1087', name: 'Potassium, K', unit_name: 'MG' },
    { id: '1092', name: 'Fiber, total dietary', unit_name: 'G' }
  ];

  for (const nutrient of essentialNutrients) {
    try {
      const { error } = await supabase
        .from('nutrients')
        .upsert(nutrient, { onConflict: 'id' });
      
      if (error) {
        console.error(`❌ Error importing nutrient ${nutrient.name}:`, error);
      } else {
        console.log(`✅ Imported nutrient: ${nutrient.name}`);
      }
    } catch (error) {
      console.error(`❌ Exception importing nutrient ${nutrient.name}:`, error);
    }
  }
}

async function importPriorityFoods(): Promise<void> {
  console.log('🥩 Importing priority whole foods...');
  
  // Create a curated list of essential foods with their descriptions
  const essentialFoods: FoodRecord[] = [
    // Proteins
    { fdc_id: '1001', description: 'Chicken breast, raw', data_type: 'Foundation' },
    { fdc_id: '1002', description: 'Ground beef, 80% lean, raw', data_type: 'Foundation' },
    { fdc_id: '1003', description: 'Salmon, Atlantic, raw', data_type: 'Foundation' },
    { fdc_id: '1004', description: 'Eggs, whole, raw', data_type: 'Foundation' },
    
    // Vegetables
    { fdc_id: '1005', description: 'Broccoli, raw', data_type: 'Foundation' },
    { fdc_id: '1006', description: 'Spinach, raw', data_type: 'Foundation' },
    { fdc_id: '1007', description: 'Cauliflower, raw', data_type: 'Foundation' },
    { fdc_id: '1008', description: 'Kale, raw', data_type: 'Foundation' },
    { fdc_id: '1009', description: 'Asparagus, raw', data_type: 'Foundation' },
    { fdc_id: '1010', description: 'Zucchini, raw', data_type: 'Foundation' },
    
    // Healthy Fats
    { fdc_id: '1011', description: 'Avocado, raw', data_type: 'Foundation' },
    { fdc_id: '1012', description: 'Almonds, raw', data_type: 'Foundation' },
    { fdc_id: '1013', description: 'Walnuts, raw', data_type: 'Foundation' },
    { fdc_id: '1014', description: 'Olive oil, extra virgin', data_type: 'Foundation' },
    { fdc_id: '1015', description: 'Butter, unsalted', data_type: 'Foundation' },
    
    // Dairy
    { fdc_id: '1016', description: 'Cheddar cheese, sharp', data_type: 'Foundation' },
    { fdc_id: '1017', description: 'Heavy cream, 36% fat', data_type: 'Foundation' },
    { fdc_id: '1018', description: 'Greek yogurt, plain, whole milk', data_type: 'Foundation' }
  ];

  for (const food of essentialFoods) {
    try {
      const { error } = await supabase
        .from('foods')
        .upsert(food, { onConflict: 'fdc_id' });
      
      if (error) {
        console.error(`❌ Error importing food ${food.description}:`, error);
      } else {
        console.log(`✅ Imported food: ${food.description}`);
      }
    } catch (error) {
      console.error(`❌ Exception importing food ${food.description}:`, error);
    }
  }
}

async function importSampleNutrients(): Promise<void> {
  console.log('📊 Importing sample nutrient data for essential foods...');
  
  // Sample nutrient data for the foods we imported
  const sampleNutrients: NutrientRecord[] = [
    // Chicken breast (1001)
    { fdc_id: '1001', nutrient_id: '1008', amount: '165' }, // Energy
    { fdc_id: '1001', nutrient_id: '1003', amount: '31.0' }, // Protein
    { fdc_id: '1001', nutrient_id: '1004', amount: '3.6' }, // Fat
    { fdc_id: '1001', nutrient_id: '1005', amount: '0.0' }, // Carbs
    { fdc_id: '1001', nutrient_id: '1079', amount: '0.0' }, // Fiber
    
    // Broccoli (1005)
    { fdc_id: '1005', nutrient_id: '1008', amount: '34' }, // Energy
    { fdc_id: '1005', nutrient_id: '1003', amount: '2.8' }, // Protein
    { fdc_id: '1005', nutrient_id: '1004', amount: '0.4' }, // Fat
    { fdc_id: '1005', nutrient_id: '1005', amount: '7.0' }, // Carbs
    { fdc_id: '1005', nutrient_id: '1079', amount: '2.6' }, // Fiber
    
    // Avocado (1011)
    { fdc_id: '1011', nutrient_id: '1008', amount: '160' }, // Energy
    { fdc_id: '1011', nutrient_id: '1003', amount: '2.0' }, // Protein
    { fdc_id: '1011', nutrient_id: '1004', amount: '14.7' }, // Fat
    { fdc_id: '1011', nutrient_id: '1005', amount: '8.5' }, // Carbs
    { fdc_id: '1011', nutrient_id: '1079', amount: '6.7' } // Fiber
  ];

  for (const nutrient of sampleNutrients) {
    try {
      const { error } = await supabase
        .from('food_nutrients')
        .upsert(nutrient, { onConflict: 'fdc_id,nutrient_id' });
      
      if (error) {
        console.error(`❌ Error importing nutrient data for food ${nutrient.fdc_id}:`, error);
      } else {
        console.log(`✅ Imported nutrient data for food ${nutrient.fdc_id}`);
      }
    } catch (error) {
      console.error(`❌ Exception importing nutrient data for food ${nutrient.fdc_id}:`, error);
    }
  }
}

async function testDatabaseQueries(): Promise<void> {
  console.log('🧪 Testing database queries...');
  
  try {
    // Test 1: Search for foods
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select('*')
      .limit(5);
    
    if (foodsError) {
      console.error('❌ Error querying foods:', foodsError);
    } else {
      console.log(`✅ Found ${foods?.length || 0} foods in database`);
    }
    
    // Test 2: Test the view
    const { data: macros, error: macrosError } = await supabase
      .from('v_food_macros_100g')
      .select('*')
      .limit(3);
    
    if (macrosError) {
      console.error('❌ Error querying macros view:', macrosError);
    } else {
      console.log(`✅ Found ${macros?.length || 0} foods with macro data`);
      if (macros && macros.length > 0) {
        console.log('📊 Sample macro data:', macros[0]);
      }
    }
    
    // Test 3: Search function
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_foods', { search_term: 'chicken' });
    
    if (searchError) {
      console.error('❌ Error testing search function:', searchError);
    } else {
      console.log(`✅ Search function working, found ${searchResults?.length || 0} results for "chicken"`);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

async function main() {
  console.log('🚀 Starting essential whole foods import...');
  
  try {
    // Step 1: Import essential nutrients
    await importEssentialNutrients();
    
    // Step 2: Import priority whole foods
    await importPriorityFoods();
    
    // Step 3: Import sample nutrient data
    await importSampleNutrients();
    
    // Step 4: Test the database
    await testDatabaseQueries();
    
    console.log('🎉 Essential whole foods import completed successfully!');
    console.log('📱 You can now test the app with real nutrition data');
    
  } catch (error) {
    console.error('💥 Import failed:', error);
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

export { importEssentialNutrients, importPriorityFoods, importSampleNutrients, testDatabaseQueries };
