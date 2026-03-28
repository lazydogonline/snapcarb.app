import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStatus() {
  try {
    console.log('🔍 Checking table status...\n');

    // Check nutrient table
    console.log('1. Checking nutrient table...');
    const { data: nutrients, error: nutrientError } = await supabase
      .from('nutrient')
      .select('*')
      .limit(5);
    
    if (nutrientError) {
      console.error('❌ Nutrient table error:', nutrientError.message);
    } else {
      console.log(`✅ Nutrient table: ${nutrients?.length || 0} records`);
      if (nutrients && nutrients.length > 0) {
        console.log('   Sample nutrients:', nutrients.map(n => `${n.name} (${n.unit_name})`));
      }
    }

    // Check food table
    console.log('\n2. Checking food table...');
    const { data: foods, error: foodError } = await supabase
      .from('food')
      .select('*')
      .limit(5);
    
    if (foodError) {
      console.error('❌ Food table error:', foodError.message);
    } else {
      console.log(`✅ Food table: ${foods?.length || 0} records`);
      if (foods && foods.length > 0) {
        console.log('   Sample foods:', foods.map(f => `${f.description} (ID: ${f.fdc_id})`));
      }
    }

    // Check food_nutrient table
    console.log('\n3. Checking food_nutrient table...');
    const { data: foodNutrients, error: foodNutrientError } = await supabase
      .from('food_nutrient')
      .select('*')
      .limit(5);
    
    if (foodNutrientError) {
      console.error('❌ Food_nutrient table error:', foodNutrientError.message);
    } else {
      console.log(`✅ Food_nutrient table: ${foodNutrients?.length || 0} records`);
      if (foodNutrients && foodNutrients.length > 0) {
        console.log('   Sample nutrition:', foodNutrients.map(fn => `Food ${fn.fdc_id}: Nutrient ${fn.nutrient_id} = ${fn.amount}`));
      }
    }

    // Check if we can insert data
    console.log('\n4. Testing insert capability...');
    try {
      const { error: testInsertError } = await supabase
        .from('nutrient')
        .insert({ id: 999999, name: 'TEST', unit_name: 'TEST' });
      
      if (testInsertError) {
        console.log('❌ Cannot insert into nutrient table:', testInsertError.message);
      } else {
        console.log('✅ Can insert into nutrient table');
        
        // Clean up test data
        await supabase
          .from('nutrient')
          .delete()
          .eq('id', 999999);
      }
    } catch (error) {
      console.log('❌ Insert test failed:', error);
    }

    console.log('\n🎯 Table status check complete!');
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkTableStatus();
