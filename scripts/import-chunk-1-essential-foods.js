const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// CHUNK 1: Essential Whole Foods (Priority 1 - Green, Allowed Foods)
const ESSENTIAL_FOODS = [
  {
    fdc_id: 1001,
    description: 'Chicken breast, raw',
    data_type: 'Foundation',
    category: 'Protein'
  },
  {
    fdc_id: 1002,
    description: 'Beef, ground, 80% lean meat / 20% fat, raw',
    data_type: 'Foundation',
    category: 'Protein'
  },
  {
    fdc_id: 1003,
    description: 'Egg, whole, raw, fresh',
    data_type: 'Foundation',
    category: 'Protein'
  },
  {
    fdc_id: 1004,
    description: 'Salmon, Atlantic, wild, raw',
    data_type: 'Foundation',
    category: 'Protein'
  },
  {
    fdc_id: 1005,
    description: 'Pork, fresh, loin, tenderloin, separable lean only, raw',
    data_type: 'Foundation',
    category: 'Protein'
  }
];

// Essential nutrients for these foods
const ESSENTIAL_NUTRIENTS = [
  {
    fdc_id: 1001, // Chicken breast
    nutrients: [
      { nutrient_id: 1008, amount: 165 }, // Energy (kcal)
      { nutrient_id: 1003, amount: 31.0 }, // Protein (g)
      { nutrient_id: 1004, amount: 3.6 }, // Total lipid (fat) (g)
      { nutrient_id: 1005, amount: 0.0 }, // Carbohydrate (g)
      { nutrient_id: 1079, amount: 0.0 }, // Fiber (g)
      { nutrient_id: 2000, amount: 0.0 }, // Sugars (g)
      { nutrient_id: 1093, amount: 74 } // Sodium (mg)
    ]
  },
  {
    fdc_id: 1002, // Ground beef
    nutrients: [
      { nutrient_id: 1008, amount: 254 }, // Energy (kcal)
      { nutrient_id: 1003, amount: 17.2 }, // Protein (g)
      { nutrient_id: 1004, amount: 20.0 }, // Total lipid (fat) (g)
      { nutrient_id: 1005, amount: 0.0 }, // Carbohydrate (g)
      { nutrient_id: 1079, amount: 0.0 }, // Fiber (g)
      { nutrient_id: 2000, amount: 0.0 }, // Sugars (g)
      { nutrient_id: 1093, amount: 66 } // Sodium (mg)
    ]
  },
  {
    fdc_id: 1003, // Egg
    nutrients: [
      { nutrient_id: 1008, amount: 143 }, // Energy (kcal)
      { nutrient_id: 1003, amount: 12.6 }, // Protein (g)
      { nutrient_id: 1004, amount: 9.51 }, // Total lipid (fat) (g)
      { nutrient_id: 1005, amount: 0.72 }, // Carbohydrate (g)
      { nutrient_id: 1079, amount: 0.0 }, // Fiber (g)
      { nutrient_id: 2000, amount: 0.37 }, // Sugars (g)
      { nutrient_id: 1093, amount: 142 } // Sodium (mg)
    ]
  },
  {
    fdc_id: 1004, // Salmon
    nutrients: [
      { nutrient_id: 1008, amount: 208 }, // Energy (kcal)
      { nutrient_id: 1003, amount: 25.4 }, // Protein (g)
      { nutrient_id: 1004, amount: 12.4 }, // Total lipid (fat) (g)
      { nutrient_id: 1005, amount: 0.0 }, // Carbohydrate (g)
      { nutrient_id: 1079, amount: 0.0 }, // Fiber (g)
      { nutrient_id: 2000, amount: 0.0 }, // Sugars (g)
      { nutrient_id: 1093, amount: 59 } // Sodium (mg)
    ]
  },
  {
    fdc_id: 1005, // Pork tenderloin
    nutrients: [
      { nutrient_id: 1008, amount: 143 }, // Energy (kcal)
      { nutrient_id: 1003, amount: 21.4 }, // Protein (g)
      { nutrient_id: 1004, amount: 6.2 }, // Total lipid (fat) (g)
      { nutrient_id: 1005, amount: 0.0 }, // Carbohydrate (g)
      { nutrient_id: 1079, amount: 0.0 }, // Fiber (g)
      { nutrient_id: 2000, amount: 0.0 }, // Sugars (g)
      { nutrient_id: 1093, amount: 59 } // Sodium (mg)
    ]
  }
];

// Helper function to clean null values
function cleanValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0.0; // Default to 0.0 for missing values
  }
  if (typeof value === 'string') {
    // Handle string representations of numbers
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0.0 : parsed;
  }
  return value;
}

