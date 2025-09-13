import { estimateCarbsFromImage, generateSnapCarbRecipe } from './gemini-ai-service';
import { FoodSearchService } from './food-search-service';
import { USDANutritionService } from './usda-nutrition-service';

export interface SnapCarbRecipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  servings: number;
  netCarbs: number; // per serving
  ingredients: {
    name: string;
    amount: string;
    net_carbs_g: number;
    fiber_g: number;
    isAllowed: boolean;
    swapSuggestion?: string;
  }[];
  instructions: string[];
  nutrition: {
    protein: number;
    fat: number;
    fiber: number;
    netCarbs: number;
  };
  tags: string[];
  source: string;
  imageUrl?: string;
  isFavorite?: boolean;
  createdAt?: string;
  coolFacts?: {
    vitamin_k2?: string;
    omega_3?: string;
    cla?: string;
    sustainability?: string;
    gut_health?: string;
    anti_inflammatory?: string;
  };
}

export interface RecipeSearchParams {
  query: string;
  maxCarbs?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  mealType?: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  prepTime?: number;
}

export class RecipeService {
  static async searchRecipe(params: RecipeSearchParams): Promise<SnapCarbRecipe> {
    try {
      // Use real Gemini AI to generate unique recipes
      const recipe = await generateSnapCarbRecipe(params.query, params.maxCarbs || 20);
      
      // Validate the AI-generated recipe
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        throw new Error('AI generated incomplete recipe');
      }
      
      // Calculate REAL nutrition data from USDA database
      try {
        const realNutrition = await this.calculateRecipeNutrition(
          recipe.ingredients.map(ing => ({ name: ing.name, amount: ing.amount })),
          recipe.servings
        );
        
        // Update the recipe with real nutrition data
        recipe.nutrition = {
          protein: realNutrition.protein_g,
          fat: realNutrition.fat_g,
          fiber: realNutrition.fiber_g,
          netCarbs: realNutrition.net_carbs_g
        };
        
        // Update the netCarbs field to match
        recipe.netCarbs = realNutrition.net_carbs_g;
        
        // Update ingredient nutrition data
        recipe.ingredients = recipe.ingredients.map(ing => ({
          ...ing,
          net_carbs_g: 0, // Will be calculated per ingredient if needed
          fiber_g: 0
        }));
        
        console.log('✅ Recipe nutrition updated with real USDA data:', realNutrition);
      } catch (nutritionError) {
        console.warn('⚠️ Could not calculate real nutrition, using AI estimates:', nutritionError);
        // Keep the AI-generated nutrition if database lookup fails
      }
      
      return recipe;
    } catch (error) {
      console.error('Error generating recipe with AI:', error);
      
      // Fallback to a simple error message instead of mock data
      throw new Error(`Failed to generate recipe for "${params.query}". Please try again or check your internet connection.`);
    }
  }

  static async getRecipeById(id: string): Promise<SnapCarbRecipe | null> {
    // TODO: Implement recipe retrieval from Supabase
    return null;
  }

  static async saveRecipe(recipe: SnapCarbRecipe): Promise<void> {
    // TODO: Implement recipe saving to Supabase
    console.log('Saving recipe:', recipe.title);
  }

  static async getPopularRecipes(limit: number = 10): Promise<SnapCarbRecipe[]> {
    // TODO: Implement popular recipes from Supabase
    return [];
  }

  static async getUserRecipes(): Promise<SnapCarbRecipe[]> {
    // TODO: Implement user recipe retrieval from Supabase
    // For now, return empty array
    return [];
  }

  static async deleteRecipe(recipeId: string): Promise<void> {
    // TODO: Implement recipe deletion from Supabase
    console.log('Deleting recipe:', recipeId);
  }

  static async updateRecipe(recipeId: string, updates: Partial<SnapCarbRecipe>): Promise<void> {
    // TODO: Implement recipe update in Supabase
    console.log('Updating recipe:', recipeId, updates);
  }

  /**
   * Calculate accurate nutrition for a recipe using USDA data from Supabase
   */
  static async calculateRecipeNutrition(ingredients: Array<{
    name: string;
    amount: string;
  }>, servings: number): Promise<{
    net_carbs_g: number;
    fiber_g: number;
    protein_g: number;
    fat_g: number;
  }> {
    const nutritionData: Array<{
      name: string;
      amount: string;
      net_carbs_g: number;
      fiber_g: number;
      calories: number;
      protein_g: number;
      fat_g: number;
    }> = [];

    // Get nutrition for each ingredient using the working FoodSearchService
    for (const ingredient of ingredients) {
      try {
        // Split the ingredient name to get the USDA search term
        const [displayName, usdaName] = ingredient.name.split('|');
        const searchTerm = usdaName ? usdaName.trim() : ingredient.name;
        
        console.log(`🔍 Getting nutrition for: "${searchTerm}"`);
        
        // Search using the working FoodSearchService (direct table access)
        const foodSearchService = new FoodSearchService();
        const searchResults = await foodSearchService.searchFoods(searchTerm);
        
        if (searchResults.length > 0) {
          // Get the first (best) match
          const food = searchResults[0];
          
          // Parse the amount to get grams
          const grams = this.parseAmountToGrams(ingredient.amount);
          
          // Calculate nutrition for the specific amount (per 100g basis)
          const ingredientNutrition = {
            name: displayName || ingredient.name,
            amount: ingredient.amount,
            net_carbs_g: (food.net_carbs * grams) / 100,
            fiber_g: (food.fiber * grams) / 100,
            calories: (food.calories * grams) / 100,
            protein_g: (food.protein * grams) / 100,
            fat_g: (food.fat * grams) / 100
          };
          
          nutritionData.push(ingredientNutrition);
          
          console.log(`✅ Got nutrition for ${displayName || ingredient.name}: ${ingredientNutrition.calories} cal, ${ingredientNutrition.protein_g}g protein`);
        } else {
          throw new Error('No food found');
        }
      } catch (error) {
        console.error(`❌ Error getting nutrition for ${ingredient.name}:`, error);
        // Use fallback values if USDA lookup fails
        nutritionData.push({
          name: ingredient.name,
          amount: ingredient.amount,
          net_carbs_g: 0,
          fiber_g: 0,
          calories: 0,
          protein_g: 0,
          fat_g: 0
        });
      }
    }

    // Calculate total recipe nutrition
    const totals = nutritionData.reduce((acc, ingredient) => ({
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

    // Return per-serving nutrition
    return {
      net_carbs_g: Math.round((totals.net_carbs_g / servings) * 100) / 100,
      fiber_g: Math.round((totals.fiber_g / servings) * 100) / 100,
      calories: Math.round((totals.calories / servings) * 100) / 100,
      protein_g: Math.round((totals.protein_g / servings) * 100) / 100,
      fat_g: Math.round((totals.fat_g / servings) * 100) / 100
    };
  }

  /**
   * Parse ingredient amount to grams for nutrition calculation
   */
  private static parseAmountToGrams(amount: string): number {
    // Default to 100g if we can't parse the amount
    if (!amount) return 100;
    
    const amountStr = amount.toLowerCase().trim();
    
    // Try to extract numeric value
    const numericMatch = amountStr.match(/(\d+(?:\.\d+)?)/);
    if (!numericMatch) return 100;
    
    const numericValue = parseFloat(numericMatch[1]);
    
    // Convert common units to grams
    if (amountStr.includes('cup') || amountStr.includes('cups')) {
      return numericValue * 240; // 1 cup ≈ 240g
    } else if (amountStr.includes('tbsp') || amountStr.includes('tablespoon')) {
      return numericValue * 15; // 1 tbsp ≈ 15g
    } else if (amountStr.includes('tsp') || amountStr.includes('teaspoon')) {
      return numericValue * 5; // 1 tsp ≈ 5g
    } else if (amountStr.includes('oz') || amountStr.includes('ounce')) {
      return numericValue * 28.35; // 1 oz ≈ 28.35g
    } else if (amountStr.includes('lb') || amountStr.includes('pound')) {
      return numericValue * 453.59; // 1 lb ≈ 453.59g
    } else if (amountStr.includes('g') || amountStr.includes('gram')) {
      return numericValue; // Already in grams
    } else if (amountStr.includes('ml') || amountStr.includes('milliliter')) {
      return numericValue; // 1ml ≈ 1g for most ingredients
    }
    
    // Default to grams if unit not recognized
    return numericValue;
  }
}
