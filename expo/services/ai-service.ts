import { MealAnalysis, Recipe } from '@/types/health';

export interface AIAnalysisRequest {
  imageUrl: string;
  description?: string;
  ingredients?: string[];
}

export interface AIAnalysisResponse {
  success: boolean;
  analysis?: MealAnalysis;
  recipe?: Recipe;
  error?: string;
}

export interface HealthInsight {
  type: 'nutrition' | 'timing' | 'combination' | 'warning';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
}

export interface PersonalizedRecommendation {
  category: 'meal' | 'supplement' | 'timing' | 'lifestyle';
  title: string;
  description: string;
  confidence: number;
  reasoning: string[];
}

class AIService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    // Initialize with environment variable or stored key
    this.apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || null;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async analyzeMealPhoto(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Simulate AI analysis for now - in production this would call OpenAI's Vision API
      const mockAnalysis: MealAnalysis = {
        estimatedNetCarbs: this.estimateNetCarbs(request.description || ''),
        disallowedIngredients: this.detectDisallowedIngredients(request.description || ''),
        complianceScore: this.calculateComplianceScore(request.description || ''),
        recommendations: this.generateRecommendations(request.description || ''),
        fiberEstimate: this.estimateFiber(request.description || ''),
        totalCarbsEstimate: this.estimateTotalCarbs(request.description || ''),
      };

      return {
        success: true,
        analysis: mockAnalysis,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async generateRecipeSuggestion(ingredients: string[], preferences: string[]): Promise<Recipe | null> {
    try {
      // Simulate AI recipe generation
      const recipe: Recipe = {
        id: Date.now().toString(),
        name: 'AI-Generated Healthy Meal',
        ingredients: ingredients,
        instructions: [
          'Combine all ingredients in a bowl',
          'Mix thoroughly',
          'Serve immediately for best results',
        ],
        netCarbs: this.calculateTotalNetCarbs(ingredients),
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        tags: ['ai-generated', 'healthy', 'quick'],
        complianceScore: 9,
      };

      return recipe;
    } catch (error) {
      console.error('Error generating recipe:', error);
      return null;
    }
  }

  async getHealthInsights(meals: any[], supplements: any[], progress: any): Promise<HealthInsight[]> {
    const insights: HealthInsight[] = [];

    // Analyze meal timing
    if (meals.length > 0) {
      const lastMeal = meals[meals.length - 1];
      const hoursSinceLastMeal = (Date.now() - new Date(lastMeal.timestamp).getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastMeal > 16) {
        insights.push({
          type: 'timing',
          title: 'Extended Fasting Window',
          message: `It's been ${Math.round(hoursSinceLastMeal)} hours since your last meal. Consider breaking your fast if you're feeling hungry.`,
          priority: 'medium',
          actionable: true,
          action: 'Log a meal',
        });
      }
    }

    // Analyze supplement compliance
    const missedSupplements = supplements.filter(s => !s.taken);
    if (missedSupplements.length > 0) {
      insights.push({
        type: 'supplement',
        title: 'Supplements Due',
        message: `You have ${missedSupplements.length} supplements that haven't been taken today.`,
        priority: 'high',
        actionable: true,
        action: 'Take supplements',
      });
    }

    // Analyze carb compliance
    if (progress.totalNetCarbs > 45) {
      insights.push({
        type: 'nutrition',
        title: 'High Carb Intake',
        message: 'Your daily net carb intake is above the recommended 45g limit. Consider reducing carbs in your next meal.',
        priority: 'medium',
        actionable: true,
        action: 'Plan low-carb meal',
      });
    }

    return insights;
  }

  async getPersonalizedRecommendations(userProfile: any, healthData: any): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];

    // Analyze user goals and provide recommendations
    if (userProfile.goals?.includes('weight-loss')) {
      recommendations.push({
        category: 'lifestyle',
        title: 'Optimize Fasting Window',
        description: 'Consider extending your fasting window to 18-20 hours for enhanced fat burning.',
        confidence: 0.85,
        reasoning: ['Weight loss goal detected', 'Current fasting pattern analysis', 'Research-backed recommendation'],
      });
    }

    if (userProfile.goals?.includes('energy')) {
      recommendations.push({
        category: 'supplement',
        title: 'Vitamin D3 Optimization',
        description: 'Your current Vitamin D3 dosage may be suboptimal. Consider increasing to 5000-8000 IU daily.',
        confidence: 0.78,
        reasoning: ['Energy goal detected', 'Current supplement analysis', 'Optimal blood level targeting'],
      });
    }

    return recommendations;
  }

  private estimateNetCarbs(description: string): number {
    // Simple keyword-based estimation - in production this would use AI
    const lowCarbKeywords = ['salad', 'vegetables', 'meat', 'fish', 'eggs', 'cheese'];
    const highCarbKeywords = ['bread', 'pasta', 'rice', 'potato', 'fruit', 'sugar'];
    
    const description_lower = description.toLowerCase();
    let carbs = 5; // Base carbs
    
    lowCarbKeywords.forEach(keyword => {
      if (description_lower.includes(keyword)) carbs -= 1;
    });
    
    highCarbKeywords.forEach(keyword => {
      if (description_lower.includes(keyword)) carbs += 8;
    });
    
    return Math.max(0, carbs);
  }

  private detectDisallowedIngredients(description: string): string[] {
    const disallowed = ['wheat', 'grain', 'seed oil', 'soybean oil', 'canola oil', 'corn oil'];
    const found: string[] = [];
    
    disallowed.forEach(ingredient => {
      if (description.toLowerCase().includes(ingredient)) {
        found.push(ingredient);
      }
    });
    
    return found;
  }

  private calculateComplianceScore(description: string): number {
    const disallowedCount = this.detectDisallowedIngredients(description).length;
    const netCarbs = this.estimateNetCarbs(description);
    
    let score = 10;
    
    if (disallowedCount > 0) score -= 3;
    if (netCarbs > 15) score -= 2;
    if (netCarbs > 25) score -= 2;
    
    return Math.max(1, score);
  }

  private generateRecommendations(description: string): string[] {
    const recommendations: string[] = [];
    const disallowed = this.detectDisallowedIngredients(description);
    const netCarbs = this.estimateNetCarbs(description);
    
    if (disallowed.length > 0) {
      recommendations.push(`Avoid ${disallowed.join(', ')} for optimal health`);
    }
    
    if (netCarbs > 15) {
      recommendations.push('Consider reducing portion size to stay under 15g net carbs');
    }
    
    if (netCarbs <= 5) {
      recommendations.push('Great choice! This meal is very low in carbs');
    }
    
    return recommendations;
  }

  private estimateFiber(description: string): number {
    const fiberKeywords = ['vegetables', 'salad', 'broccoli', 'spinach', 'avocado'];
    const description_lower = description.toLowerCase();
    let fiber = 2; // Base fiber
    
    fiberKeywords.forEach(keyword => {
      if (description_lower.includes(keyword)) fiber += 3;
    });
    
    return fiber;
  }

  private estimateTotalCarbs(description: string): number {
    return this.estimateNetCarbs(description) + this.estimateFiber(description);
  }

  private calculateTotalNetCarbs(ingredients: string[]): number {
    return ingredients.reduce((total, ingredient) => {
      return total + this.estimateNetCarbs(ingredient);
    }, 0);
  }
}

export const aiService = new AIService();
export default aiService;

