/**
 * Image Service - Generates AI images for recipes using DALL-E 3
 */

interface OpenAIImageResponse {
  data: Array<{
    url: string;
    revised_prompt?: string;
  }>;
}

export class ImageService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
  private static readonly OPENAI_BASE_URL = 'https://api.openai.com/v1';

  /**
   * Generate AI image for recipe using DALL-E 3
   */
  static async getRecipeImage(recipeName: string, recipeDescription?: string): Promise<string | null> {
    try {
      console.log(`🎨 Generating AI image for: "${recipeName}"`);
      
      if (!this.OPENAI_API_KEY) {
        console.log('⚠️ OpenAI API key not found, using fallback image');
        return this.getFallbackImage(recipeName);
      }

      // Create detailed prompt for food photography
      const imagePrompt = this.createFoodPhotoPrompt(recipeName, recipeDescription);
      
      const response = await fetch(`${this.OPENAI_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: imagePrompt,
          size: '1024x1024',
          quality: 'standard',
          n: 1
        })
      });

      if (!response.ok) {
        console.error('❌ DALL-E API error:', response.status, response.statusText);
        return this.getFallbackImage(recipeName);
      }

      const data: OpenAIImageResponse = await response.json();
      
      if (data.data && data.data.length > 0) {
        const imageUrl = data.data[0].url;
        console.log(`✅ Generated AI image: ${imageUrl}`);
        return imageUrl;
      }

      console.log(`⚠️ No image generated, using fallback`);
      return this.getFallbackImage(recipeName);

    } catch (error) {
      console.error('❌ Error generating AI image:', error);
      return this.getFallbackImage(recipeName);
    }
  }

  /**
   * Create optimized prompt for food photography
   */
  private static createFoodPhotoPrompt(recipeName: string, description?: string): string {
    const cleanName = this.cleanRecipeName(recipeName);
    
    const basePrompt = `Professional food photography of ${cleanName}`;
    const stylePrompt = ', beautifully plated, appetizing, well-lit, restaurant quality, high resolution, food styling, natural lighting, shallow depth of field';
    
    // Add context from description if available
    let contextPrompt = '';
    if (description) {
      // Extract key visual elements from description
      const visualKeywords = description.toLowerCase().match(/\b(creamy|crispy|golden|fresh|colorful|rich|tender|juicy|grilled|roasted|seared)\b/g);
      if (visualKeywords) {
        contextPrompt = `, ${visualKeywords.slice(0, 3).join(', ')}`;
      }
    }
    
    return basePrompt + contextPrompt + stylePrompt;
  }

  /**
   * Clean recipe name for better search results
   */
  private static cleanRecipeName(recipeName: string): string {
    return recipeName
      .toLowerCase()
      // Remove common recipe prefixes/suffixes that don't help image search
      .replace(/^(keto|low-carb|snapcarb|healthy|easy|quick|homemade)\s+/i, '')
      .replace(/\s+(recipe|dish|meal|food)$/i, '')
      // Keep main food words
      .replace(/\s+with\s+.*$/i, '') // "Chicken Salad with Avocado" -> "Chicken Salad"
      .replace(/\s+and\s+.*$/i, '')  // "Steak and Vegetables" -> "Steak"
      .trim();
  }

  /**
   * Get fallback food category images for common SnapCarb foods
   */
  static getFallbackImage(recipeName: string): string {
    const name = recipeName.toLowerCase();
    
    // Map common SnapCarb foods to beautiful food category images (all free from Unsplash)
    const fallbacks: { [key: string]: string } = {
      // Proteins
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80',
      'beef': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
      'steak': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
      'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
      'fish': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
      'eggs': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
      'pork': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
      'lamb': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
      
      // Vegetables & Salads
      'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
      'avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
      'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
      'broccoli': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&q=80',
      'cauliflower': 'https://images.unsplash.com/photo-1568584711271-81f77a2c7b0e?w=800&q=80',
      'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
      'zucchini': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80',
      
      // Keto Favorites  
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&q=80',
      'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80',
      'coconut': 'https://images.unsplash.com/photo-1520638023360-6def1f5c2c6a?w=800&q=80',
      'nuts': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80',
      'almonds': 'https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80',
      
      // Desserts & Treats
      'chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80',
      'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
      'cookies': 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80'
    };

    // Find matching category (prioritize more specific matches first)
    const sortedCategories = Object.entries(fallbacks).sort((a, b) => b[0].length - a[0].length);
    
    for (const [category, imageUrl] of sortedCategories) {
      if (name.includes(category)) {
        console.log(`📸 Matched "${recipeName}" → "${category}" image`);
        return imageUrl;
      }
    }

    // Default healthy food image (better generic image)
    console.log(`📸 No match for "${recipeName}" → using default image`);
    return 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80';
  }
}
