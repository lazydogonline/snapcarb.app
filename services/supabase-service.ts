import { createClient } from '@supabase/supabase-js';
import { SnapCarbRecipe } from './gemini-ai-service';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables in supabase-service.ts');
}

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
        .eq('user_id', userId);

      if (error) throw error;

      // Transform the data to match SnapCarbRecipe interface
      return data.map(item => ({
        id: item.recipes.id,
        title: item.recipes.title,
        description: item.recipes.description,
        difficulty: item.recipes.difficulty,
        prepTime: item.recipes.prep_time,
        cookTime: item.recipes.cook_time,
        totalTime: item.recipes.total_time,
        servings: item.recipes.servings,
        netCarbs: item.recipes.net_carbs,
        nutrition: {
          calories: item.recipes.calories,
          protein: item.recipes.protein,
          fat: item.recipes.fat,
          fiber: item.recipes.fiber,
          carbs: item.recipes.net_carbs + (item.recipes.fiber || 0)
        },
        ingredients: item.recipes.ingredients || [],
        instructions: item.recipes.instructions || [],
        tags: item.recipes.tags || [],
        source: item.recipes.source,
        coolFacts: item.recipes.cool_facts || [],
        complianceScore: item.recipes.compliance_score
      }));
    } catch (error) {
      console.error('Error getting user recipes:', error);
      throw new Error(`Failed to get user recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recipe by ID
   */
  static async getRecipeById(recipeId: string): Promise<SnapCarbRecipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Transform the data to match SnapCarbRecipe interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        prepTime: data.prep_time,
        cookTime: data.cook_time,
        totalTime: data.total_time,
        servings: data.servings,
        netCarbs: data.net_carbs,
        nutrition: {
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          fiber: data.fiber,
          carbs: data.net_carbs + (data.fiber || 0)
        },
        ingredients: data.ingredients || [],
        instructions: data.instructions || [],
        tags: data.tags || [],
        source: data.source,
        coolFacts: data.cool_facts || [],
        complianceScore: data.compliance_score
      };
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw new Error(`Failed to get recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update recipe
   */
  static async updateRecipe(recipeId: string, updates: Partial<SnapCarbRecipe>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.difficulty) updateData.difficulty = updates.difficulty;
      if (updates.prepTime) updateData.prep_time = updates.prepTime;
      if (updates.cookTime) updateData.cook_time = updates.cookTime;
      if (updates.servings) updateData.servings = updates.servings;
      if (updates.netCarbs) updateData.net_carbs = updates.netCarbs;
      if (updates.ingredients) updateData.ingredients = updates.ingredients;
      if (updates.instructions) updateData.instructions = updates.instructions;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.coolFacts) updateData.cool_facts = updates.coolFacts;
      if (updates.complianceScore) updateData.compliance_score = updates.complianceScore;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw new Error(`Failed to update recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete recipe
   */
  static async deleteRecipe(recipeId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw new Error(`Failed to delete recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search recipes by title or description
   */
  static async searchRecipes(query: string, userId?: string): Promise<SnapCarbRecipe[]> {
    try {
      let queryBuilder = supabase
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      // If userId is provided, only return user's recipes
      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Transform the data to match SnapCarbRecipe interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        difficulty: item.difficulty,
        prepTime: item.prep_time,
        cookTime: item.cook_time,
        totalTime: item.total_time,
        servings: item.servings,
        netCarbs: item.net_carbs,
        nutrition: {
          calories: item.calories,
          protein: item.protein,
          fat: item.fat,
          fiber: item.fiber,
          carbs: item.net_carbs + (item.fiber || 0)
        },
        ingredients: item.ingredients || [],
        instructions: item.instructions || [],
        tags: item.tags || [],
        source: item.source,
        coolFacts: item.cool_facts || [],
        complianceScore: item.compliance_score
      }));
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw new Error(`Failed to search recipes: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      return data;
    } catch (error) {
      console.error('Error getting recipe categories:', error);
      throw new Error(`Failed to get recipe categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add recipe to category
   */
  static async addRecipeToCategory(recipeId: string, categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipe_category_relations')
        .insert({
          recipe_id: recipeId,
          category_id: categoryId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding recipe to category:', error);
      throw new Error(`Failed to add recipe to category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove recipe from category
   */
  static async removeRecipeFromCategory(recipeId: string, categoryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recipe_category_relations')
        .delete()
        .eq('recipe_id', recipeId)
        .eq('category_id', categoryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing recipe from category:', error);
      throw new Error(`Failed to remove recipe from category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recipes by category
   */
  static async getRecipesByCategory(categoryId: string, userId?: string): Promise<SnapCarbRecipe[]> {
    try {
      let queryBuilder = supabase
        .from('recipe_category_relations')
        .select(`
          *,
          recipes (*)
        `)
        .eq('category_id', categoryId);

      // If userId is provided, only return user's recipes
      if (userId) {
        queryBuilder = queryBuilder.eq('recipes.user_id', userId);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;

      // Transform the data to match SnapCarbRecipe interface
      return data.map(item => ({
        id: item.recipes.id,
        title: item.recipes.title,
        description: item.recipes.description,
        difficulty: item.recipes.difficulty,
        prepTime: item.recipes.prep_time,
        cookTime: item.recipes.cook_time,
        totalTime: item.recipes.total_time,
        servings: item.recipes.servings,
        netCarbs: item.recipes.net_carbs,
        nutrition: {
          calories: item.recipes.calories,
          protein: item.recipes.protein,
          fat: item.recipes.fat,
          fiber: item.recipes.fiber,
          carbs: item.recipes.net_carbs + (item.recipes.fiber || 0)
        },
        ingredients: item.recipes.ingredients || [],
        instructions: item.recipes.instructions || [],
        tags: item.recipes.tags || [],
        source: item.recipes.source,
        coolFacts: item.recipes.cool_facts || [],
        complianceScore: item.recipes.compliance_score
      }));
    } catch (error) {
      console.error('Error getting recipes by category:', error);
      throw new Error(`Failed to get recipes by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default RecipeService;



