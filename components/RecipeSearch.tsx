import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Share, Clipboard } from 'react-native';
import { Search, BookOpen, Share2, Printer, Copy } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { RecipeService } from '../services/recipe-service';
import { SnapCarbRecipe } from '../services/recipe-service';
import RecipeCard from './RecipeCard';
import appDownloadLinks from '../config/app-links';

interface RecipeSearchProps {
  initialQuery?: string;
}

export default function RecipeSearch({ initialQuery = '' }: RecipeSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [recipe, setRecipe] = useState<SnapCarbRecipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSearch = async (retryCount = 0) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      console.log(`🔍 Searching for recipe: "${query.trim()}" (attempt ${retryCount + 1})`);
      const result = await RecipeService.searchRecipe({ query: query.trim() });
      setRecipe(result);
      console.log('✅ Recipe generated successfully');
    } catch (error) {
      console.error('❌ Recipe search error:', error);
      
      // If it's an API key error and we haven't retried, try once more
      if (error instanceof Error && error.message.includes('API key') && retryCount === 0) {
        console.log('🔄 Retrying due to API key error...');
        setTimeout(() => handleSearch(1), 2000);
        return;
      }
      
      setError(error instanceof Error ? error.message : 'Failed to generate recipe');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when component mounts with initial query
  useEffect(() => {
    if (initialQuery.trim()) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleSave = async () => {
    if (!recipe) return;
    
    try {
      setSaving(true);
      await RecipeService.saveRecipe(recipe);
      Alert.alert('Success!', 'Recipe saved to your collection');
      setSaving(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
      setSaving(false);
    }
  };

  const handleSaveRecipe = async (recipeToSave: SnapCarbRecipe) => {
    try {
      await RecipeService.saveRecipe(recipeToSave);
      Alert.alert('Saved!', 'Recipe saved to your collection');
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const handleShareRecipe = (recipeToShare: SnapCarbRecipe) => {
    const shareText = `${recipeToShare.title}\n\n${recipeToShare.description}\n\nIngredients:\n${recipeToShare.ingredients.map(ing => `• ${ing.amount} ${ing.name}`).join('\n')}\n\nInstructions:\n${recipeToShare.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}\n\nNutrition (per serving):\n• ${recipeToShare.nutrition.netCarbs}g Net Carbs\n• ${recipeToShare.nutrition.protein}g Protein\n• ${recipeToShare.nutrition.fat}g Fat\n• ${recipeToShare.nutrition.fiber}g Fiber`;
    
    if (navigator.share) {
      navigator.share({
        title: recipeToShare.title,
        text: shareText,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      Alert.alert('Recipe Copied!', 'Recipe has been copied to your clipboard.');
    }
  };

  // Add Jessie Inchauspé food order recommendations
  const getFoodOrderRecommendation = (recipe: SnapCarbRecipe) => {
    const hasVeggies = recipe.ingredients.some(ingredient => 
      ingredient.name.toLowerCase().includes('vegetable') ||
      ingredient.name.toLowerCase().includes('salad') ||
      ingredient.name.toLowerCase().includes('greens') ||
      ingredient.name.toLowerCase().includes('broccoli') ||
      ingredient.name.toLowerCase().includes('cauliflower') ||
      ingredient.name.toLowerCase().includes('spinach') ||
      ingredient.name.toLowerCase().includes('kale') ||
      ingredient.name.toLowerCase().includes('zucchini') ||
      ingredient.name.toLowerCase().includes('asparagus')
    );

    const hasProtein = recipe.ingredients.some(ingredient =>
      ingredient.name.toLowerCase().includes('chicken') ||
      ingredient.name.toLowerCase().includes('beef') ||
      ingredient.name.toLowerCase().includes('pork') ||
      ingredient.name.toLowerCase().includes('fish') ||
      ingredient.name.toLowerCase().includes('eggs') ||
      ingredient.name.toLowerCase().includes('cheese') ||
      ingredient.name.toLowerCase().includes('yogurt')
    );

    const hasFats = recipe.ingredients.some(ingredient =>
      ingredient.name.toLowerCase().includes('olive oil') ||
      ingredient.name.toLowerCase().includes('butter') ||
      ingredient.name.toLowerCase().includes('avocado') ||
      ingredient.name.toLowerCase().includes('nuts') ||
      ingredient.name.toLowerCase().includes('seeds')
    );

    // Check for bad ingredients (SnapCarb forbidden foods)
    const badIngredients = recipe.ingredients.filter(ingredient => {
      const name = ingredient.name.toLowerCase();
      
      // First check for allowed ingredients (these are OK even if they contain forbidden keywords)
      const isAllowed = name.includes('almond flour') || name.includes('coconut flour') || 
                       name.includes('almond') || name.includes('coconut') ||
                       name.includes('stevia') || name.includes('erythritol') ||
                       name.includes('cauliflower') || name.includes('zucchini') ||
                       name.includes('shirataki') || name.includes('konjac');
      
      if (isAllowed) return false; // Skip allowed ingredients
      
      // Now check for forbidden ingredients
      return name.includes('wheat') || name.includes('rice') || name.includes('corn') || 
             name.includes('oats') || name.includes('barley') || name.includes('rye') ||
             name.includes('sugar') || name.includes('honey') || name.includes('maple') ||
             name.includes('potato') || name.includes('sweet potato') || name.includes('carrot') ||
             name.includes('beans') || name.includes('lentils') || name.includes('chickpeas') ||
             name.includes('bread') || name.includes('pasta') || 
             (name.includes('flour') && !name.includes('almond') && !name.includes('coconut')) ||
             name.includes('apple') || name.includes('banana') || name.includes('orange') ||
             name.includes('mango') || name.includes('pineapple') || name.includes('grapes');
    });

    let recommendation = '';
    let needsVeggieStarter = false;
    let badIngredientSubstitutions = '';

    // Check for bad ingredients first
    if (badIngredients.length > 0) {
      const substitutions = badIngredients.map(ingredient => {
        const name = ingredient.name.toLowerCase();
        if (name.includes('wheat') || name.includes('bread') || name.includes('flour')) {
          return `${ingredient.name} → Almond flour or coconut flour`;
        } else if (name.includes('rice')) {
          return `${ingredient.name} → Cauliflower rice`;
        } else if (name.includes('pasta')) {
          return `${ingredient.name} → Zucchini noodles or shirataki noodles`;
        } else if (name.includes('potato') || name.includes('sweet potato')) {
          return `${ingredient.name} → Cauliflower or turnips`;
        } else if (name.includes('sugar') || name.includes('honey') || name.includes('maple')) {
          return `${ingredient.name} → Stevia or erythritol`;
        } else if (name.includes('beans') || name.includes('lentils')) {
          return `${ingredient.name} → Mushrooms or nuts`;
        } else if (name.includes('apple') || name.includes('banana') || name.includes('orange')) {
          return `${ingredient.name} → Berries (in moderation)`;
        } else {
          return `${ingredient.name} → Low-carb alternative`;
        }
      }).join(', ');
      
      badIngredientSubstitutions = `🔄 **Substitute**: ${substitutions}`;
      recommendation = '❌ **SnapCarb Alert**: This recipe contains forbidden ingredients!';
    } else if (recipe.netCarbs / recipe.servings > 15) {
      const perServingCarbs = Math.round((recipe.netCarbs / recipe.servings) * 10) / 10;
      recommendation = `⚠️ **SnapCarb Alert**: This recipe has ${perServingCarbs}g net carbs per serving (exceeds 15g limit). Consider reducing portion size or choosing a lower-carb alternative.`;
    } else {
      // Jessie Inchauspé Food Order Recommendations
      if (!hasVeggies) {
        needsVeggieStarter = true;
        recommendation = '🥬 **Add a veggie starter** to reduce glucose spikes!';
      } else if (hasVeggies && hasProtein && hasFats) {
        recommendation = '✅ **Optimal Eating Order**: 1) Vegetables 2) Proteins/Fats 3) Any remaining ingredients';
      } else if (hasVeggies && !hasProtein) {
        recommendation = '🥬 **Veggie-First**: Great! Start with vegetables, then add protein if desired.';
      } else {
        recommendation = '💡 **Pro Tip**: Consider adding leafy greens to start your meal for better glucose control.';
      }
    }

    return { recommendation, needsVeggieStarter, badIngredientSubstitutions };
  };

  const getVeggieStarterSuggestions = () => {
    const starters = [
      '🥗 Simple green salad with olive oil and lemon',
      '🥦 Steamed broccoli with butter and sea salt',
      '🥑 Avocado slices with sea salt and black pepper',
      '🥒 Cucumber slices with apple cider vinegar',
      '🌿 Mixed greens with olive oil and herbs',
      '🍅 Cherry tomatoes with fresh basil',
      '🥬 Baby spinach with olive oil and garlic',
      '🥕 Carrot sticks with guacamole'
    ];
    return starters[Math.floor(Math.random() * starters.length)];
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    // Create a comprehensive share message with app download info
    const shareMessage = `🍽️ Check out this amazing SnapCarb recipe I just discovered!

${recipe.title}
${recipe.description}

⏱️ Prep: ${recipe.prepTime}min | 🍳 Cook: ${recipe.cookTime}min
🥗 Net Carbs: ${recipe.netCarbs}g | 🎯 SnapCarb Approved!

📱 Want to create your own AI-generated SnapCarb recipes?
Download the SnapCarb app and start your health journey today!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #HealthyEating #AICooking #LowCarb`;

    try {
      // Use React Native's Share API
      await Share.share({
        message: shareMessage,
        title: `SnapCarb Recipe: ${recipe.title}`,
      });
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to clipboard if share fails
      try {
        await Clipboard.setString(shareMessage);
        Alert.alert('Copied!', 'Recipe details copied to clipboard');
      } catch (clipboardError) {
        Alert.alert('Error', 'Failed to share recipe');
      }
    }
  };

  const handleQuickCopy = async () => {
    if (!recipe) return;
    
    try {
      const simpleRecipe = `${recipe.title}

${recipe.description}

Prep Time: ${recipe.prepTime} minutes
Cook Time: ${recipe.cookTime} minutes
Net Carbs: ${recipe.netCarbs}g
SnapCarb Approved!

INGREDIENTS:
${recipe.ingredients.map(ing => `• ${ing.name} (${ing.amount})`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Generated by SnapCarb AI
Download: ${appDownloadLinks.web.downloadPage}`;

      await Clipboard.setString(simpleRecipe);
      Alert.alert('Copied!', 'Recipe copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy recipe');
    }
  };

  const handlePrint = () => {
    if (!recipe) return;
    
    // Create a print-friendly recipe format
    const printContent = `
╔══════════════════════════════════════════════════════════════╗
║                    SNAP CARB RECIPE                          ║
║                                                              ║
║  ${recipe.title.toUpperCase().padEnd(50)}  ║
║                                                              ║
║  ${recipe.description.padEnd(50)}  ║
║                                                              ║
║  ⏱️  Prep Time: ${recipe.prepTime} minutes                    ║
║  🍳  Cook Time: ${recipe.cookTime} minutes                  ║
║  🥗  Net Carbs: ${recipe.netCarbs}g                         ║
║  🎯  SnapCarb Approved!                                     ║
║                                                              ║
║  INGREDIENTS:                                                ║
${recipe.ingredients.map(ing => `║  • ${ing.name} (${ing.amount})`).join('\n')}
║                                                              ║
║  INSTRUCTIONS:                                               ║
${recipe.instructions.map((step, i) => `║  ${i + 1}. ${step}`).join('\n')}
║                                                              ║
║  🤖  Generated by SnapCarb AI                               ║
║  🔗  Download: ${appDownloadLinks.web.downloadPage}         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;

    // Create a simple text version for clipboard
    const simpleRecipe = `${recipe.title}

${recipe.description}

Prep Time: ${recipe.prepTime} minutes
Cook Time: ${recipe.cookTime} minutes
Net Carbs: ${recipe.netCarbs}g
SnapCarb Approved!

INGREDIENTS:
${recipe.ingredients.map(ing => `• ${ing.name} (${ing.amount})`).join('\n')}

INSTRUCTIONS:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Generated by SnapCarb AI
Download: ${appDownloadLinks.web.downloadPage}`;

    // Show print options
    Alert.alert(
      'Print Recipe', 
      'Choose how you want to use this recipe!',
      [
        { text: 'Copy to Clipboard', onPress: async () => {
          try {
            await Clipboard.setString(simpleRecipe);
            Alert.alert('Copied!', 'Recipe copied to clipboard for printing');
          } catch (error) {
            Alert.alert('Error', 'Failed to copy recipe');
          }
        }},
        { text: 'View Print Preview', onPress: () => {
          Alert.alert('Print Preview', printContent, [
            { text: 'Copy Recipe', onPress: async () => {
              try {
                await Clipboard.setString(simpleRecipe);
                Alert.alert('Copied!', 'Recipe copied to clipboard');
              } catch (error) {
                Alert.alert('Error', 'Failed to copy recipe');
              }
            }},
            { text: 'Close', style: 'cancel' }
          ]);
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Find Your Perfect Recipe</Text>
        <Text style={styles.searchSubtitle}>
          Search for any dish and our AI will create a unique, SnapCarb-approved recipe just for you!
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for any dish..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Search size={20} color={colors.background} />
            <Text style={styles.searchButtonText}>
              {loading ? 'Creating...' : 'Find Recipe'}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHelpText}>
              💡 This might be a temporary API issue. Try again in a few minutes, or check if your Gemini API key needs renewal.
            </Text>
          </View>
        )}
      </View>

      {/* Recipe Display */}
      {recipe && (
        <View style={styles.recipeContainer}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
          
          {/* SnapCarb + Jessie Inchauspé Smart Recommendations */}
          <View style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>🧠 Smart Eating Recommendations</Text>
            
            {(() => {
              const { recommendation, needsVeggieStarter, badIngredientSubstitutions } = getFoodOrderRecommendation(recipe);
              return (
                <>
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                  
                  {badIngredientSubstitutions && (
                    <View style={styles.badIngredientContainer}>
                      <Text style={styles.badIngredientText}>{badIngredientSubstitutions}</Text>
                    </View>
                  )}
                  
                  {needsVeggieStarter && (
                    <View style={styles.veggieStarterContainer}>
                      <Text style={styles.veggieStarterTitle}>🥬 Suggested Veggie Starter:</Text>
                      <Text style={styles.veggieStarterText}>{getVeggieStarterSuggestions()}</Text>
                      <Text style={styles.veggieStarterTip}>
                        💡 Starting with vegetables can reduce glucose spikes by up to 75% (Jessie Inchauspé)
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.drDavisCompliance}>
                    <Text style={styles.complianceTitle}>🎯 SnapCarb Compliance:</Text>
                    <Text style={[
                      styles.complianceText, 
                      { color: (recipe.netCarbs / recipe.servings) <= 15 ? colors.success : colors.error }
                    ]}>
                      {(() => {
                        const perServingCarbs = Math.round((recipe.netCarbs / recipe.servings) * 10) / 10;
                        return (recipe.netCarbs / recipe.servings) <= 15 
                          ? `✅ ${perServingCarbs}g net carbs per serving (within 15g limit)` 
                          : `❌ ${perServingCarbs}g net carbs per serving (exceeds 15g limit)`;
                      })()}
                    </Text>
                    <Text style={styles.complianceSubtext}>
                      Net Carbs = Total Carbs - Fiber
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>

          {/* Recipe Card Display */}
          <RecipeCard 
            recipe={recipe} 
            onSave={() => handleSaveRecipe(recipe)}
            onShare={() => handleShareRecipe(recipe)}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <BookOpen size={20} color={colors.background} />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color={colors.background} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleQuickCopy}>
              <Copy size={20} color={colors.background} />
              <Text style={styles.actionButtonText}>Copy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
              <Printer size={20} color={colors.background} />
              <Text style={styles.actionButtonText}>Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchSection: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  searchButtonDisabled: {
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorHelpText: {
    fontSize: 12,
    color: '#7F1D1D',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recipeContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recipeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  recommendationsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  veggieStarterContainer: {
    backgroundColor: '#E0F2F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  veggieStarterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  veggieStarterText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  veggieStarterTip: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  badIngredientContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  badIngredientText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
    fontWeight: '500',
  },
  drDavisCompliance: {
    backgroundColor: '#F0F9EB',
    borderRadius: 12,
    padding: 12,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  complianceText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  complianceSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '48%',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});