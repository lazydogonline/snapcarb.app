import { createClient } from '@supabase/supabase-js';
import { SnapCarbRecipe } from './gemini-ai-service';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserRecipeCollection {
  id: string;
  user_id: string;
  recipe_id: string;
  is_favorite: boolean;
  notes?: string;
  rating?: number;
  cooked_count: number;
  last_cooked?: string;
  created_at: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export class RecipeService {
  /**
   * Save an AI-generated recipe to the database
   */
  static async saveRecipe(recipe: SnapCarbRecipe, userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert({
          user_id: userId,
          title: recipe.title,
          description: recipe.description,
          difficulty: recipe.difficulty,
          prep_time: recipe.prepTime,
          cook_time: recipe.cookTime,
          total_time: recipe.totalTime,
          servings: recipe.servings,
          net_carbs: recipe.netCarbs,
          fiber: recipe.nutrition.fiber,
          protein: recipe.nutrition.protein,
          fat: recipe.nutrition.fat,
          calories: recipe.nutrition.calories,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags,
          source: recipe.source,
          is_ai_generated: true,
          ai_model: 'gemini-1.5-flash',
          cool_facts: recipe.coolFacts,
          compliance_score: 10 // AI-generated recipes are SnapCarb compliant
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw new Error(`Failed to save recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a recipe to user's collection
   */
  static async addToCollection(recipeId: string, userId: string, isFavorite: boolean = false): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_recipe_collections')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
          is_favorite: isFavorite
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding recipe to collection:', error);
      throw new Error(`Failed to add recipe to collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's recipe collection
   */
  static async getUserRecipes(userId: string): Promise<SnapCarbRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('user_recipe_collections')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => this.mapDatabaseRecipeToSnapCarbRecipe(item.recipes)) || [];
    } catch (error) {
      console.error('Error getting user recipes:', error);
      throw new Error(`Failed to get user recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get favorite recipes
   */
  static async getFavoriteRecipes(userId: string): Promise<SnapCarbRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('user_recipe_collections')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => this.mapDatabaseRecipeToSnapCarbRecipe(item.recipes)) || [];
    } catch (error) {
      console.error('Error getting favorite recipes:', error);
      throw new Error(`Failed to get favorite recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recipe categories
   */
  static async getRecipeCategories(): Promise<RecipeCategory[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recipe categories:', error);
      throw new Error(`Failed to get recipe categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search recipes by category
   */
  static async getRecipesByCategory(categoryName: string): Promise<SnapCarbRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_category_assignments')
        .select(`
          *,
          recipes (*)
        `)
        .eq('recipe_categories.name', categoryName);

      if (error) throw error;

      return data?.map(item => this.mapDatabaseRecipeToSnapCarbRecipe(item.recipes)) || [];
    } catch (error) {
      console.error('Error getting recipes by category:', error);
      throw new Error(`Failed to get recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update recipe rating
   */
  static async updateRecipeRating(recipeId: string, userId: string, rating: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_recipe_collections')
        .update({ rating })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating recipe rating:', error);
      throw new Error(`Failed to update recipe rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark recipe as cooked
   */
  static async markRecipeAsCooked(recipeId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_recipe_collections')
        .update({ 
          last_cooked: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking recipe as cooked:', error);
      throw new Error(`Failed to mark recipe as cooked: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove recipe from collection
   */
  static async removeFromCollection(recipeId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_recipe_collections')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing recipe from collection:', error);
      throw new Error(`Failed to remove recipe from collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map database recipe to SnapCarbRecipe interface
   */
  private static mapDatabaseRecipeToSnapCarbRecipe(dbRecipe: any): SnapCarbRecipe {
    return {
      id: dbRecipe.id,
      title: dbRecipe.title,
      description: dbRecipe.description,
      difficulty: dbRecipe.difficulty,
      prepTime: dbRecipe.prep_time,
      cookTime: dbRecipe.cook_time,
      totalTime: dbRecipe.total_time,
      servings: dbRecipe.servings,
      netCarbs: dbRecipe.net_carbs,
      ingredients: dbRecipe.ingredients || [],
      instructions: dbRecipe.instructions || [],
      nutrition: {
        calories: dbRecipe.calories,
        protein: dbRecipe.protein,
        fat: dbRecipe.fat,
        fiber: dbRecipe.fiber,
        netCarbs: dbRecipe.net_carbs
      },
      tags: dbRecipe.tags || [],
      source: dbRecipe.source,
      coolFacts: dbRecipe.cool_facts
    };
  }
}

export default RecipeService;



