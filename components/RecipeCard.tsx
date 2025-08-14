import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Users, Target, CheckCircle, XCircle, AlertCircle, Share2, Bookmark, Printer, Lightbulb, Heart, Leaf, Brain, Shield, Zap } from 'lucide-react-native';
import { SnapCarbRecipe } from '@/services/recipe-service';

interface RecipeCardProps {
  recipe: SnapCarbRecipe;
  onSave?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
}

const { width } = Dimensions.get('window');

export default function RecipeCard({ recipe, onSave, onShare, onPrint }: RecipeCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.header}
      >
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
        
        {/* Recipe Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Clock size={16} color="#9CA3AF" />
            <Text style={styles.statText}>{formatTime(recipe.prepTime)} prep</Text>
          </View>
          <View style={styles.stat}>
            <Clock size={16} color="#9CA3AF" />
            <Text style={styles.statText}>{formatTime(recipe.cookTime)} cook</Text>
          </View>
          <View style={styles.stat}>
            <Users size={16} color="#9CA3AF" />
            <Text style={styles.statText}>{recipe.servings} servings</Text>
          </View>
        </View>

        {/* Difficulty Badge */}
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(recipe.difficulty) }]}>
          <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
        </View>

        {/* Net Carbs Highlight */}
        <View style={styles.carbsHighlight}>
          <Target size={20} color="#10B981" />
          <Text style={styles.carbsText}>{recipe.netCarbs}g net carbs</Text>
        </View>
      </LinearGradient>

      {/* Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientRow}>
            <View style={styles.ingredientInfo}>
              {ingredient.isAllowed ? (
                <CheckCircle size={20} color="#10B981" />
              ) : (
                <XCircle size={20} color="#EF4444" />
              )}
              <View style={styles.ingredientDetails}>
                <Text style={[
                  styles.ingredientName,
                  !ingredient.isAllowed && styles.restrictedIngredient
                ]}>
                  {ingredient.name}
                </Text>
                <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
                <Text style={styles.carbsInfo}>
                  {ingredient.net_carbs_g}g net carbs • {ingredient.fiber_g}g fiber
                </Text>
              </View>
            </View>
            
            {!ingredient.isAllowed && ingredient.swapSuggestion && (
              <View style={styles.swapContainer}>
                <AlertCircle size={16} color="#F59E0B" />
                <Text style={styles.swapText}>{ingredient.swapSuggestion}</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionStep}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>

      {/* Nutrition Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.fiber}g</Text>
            <Text style={styles.nutritionLabel}>Fiber</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutrition.netCarbs}g</Text>
            <Text style={styles.nutritionLabel}>Net Carbs</Text>
          </View>
        </View>
      </View>

      {/* Cool Facts Section */}
      {recipe.coolFacts && Object.keys(recipe.coolFacts).length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={24} color="#10B981" />
            <Text style={styles.sectionTitle}>Cool Facts</Text>
          </View>
          <Text style={styles.coolFactsSubtitle}>
            Science-backed benefits of your ingredients
          </Text>
          
          {recipe.coolFacts.vitamin_k2 && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Heart size={20} color="#EF4444" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>Vitamin K2 Power</Text>
                <Text style={styles.factText}>{recipe.coolFacts.vitamin_k2}</Text>
              </View>
            </View>
          )}
          
          {recipe.coolFacts.omega_3 && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Brain size={20} color="#3B82F6" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>Omega-3 Boost</Text>
                <Text style={styles.factText}>{recipe.coolFacts.omega_3}</Text>
              </View>
            </View>
          )}
          
          {recipe.coolFacts.cla && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Zap size={20} color="#F59E0B" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>CLA Benefits</Text>
                <Text style={styles.factText}>{recipe.coolFacts.cla}</Text>
              </View>
            </View>
          )}
          
          {recipe.coolFacts.sustainability && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Leaf size={20} color="#10B981" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>Sustainable Choice</Text>
                <Text style={styles.factText}>{recipe.coolFacts.sustainability}</Text>
              </View>
            </View>
          )}
          
          {recipe.coolFacts.gut_health && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Shield size={20} color="#8B5CF6" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>Gut Health</Text>
                <Text style={styles.factText}>{recipe.coolFacts.gut_health}</Text>
              </View>
            </View>
          )}
          
          {recipe.coolFacts.anti_inflammatory && (
            <View style={styles.factCard}>
              <View style={styles.factIcon}>
                <Heart size={20} color="#EC4899" />
              </View>
              <View style={styles.factContent}>
                <Text style={styles.factTitle}>Anti-Inflammatory</Text>
                <Text style={styles.factText}>{recipe.coolFacts.anti_inflammatory}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Tags Section */}
      {recipe.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {recipe.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Source Section */}
      <View style={styles.section}>
        <Text style={styles.sourceText}>Source: {recipe.source}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onSave}>
          <Bookmark size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Share2 size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton} onPress={onPrint}>
          <Printer size={20} color="#6B7280" />
          <Text style={styles.actionButtonText}>Print</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    minHeight: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
  },
  difficultyBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  carbsHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
  },
  carbsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  ingredientRow: {
    marginBottom: 16,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ingredientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  restrictedIngredient: {
    color: '#EF4444',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  carbsInfo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginLeft: 32,
  },
  swapText: {
    fontSize: 14,
    color: '#92400E',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    flex: 1,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: (width - 60) / 2,
    alignItems: 'center',
    marginBottom: 16,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Cool Facts Styles
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coolFactsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  factCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  factIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  factContent: {
    flex: 1,
  },
  factTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  factText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