// Helper function to validate nutrient data
function validateNutrient(nutrient, recordId) {
  return {
    id: recordId, // Unique ID for each record
    fdc_id: nutrient.fdc_id,
    nutrient_id: nutrient.nutrient_id,
    amount: cleanValue(nutrient.amount)
    // Note: id field must be provided (not auto-generated)
    // Only include optional fields if they have valid values
    // ...(nutrient.data_points && { data_points: nutrient.data_points }),
    // ...(nutrient.derivation_id && { derivation_id: nutrient.derivation_id }),
    // ...(nutrient.min && { min: cleanValue(nutrient.min) }),
    // ...(nutrient.max && { max: cleanValue(nutrient.max) }),
    // ...(nutrient.median && { median: cleanValue(nutrient.median) }),
    // ...(nutrient.footnote && { footnote: nutrient.footnote }),
    // ...(nutrient.min_year_acquired && { min_year_acquired: nutrient.min_year_acquired })
  };
}

async function importChunk1() {
  try {
    console.log('🚀 Starting Chunk 1 Import: Essential Whole Foods');
    console.log(`📊 Importing ${ESSENTIAL_FOODS.length} foods with nutrition data`);
    
    // Step 1: Import food descriptions
    console.log('\n🔧 Step 1: Importing food descriptions...');
    for (const food of ESSENTIAL_FOODS) {
      try {
        const { data, error } = await supabase
          .from('food')
          .upsert({
            fdc_id: food.fdc_id,
            description: food.description,
            data_type: food.data_type
          }, { onConflict: 'fdc_id' });
        
        if (error) {
          console.log(`⚠️  Food ${food.fdc_id} (${food.description}): ${error.message}`);
        } else {
          console.log(`✅ Food ${food.fdc_id}: ${food.description}`);
        }
      } catch (e) {
        console.log(`❌ Food ${food.fdc_id} failed: ${e.message}`);
      }
    }
    
    // Step 2: Import nutrition data
    console.log('\n🔧 Step 2: Importing nutrition data...');
    let successCount = 0;
    let errorCount = 0;
    
    let recordId = 100; // Start with ID 100 to avoid conflicts
    for (const foodNutrients of ESSENTIAL_NUTRIENTS) {
      for (const nutrient of foodNutrients.nutrients) {
        try {
          // Clean and validate the nutrient data
          const cleanNutrient = validateNutrient({
            fdc_id: foodNutrients.fdc_id,
            nutrient_id: nutrient.nutrient_id,
            amount: nutrient.amount
          }, recordId);
          
          recordId++; // Increment for next record
          
          console.log(`📊 Importing: Food ${cleanNutrient.fdc_id}, Nutrient ${cleanNutrient.nutrient_id}, Amount: ${cleanNutrient.amount}`);
          
          const { data, error } = await supabase
            .from('food_nutrient')
            .insert(cleanNutrient);
          
          if (error) {
            console.log(`⚠️  Nutrient ${nutrient.nutrient_id} for food ${foodNutrients.fdc_id}: ${error.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (e) {
          console.log(`❌ Nutrient ${nutrient.nutrient_id} for food ${foodNutrients.fdc_id} failed: ${e.message}`);
          errorCount++;
        }
      }
    }
    
    // Step 3: Test the data
    console.log('\n🧪 Step 3: Testing imported data...');
    
    // Test food search
    const { data: searchResults, error: searchError } = await supabase
      .from('food')
      .select('fdc_id, description')
      .in('fdc_id', [1001, 1002, 1003, 1004, 1005]);
    
    if (searchError) {
      console.log(`❌ Search test failed: ${searchError.message}`);
    } else {
      console.log(`✅ Search test successful: Found ${searchResults.length} foods`);
      searchResults.forEach(food => {
        console.log(`   - ${food.fdc_id}: ${food.description}`);
      });
    }
    
    // Test nutrition data
    const { data: nutritionResults, error: nutritionError } = await supabase
      .from('food_nutrient')
      .select('fdc_id, nutrient_id, amount')
      .in('fdc_id', [1001, 1002, 1003, 1004, 1005])
      .limit(10);
    
    if (nutritionError) {
      console.log(`❌ Nutrition test failed: ${nutritionError.message}`);
    } else {
      console.log(`✅ Nutrition test successful: Found ${nutritionResults.length} nutrient records`);
    }
    
    // Summary
    console.log('\n📊 CHUNK 1 IMPORT SUMMARY:');
    console.log(`✅ Foods imported: ${ESSENTIAL_FOODS.length}`);
    console.log(`✅ Nutrition records: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`🎯 Success rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Chunk 1 import completed successfully!');
      console.log('💡 Ready to proceed with Chunk 2 (Vegetables)');
    } else {
      console.log('\n⚠️  Chunk 1 import completed with some errors');
      console.log('💡 Review errors before proceeding to next chunk');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

// Run the import
importChunk1();
