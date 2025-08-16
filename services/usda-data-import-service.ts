import { supabase } from '../config/supabase';

export interface USDAFoodData {
  fdcId: string;
  description: string;
  brandOwner?: string;
  brandName?: string;
  dataType?: string;
  publicationDate?: string;
  allHighlightFields?: string;
  allKeywords?: string;
  gtinUpc?: string;
  ingredients?: string;
  marketCountry?: string;
  modifiedDate?: string;
  availableDate?: string;
  dataSource?: string;
  nutrients: USDANutrient[];
  servingSize?: number;
  servingUnit?: string;
}

export interface USDANutrient {
  id: number;
  number: string;
  name: string;
  amount: number;
  unitName: string;
  derivationCode?: string;
  derivationDescription?: string;
}

export interface USDAFoundationFood {
  fdcId: string;
  description: string;
  brandOwner?: string;
  brandName?: string;
  dataType: string;
  publicationDate?: string;
  allHighlightFields?: string;
  allKeywords?: string;
  nutrients: USDANutrient[];
  servingSize: number;
  servingUnit: string;
}

export interface USDABrandedFood {
  fdcId: string;
  description: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  ingredients?: string;
  marketCountry?: string;
  modifiedDate?: string;
  availableDate?: string;
  dataSource?: string;
  nutrients: USDANutrient[];
  servingSize: number;
  servingUnit: string;
}

export class USDADataImportService {
  private static readonly API_BASE = 'https://api.nal.usda.gov/fdc/v1';
  private static readonly API_KEY = process.env.EXPO_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
  
  /**
   * Download and import USDA Foundation Foods
   * This downloads the complete foundation foods database
   */
  static async importFoundationFoods(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('Starting USDA Foundation Foods import...');
      
      // Get total count first
      const totalCount = await this.getFoundationFoodsCount();
      console.log(`Total foundation foods to import: ${totalCount}`);
      
      let importedCount = 0;
      const batchSize = 200; // USDA API limit per request
      
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        console.log(`Importing batch ${Math.floor(offset / batchSize) + 1}/${Math.ceil(totalCount / batchSize)}`);
        
        const foods = await this.fetchFoundationFoodsBatch(offset, batchSize);
        if (foods.length === 0) break;
        
        const success = await this.insertFoundationFoods(foods);
        if (success) {
          importedCount += foods.length;
          console.log(`Imported ${foods.length} foods (Total: ${importedCount}/${totalCount})`);
        } else {
          console.error(`Failed to import batch starting at offset ${offset}`);
        }
        
        // Rate limiting - USDA allows 1000 requests per hour
        if (offset + batchSize < totalCount) {
          await this.delay(3600); // Wait 1 hour between batches
        }
      }
      
