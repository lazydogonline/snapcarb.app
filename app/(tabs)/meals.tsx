import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Utensils, Share2, BookOpen, ArrowLeft, Camera, Trash2 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { analyzeMealForSnapCarb } from '../../services/gemini-ai-service';
import RecipeSearch from '../../components/RecipeSearch';
import RecipeCollection from '../../components/RecipeCollection';
import appDownloadLinks from '../../config/app-links';

export default function MealsScreen() {
  const [showRecipeCollection, setShowRecipeCollection] = useState(false);
  const [mealAnalysis, setMealAnalysis] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    if (!selectedImage) return;
    
    try {
      // Show loading state
      Alert.alert('Analyzing...', 'Processing your meal photo with AI');
      
      console.log('🔍 Starting AI analysis...');
      console.log('📸 Image path:', selectedImage);
      
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      console.log('📦 Base64 length:', base64.length);
      console.log('🤖 Calling Gemini AI...');
      
      // Call real Gemini AI analysis
      const aiResult = await analyzeMealForSnapCarb(base64);
      
      console.log('✅ AI Result:', aiResult);
      
      // Transform AI result to match our UI format
      const analysis = {
        score: aiResult.compliance.score.toFixed(1),
        items: aiResult.nutrition.items.length,
        notes: aiResult.compliance.recommendations.join(' ') || aiResult.nutrition.notes || 'Analysis complete.',
        ingredients: aiResult.nutrition.items.map(item => item.name),
        nutrition: {
          totalCarbs: `${aiResult.nutrition.total_carbs_g.toFixed(1)}g`,
          netCarbs: `${aiResult.nutrition.total_carbs_g.toFixed(1)}g`, // Using total as net for now
          protein: 'Calculating...' // AI doesn't return protein yet
        },
        warnings: aiResult.compliance.warnings,
        isCompliant: aiResult.compliance.isCompliant
      };
      
      setMealAnalysis(analysis);
      
    } catch (error) {
      console.error('AI Analysis Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Analysis Failed', `Error: ${errorMessage}\n\nPlease check your internet connection and try again.`);
    }
  };

  if (showRecipeCollection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToSearch}>
              <ArrowLeft size={32} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Utensils size={32} color={colors.primary} />
            <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
              <Share2 size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Food & Nutrition</Text>
          <Text style={styles.subtitle}>Find recipes and plan your meals</Text>
        </View>

        {/* Recipe Search Section - Now First */}
        <RecipeSearch />
        
        {/* Recipe Collection */}
        <RecipeCollection />

        {/* My Recipes Button */}
        <View style={styles.myRecipesSection}>
          <TouchableOpacity style={styles.myRecipesButton} onPress={handleMyRecipes}>
            <BookOpen size={20} color={colors.background} />
            <Text style={styles.myRecipesButtonText}>My Recipe Collection</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze Your Meal Section - Now After Recipes */}
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
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.retakeButton} onPress={handleTakePhoto}>
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.analyzeActionButton} onPress={handleAnalyzePhoto}>
                  <Text style={styles.analyzeActionButtonText}>Analyze</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          {/* Take Photo Button - Only show if no image selected */}
          {!selectedImage && (
            <TouchableOpacity style={styles.analyzeButton} onPress={handleTakePhoto}>
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
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAnalysis}>
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          </View>

          {/* Photo Display */}
          {selectedImage && (
            <View style={styles.photoContainer}>
              <Image source={{ uri: selectedImage }} style={styles.mealPhoto} />
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
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Total Carbs:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.totalCarbs}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Net Carbs:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.netCarbs}g</Text>
              </View>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Protein:</Text>
                <Text style={styles.nutritionValue}>{mealAnalysis.nutrition.protein}g</Text>
              </View>
            </View>
          )}
        </View>
      )}
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
    paddingBottom: 100, // Extra space for tab bar
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
  myRecipesSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  myRecipesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myRecipesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  content: {
    flex: 1,
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
    marginBottom: 12,
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
  analyzeActionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});