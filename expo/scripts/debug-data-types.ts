import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugDataTypes() {
  try {
    console.log('🔍 Debugging data types in food table...\n');

    // Check what data_type values exist
    console.log('1. Checking all unique data_type values...');
    const { data: dataTypes, error: dataTypeError } = await supabase
      .from('food')
      .select('data_type')
      .limit(1000);
    
    if (dataTypeError) {
      console.error('Error getting data types:', dataTypeError);
    } else {
      const uniqueTypes = [...new Set(dataTypes?.map(f => f.data_type))];
      console.log('Unique data types found:', uniqueTypes);
      
      // Count each type
      uniqueTypes.forEach(type => {
        const count = dataTypes?.filter(f => f.data_type === type).length || 0;
        console.log(`  ${type}: ${count} foods`);
      });
    }

    // Check if Foundation foods exist
    console.log('\n2. Checking for Foundation foods...');
    const { data: foundationFoods, error: foundationError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .eq('data_type', 'Foundation')
      .limit(5);
    
    if (foundationError) {
      console.error('Error getting Foundation foods:', foundationError);
    } else {
      console.log(`Foundation foods found: ${foundationFoods?.length || 0}`);
      if (foundationFoods && foundationFoods.length > 0) {
        console.log('Examples:', foundationFoods.map(f => f.description));
      }
    }

    // Check if SR Legacy foods exist
    console.log('\n3. Checking for SR Legacy foods...');
    const { data: legacyFoods, error: legacyError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .eq('data_type', 'SR Legacy')
      .limit(5);
    
    if (legacyError) {
      console.error('Error getting SR Legacy foods:', legacyError);
    } else {
      console.log(`SR Legacy foods found: ${legacyFoods?.length || 0}`);
      if (legacyFoods && legacyFoods.length > 0) {
        console.log('Examples:', legacyFoods.map(f => f.description));
      }
    }

    // Try a broader search
    console.log('\n4. Trying broader search without data_type filter...');
    const { data: allFoods, error: allError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', '%steak%')
      .limit(10);
    
    if (allError) {
      console.error('Error getting all foods:', allError);
    } else {
      console.log(`Foods with "steak" found: ${allFoods?.length || 0}`);
      if (allFoods && allFoods.length > 0) {
        console.log('Examples:', allFoods.map(f => ({ description: f.description, data_type: f.data_type })));
      }
    }

  } catch (error) {
    console.error('Error in debug script:', error);
  }
}

debugDataTypes();
