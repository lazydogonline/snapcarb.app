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
  console.log('🔬 estimateCarbsFromImage called');
  console.log('📦 Base64 input length:', base64Image?.length || 0);
  
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");
  
  // Validate base64 input
  if (!base64Image || typeof base64Image !== 'string') {
    throw new Error("Invalid base64 image: input is null, undefined, or not a string");
  }
  
  if (base64Image.length < 100) {
    throw new Error(`Invalid base64 image: too short (${base64Image.length} characters)`);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Analyze this food image and estimate the complete nutrition content. 

CRITICAL NUTRITION ACCURACY:
- Pure animal proteins (meat, fish, poultry, eggs) have ZERO carbs and ZERO fiber
- Smoked salmon, grilled chicken, beef, etc. = 0g carbs, 0g fiber
- Only add carbs if you see vegetables, fruits, grains, or processed foods
- Be extremely accurate with zero-carb foods

Return ONLY valid JSON in this format:
{
  "total_carbs_g": 25.5,
  "net_carbs_g": 20.0,
  "fiber_g": 5.5,
  "protein_g": 15.0,
  "fat_g": 10.0,
  "calories": 220,
  "items": [
    {
      "name": "Food item name",
      "carbs_g": 12.3,
      "net_carbs_g": 10.0,
      "fiber_g": 2.3,
      "protein_g": 8.0,
      "fat_g": 5.0,
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

  console.log('🌐 Sending request to Gemini API...');
  
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (fetchError: any) {
    console.error('❌ Network error calling Gemini:', fetchError);
    throw new Error(`Network error: ${fetchError?.message || 'Unknown network error'}`);
  }

  console.log('📡 Gemini API response status:', res.status);

  if (!res.ok) {
    const err = await res.text();
    console.error('❌ Gemini API error response:', err);
    
    if (err.includes('base64') || err.includes('Base64') || err.includes('INVALID_ARGUMENT')) {
      throw new Error(`Invalid image format: ${err}`);
    }
    
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  
  console.log('📋 Raw AI response text:', jsonText);
  
  try {
    const parsed = JSON.parse(jsonText);
    console.log('📋 Parsed AI response:', parsed);
    
    // Ensure all required fields exist with fallbacks
    const result = {
      total_carbs_g: Number(parsed.total_carbs_g) || 0,
      net_carbs_g: Number(parsed.net_carbs_g) || Number(parsed.total_carbs_g) || 0,
      fiber_g: Number(parsed.fiber_g) || 0,
      protein_g: Number(parsed.protein_g) || 0,
      fat_g: Number(parsed.fat_g) || 0,
      calories: Number(parsed.calories) || 0,
      items: parsed.items || [],
      notes: parsed.notes || 'Analysis complete'
    };
    
    console.log('📋 Sanitized result:', result);
    return result as MealNutrition;
  } catch (parseError) {
    console.error('❌ JSON parsing failed:', parseError);
    console.error('❌ Raw text was:', jsonText);
    throw new Error(`Failed to parse AI response: ${parseError}`);
  }
}

export async function generateSnapCarbRecipe(query: string, maxCarbs: number = 20): Promise<SnapCarbRecipe> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a world-class chef and nutritionist specializing in the SnapCarb diet. Create a DELICIOUS, unique recipe for: "${query}"

CRITICAL RECIPE NAMING RULES:
1. The recipe title MUST include the main ingredients/concepts from the request: "${query}"
2. You can ADD SnapCarb-friendly descriptors (like "Keto", "Low-Carb", "SnapCarb") but NEVER remove the core words
3. Examples: "Almond Spinach Cake" → "Keto Almond Spinach Cake" or "SnapCarb Almond Spinach Cake" 
4. Never completely rename the dish - if they want "Beef Stroganoff", don't call it "Cauliflower Beef Bowl"
5. Avoid using quotation marks in the title or description fields to prevent JSON parsing errors

SNAP CARB DIET RULES - These ingredients are NOT allowed:
- Grains (wheat, rice, corn, oats, barley, rye)
- Sugar (white sugar, brown sugar, honey, maple syrup, agave)
- High-carb vegetables (potatoes, sweet potatoes, carrots, beets)
- Legumes (beans, lentils, chickpeas, peanuts)
- Most fruits (except berries in moderation)
- Processed foods with added sugars
- Regular chocolate chips (contain sugar)

These ingredients ARE allowed:
- Meat, fish, eggs
- Low-carb vegetables (leafy greens, broccoli, cauliflower, zucchini)
- Nuts and seeds (almonds, walnuts, chia seeds)
- Full-fat dairy (cheese, butter, cream)
- Berries (strawberries, blueberries, raspberries) in moderation
- Healthy fats (olive oil, coconut oil, avocado)
- Sugar-free sweeteners (stevia, erythritol, monk fruit)
- Sugar-free chocolate chips (sweetened with stevia/erythritol)

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

COOKING INSTRUCTIONS MUST:
- Always specify proper cooking methods (grill, bake, sauté, etc.)
- Include cooking temperatures and times where appropriate
- Never suggest eating raw meat, poultry, or eggs
- Ensure all proteins are fully cooked for food safety

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

FOOD SAFETY & CONSISTENCY CHECK - Before finalizing the recipe:
1. NEVER suggest raw meat, poultry, or eggs - all proteins must be cooked properly
2. If ANY ingredient has "isAllowed": false, this is NOT a SnapCarb-compliant recipe
3. Only mark ingredients as "isAllowed": true if they are explicitly in the allowed list
4. Be consistent: don't contradict yourself within the same recipe
5. Sugar-free alternatives (stevia, erythritol, sugar-free chocolate chips) are ALLOWED

COOKING SAFETY:
- Chicken must be cooked to 165°F (74°C)
- Beef/lamb can be cooked to preference but never served raw
- Pork must be cooked to 145°F (63°C)
- Fish must be cooked unless specifically sushi-grade

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
      // Fix common JSON issues before parsing
      let cleanedJson = jsonText;
      
      // Fix unescaped quotes in titles and descriptions
      cleanedJson = cleanedJson.replace(/"title":\s*"([^"]*)"([^"]*)"([^"]*)"/, '"title": "$1\\"$2\\"$3"');
      cleanedJson = cleanedJson.replace(/"description":\s*"([^"]*)"([^"]*)"([^"]*)"/, '"description": "$1\\"$2\\"$3"');
      
      console.log('🔧 Cleaned JSON for parsing');
      recipe = JSON.parse(cleanedJson) as SnapCarbRecipe;
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

