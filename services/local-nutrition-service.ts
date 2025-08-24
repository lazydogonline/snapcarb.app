// Simple local nutrition service that works with React Native
// This service will be populated with nutrition data from the CSV

export interface NutritionData {
  net_carbs: number;
  protein: number;
  fat: number;
  calories: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

export interface FoodNutrientRecord {
  id: number;
  fdc_id: number;
  nutrient_id: number;
  amount: number;
}

export class LocalNutritionService {
  private static nutritionData: FoodNutrientRecord[] = [];
  private static isLoaded = false;

  /**
   * Initialize with nutrition data from CSV
   * This should be called once when the app starts
   */
  static initializeWithCSVData(csvData: string): void {
    if (this.isLoaded) return;

    try {
      console.log('📊 Initializing local nutrition database...');
      
      // Parse CSV content
      this.nutritionData = this.parseCSV(csvData);
      
      this.isLoaded = true;
      console.log(`✅ Initialized with ${this.nutritionData.length} nutrition records locally`);
    } catch (error) {
      console.error('❌ Error initializing local nutrition data:', error);
      throw error;
    }
  }

  /**
   * Parse CSV content into structured data
   */
  private static parseCSV(csvContent: string): FoodNutrientRecord[] {
    const lines = csvContent.split('\n');
    const records: FoodNutrientRecord[] = [];
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        records.push({
          id: parseInt(id),
          fdc_id: parseInt(fdc_id),
          nutrient_id: parseInt(nutrient_id),
          amount: parseFloat(amount)
        });
      }
    }
    
    return records;
  }

  /**
   * Get nutrition data for a specific food by fdc_id
   */
  static async getFoodNutrition(fdcId: number): Promise<NutritionData> {
    if (!this.isLoaded) {
      throw new Error('LocalNutritionService not initialized. Call initializeWithCSVData() first.');
    }

    // Find all nutrition records for this food
    const foodNutrients = this.nutritionData.filter(record => record.fdc_id === fdcId);
    
    if (foodNutrients.length === 0) {
      console.log(`🔍 No local nutrition data found for food ID: ${fdcId}`);
      return {
        net_carbs: 0, protein: 0, fat: 0, calories: 0, fiber: 0, sugar: 0, sodium: 0
      };
    }

    // Map nutrient IDs to nutrition values
    let calories = 0, protein = 0, fat = 0, carbs = 0, fiber = 0, sugar = 0, sodium = 0;
    
    foodNutrients.forEach(record => {
      switch (record.nutrient_id) {
        case 1008: // Energy
          calories = record.amount;
          break;
        case 1003: // Protein
          protein = record.amount;
          break;
        case 1004: // Total lipid (fat)
          fat = record.amount;
          break;
        case 1005: // Carbohydrate, by difference
          carbs = record.amount;
          break;
        case 1079: // Fiber, total dietary
          fiber = record.amount;
          break;
        case 2000: // Total Sugars
          sugar = record.amount;
          break;
        case 1093: // Sodium, Na
          sodium = record.amount;
          break;
      }
    });

    // Calculate net carbs (total carbs - fiber)
    const net_carbs = Math.max(0, carbs - fiber);

    console.log(`🔍 Local nutrition data for food ID ${fdcId}:`, {
      calories, protein, fat, carbs, fiber, sugar, sodium, net_carbs
    });

    return {
      net_carbs,
      protein,
      fat,
      calories,
      fiber,
      sugar,
      sodium
    };
  }

  /**
   * Check if a food has nutrition data locally
   */
  static async hasNutritionData(fdcId: number): Promise<boolean> {
    if (!this.isLoaded) {
      throw new Error('LocalNutritionService not initialized. Call initializeWithCSVData() first.');
    }

    return this.nutritionData.some(record => record.fdc_id === fdcId);
  }

  /**
   * Get all available fdc_ids that have nutrition data
   */
  static async getAvailableFoodIds(): Promise<number[]> {
    if (!this.isLoaded) {
      throw new Error('LocalNutritionService not initialized. Call initializeWithCSVData() first.');
    }

    const uniqueIds = new Set(this.nutritionData.map(record => record.fdc_id));
    return Array.from(uniqueIds);
  }

  /**
   * Get the total count of nutrition records
   */
  static getRecordCount(): number {
    return this.nutritionData.length;
  }

  /**
   * Check if the service is initialized
   */
  static isInitialized(): boolean {
    return this.isLoaded;
  }
}

export default LocalNutritionService;
