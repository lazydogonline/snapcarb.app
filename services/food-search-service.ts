import { supabase } from './supabase-service';
import { LocalNutritionService } from './local-nutrition-service';

export interface FoodSearchResult {
  id: number;
  fdc_id: number;
  name: string;
  brand?: string;
  ingredients?: string;
  data_type: string;
  calories: number;
    protein: number;
    fat: number;
  carbs: number;
    fiber: number;
    sugar: number;
    sodium: number;
  net_carbs: number;
  snapcarb_score: number;
  traffic_light: string;
}

export class FoodSearchService {
  private localNutritionService: LocalNutritionService;

  constructor() {
    this.localNutritionService = new LocalNutritionService();
  }

  async searchFoods(query: string): Promise<FoodSearchResult[]> {
    try {
      console.log(`🔍 Searching for: "${query}"`);

      const searchTerm = query.trim().toLowerCase();
      
      // Smart search: look for foods by name AND nutrition characteristics
      let searchQuery = supabase
        .from('foods_complete')
        .select('*');

      // If searching for protein-related foods, prioritize high protein
      if (searchTerm.includes('steak') || searchTerm.includes('meat') || searchTerm.includes('beef') || 
          searchTerm.includes('chicken') || searchTerm.includes('pork') || searchTerm.includes('protein')) {
        console.log('🥩 Protein search detected - prioritizing high protein foods');
        searchQuery = searchQuery.gte('protein', 15); // Foods with at least 15g protein
      }
      
      // If searching for carb-related foods, look for high carb
      if (searchTerm.includes('bread') || searchTerm.includes('pasta') || searchTerm.includes('rice') || 
          searchTerm.includes('potato') || searchTerm.includes('carb') || searchTerm.includes('starch')) {
        console.log('🍞 Carb search detected - prioritizing high carb foods');
        searchQuery = searchQuery.gte('carbs', 30); // Foods with at least 30g carbs
      }
      
      // If searching for fat-related foods, look for high fat
      if (searchTerm.includes('oil') || searchTerm.includes('butter') || searchTerm.includes('fat') || 
          searchTerm.includes('avocado') || searchTerm.includes('nuts')) {
        console.log('🧈 Fat search detected - prioritizing high fat foods');
        searchQuery = searchQuery.gte('fat', 15); // Foods with at least 15g fat
      }

      // Execute the search
      const { data, error } = await searchQuery
        .order('snapcarb_score', { ascending: false }) // Green foods first!
        .limit(50);

      if (error) {
        console.error('❌ Search error:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No foods found');
        return [];
      }

      console.log(`✅ Found ${data.length} foods`);
      
      // Log first few results for debugging
      data.slice(0, 3).forEach(food => {
        console.log(`   - ${food.name}`);
        console.log(`     Score: ${food.snapcarb_score} (${food.traffic_light})`);
      });

      return data;
    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  async getFoodNutrition(fdcId: number): Promise<FoodSearchResult | null> {
    try {
      // Get nutrition from mega-table - no JOINs needed!
      const { data, error } = await supabase
        .from('foods_complete')
        .select('*')
        .eq('fdc_id', fdcId)
        .single();
        
        if (error) {
        console.error('❌ Nutrition fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Nutrition fetch failed:', error);
      return null;
    }
  }

  calculateSnapCarbScore(food: FoodSearchResult): number {
    // Score is already calculated in the mega-table!
    return food.snapcarb_score;
  }

  getTrafficLight(food: FoodSearchResult): string {
    // Traffic light is already assigned in the mega-table!
    return food.traffic_light;
  }

  async searchByIngredients(ingredientQuery: string): Promise<FoodSearchResult[]> {
    try {
      // Search ingredients in mega-table
      const { data, error } = await supabase
        .from('foods_complete')
        .select('*')
        .ilike('ingredients', `%${ingredientQuery}%`)
        .order('snapcarb_score', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Ingredient search error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Ingredient search failed:', error);
      return [];
    }
  }

  async lookupFoodByBarcode(barcode: string): Promise<FoodSearchResult | null> {
    try {
      // For now, search by name - you can add barcode column later
      const { data, error } = await supabase
        .from('foods_complete')
        .select('*')
        .ilike('name', `%${barcode}%`)
        .single();

      if (error) {
        console.error('❌ Barcode lookup error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Barcode lookup failed:', error);
      return null;
    }
  }
}
