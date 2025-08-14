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
    calories: number;
    protein: number;
    fat: number;
    fiber: number;
    netCarbs: number;
  };
  tags: string[];
  source: string;
  coolFacts?: {
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

  const body = {
    generationConfig: {
      response_mime_type: "application/json",
      // Optional: nudge for concise numeric outputs
      temperature: 0.2,
    },
    contents: [
      {
        parts: [
          {
            text:
`You are a nutritionist. Identify foods in the photo and estimate carbohydrates in grams.
Return ONLY JSON with:
{
  "total_carbs_g": number,
  "items": [
    {"name": string, "carbs_g": number, "portion_description": string, "confidence": 0-1}
  ],
  "notes": string (optional)
}
Assume common restaurant/home portions. If uncertain, reflect that in lower confidence.`
          },
          {
            inlineData: {
              mimeType: "image/jpeg", // or image/png if that's what you pass
              data: base64Image
            }
          }
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
  // Gemini v1beta JSON output is in candidates[0].content.parts[0].text
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
- Wild-caught fish (sustainable, no farm chemicals)
- Organic vegetables (no pesticides, better nutrition)
- Sustainable sourcing (better for animals, planet, and you)

PHILOSOPHY: "Eat Less, Better Quality" - Choose ingredients that respect animal welfare and environmental sustainability.

Requirements:
- Recipe must be DELICIOUS and restaurant-quality
- Maximum ${maxCarbs} NET carbs per serving (total carbs minus fiber)
- Include detailed, professional cooking instructions
- Use high-quality, sustainable ingredients
- Add interesting "cool facts" about nutritional benefits
- Make it unique and creative - not a generic recipe

Return ONLY a JSON object with this exact structure:
{
  "id": "unique-recipe-id",
  "title": "Creative Recipe Title",
  "description": "Mouthwatering description",
  "difficulty": "Easy|Medium|Hard",
  "prepTime": number,
  "cookTime": number,
  "totalTime": number,
  "servings": number,
  "netCarbs": number,
  "ingredients": [
    {
      "name": "Ingredient name with quality descriptor",
      "amount": "Specific amount",
      "net_carbs_g": number,
      "fiber_g": number,
      "isAllowed": true,
      "swapSuggestion": "Alternative if needed"
    }
  ],
  "instructions": ["Detailed step 1", "Detailed step 2"],
  "nutrition": {
    "calories": number,
    "protein": number,
    "fat": number,
    "fiber": number,
    "netCarbs": number
  },
  "tags": ["low-carb", "snapcarb-approved", "high-protein", "gourmet"],
  "source": "SnapCarb Chef Collection",
  "coolFacts": {
    "vitamin_k2": "Interesting fact about K2",
    "omega_3": "Interesting fact about omega-3s",
    "cla": "Interesting fact about CLA",
    "sustainability": "Environmental benefit",
    "gut_health": "Digestive health benefit",
    "anti_inflammatory": "Anti-inflammatory benefit"
  }
}

Make this recipe AMAZING - it should be something people want to cook and eat!`;

  const body = {
    generationConfig: {
      response_mime_type: "application/json",
      temperature: 0.8, // Creative but consistent
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
    
    // Parse the AI-generated recipe
    const recipe = JSON.parse(jsonText) as SnapCarbRecipe;
    
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
  try {
    const nutrition = await estimateCarbsFromImage(base64Image);
    
    // SnapCarb compliance analysis
    const maxNetCarbsPerMeal = 15; // grams
    const isCompliant = nutrition.total_carbs_g <= maxNetCarbsPerMeal;
    
    // Calculate compliance score (1-10)
    let score = 10;
    if (nutrition.total_carbs_g > maxNetCarbsPerMeal) {
      score = Math.max(1, 10 - Math.floor((nutrition.total_carbs_g - maxNetCarbsPerMeal) / 2));
    }
    
    // Generate warnings and recommendations
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    if (nutrition.total_carbs_g > maxNetCarbsPerMeal) {
      warnings.push(`This meal exceeds the recommended ${maxNetCarbsPerMeal}g net carbs per meal`);
      recommendations.push("Consider reducing portion sizes or choosing lower-carb alternatives");
    }
    
    if (nutrition.total_carbs_g > 30) {
      warnings.push("Very high carb content - may impact ketosis");
      recommendations.push("This meal could break your fasting state");
    }
    
    // Check for disallowed foods
    const disallowedFoods = ['bread', 'pasta', 'rice', 'potato', 'corn', 'wheat', 'grain'];
    const foundDisallowed = nutrition.items.filter(item => 
      disallowedFoods.some(food => 
        item.name.toLowerCase().includes(food) && item.confidence > 0.7
      )
    );
    
    if (foundDisallowed.length > 0) {
      warnings.push(`Contains disallowed foods: ${foundDisallowed.map(f => f.name).join(', ')}`);
      score = Math.max(1, score - 3);
    }
    
    // Add positive recommendations
    if (nutrition.total_carbs_g <= 10) {
      recommendations.push("Great choice! This meal is well within your carb limits");
    }
    
    if (nutrition.items.some(item => item.name.toLowerCase().includes('vegetable'))) {
      recommendations.push("Good choice including vegetables - they're great for your health");
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
  } catch (error) {
    console.error('Error analyzing meal:', error);
    throw new Error(`Failed to analyze meal: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to convert image to base64
export function imageToBase64(imageUri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // For React Native, you might need to use react-native-fs or similar
    // This is a placeholder - implement based on your image handling library
    reject(new Error('Image to base64 conversion not implemented - use your preferred image library'));
  });
}

// Export the service
export default {
  estimateCarbsFromImage,
  analyzeMealForSnapCarb,
  generateSnapCarbRecipe,
  imageToBase64
};


