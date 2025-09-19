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
    setSaving(true);
    try {
      await RecipeService.saveRecipe(recipeToSave);
      Alert.alert(
        '✅ Recipe Saved!', 
        `"${recipeToSave.title}" has been added to your collection.\n\nFind it in "My Recipe Collection" below.`,
        [{ text: 'Great!', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('❌ Save Failed', 'Could not save recipe. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleShareRecipe = (recipeToShare: SnapCarbRecipe) => {
    const shareText = `🔥 Amazing SnapCarb Recipe from the SnapCarb App!

${recipeToShare.title}
${recipeToShare.description}

🤖 AI-Generated • Only ${recipeToShare.netCarbs}g Net Carbs!

Ingredients:
${recipeToShare.ingredients.map(ing => `• ${ing.amount} ${ing.name}`).join('\n')}

Instructions:
${recipeToShare.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

📊 Nutrition (per serving):
• ${recipeToShare.nutrition.netCarbs}g Net Carbs
• ${recipeToShare.nutrition.protein}g Protein
• ${recipeToShare.nutrition.fat}g Fat
• ${recipeToShare.nutrition.fiber}g Fiber

📱 Get the SnapCarb App for instant AI recipe generation:
${appDownloadLinks.web.website}

#SnapCarb #LowCarb #KetoRecipes #HealthyEating #AIChef`;
    
    // Show comprehensive sharing options
    Alert.alert(
      'Share Recipe',
      'Choose how you want to share this recipe:',
      [
        { text: 'Native Share', onPress: () => {
          if (navigator.share) {
            navigator.share({ title: recipeToShare.title, text: shareText });
          } else {
            navigator.clipboard.writeText(shareText);
            Alert.alert('Recipe Copied!', 'Recipe has been copied to your clipboard.');
          }
        }},
        { text: 'Facebook', onPress: () => handleSocialShare(recipeToShare, 'facebook') },
        { text: 'X (Twitter)', onPress: () => handleSocialShare(recipeToShare, 'twitter') },
        { text: 'WhatsApp', onPress: () => handleSocialShare(recipeToShare, 'whatsapp') },
        { text: 'Instagram', onPress: () => handleSocialShare(recipeToShare, 'instagram') },
        { text: 'Pinterest', onPress: () => handleSocialShare(recipeToShare, 'pinterest') },
        { text: 'Telegram', onPress: () => handleSocialShare(recipeToShare, 'telegram') },
        { text: 'LinkedIn', onPress: () => handleSocialShare(recipeToShare, 'linkedin') },
        { text: 'Reddit', onPress: () => handleSocialShare(recipeToShare, 'reddit') },
        { text: 'Discord', onPress: () => handleSocialShare(recipeToShare, 'discord') },
        { text: 'Email', onPress: () => handleSocialShare(recipeToShare, 'email') },
        { text: 'SMS', onPress: () => handleSocialShare(recipeToShare, 'sms') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSocialShare = (recipe: SnapCarbRecipe, platform: string) => {
    const message = `Check out this amazing SnapCarb recipe: ${recipe.title}! 🍎\n\n${recipe.description}\n\nNet Carbs: ${recipe.netCarbs}g per serving\n\nGet the full recipe and more at SnapCarb.app`;
    
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://snapcarb.app')}&quote=${encodeURIComponent(message)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent('https://snapcarb.app')}`;
        break;
      case 'whatsapp':
        url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        Alert.alert('Instagram Share', 'Recipe details copied to clipboard! Paste them in your Instagram story or post.', [
          { text: 'OK', onPress: () => navigator.clipboard.writeText(message) }
        ]);
        return;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent('https://snapcarb.app')}&description=${encodeURIComponent(message)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent('https://snapcarb.app')}&text=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://snapcarb.app')}&summary=${encodeURIComponent(message)}`;
        break;
      case 'reddit':
        url = `https://reddit.com/submit?url=${encodeURIComponent('https://snapcarb.app')}&title=${encodeURIComponent(recipe.title)}&text=${encodeURIComponent(message)}`;
        break;
      case 'discord':
        Alert.alert('Discord Share', 'Recipe details copied to clipboard! Paste them in your Discord chat.', [
          { text: 'OK', onPress: () => navigator.clipboard.writeText(message) }
        ]);
        return;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Amazing SnapCarb Recipe: ${recipe.title}`)}&body=${encodeURIComponent(message)}`;
        break;
      case 'sms':
        url = `sms:?body=${encodeURIComponent(message)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank');
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
      
      // Now check for forbidden ingredients (but exclude sugar-free items)
      const hasForbiddenSugar = name.includes('sugar') && !name.includes('sugar-free');
      
      return name.includes('wheat') || name.includes('rice') || name.includes('corn') || 
             name.includes('oats') || name.includes('barley') || name.includes('rye') ||
             hasForbiddenSugar || name.includes('honey') || name.includes('maple') ||
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
            onSubmitEditing={() => handleSearch()}
          />
          <TouchableOpacity 
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={() => handleSearch()}
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
          
          {/* Save Button - Prominent Position */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={() => handleSaveRecipe(recipe)}
            disabled={saving}
          >
            <BookOpen size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Recipe'}
            </Text>
          </TouchableOpacity>
          
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
          <RecipeCard recipe={recipe} />

          {/* Streamlined Action Bar */}
          <View style={styles.streamlinedActions}>
            <TouchableOpacity 
              style={[styles.primaryActionButton, saving && styles.primaryActionButtonDisabled]} 
              onPress={() => handleSaveRecipe(recipe)}
              disabled={saving}
            >
              <BookOpen size={20} color={colors.background} />
              <Text style={styles.primaryActionButtonText}>
                {saving ? 'Saving...' : 'Save Recipe'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.secondaryActionButton} onPress={() => handleShareRecipe(recipe)}>
                <Share2 size={18} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryActionButton} onPress={handleQuickCopy}>
                <Copy size={18} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryActionButton} onPress={handlePrint}>
                <Printer size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981', // Bright green
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    marginTop: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  streamlinedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryActionButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.6,
  },
  primaryActionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});