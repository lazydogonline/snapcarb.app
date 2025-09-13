import { supabase } from './supabase-service';

/**
 * Defines the structure of a single food search result, with all nutrients
 * and branded data aggregated from multiple tables.
 */
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

/**
 * The structure of the raw data returned from the Supabase query with
 * nested joins. This is a temporary interface used for parsing.
 */
interface RawFoodData {
  fdc_id: number;
  description: string;
  data_type: string;
  branded_food: {
    brand_owner: string;
    ingredients: string;
  }[];
  food_nutrient: {
    amount: number;
    nutrient: {
      id: number;
      name: string;
      unit_name: string;
    };
  }[];
}

export class FoodSearchService {
  /**
   * Rewritten food search to use JOINs on the full USDA tables.
   * This is more accurate but may be slower on the first load.
   *
   * @param query The user's search term.
   * @returns A promise of a list of FoodSearchResult objects.
   */
  async searchFoods(query: string): Promise<FoodSearchResult[]> {
    try {
      console.log(`Searching for: "${query}" using the full USDA database.`);

      // Clean up the search term to improve matching.
      const searchTerm = this.cleanIngredientName(query);

      // Build a dynamic query using OR conditions for a more robust search.
      let searchQuery = supabase
        .from('food')
        .select('fdc_id, description, data_type')
        // Use a filter to search for the full phrase or individual words.
        .ilike('description', `%${searchTerm}%`)
        .neq('data_type', 'sub_sample_food')
        // Prioritize Foundation foods (raw ingredients) over branded foods
        .order('data_type', { ascending: true });

      // If the search term has multiple words, add an OR condition for each word
      const keywords = searchTerm.split(' ').filter(word => word.length > 2);
      if (keywords.length > 1) {
          const keywordConditions = keywords.map(keyword => `description.ilike.%${keyword}%`).join(',');
          searchQuery = searchQuery.or(keywordConditions);
      }
      
      // Execute the search
      const { data, error } = await searchQuery.limit(50);

      if (error) {
        console.error('❌ Search error:', error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log('ℹ️ No foods found');
        return [];
      }

      console.log(`✅ Found ${data.length} foods`);
      
      // Get nutrition data for the first few foods
      const results: FoodSearchResult[] = [];
      
      for (const food of data.slice(0, 5)) {
        try {
          const nutrition = await this.getFoodNutrition(food.fdc_id);
          if (nutrition) {
            results.push(nutrition);
            console.log(`  - ${nutrition.name} (${nutrition.data_type})`);
            console.log(`    Protein: ${nutrition.protein}g, Net Carbs: ${nutrition.net_carbs}g`);
          }
        } catch (error) {
          console.warn(`⚠️ Could not get nutrition for ${food.description}:`, error);
        }
      }

      return results;

    } catch (error) {
      console.error('❌ Search failed:', error);
      return [];
    }
  }

  /**
   * Retrieves a single food item and its full nutrition data by its fdcId.
   *
   * @param fdcId The unique ID of the food.
   * @returns A promise of a single FoodSearchResult or null.
   */
  async getFoodNutrition(fdcId: number): Promise<FoodSearchResult | null> {
    try {
      // Get food info
      const { data: foodData, error: foodError } = await supabase
        .from('food')
        .select('fdc_id, description, data_type')
        .eq('fdc_id', fdcId)
        .single();
        
      if (foodError || !foodData) {
        console.error('❌ Food not found:', foodError);
        return null;
      }

      // Get nutrition data for the specific macronutrients we need
      const { data: nutritionData, error: nutritionError } = await supabase
        .from('food_nutrient')
        .select('amount, nutrient_id')
        .eq('fdc_id', fdcId)
        .in('nutrient_id', [
          1008, // Energy (kcal)
          1003, // Protein
          1004, // Total lipid (fat)
          1005, // Carbohydrate, by difference
          1079, // Fiber, total dietary
          2000, // Sugars, total including NLEA
          1093  // Sodium, Na
        ]);
        
      if (nutritionError) {
        console.error('❌ Nutrition fetch error:', nutritionError);
        return null;
      }

      // Build the result
      const result: FoodSearchResult = {
        id: foodData.fdc_id,
        fdc_id: foodData.fdc_id,
        name: foodData.description,
        brand: undefined,
        ingredients: undefined,
        data_type: foodData.data_type,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        net_carbs: 0,
        snapcarb_score: 0,
        traffic_light: 'gray'
      };

      // Parse nutrition data using nutrient IDs
      if (nutritionData && nutritionData.length > 0) {
        for (const nutrientEntry of nutritionData) {
          const amount = nutrientEntry.amount || 0;
          const nutrientId = nutrientEntry.nutrient_id;

          switch (nutrientId) {
            case 1008: // Energy (kcal)
              result.calories = amount;
              break;
            case 1003: // Protein
              result.protein = amount;
              break;
            case 1004: // Total lipid (fat)
              result.fat = amount;
              break;
            case 1005: // Carbohydrate, by difference
              result.carbs = amount;
              break;
            case 1079: // Fiber, total dietary
              result.fiber = amount;
              break;
            case 2000: // Sugars, total including NLEA
              result.sugar = amount;
              break;
            case 1093: // Sodium, Na
              result.sodium = amount;
              break;
          }
        }
      }

      // Calculate net carbs and scores
      result.net_carbs = result.carbs - result.fiber;
      result.snapcarb_score = this.calculateSnapCarbScore(result);
      result.traffic_light = this.getTrafficLight(result);
      
      return result;

    } catch (error) {
      console.error('❌ Nutrition fetch failed:', error);
      return null;
    }
  }

  /**
   * A private helper function to process the raw, joined data from Supabase
   * and convert it into the clean FoodSearchResult format.
   * This handles the fact that each nutrient comes as a separate row in the joined table.
   *
   * @param rawData The raw data array from the Supabase query.
   * @returns An array of cleaned FoodSearchResult objects.
   */
  private parseJoinedData(rawData: RawFoodData[]): FoodSearchResult[] {
    const results: FoodSearchResult[] = [];

    for (const rawFood of rawData) {
      // Initialize a new FoodSearchResult object with default values.
      const food: FoodSearchResult = {
        id: rawFood.fdc_id, // Use fdc_id as the unique ID for now.
        fdc_id: rawFood.fdc_id,
        name: rawFood.description,
        brand: rawFood.branded_food?.[0]?.brand_owner || undefined,
        ingredients: rawFood.branded_food?.[0]?.ingredients || undefined,
        data_type: rawFood.data_type,
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        net_carbs: 0,
        snapcarb_score: 0,
        traffic_light: 'gray', // Default to gray, will be calculated later
      };

      // Iterate through the food_nutrient array to populate the nutrient fields.
      // We will need to map nutrient names to our interface's fields.
      for (const nutrientEntry of rawFood.food_nutrient) {
        const amount = nutrientEntry.amount || 0;
        const nutrientName = nutrientEntry.nutrient.name;

        // Use a switch statement to map USDA nutrient names to our fields.
        switch (nutrientName) {
          case 'Energy':
            // Energy is typically in kcal, but USDA has multiple entries, so we prioritize the most common.
            if (nutrientEntry.nutrient.unit_name === 'kcal') {
              food.calories = amount;
            }
            break;
          case 'Protein':
            food.protein = amount;
            break;
          case 'Total lipid (fat)':
            food.fat = amount;
            break;
          case 'Carbohydrate, by difference':
            food.carbs = amount;
            break;
          case 'Fiber, total dietary':
            food.fiber = amount;
            break;
          case 'Sugars, total including NLEA':
            food.sugar = amount;
            break;
          case 'Sodium, Na':
            food.sodium = amount;
            break;
        }
      }

      // Calculate net carbs based on the new data.
      food.net_carbs = food.carbs - food.fiber;

      // Calculate SnapCarb score and traffic light based on nutrition data
      food.snapcarb_score = this.calculateSnapCarbScore(food);
      food.traffic_light = this.getTrafficLight(food);

      results.push(food);
    }
    return results;
  }

  /**
   * Calculate SnapCarb score based on nutrition data
   * Higher scores = better for SnapCarb diet
   */
  calculateSnapCarbScore(food: FoodSearchResult): number {
    let score = 50; // Base score

    // Net carbs scoring (lower is better)
    if (food.net_carbs <= 5) score += 30; // Excellent
    else if (food.net_carbs <= 10) score += 20; // Good
    else if (food.net_carbs <= 15) score += 10; // Acceptable
    else if (food.net_carbs <= 25) score -= 10; // Poor
    else score -= 30; // Very poor

    // Protein scoring (higher is better)
    if (food.protein >= 20) score += 20; // Excellent
    else if (food.protein >= 15) score += 15; // Good
    else if (food.protein >= 10) score += 10; // Acceptable
    else if (food.protein >= 5) score += 5; // Low
    else score -= 10; // Very low

    // Fiber scoring (higher is better)
    if (food.fiber >= 5) score += 15; // Excellent
    else if (food.fiber >= 3) score += 10; // Good
    else if (food.fiber >= 1) score += 5; // Acceptable

    // Sugar penalty (lower is better)
    if (food.sugar >= 10) score -= 20; // High sugar
    else if (food.sugar >= 5) score -= 10; // Medium sugar

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get traffic light color based on SnapCarb score
   */
  getTrafficLight(food: FoodSearchResult): string {
    if (food.snapcarb_score >= 80) return 'green';
    if (food.snapcarb_score >= 60) return 'yellow';
    return 'red';
  }

  /**
   * Clean up ingredient names for better database matching.
   * This function should be less aggressive to avoid removing important terms.
   */
  private cleanIngredientName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }
}