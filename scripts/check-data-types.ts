import { supabase } from '../services/supabase-service';

async function checkDataTypes() {
  try {
    console.log('🔍 Checking what data_type values exist in the food table...');
    
    // Get all unique data_type values
    const { data: dataTypes, error } = await supabase
      .from('food')
      .select('data_type')
      .not('data_type', 'is', null);
    
    if (error) {
      console.error('Error getting data types:', error);
      return;
    }
    
    // Get unique values and count them
    const uniqueTypes = [...new Set(dataTypes.map(item => item.data_type))];
    console.log(`\n📊 Found ${uniqueTypes.length} unique data_type values:`);
    
    for (const type of uniqueTypes) {
      const count = dataTypes.filter(item => item.data_type === type).length;
      console.log(`  - "${type}": ${count} foods`);
    }
    
    // Check for foods that look branded
    console.log('\n🔍 Checking for foods that look branded...');
    const { data: brandedLooking, error: brandedError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .or('description.ilike.%branded%,description.ilike.%steakhouse%,description.ilike.%campbell%')
      .limit(10);
    
    if (brandedError) {
      console.error('Error checking branded foods:', brandedError);
      return;
    }
    
    if (brandedLooking && brandedLooking.length > 0) {
      console.log('\n⚠️ Foods that look branded:');
      brandedLooking.forEach(food => {
        console.log(`  - "${food.description}" (data_type: "${food.data_type}")`);
      });
    }
    
  } catch (error) {
    console.error('Error in checkDataTypes:', error);
  }
}

checkDataTypes();
