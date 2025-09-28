import { supabase } from '../services/supabase-service';

async function testFoodSearch() {
  try {
    console.log('🔍 Testing simple food search...');
    
    // Test 1: Search for chicken without any filters
    const { data: allChicken, error: allError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', '%chicken%')
      .limit(5);
    
    if (allError) {
      console.error('Error searching all chicken:', allError);
      return;
    }
    
    console.log('\n📊 Found chicken foods (no filters):');
    allChicken?.forEach(food => {
      console.log(`  - "${food.description}" (data_type: "${food.data_type}")`);
    });
    
    // Test 2: Try to filter by data_type
    const { data: filteredChicken, error: filteredError } = await supabase
      .from('food')
      .select('fdc_id, description, data_type')
      .ilike('description', '%chicken%')
      .neq('data_type', 'branded food')
      .limit(5);
    
    if (filteredError) {
      console.error('Error searching filtered chicken:', filteredError);
      return;
    }
    
    console.log('\n📊 Found chicken foods (filtered):');
    filteredChicken?.forEach(food => {
      console.log(`  - "${food.description}" (data_type: "${food.data_type}")`);
    });
    
    console.log(`\n🔍 Total chicken found: ${allChicken?.length || 0}`);
    console.log(`🔍 Filtered chicken found: ${filteredChicken?.length || 0}`);
    
  } catch (error) {
    console.error('Error in testFoodSearch:', error);
  }
}

testFoodSearch();
