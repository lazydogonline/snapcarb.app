import { supabase } from '../config/supabase';

export class DailyLimitService {
  private static readonly DAILY_RECIPE_LIMIT = 3;
  
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
   * Get daily limit info for display
   */
  static async getDailyLimitInfo(userId: string): Promise<{ used: number; remaining: number; limit: number }> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('daily_recipe_searches')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today);
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      const used = data ? data.length : 0;
      const remaining = Math.max(0, this.DAILY_RECIPE_LIMIT - used);
      
      return {
        used,
        remaining,
        limit: this.DAILY_RECIPE_LIMIT
      };
    } catch (error) {
      console.error('Error getting daily limit info:', error);
      return {
        used: 0,
        remaining: this.DAILY_RECIPE_LIMIT,
        limit: this.DAILY_RECIPE_LIMIT
      };
    }
  }
}
