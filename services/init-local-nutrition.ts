import LocalNutritionService from './local-nutrition-service';

// Import the nutrition data from the JSON file
import nutritionData from '../assets/nutrition-data.json';

/**
 * Initialize the local nutrition service with the full nutrition database
 * This should be called when your app starts
 */
export function initializeLocalNutrition(): void {
  try {
    console.log('🚀 Initializing local nutrition service...');
    
    // Convert JSON data to CSV format for the service
    const csvData = convertJSONToCSV(nutritionData);
    LocalNutritionService.initializeWithCSVData(csvData);
    
    console.log('✅ Local nutrition service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize local nutrition service:', error);
  }
}

/**
 * Convert JSON nutrition data back to CSV format for the service
 */
function convertJSONToCSV(data: any[]): string {
  let csv = 'id,fdc_id,nutrient_id,amount\n';
  let id = 1;
  
  data.forEach(food => {
    Object.entries(food.nutrients).forEach(([nutrientId, amount]) => {
      csv += `${id},${food.fdc_id},${nutrientId},${amount}\n`;
      id++;
    });
  });
  
  return csv;
}

/**
 * Check if the local nutrition service is ready
 */
export function isLocalNutritionReady(): boolean {
  return LocalNutritionService.isInitialized();
}

export default LocalNutritionService;
