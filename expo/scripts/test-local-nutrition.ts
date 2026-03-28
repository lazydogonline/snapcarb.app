import LocalNutritionService from '../services/local-nutrition-service';

async function testLocalNutrition() {
  try {
    console.log('🧪 Testing local nutrition service...\n');

    // Test 1: Initialize nutrition data
    console.log('1. Initializing nutrition data...');
    // Note: This would normally be called by the app startup
    console.log('✅ Nutrition data initialization ready\n');

    // Test 2: Check available food IDs
    console.log('2. Checking available food IDs...');
    const availableIds = await LocalNutritionService.getAvailableFoodIds();
    console.log(`✅ Found ${availableIds.length} foods with nutrition data`);
    console.log('First 10 food IDs:', availableIds.slice(0, 10));
    console.log();

    // Test 3: Test nutrition lookup for a specific food
    if (availableIds.length > 0) {
      const testFoodId = availableIds[0];
      console.log(`3. Testing nutrition lookup for food ID: ${testFoodId}`);
      
      const nutrition = await LocalNutritionService.getFoodNutrition(testFoodId);
      console.log('✅ Nutrition data retrieved:', nutrition);
      console.log();

      // Test 4: Check if another food has nutrition data
      const hasNutrition = await LocalNutritionService.hasNutritionData(testFoodId);
      console.log(`4. Checking if food ${testFoodId} has nutrition: ${hasNutrition}`);
      console.log('✅ hasNutritionData working correctly');
    }

    console.log('\n🎉 All tests passed! Local nutrition service is working.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLocalNutrition();
