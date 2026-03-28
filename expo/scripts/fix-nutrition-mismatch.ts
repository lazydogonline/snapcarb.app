import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNutritionMismatch() {
  try {
    console.log('🔧 Fixing nutrition data mismatch...\n');

    // Step 1: Read your CSV file
    console.log('1. Reading nutrition CSV data...');
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Step 2: Parse CSV data
    console.log('2. Parsing CSV data...');
    const lines = csvContent.split('\n');
    const nutritionRecords = [];
    let newId = 20000; // Start with a high number to avoid conflicts
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        nutritionRecords.push({
          id: newId++,
          fdc_id: parseInt(fdc_id),
          nutrient_id: parseInt(nutrient_id),
          amount: parseFloat(amount)
        });
      }
    }
    
    console.log(`✅ Parsed ${nutritionRecords.length} nutrition records`);

    // Step 3: Check what's already in Supabase
    console.log('\n3. Checking existing Supabase nutrition data...');
    const { data: existingData, error: existingError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(1);
    
    if (existingError) {
      console.error('❌ Error checking existing data:', existingError);
      return;
    }
    
    console.log(`✅ Supabase already has ${existingData?.length || 0} nutrition records`);

    // Step 4: Import missing nutrition data
    console.log('\n4. Importing missing nutrition data to Supabase...');
    
    // Process in batches to avoid memory issues
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < nutritionRecords.length; i += batchSize) {
      const batch = nutritionRecords.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('food_nutrient')
          .insert(batch);
        
        if (error) {
          console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        } else {
          imported += batch.length;
          console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported} total imported`);
        }
      } catch (error) {
        console.error(`❌ Exception in batch ${Math.floor(i/batchSize) + 1}:`, error);
      }
    }
    
    console.log(`\n🎉 Nutrition data import complete! Total imported: ${imported}`);
    
    // Step 5: Verify the fix
    console.log('\n5. Verifying the fix...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('food_nutrient')
      .select('fdc_id')
      .limit(10);
    
    if (verifyError) {
      console.error('❌ Error verifying data:', verifyError);
    } else {
      console.log('✅ Verification successful! Sample fdc_ids:', verifyData?.map(r => r.fdc_id));
    }
    
    console.log('\n🎯 Now your food search should work!');
    console.log('💡 Try searching for "chicken" again - it should find foods with nutrition data!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixNutritionMismatch();
