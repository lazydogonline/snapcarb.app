import { estimateCarbsFromImage, generateSnapCarbRecipe } from './gemini-ai-service';
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
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    netCarbs: number;
  };
  tags: string[];
  source: string;
  imageUrl?: string;
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

  /**
   * Calculate accurate nutrition for a recipe using USDA data
   */
  static async calculateRecipeNutrition(ingredients: Array<{
    name: string;
    amount: string;
  }>, servings: number): Promise<{
    net_carbs_g: number;
    fiber_g: number;
    calories: number;
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

    // Get nutrition for each ingredient
    for (const ingredient of ingredients) {
      try {
        // Search USDA database for the ingredient
        const searchResults = await USDANutritionService.searchFoods(ingredient.name, 1);
        
        if (searchResults.length > 0) {
          // Get detailed nutrition for the first (best) match
          const nutrition = await USDANutritionService.getFoodNutrition(searchResults[0].fdcId);
          
          if (nutrition) {
            // Calculate nutrition for the specific amount
            const ingredientNutrition = USDANutritionService.calculateIngredientNutrition(
              ingredient.name,
              ingredient.amount,
              nutrition
            );
            
            nutritionData.push({
              name: ingredient.name,
              amount: ingredient.amount,
              ...ingredientNutrition
            });
          }
        }
      } catch (error) {
        console.error(`Error getting nutrition for ${ingredient.name}:`, error);
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
    return USDANutritionService.calculateRecipeNutrition(nutritionData, servings);
  }
}
