import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickTest() {
  console.log('🧪 Quick test: Inserting 5 food nutrients...');
  
  // Test data - just 5 rows
  const testData = [
    { id: 1, fdc_id: 1506545, nutrient_id: 2047, amount: 100 },
    { id: 2, fdc_id: 1506545, nutrient_id: 1253, amount: 8.0 },
    { id: 3, fdc_id: 1506545, nutrient_id: 1104, amount: 519.0 },
    { id: 4, fdc_id: 1506546, nutrient_id: 2047, amount: 150 },
    { id: 5, fdc_id: 1506546, nutrient_id: 1253, amount: 12.0 },
  ];
  
  try {
    console.log('🚀 Inserting test data...');
    const { data, error } = await supabase
      .from('food_nutrient')
      .insert(testData);
    
    if (error) {
      console.error('❌ Insert error:', error);
    } else {
      console.log('✅ Insert successful!');
      console.log('📊 Data inserted:', data);
    }
  } catch (error) {
    console.error('❌ Exception during insert:', error);
  }
}

quickTest()
  .then(() => {
    console.log('✅ Quick test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Quick test failed:', error);
    process.exit(1);
  });