// Enhanced function for SnapCarb specific analysis (USDA disabled for speed)
export async function analyzeMealForSnapCarb(base64Image: string): Promise<{
  nutrition: {
    total_carbs_g: number;
    net_carbs_g: number;
    fiber_g: number;
    protein_g: number;
    fat_g: number;
    calories: number;
    items: {
      name: string;
      carbs_g: number;
      net_carbs_g: number;
      fiber_g: number;
      protein_g: number;
      portion_description: string;
      confidence: number;
      usda_verified: boolean;
    }[];
    notes?: string;
  };
  compliance: {
    score: number; // 1-10
    isCompliant: boolean;
    warnings: string[];
    recommendations: string[];
  };
}> {
  console.log('🔬 Starting fast meal analysis (USDA disabled)...');
  
  // Get AI identification and nutrition - fast and accurate enough!
  const aiNutrition = await estimateCarbsFromImage(base64Image);
  console.log('🤖 AI analyzed meal:', aiNutrition);
  console.log('🤖 AI nutrition items:', aiNutrition.items);
  
  // Use AI nutrition directly - skip slow USDA lookups!
  
  // Use AI nutrition directly - fast and good enough!
  const enhancedItems = aiNutrition.items.map(item => ({
    name: item.name || 'Unknown food',
    carbs_g: item.carbs_g || 0,
    net_carbs_g: (item as any).net_carbs_g || item.carbs_g || 0,
    fiber_g: (item as any).fiber_g || 0,
    protein_g: (item as any).protein_g || 0,
    portion_description: item.portion_description || 'Unknown portion',
    confidence: item.confidence || 0.5,
    usda_verified: false // All AI estimates for speed
  }));
  
  // Use AI totals directly with robust fallbacks
  const totalCarbs = Number(aiNutrition.total_carbs_g) || 0;
  const totalNetCarbs = Number((aiNutrition as any).net_carbs_g) || Number(aiNutrition.total_carbs_g) || 0;
  const totalFiber = Number((aiNutrition as any).fiber_g) || 0;
  const totalProtein = Number((aiNutrition as any).protein_g) || 0;
  const totalFat = Number((aiNutrition as any).fat_g) || 0;
  const totalCalories = Number((aiNutrition as any).calories) || 0;
  
  console.log('🔢 Parsed nutrition values:', {
    totalCarbs,
    totalNetCarbs,
    totalFiber,
    totalProtein,
    totalFat,
    totalCalories
  });
  
  // Step 3: Calculate compliance based on REAL net carbs
  const score = Math.max(1, Math.min(10, 10 - (totalNetCarbs / 5)));
  const isCompliant = totalNetCarbs <= 20;
  
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
  // Check for unverified items
  const unverifiedItems = enhancedItems.filter(item => !item.usda_verified);
  if (unverifiedItems.length > 0) {
    warnings.push(`Could not verify ${unverifiedItems.length} ingredient(s) in USDA database - estimates may be less accurate`);
  }
  
  if (totalNetCarbs > 20) {
    warnings.push(`High net carb content: ${(totalNetCarbs || 0).toFixed(1)}g (limit: 20g)`);
    recommendations.push('Consider reducing portion size or choosing lower-carb alternatives');
  }
  
  if (totalNetCarbs > 50) {
    warnings.push('Very high net carb content - not SnapCarb compliant');
    recommendations.push('This meal significantly exceeds SnapCarb guidelines');
  }
  
  console.log('✅ Enhanced analysis complete:', {
    totalNetCarbs: (totalNetCarbs || 0).toFixed(1),
    totalFiber: (totalFiber || 0).toFixed(1),
    verifiedItems: enhancedItems.filter(i => i.usda_verified).length,
    totalItems: enhancedItems.length
  });
    
    return {
    nutrition: {
      total_carbs_g: totalCarbs,
      net_carbs_g: totalNetCarbs,
      fiber_g: totalFiber,
      protein_g: totalProtein,
      fat_g: totalFat,
      calories: totalCalories,
      items: enhancedItems,
      notes: aiNutrition.notes
    },
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
