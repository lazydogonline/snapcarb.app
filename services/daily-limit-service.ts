import { supabase } from '../config/supabase';

export class DailyLimitService {
  private static readonly DAILY_RECIPE_LIMIT = 5;
  private static readonly DAILY_MEAL_ANALYSIS_LIMIT = 10;
  private static readonly DAILY_AI_INSIGHTS_LIMIT = 15;
  
  /**
   * Check if user has reached daily recipe search limit
   */
  static async checkRecipeLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      const { data, error } = await supabase
        .from('daily_recipe_searches')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const count = data ? data.length : 0;
      const remaining = Math.max(0, this.DAILY_RECIPE_LIMIT - count);
      
      return {
        allowed: count < this.DAILY_RECIPE_LIMIT,
        remaining,
        limit: this.DAILY_RECIPE_LIMIT
      };
    } catch (error) {
      console.error('Error checking recipe limit:', error);
      // On error, allow the request to prevent blocking users
      return {
        allowed: true,
        remaining: this.DAILY_RECIPE_LIMIT,
        limit: this.DAILY_RECIPE_LIMIT
      };
    }
  }
  
  /**
   * Log a recipe search for daily limit tracking
   */
  static async logRecipeSearch(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      const { error } = await supabase
        .from('daily_recipe_searches')
        .insert({
          user_id: userId,
          date: today,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging recipe search:', error);
      // Don't throw error to prevent blocking recipe generation
    }
  }
  
  /**
   * Check if user has reached daily meal analysis limit
   */
  static async checkMealAnalysisLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('daily_meal_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const count = data ? data.length : 0;
      const remaining = Math.max(0, this.DAILY_MEAL_ANALYSIS_LIMIT - count);
      
      return {
        allowed: count < this.DAILY_MEAL_ANALYSIS_LIMIT,
        remaining,
        limit: this.DAILY_MEAL_ANALYSIS_LIMIT
      };
    } catch (error) {
      console.error('Error checking meal analysis limit:', error);
      return {
        allowed: true,
        remaining: this.DAILY_MEAL_ANALYSIS_LIMIT,
        limit: this.DAILY_MEAL_ANALYSIS_LIMIT
      };
    }
  }

  /**
   * Log a meal analysis for daily limit tracking
   */
  static async logMealAnalysis(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { error } = await supabase
        .from('daily_meal_analyses')
        .insert({
          user_id: userId,
          date: today,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging meal analysis:', error);
    }
  }

  /**
   * Check if user has reached daily AI insights limit
   */
  static async checkAIInsightsLimit(userId: string): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('daily_ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const count = data ? data.length : 0;
      const remaining = Math.max(0, this.DAILY_AI_INSIGHTS_LIMIT - count);
      
      return {
        allowed: count < this.DAILY_AI_INSIGHTS_LIMIT,
        remaining,
        limit: this.DAILY_AI_INSIGHTS_LIMIT
      };
    } catch (error) {
      console.error('Error checking AI insights limit:', error);
      return {
        allowed: true,
        remaining: this.DAILY_AI_INSIGHTS_LIMIT,
        limit: this.DAILY_AI_INSIGHTS_LIMIT
      };
    }
  }

  /**
   * Log an AI insight for daily limit tracking
   */
  static async logAIInsight(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { error } = await supabase
        .from('daily_ai_insights')
        .insert({
          user_id: userId,
          date: today,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error logging AI insight:', error);
    }
  }

  /**
   * Get daily limit info for display
   */
  static async getDailyLimitInfo(userId: string): Promise<{ 
    recipes: { used: number; remaining: number; limit: number };
    meals: { used: number; remaining: number; limit: number };
    insights: { used: number; remaining: number; limit: number };
  }> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      // Get recipe usage
      const { data: recipeData } = await supabase
        .from('daily_recipe_searches')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      // Get meal analysis usage
      const { data: mealData } = await supabase
        .from('daily_meal_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      // Get AI insights usage
      const { data: insightsData } = await supabase
        .from('daily_ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      const recipesUsed = recipeData ? recipeData.length : 0;
      const mealsUsed = mealData ? mealData.length : 0;
      const insightsUsed = insightsData ? insightsData.length : 0;
      
      return {
        recipes: {
          used: recipesUsed,
          remaining: Math.max(0, this.DAILY_RECIPE_LIMIT - recipesUsed),
          limit: this.DAILY_RECIPE_LIMIT
        },
        meals: {
          used: mealsUsed,
          remaining: Math.max(0, this.DAILY_MEAL_ANALYSIS_LIMIT - mealsUsed),
          limit: this.DAILY_MEAL_ANALYSIS_LIMIT
        },
        insights: {
          used: insightsUsed,
          remaining: Math.max(0, this.DAILY_AI_INSIGHTS_LIMIT - insightsUsed),
          limit: this.DAILY_AI_INSIGHTS_LIMIT
        }
      };
    } catch (error) {
      console.error('Error getting daily limit info:', error);
      return {
        recipes: {
          used: 0,
          remaining: this.DAILY_RECIPE_LIMIT,
          limit: this.DAILY_RECIPE_LIMIT
        },
        meals: {
          used: 0,
          remaining: this.DAILY_MEAL_ANALYSIS_LIMIT,
          limit: this.DAILY_MEAL_ANALYSIS_LIMIT
        },
        insights: {
          used: 0,
          remaining: this.DAILY_AI_INSIGHTS_LIMIT,
          limit: this.DAILY_AI_INSIGHTS_LIMIT
        }
      };
    }
  }
}