      console.log(`Foundation foods import completed. Imported: ${importedCount}/${totalCount}`);
      return { success: true, count: importedCount };
      
    } catch (error) {
      console.error('Error importing foundation foods:', error);
      return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Download and import USDA Branded Foods
   * This downloads branded products with barcodes
   */
  static async importBrandedFoods(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      console.log('Starting USDA Branded Foods import...');
      
      // Get total count first
      const totalCount = await this.getBrandedFoodsCount();
      console.log(`Total branded foods to import: ${totalCount}`);
      
      let importedCount = 0;
      const batchSize = 200; // USDA API limit per request
      
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        console.log(`Importing batch ${Math.floor(offset / batchSize) + 1}/${Math.ceil(totalCount / batchSize)}`);
        
        const foods = await this.fetchBrandedFoodsBatch(offset, batchSize);
        if (foods.length === 0) break;
        
        const success = await this.insertBrandedFoods(foods);
        if (success) {
          importedCount += foods.length;
          console.log(`Imported ${foods.length} foods (Total: ${importedCount}/${totalCount})`);
        } else {
          console.error(`Failed to import batch starting at offset ${offset}`);
        }
        
        // Rate limiting - USDA allows 1000 requests per hour
        if (offset + batchSize < totalCount) {
          await this.delay(3600); // Wait 1 hour between batches
        }
      }
      
      console.log(`Branded foods import completed. Imported: ${importedCount}/${totalCount}`);
      return { success: true, count: importedCount };
      
    } catch (error) {
      console.error('Error importing branded foods:', error);
      return { success: false, count: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Get total count of foundation foods
   */
  private static async getFoundationFoodsCount(): Promise<number> {
    try {
      const response = await fetch(
        `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&dataType=Foundation&pageSize=1`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.totalHits || 0;
    } catch (error) {
      console.error('Error getting foundation foods count:', error);
      return 0;
    }
  }
  
  /**
   * Get total count of branded foods
   */
  private static async getBrandedFoodsCount(): Promise<number> {
    try {
      const response = await fetch(
        `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&dataType=Branded&pageSize=1`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.totalHits || 0;
    } catch (error) {
      console.error('Error getting branded foods count:', error);
      return 0;
    }
  }
  
  /**
   * Fetch a batch of foundation foods
   */
  private static async fetchFoundationFoodsBatch(offset: number, limit: number): Promise<USDAFoundationFood[]> {
    try {
      const response = await fetch(
        `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&dataType=Foundation&pageSize=${limit}&pageNumber=${Math.floor(offset / limit) + 1}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error('Error fetching foundation foods batch:', error);
      return [];
    }
  }
  
  /**
   * Fetch a batch of branded foods
   */
  private static async fetchBrandedFoodsBatch(offset: number, limit: number): Promise<USDABrandedFood[]> {
    try {
      const response = await fetch(
        `${this.API_BASE}/foods/search?api_key=${this.API_KEY}&dataType=Branded&pageSize=${limit}&pageNumber=${Math.floor(offset / limit) + 1}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.foods || [];
    } catch (error) {
      console.error('Error fetching branded foods batch:', error);
      return [];
    }
  }
  
  /**
   * Insert foundation foods into Supabase
   */
  private static async insertFoundationFoods(foods: USDAFoundationFood[]): Promise<boolean> {
    try {
      const foodsToInsert = foods.map(food => ({
        fdc_id: food.fdcId,
        description: food.description,
        brand_owner: food.brandOwner || null,
        brand_name: food.brandName || null,
        data_type: food.dataType,
        publication_date: food.publicationDate ? new Date(food.publicationDate) : null,
        all_highlight_fields: food.allHighlightFields || null,
        all_keywords: food.allKeywords || null,
        calories: this.extractNutrientValue(food.nutrients, 'Energy', 'KCAL'),
        protein_g: this.extractNutrientValue(food.nutrients, 'Protein', 'G'),
        fat_g: this.extractNutrientValue(food.nutrients, 'Total lipid (fat)', 'G'),
        total_carbs_g: this.extractNutrientValue(food.nutrients, 'Carbohydrate, by difference', 'G'),
        fiber_g: this.extractNutrientValue(food.nutrients, 'Fiber, total dietary', 'G'),
        sugar_g: this.extractNutrientValue(food.nutrients, 'Sugars, total including NLEA', 'G'),
        sodium_mg: this.extractNutrientValue(food.nutrients, 'Sodium, Na', 'MG'),
        potassium_mg: this.extractNutrientValue(food.nutrients, 'Potassium, K', 'MG'),
        calcium_mg: this.extractNutrientValue(food.nutrients, 'Calcium, Ca', 'MG'),
        iron_mg: this.extractNutrientValue(food.nutrients, 'Iron, Fe', 'MG'),
        vitamin_c_mg: this.extractNutrientValue(food.nutrients, 'Vitamin C, total ascorbic acid', 'MG'),
        vitamin_d_iu: this.extractNutrientValue(food.nutrients, 'Vitamin D (D2 + D3), International Units', 'IU'),
        additional_nutrients: this.prepareAdditionalNutrients(food.nutrients),
        serving_size: food.servingSize || 100,
        serving_unit: food.servingUnit || 'g'
      }));
      
      const { error } = await supabase
        .from('usda_foundation_foods')
        .upsert(foodsToInsert, { onConflict: 'fdc_id' });
      
      if (error) {
        console.error('Error inserting foundation foods:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error preparing foundation foods for insert:', error);
      return false;
    }
  }
  
  /**
   * Insert branded foods into Supabase
   */
  private static async insertBrandedFoods(foods: USDABrandedFood[]): Promise<boolean> {
    try {
      const foodsToInsert = foods.map(food => ({
        fdc_id: food.fdcId,
        description: food.description,
        brand_owner: food.brandOwner || null,
        brand_name: food.brandName || null,
        gtin_upc: food.gtinUpc || null,
        ingredients: food.ingredients || null,
        market_country: food.marketCountry || null,
        modified_date: food.modifiedDate ? new Date(food.modifiedDate) : null,
        available_date: food.availableDate ? new Date(food.availableDate) : null,
        data_source: food.dataSource || null,
        calories: this.extractNutrientValue(food.nutrients, 'Energy', 'KCAL'),
        protein_g: this.extractNutrientValue(food.nutrients, 'Protein', 'G'),
        fat_g: this.extractNutrientValue(food.nutrients, 'Total lipid (fat)', 'G'),
        total_carbs_g: this.extractNutrientValue(food.nutrients, 'Carbohydrate, by difference', 'G'),
        fiber_g: this.extractNutrientValue(food.nutrients, 'Fiber, total dietary', 'G'),
        sugar_g: this.extractNutrientValue(food.nutrients, 'Sugars, total including NLEA', 'G'),
        sodium_mg: this.extractNutrientValue(food.nutrients, 'Sodium, Na', 'MG'),
        potassium_mg: this.extractNutrientValue(food.nutrients, 'Potassium, K', 'MG'),
        calcium_mg: this.extractNutrientValue(food.nutrients, 'Calcium, Ca', 'MG'),
        iron_mg: this.extractNutrientValue(food.nutrients, 'Iron, Fe', 'MG'),
        vitamin_c_mg: this.extractNutrientValue(food.nutrients, 'Vitamin C, total ascorbic acid', 'MG'),
        vitamin_d_iu: this.extractNutrientValue(food.nutrients, 'Vitamin D (D2 + D3), International Units', 'IU'),
        additional_nutrients: this.prepareAdditionalNutrients(food.nutrients),
        serving_size: food.servingSize || 100,
        serving_unit: food.servingUnit || 'g'
      }));
      
      const { error } = await supabase
        .from('usda_branded_foods')
        .upsert(foodsToInsert, { onConflict: 'fdc_id' });
      
      if (error) {
        console.error('Error inserting branded foods:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error preparing branded foods for insert:', error);
      return false;
    }
  }
  
  /**
   * Extract nutrient value from nutrients array
   */
  private static extractNutrientValue(nutrients: USDANutrient[], name: string, unit: string): number | null {
    const nutrient = nutrients.find(n => 
      n.name.toLowerCase().includes(name.toLowerCase()) && 
      n.unitName === unit
    );
    return nutrient ? Number(nutrient.amount) : null;
  }
  
  /**
   * Prepare additional nutrients as JSON
   */
  private static prepareAdditionalNutrients(nutrients: USDANutrient[]): any {
    const additional: any = {};
    
    nutrients.forEach(nutrient => {
      if (nutrient.name && nutrient.amount !== undefined) {
        additional[nutrient.name] = {
          amount: nutrient.amount,
          unit: nutrient.unitName,
          id: nutrient.id,
          number: nutrient.number
        };
      }
    });
    
    return Object.keys(additional).length > 0 ? additional : null;
  }
  
  /**
   * Delay function for rate limiting
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get import progress
   */
  static async getImportProgress(): Promise<{
    foundationFoods: { total: number; imported: number };
    brandedFoods: { total: number; imported: number };
  }> {
    try {
      const [foundationCount, brandedCount] = await Promise.all([
        supabase.from('usda_foundation_foods').select('*', { count: 'exact', head: true }),
        supabase.from('usda_branded_foods').select('*', { count: 'exact', head: true })
      ]);
      
      return {
        foundationFoods: {
          total: await this.getFoundationFoodsCount(),
          imported: foundationCount.count || 0
        },
        brandedFoods: {
          total: await this.getBrandedFoodsCount(),
          imported: brandedCount.count || 0
        }
      };
    } catch (error) {
      console.error('Error getting import progress:', error);
      return {
        foundationFoods: { total: 0, imported: 0 },
        brandedFoods: { total: 0, imported: 0 }
      };
    }
  }
  
  /**
   * Clear all USDA data (for testing/reset)
   */
  static async clearAllData(): Promise<boolean> {
    try {
      const { error: foundationError } = await supabase
        .from('usda_foundation_foods')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      const { error: brandedError } = await supabase
        .from('usda_branded_foods')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (foundationError || brandedError) {
        console.error('Error clearing USDA data:', { foundationError, brandedError });
        return false;
      }
      
      console.log('All USDA data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing USDA data:', error);
      return false;
    }
  }
}


