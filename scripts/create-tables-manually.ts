import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTablesManually() {
  try {
    console.log('🔧 Creating tables manually...\n');

    // Step 1: Create nutrient table
    console.log('1. Creating nutrient table...');
    const { error: nutrientError } = await supabase
      .from('nutrient')
      .select('*')
      .limit(1);
    
    if (nutrientError && nutrientError.message.includes('does not exist')) {
      console.log('✅ Nutrient table does not exist - you need to create it manually');
      console.log('💡 Go to Supabase → SQL Editor and run this:');
      console.log(`
        CREATE TABLE nutrient (
          id BIGINT PRIMARY KEY,
          name TEXT NOT NULL,
          unit_name TEXT,
          nutrient_nbr TEXT
        );
      `);
    } else {
      console.log('✅ Nutrient table exists');
    }

    // Step 2: Create food table
    console.log('\n2. Creating food table...');
    const { error: foodError } = await supabase
      .from('food')
      .select('*')
      .limit(1);
    
    if (foodError && foodError.message.includes('does not exist')) {
      console.log('✅ Food table does not exist - you need to create it manually');
      console.log('💡 Go to Supabase → SQL Editor and run this:');
      console.log(`
        CREATE TABLE food (
          fdc_id BIGINT PRIMARY KEY,
          description TEXT NOT NULL,
          data_type TEXT,
          publication_date DATE
        );
      `);
    } else {
      console.log('✅ Food table exists');
    }

    // Step 3: Create food_nutrient table
    console.log('\n3. Creating food_nutrient table...');
    const { error: foodNutrientError } = await supabase
      .from('food_nutrient')
      .select('*')
      .limit(1);
    
    if (foodNutrientError && foodNutrientError.message.includes('does not exist')) {
      console.log('✅ Food_nutrient table does not exist - you need to create it manually');
      console.log('💡 Go to Supabase → SQL Editor and run this:');
      console.log(`
        CREATE TABLE food_nutrient (
          id BIGINT PRIMARY KEY,
          fdc_id BIGINT REFERENCES food(fdc_id),
          nutrient_id BIGINT REFERENCES nutrient(id),
          amount DECIMAL(10,3)
        );
      `);
    } else {
      console.log('✅ Food_nutrient table exists');
    }

    console.log('\n🎯 MANUAL TABLE CREATION REQUIRED!');
    console.log('💡 Go to Supabase Dashboard → SQL Editor');
    console.log('📝 Copy and paste the CREATE TABLE commands above');
    console.log('🚀 Then come back and run the import script!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createTablesManually();
