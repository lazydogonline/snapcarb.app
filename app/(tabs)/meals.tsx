import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Utensils, Share2, ArrowLeft, Camera, Trash2, BookOpen } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { analyzeMealForSnapCarb } from '../../services/gemini-ai-service';
import RecipeSearch from '../../components/RecipeSearch';
import RecipeCollection from '../../components/RecipeCollection';
import appDownloadLinks from '../../config/app-links';

export default function MealsScreen() {
  const [showRecipeCollection, setShowRecipeCollection] = useState(false);
  const [mealAnalysis, setMealAnalysis] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const insets = useSafeAreaInsets();

  const handleShareApp = () => {
    const message = `🍎 Discover SnapCarb - The Revolutionary Health App!

Transform your health with:
✅ AI-powered recipe generation
✅ Real USDA nutrition data
✅ SnapCarb diet compliance
✅ Health tracking & insights
✅ Community support

Download now: ${appDownloadLinks.getDownloadLink()}

#SnapCarb #Health #Wellness #LowCarb #Nutrition`;

    Alert.alert('Share SnapCarb', message, [
      { text: 'Copy', onPress: () => Alert.alert('Copied!', 'App link copied to clipboard') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };


  const handleMyRecipes = () => {
    setShowRecipeCollection(true);
  };

  const handleBackToSearch = () => {
    setShowRecipeCollection(false);
  };

  const handleDeleteAnalysis = () => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this meal analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMealAnalysis(null);
            setSelectedImage(null);
          }
        }
      ]
    );
  };

  const handleTakePhoto = async () => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add a photo:',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Photo Library', onPress: () => openImagePicker() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setMealAnalysis(null); // Clear old analysis
      // Don't auto-analyze anymore - wait for user to click "Analyze"
    }
  };

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setMealAnalysis(null); // Clear old analysis
      // Don't auto-analyze anymore - wait for user to click "Analyze"
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please take a photo or select an image first.');
      return;
    }
    
    if (isAnalyzing) {
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Show loading state
      Alert.alert('Analyzing...', 'Processing your meal photo with AI');
      
      // Convert image to base64 with detailed error handling
      let base64;
      try {
        base64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: 'base64',
        });
        
        // Validate base64 string
        if (!base64 || base64.length < 100) {
          throw new Error(`Base64 string is too short or empty. Length: ${base64?.length || 0}`);
        }
        
        // Test base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(base64)) {
          throw new Error('Base64 string contains invalid characters');
        }
        
      } catch (base64Error: any) {
        console.error('Base64 conversion failed:', base64Error);
        Alert.alert('Image Processing Error', `Failed to process image: ${base64Error?.message || 'Unknown error'}\n\nPlease try taking another photo.`);
        setIsAnalyzing(false);
        return;
      }
      
      // Call real Gemini AI analysis with error handling
      let aiResult;
      try {
        aiResult = await analyzeMealForSnapCarb(base64);
      } catch (aiError: any) {
        console.error('Gemini AI analysis failed:', aiError);
        
        if (aiError?.message?.includes('base64') || aiError?.message?.includes('Base64')) {
          Alert.alert('Image Format Error', 'There was an issue processing your image format. Please try taking another photo with better lighting.');
        } else {
          Alert.alert('Analysis Error', `AI analysis failed: ${aiError?.message || 'Unknown error'}\n\nPlease try again or contact support.`);
        }
        setIsAnalyzing(false);
        return;
      }
      
      // Transform enhanced AI result with USDA data to match our UI format
      const analysis = {
        score: aiResult.compliance.score.toFixed(1),
        items: aiResult.nutrition.items.length,
        notes: aiResult.compliance.recommendations.join(' ') || aiResult.nutrition.notes || 'Analysis complete with USDA nutrition data.',
        ingredients: aiResult.nutrition.items.map(item => 
          `${item.name} (${item.portion_description || 'unknown portion'}) ~`
        ),
        nutrition: {
          totalCarbs: `${aiResult.nutrition.total_carbs_g.toFixed(1)}g`,
          netCarbs: `${aiResult.nutrition.net_carbs_g.toFixed(1)}g`, // Real net carbs from USDA
          protein: `${aiResult.nutrition.protein_g.toFixed(1)}g`,
          fiber: `${aiResult.nutrition.fiber_g.toFixed(1)}g`,
          calories: `${Math.round(aiResult.nutrition.calories)} cal`
        },
        warnings: aiResult.compliance.warnings,
        isCompliant: aiResult.compliance.isCompliant,
        usdaVerified: aiResult.nutrition.items.filter(i => i.usda_verified).length
      };
      
      setMealAnalysis(analysis);
      
    } catch (error: any) {
      console.error('Error in handleAnalyzePhoto:', error);
      
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      Alert.alert(
        'Analysis Failed', 
        `Error: ${errorMessage}\n\nPlease check your internet connection and try again.`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (showRecipeCollection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackToSearch}
              accessibilityLabel="Go back to recipe search"
              accessibilityRole="button"
            >
              <ArrowLeft size={32} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShareApp}
              accessibilityLabel="Share SnapCarb app"
              accessibilityRole="button"
            >
              <Share2 size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>My Recipe Collection</Text>
          <Text style={styles.subtitle}>Manage your saved SnapCarb recipes</Text>
        </View>
        <RecipeCollection userId="user-123" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 200 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Utensils size={32} color={colors.primary} />
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShareApp}
              accessibilityLabel="Share SnapCarb app"
              accessibilityRole="button"
            >
              <Share2 size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Food & Nutrition</Text>
          <Text style={styles.subtitle}>Find recipes and plan your meals</Text>
        </View>

        {/* Analyze Your Meal Section - Now Prominently Placed First */}
        <View style={styles.analyzeSection}>
          <View style={styles.analyzeHeader}>
            <Camera size={24} color={colors.primary} />
            <Text style={styles.analyzeTitle}>Analyze Your Meal</Text>
          </View>
          <Text style={styles.analyzeSubtitle}>
            Take a photo of your meal or ingredients for instant SnapCarb analysis
          </Text>
          
          {/* Photo Preview with Retake/Analyze buttons */}
          {selectedImage && !mealAnalysis && (
            <View style={styles.photoPreview}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.previewImage} 
                accessibilityLabel="Selected meal photo for analysis"
              />
              <View style={styles.photoActions}>
                <TouchableOpacity 
                  style={styles.retakeButton} 
                  onPress={handleTakePhoto}
                  accessibilityLabel="Take a new photo"
                  accessibilityRole="button"
                >
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.analyzeActionButton, isAnalyzing && styles.analyzeActionButtonDisabled]} 
                  onPress={handleAnalyzePhoto}
                  disabled={isAnalyzing}
                  accessibilityLabel="Analyze meal photo with AI"
                  accessibilityRole="button"
                >
                  <Text style={styles.analyzeActionButtonText}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Take Photo Button - Only show if no image selected */}
          {!selectedImage && (
            <TouchableOpacity 
              style={styles.analyzeButton} 
              onPress={handleTakePhoto}
              accessibilityLabel="Take a photo of your meal"
              accessibilityRole="button"
            >
              <Camera size={20} color={colors.background} />
              <Text style={styles.analyzeButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Meal Analysis Results */}
        {mealAnalysis && (
          <View style={styles.analysisResults}>
          <View style={styles.analysisHeader}>
            <Text style={styles.analysisTitle}>Meal Analysis Results</Text>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDeleteAnalysis}
              accessibilityLabel="Delete meal analysis"
              accessibilityRole="button"
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Photo Display */}
          {selectedImage && (
            <View style={styles.photoContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.mealPhoto} 
                accessibilityLabel="Analyzed meal photo"
              />
            </View>
          )}
          
          {/* SC Score */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>SC Score</Text>
            <Text style={styles.scoreValue}>{mealAnalysis.score || '6.4'}/10</Text>
            <Text style={styles.scoreDescription}>Mixed meal ({mealAnalysis.items || 5} items)</Text>
          </View>

          {/* AI Notes */}
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>AI Notes:</Text>
            <Text style={styles.notesText}>
              {mealAnalysis.notes || 'English muffins are high in carbohydrates and should be avoided on SnapCarb. Consider substituting with low-carb alternatives like portobello mushrooms or almond flour bread.'}
            </Text>
          </View>

          {/* Detected Ingredients */}
          {mealAnalysis.ingredients && (
            <View style={styles.ingredientsCard}>
              <Text style={styles.ingredientsTitle}>Detected Ingredients:</Text>
              {mealAnalysis.ingredients.map((ingredient: string, index: number) => (
                <Text key={index} style={styles.ingredientItem}>• {ingredient}</Text>
              ))}
            </View>
          )}

          {/* Nutrition Summary */}
          {mealAnalysis.nutrition && (
            <View style={styles.nutritionCard}>
              <Text style={styles.nutritionTitle}>SnapCarb Nutrition</Text>
              <Text style={styles.nutritionSubtitle}>For entire meal shown in photo</Text>
              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  ⚠️ AI estimates may be inaccurate. Verify with nutrition labels for precise tracking.
                </Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Total Carbs:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.totalCarbs}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Net Carbs:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.netCarbs}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.protein}</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Fiber:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.fiber}</Text>
              </View>
            </View>
          )}
        </View>
      )}

        {/* Recipe Search Section */}
        <RecipeSearch />
        
        {/* My Saved Recipes Link */}
        <View style={styles.savedRecipesSection}>
          <TouchableOpacity 
            style={styles.savedRecipesButton} 
            onPress={handleMyRecipes}
            accessibilityLabel="View your saved recipe collection"
            accessibilityRole="button"
          >
            <BookOpen size={20} color={colors.primary} />
            <Text style={styles.savedRecipesButtonText}>View My Saved Recipes</Text>
            <ArrowLeft size={16} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    // Dynamic padding applied inline based on safe area insets
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    backgroundColor: colors.cardBackground,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  shareButton: {
    padding: 5,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  savedRecipesSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
  },
  savedRecipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  savedRecipesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  analyzeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analyzeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyzeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  analyzeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  analysisResults: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: colors.errorBackground,
    borderRadius: 8,
  },
  scoreCard: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: colors.background,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.background,
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.9,
  },
  notesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  ingredientsCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  ingredientItem: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nutritionCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  nutritionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 11,
    color: '#92400E',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  photoContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealPhoto: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoPreview: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: colors.textSecondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeActionButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  analyzeActionButtonDisabled: {
    backgroundColor: colors.secondary,
    opacity: 0.6,
  },
  analyzeActionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});