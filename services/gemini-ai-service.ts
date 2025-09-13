export type MealNutrition = {
  total_carbs_g: number;
  items: { name: string; carbs_g: number; portion_description: string; confidence: number }[];
  notes?: string;
};

export interface SnapCarbRecipe {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  netCarbs: number;
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
    protein: number;
    fat: number;
    fiber: number;
    netCarbs: number;
  };
  tags: string[];
  source: string;
  coolFacts: {
    vitamin_k2?: string;
    omega_3?: string;
    cla?: string;
    sustainability?: string;
    gut_health?: string;
    anti_inflammatory?: string;
  };
}

export async function estimateCarbsFromImage(base64Image: string): Promise<MealNutrition> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Analyze this food image and estimate the carbohydrate content. Return ONLY valid JSON in this format:
{
  "total_carbs_g": 25.5,
  "items": [
    {
      "name": "Food item name",
      "carbs_g": 12.3,
      "portion_description": "1 cup",
      "confidence": 0.85
    }
  ],
  "notes": "Additional observations"
}`;

  const body = {
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.3,
    },
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(jsonText) as MealNutrition;
}

export async function generateSnapCarbRecipe(query: string, maxCarbs: number = 20): Promise<SnapCarbRecipe> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a world-class chef and nutritionist specializing in the SnapCarb diet. Create a DELICIOUS, unique recipe for: "${query}"

SNAP CARB DIET RULES - These ingredients are NOT allowed:
- Grains (wheat, rice, corn, oats, barley, rye)
- Sugar (white sugar, brown sugar, honey, maple syrup, agave)
- High-carb vegetables (potatoes, sweet potatoes, carrots, beets)
- Legumes (beans, lentils, chickpeas, peanuts)
- Most fruits (except berries in moderation)
- Processed foods with added sugars

These ingredients ARE allowed:
- Meat, fish, eggs
- Low-carb vegetables (leafy greens, broccoli, cauliflower, zucchini)
- Nuts and seeds (almonds, walnuts, chia seeds)
- Full-fat dairy (cheese, butter, cream)
- Berries (strawberries, blueberries, raspberries) in moderation
- Healthy fats (olive oil, coconut oil, avocado)

QUALITY STANDARDS - Always prioritize:
- Grass-fed beef and lamb (better omega-3s, CLA, no antibiotics)
- Pasture-raised chickens and eggs (more nutrients, better taste)
- Wild-caught fish (higher omega-3s, no mercury concerns)
- Organic vegetables (no pesticides, more nutrients)
- Full-fat dairy (better satiety, more nutrients)

NUTRITION TARGETS:
- Net carbs: ${maxCarbs}g or less per serving
- Protein: 20-40g per serving
- Fat: 15-30g per serving
- Fiber: 3-8g per serving

SERVING REQUIREMENTS - NEVER suggest these forbidden serving options:
- NO crackers, bread, toast, or any wheat-based items
- NO rice cakes, corn chips, or grain-based snacks
- NO pasta, noodles, or grain-based accompaniments

ALWAYS suggest SnapCarb-compliant serving options:
- Lettuce cups, cabbage leaves, or other leafy greens
- Cucumber slices, bell pepper strips, or other low-carb vegetables
- Cheese crisps, pork rinds, or other grain-free alternatives
- Serve directly on a plate or in a bowl

OUTPUT FORMAT - Return ONLY valid JSON in this exact structure:
{
  "id": "unique-recipe-id-1",
  "title": "Recipe Name",
  "description": "Brief description of the dish",
  "difficulty": "Easy|Medium|Hard",
  "prepTime": 15,
  "cookTime": 30,
  "totalTime": 45,
  "servings": 4,
  "netCarbs": 12,
  "ingredients": [
    {
      "name": "Ingredient Name|Display Name",
      "amount": "1 cup",
      "net_carbs_g": 2,
      "fiber_g": 1,
      "isAllowed": true,
      "swapSuggestion": "Alternative ingredient"
    }
  ],
  "instructions": [
    "Step 1: Do this",
    "Step 2: Do that"
  ],
  "nutrition": {
    "protein": 25,
    "fat": 20,
    "fiber": 5,
    "netCarbs": 12
  },
  "tags": ["low-carb", "snapcarb-approved", "high-protein"],
  "source": "SnapCarb Chef Collection",
  "coolFacts": {
    "vitamin_k2": "Health benefit description",
    "omega_3": "Health benefit description",
    "cla": "Health benefit description",
    "sustainability": "Sustainability note",
    "gut_health": "Gut health benefit",
    "anti_inflammatory": "Anti-inflammatory benefit"
  }
}

Make this recipe AMAZING - it should be something people want to cook and eat!`;

  const body = {
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.8,
      maxOutputTokens: 4000,
    },
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error: ${res.status} ${err}`);
    }

    const data = await res.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    
    console.log('🤖 Raw Gemini response:', jsonText);
    
    // Parse the AI-generated recipe
    let recipe: SnapCarbRecipe;
    try {
      recipe = JSON.parse(jsonText) as SnapCarbRecipe;
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('❌ JSON text:', jsonText);
      
      // Try to extract essential data as fallback
      const essentialData = extractEssentialRecipeData(jsonText);
      recipe = essentialData as SnapCarbRecipe;
    }
    
    // Validate and enhance the recipe
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      throw new Error("AI generated incomplete recipe");
    }

    // Generate unique ID if not provided
    if (!recipe.id) {
      recipe.id = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    return recipe;
  } catch (error) {
    console.error('Error generating recipe with Gemini:', error);
    throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract essential recipe data from truncated or malformed JSON
 */
function extractEssentialRecipeData(jsonText: string): Partial<SnapCarbRecipe> {
  const recipe: Partial<SnapCarbRecipe> = {
    id: `recipe-${Date.now()}`,
    title: 'Generated Recipe',
    description: 'A delicious SnapCarb recipe',
    difficulty: 'Medium' as const,
    prepTime: 20,
    cookTime: 30,
    totalTime: 50,
    servings: 2,
    netCarbs: 10,
    ingredients: [],
    instructions: [],
    nutrition: { protein: 25, fat: 20, fiber: 5, netCarbs: 10 },
    tags: ['low-carb', 'snapcarb-approved'],
    source: 'SnapCarb Chef Collection',
    coolFacts: {}
  };

  try {
    // Try to extract title
    const titleMatch = jsonText.match(/"title":\s*"([^"]+)"/);
    if (titleMatch) {
      recipe.title = titleMatch[1];
    }

    // Try to extract description
    const descMatch = jsonText.match(/"description":\s*"([^"]+)"/);
    if (descMatch) {
      recipe.description = descMatch[1];
    }

    // Try to extract ingredients array
    const ingredientsMatch = jsonText.match(/"ingredients":\s*\[(.*?)\]/s);
    if (ingredientsMatch) {
      try {
        const ingredientsJson = '[' + ingredientsMatch[1] + ']';
        recipe.ingredients = JSON.parse(ingredientsJson);
      } catch (e) {
        console.log('Could not parse ingredients, using empty array');
      }
    }

    // Try to extract instructions array
    const instructionsMatch = jsonText.match(/"instructions":\s*\[(.*?)\]/s);
    if (instructionsMatch) {
      try {
        const instructionsJson = '[' + instructionsMatch[1] + ']';
        recipe.instructions = JSON.parse(instructionsJson);
      } catch (e) {
        console.log('Could not parse instructions, using empty array');
      }
    }

    // Try to extract nutrition
    const nutritionMatch = jsonText.match(/"nutrition":\s*\{([^}]+)\}/);
    if (nutritionMatch) {
      try {
        const nutritionJson = '{' + nutritionMatch[1] + '}';
        recipe.nutrition = JSON.parse(nutritionJson);
      } catch (e) {
        console.log('Could not parse nutrition, using defaults');
      }
    }

  } catch (error) {
    console.error('Error extracting essential data:', error);
  }

  return recipe;
}

// Enhanced function for SnapCarb specific analysis
export async function analyzeMealForSnapCarb(base64Image: string): Promise<{
  nutrition: MealNutrition;
  compliance: {
    score: number; // 1-10
    isCompliant: boolean;
    warnings: string[];
    recommendations: string[];
  };
}> {
  const nutrition = await estimateCarbsFromImage(base64Image);
  
  // Simple compliance scoring
  const score = Math.max(1, Math.min(10, 10 - (nutrition.total_carbs_g / 5)));
  const isCompliant = nutrition.total_carbs_g <= 20;
  
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (nutrition.total_carbs_g > 20) {
    warnings.push(`High carb content: ${nutrition.total_carbs_g}g`);
    recommendations.push('Consider reducing portion size or choosing lower-carb alternatives');
  }
  
  if (nutrition.total_carbs_g > 50) {
    warnings.push('Very high carb content - not SnapCarb compliant');
    recommendations.push('This meal exceeds SnapCarb guidelines');
  }
  
  return {
    nutrition,
    compliance: {
      score,
      isCompliant,
      warnings,
      recommendations
    }
  };
}

/**
 * Check if an ingredient is SnapCarb compliant using AI
 */
export async function checkIngredientCompliance(ingredientName: string, netCarbsPer100g: number): Promise<{
  isAllowed: boolean;
  reason: string;
  swapSuggestion?: string;
}> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback to simple rules if no API key
    return {
      isAllowed: netCarbsPer100g <= 5,
      reason: netCarbsPer100g <= 5 ? 'Low carb content' : 'High carb content'
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a SnapCarb diet expert. Analyze this ingredient for SnapCarb compliance:

INGREDIENT: "${ingredientName}"
NET CARBS: ${netCarbsPer100g}g per 100g

SNAP CARB DIET RULES:
- NO grains (wheat, rice, corn, oats, barley, rye)
- NO sugar (white sugar, brown sugar, honey, maple syrup, agave)
- NO high-carb vegetables (potatoes, sweet potatoes, carrots, beets)
- NO legumes (beans, lentils, chickpeas, peanuts)
- NO most fruits (except berries in moderation)
- NO processed foods with added sugars
- YES meat, fish, eggs
- YES low-carb vegetables (leafy greens, broccoli, cauliflower, zucchini)
- YES nuts and seeds (almonds, walnuts, chia seeds)
- YES full-fat dairy (cheese, butter, cream)
- YES berries in moderation
- YES healthy fats (olive oil, coconut oil, avocado)

Return ONLY valid JSON:
{
  "isAllowed": true/false,
  "reason": "Brief explanation why it's allowed or not",
  "swapSuggestion": "Alternative ingredient if not allowed (or null if allowed)"
}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.3
        },
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const result = JSON.parse(jsonText);
    
    return {
      isAllowed: result.isAllowed || false,
      reason: result.reason || 'Unknown ingredient',
      swapSuggestion: result.swapSuggestion || null
    };
  } catch (error) {
    console.error('Error checking ingredient compliance with Gemini:', error);
    // Fallback to simple rules
    return {
      isAllowed: netCarbsPer100g <= 5,
      reason: netCarbsPer100g <= 5 ? 'Low carb content' : 'High carb content'
    };
  }
}
