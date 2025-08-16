import { supabase } from '../config/supabase';

export interface USDANutrition {
  fdcId: string;
  description: string;
  calories: number;
  protein_g: number;
  fat_g: number;
  total_carbs_g: number;
  fiber_g: number;
  net_carbs_g: number;
  serving_size: number;
  serving_unit: string;
}

export interface USDAFoodSearchResult {
  fdcId: string;
  description: string;
  brandOwner?: string;
  ingredients?: string;
}

export class USDANutritionService {
  /**
   * Search for foods in the local USDA database
   */
  static async searchFoods(query: string, limit: number = 25): Promise<USDAFoodSearchResult[]> {
    try {
      console.log(`USDA Service: Searching for "${query}" in local database`);
      
      // Use the database function for efficient search
      const { data, error } = await supabase.rpc('search_usda_foods', {
        search_query: query,
        food_type: 'both',
        limit_count: limit
      });
      
      if (error) {
        console.error('Error searching USDA foods:', error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log('No foods found in local database');
        return [];
      }
      
      // Convert to our interface format
      const results: USDAFoodSearchResult[] = data.map((item: any) => ({
        fdcId: item.fdc_id,
        description: item.description,
        brandOwner: item.brand_owner,
        ingredients: undefined // Not available in search results
      }));
      
      console.log(`Found ${results.length} foods in local database`);
      return results;
      
    } catch (error) {
      console.error('Error searching USDA foods:', error);
      return [];
    }
  }
  
  /**
   * Get detailed nutrition for a specific food from local database
   */
  static async getFoodNutrition(fdcId: string): Promise<USDANutrition | null> {
    try {
      console.log(`USDA Service: Getting nutrition for FDC ID: ${fdcId}`);
      
      // Use the database function to get nutrition
      const { data, error } = await supabase.rpc('get_usda_nutrition', {
        fdc_id_param: fdcId
      });
      
      if (error) {
        console.error('Error getting USDA nutrition:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('No nutrition data found for FDC ID:', fdcId);
        return null;
      }
      
      const nutritionData = data[0];
      
      // Convert to our interface format
      const nutrition: USDANutrition = {
        fdcId: nutritionData.fdc_id,
        description: nutritionData.description,
        calories: nutritionData.calories || 0,
        protein_g: nutritionData.protein_g || 0,
        fat_g: nutritionData.fat_g || 0,
        total_carbs_g: nutritionData.total_carbs_g || 0,
        fiber_g: nutritionData.fiber_g || 0,
        net_carbs_g: nutritionData.net_carbs_g || 0,
        serving_size: nutritionData.serving_size || 100,
        serving_unit: nutritionData.serving_unit || 'g'
      };
      
      console.log('Retrieved nutrition data:', nutrition);
      return nutrition;
      
    } catch (error) {
      console.error('Error getting USDA nutrition:', error);
      return null;
    }
  }
  
  /**
   * Search for foods by barcode (UPC/GTIN)
   */
  static async searchFoodsByBarcode(barcode: string): Promise<USDANutrition | null> {
    try {
      console.log(`USDA Service: Searching for barcode: ${barcode}`);
      
      const { data, error } = await supabase
        .from('usda_branded_foods')
        .select('*')
        .eq('gtin_upc', barcode)
        .single();
      
      if (error || !data) {
        console.log('No branded food found for barcode:', barcode);
        return null;
      }
      
      // Convert to our interface format
      const nutrition: USDANutrition = {
        fdcId: data.fdc_id,
        description: data.description,
        calories: data.calories || 0,
        protein_g: data.protein_g || 0,
        fat_g: data.fat_g || 0,
        total_carbs_g: data.total_carbs_g || 0,
        fiber_g: data.fiber_g || 0,
        net_carbs_g: data.net_carbs_g || 0,
        serving_size: data.serving_size || 100,
        serving_unit: data.serving_unit || 'g'
      };
      
      console.log('Found branded food by barcode:', nutrition);
      return nutrition;
      
    } catch (error) {
      console.error('Error searching foods by barcode:', error);
      return null;
    }
  }
  
  /**
   * Calculate nutrition for a recipe ingredient
   */
  static calculateIngredientNutrition(
    ingredient: string,
    amount: string,
    nutrition: USDANutrition
  ): {
    net_carbs_g: number;
    fiber_g: number;
    calories: number;
    protein_g: number;
    fat_g: number;
  } {
    // Parse amount (e.g., "100g", "1 cup", "2 tbsp")
    const parsedAmount = this.parseAmount(amount);
    const multiplier = parsedAmount.value / nutrition.serving_size;
    
    return {
      net_carbs_g: Math.round((nutrition.net_carbs_g * multiplier) * 100) / 100,
      fiber_g: Math.round((nutrition.fiber_g * multiplier) * 100) / 100,
      calories: Math.round((nutrition.calories * multiplier) * 100) / 100,
      protein_g: Math.round((nutrition.protein_g * multiplier) * 100) / 100,
      fat_g: Math.round((nutrition.fat_g * multiplier) * 100) / 100
    };
  }
  
  /**
   * Calculate total recipe nutrition
   */
  static calculateRecipeNutrition(ingredients: Array<{
    name: string;
    amount: string;
    net_carbs_g: number;
    fiber_g: number;
    calories: number;
    protein_g: number;
    fat_g: number;
  }>, servings: number) {
    const total = ingredients.reduce((acc, ingredient) => ({
      net_carbs_g: acc.net_carbs_g + ingredient.net_carbs_g,
      fiber_g: acc.fiber_g + ingredient.fiber_g,
      calories: acc.calories + ingredient.calories,
      protein_g: acc.protein_g + ingredient.protein_g,
      fat_g: acc.fat_g + ingredient.fat_g
    }), {
      net_carbs_g: 0,
      fiber_g: 0,
      calories: 0,
      protein_g: 0,
      fat_g: 0
    });
    
    // Calculate per serving
    return {
      net_carbs_g: Math.round((total.net_carbs_g / servings) * 100) / 100,
      fiber_g: Math.round((total.fiber_g / servings) * 100) / 100,
      calories: Math.round((total.calories / servings) * 100) / 100,
      protein_g: Math.round((total.protein_g / servings) * 100) / 100,
      fat_g: Math.round((total.fat_g / servings) * 100) / 100
    };
  }
  
  /**
   * Parse ingredient amounts (e.g., "100g", "1 cup", "2 tbsp")
   */
  private static parseAmount(amount: string): { value: number; unit: string } {
    // Handle common measurements
    const commonConversions: { [key: string]: number } = {
      'cup': 236.588, // 1 cup = 236.588g
      'tbsp': 14.7868, // 1 tbsp = 14.7868g
      'tsp': 4.92892, // 1 tsp = 4.92892g
      'oz': 28.3495, // 1 oz = 28.3495g
      'lb': 453.592, // 1 lb = 453.592g
      'g': 1,
      'ml': 1, // 1ml ≈ 1g for most ingredients
      'l': 1000,
      'kg': 1000
    };
    
    // Extract number and unit
    const match = amount.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      if (commonConversions[unit]) {
        return { value: value * commonConversions[unit], unit: 'g' };
      }
    }
    
    // Default to grams if no unit specified
    const numericValue = parseFloat(amount.replace(/[^\d.]/g, ''));
    return { value: numericValue || 100, unit: 'g' };
  }
  
  /**
   * Get database statistics
   */
  static async getDatabaseStats(): Promise<{
    foundationFoods: number;
    brandedFoods: number;
    totalFoods: number;
  }> {
    try {
      const [foundationCount, brandedCount] = await Promise.all([
        supabase.from('usda_foundation_foods').select('*', { count: 'exact', head: true }),
        supabase.from('usda_branded_foods').select('*', { count: 'exact', head: true })
      ]);
      
      return {
        foundationFoods: foundationCount.count || 0,
        brandedFoods: brandedCount.count || 0,
        totalFoods: (foundationCount.count || 0) + (brandedCount.count || 0)
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      return {
        foundationFoods: 0,
        brandedFoods: 0,
        totalFoods: 0
      };
    }
  }
}
