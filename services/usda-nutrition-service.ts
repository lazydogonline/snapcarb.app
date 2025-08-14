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
  private static readonly API_BASE = 'https://api.nal.usda.gov/fdc/v1';
  private static readonly API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
  
  /**
   * Search for foods in the USDA database
   */
  static async searchFoods(query: string, limit: number = 25): Promise<USDAFoodSearchResult[]> {
    try {
      const response = await fetch(
        `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&query=${encodeURIComponent(query)}&pageSize=${limit}&dataType=Foundation,SR Legacy`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.foods?.map((food: any) => ({
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner,
        ingredients: food.ingredients
      })) || [];
    } catch (error) {
      console.error('USDA search error:', error);
      return [];
    }
  }
  
  /**
   * Get detailed nutrition for a specific food
   */
  static async getFoodNutrition(fdcId: string): Promise<USDANutrition | null> {
    try {
      const response = await fetch(
        `${this.API_BASE}/food/${fdcId}?api_key=${this.API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`USDA API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract nutrition data from USDA response
      const nutrients = data.foodNutrients || [];
      
      const nutrition: USDANutrition = {
        fdcId: data.fdcId,
        description: data.description,
        calories: this.extractNutrient(nutrients, 'Energy', 'kcal') || 0,
        protein_g: this.extractNutrient(nutrients, 'Protein', 'g') || 0,
        fat_g: this.extractNutrient(nutrients, 'Total lipid (fat)', 'g') || 0,
        total_carbs_g: this.extractNutrient(nutrients, 'Carbohydrate, by difference', 'g') || 0,
        fiber_g: this.extractNutrient(nutrients, 'Fiber, total dietary', 'g') || 0,
        serving_size: 100, // USDA data is per 100g
        serving_unit: 'g'
      };
      
      // Calculate net carbs
      nutrition.net_carbs_g = Math.max(0, nutrition.total_carbs_g - nutrition.fiber_g);
      
      return nutrition;
    } catch (error) {
      console.error('USDA nutrition error:', error);
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
   * Extract nutrient value from USDA response
   */
  private static extractNutrient(nutrients: any[], name: string, unit: string): number | null {
    const nutrient = nutrients.find(n => 
      n.nutrientName?.toLowerCase().includes(name.toLowerCase()) && 
      n.unitName === unit
    );
    return nutrient?.value || null;
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
}
