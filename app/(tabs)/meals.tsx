import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Plus, Camera, AlertTriangle, CheckCircle, Clock } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';
import { Meal } from '@/types/health';
import { disallowedFoods } from '@/constants/health-data';

export default function MealsScreen() {
  const { meals, addMeal, updateMeal } = useHealth();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [mealName, setMealName] = useState('');
  const [mealDescription, setMealDescription] = useState('');

  const todayMeals = meals.filter(meal => 
    new Date(meal.timestamp).toDateString() === new Date().toDateString()
  );

  const analyzeMealWithAI = async (meal: Omit<Meal, 'id'>) => {
    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert specializing in Dr. William Davis's Infinite Health program. Analyze meals for net carbs and identify disallowed foods.

DISALLOWED FOODS: wheat, grains (all types), seed oils (canola, soybean, vegetable, sunflower, safflower, cottonseed, corn oil), processed foods with these ingredients.

For each meal analysis, provide:
1. Estimated net carbs (total carbs minus fiber)
2. List any disallowed foods found
3. Brief health assessment

Keep responses concise and helpful. Net carbs should be ≤15g per meal for optimal health.`
            },
            {
              role: 'user',
              content: `Analyze this meal: "${meal.name}" - ${meal.description}`
            }
          ]
        })
      });

      const data = await response.json();
      return data.completion;
    } catch (error) {
      console.error('AI analysis error:', error);
      return 'Unable to analyze meal at this time.';
    }
  };

  const handleAddMeal = async () => {
    if (!mealName.trim()) {
      Alert.alert('Error', 'Please enter a meal name');
      return;
    }

    const newMeal: Omit<Meal, 'id'> = {
      name: mealName,
      description: mealDescription,
      timestamp: new Date(),
      netCarbs: 0,
      isAnalyzing: true,
      hasDisallowedFoods: false,
      disallowedFoods: [],
    };

    await addMeal(newMeal);
    
    // Find the meal we just added to update it with AI analysis
    const addedMeal = meals[meals.length - 1];
    
    // Start AI analysis
    const aiAnalysis = await analyzeMealWithAI(newMeal);
    
    // Parse AI response for net carbs and disallowed foods
    const netCarbsMatch = aiAnalysis.match(/(\d+(?:\.\d+)?)\s*g?\s*net carbs?/i);
    const estimatedNetCarbs = netCarbsMatch ? parseFloat(netCarbsMatch[1]) : 0;
    
    const foundDisallowedFoods = disallowedFoods.filter(food => 
      mealName.toLowerCase().includes(food) || 
      mealDescription.toLowerCase().includes(food) ||
      aiAnalysis.toLowerCase().includes(food)
    );

    await updateMeal(addedMeal?.id || Date.now().toString(), {
      netCarbs: estimatedNetCarbs,
      isAnalyzing: false,
      hasDisallowedFoods: foundDisallowedFoods.length > 0,
      disallowedFoods: foundDisallowedFoods,
      aiAnalysis,
    });

    setMealName('');
    setMealDescription('');
    setShowAddMeal(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const totalNetCarbs = todayMeals.reduce((sum, meal) => sum + meal.netCarbs, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meals</Text>
        <Text style={styles.headerSubtitle}>
          Today: {totalNetCarbs.toFixed(1)}g net carbs
        </Text>
        {totalNetCarbs > 45 && (
          <Text style={styles.warningText}>⚠️ Daily limit exceeded</Text>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showAddMeal && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddMeal(true)}>
            <Plus color="#ffffff" size={24} />
            <Text style={styles.addButtonText}>Log New Meal</Text>
          </TouchableOpacity>
        )}

        {showAddMeal && (
          <View style={styles.addMealForm}>
            <Text style={styles.formTitle}>Add New Meal</Text>
            <TextInput
              style={styles.input}
              placeholder="Meal name (e.g., Grilled Salmon)"
              value={mealName}
              onChangeText={setMealName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description and ingredients..."
              value={mealDescription}
              onChangeText={setMealDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setShowAddMeal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleAddMeal}>
                <Text style={styles.buttonText}>Analyze Meal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
        
        {todayMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Camera color="#9ca3af" size={48} />
            <Text style={styles.emptyStateText}>No meals logged today</Text>
            <Text style={styles.emptyStateSubtext}>
              Start by logging your first meal
            </Text>
          </View>
        ) : (
          todayMeals.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
                </View>
                <View style={styles.mealStatus}>
                  {meal.isAnalyzing ? (
                    <View style={styles.analyzing}>
                      <Clock color="#f59e0b" size={16} />
                      <Text style={styles.analyzingText}>Analyzing...</Text>
                    </View>
                  ) : meal.hasDisallowedFoods ? (
                    <View style={styles.warning}>
                      <AlertTriangle color="#ef4444" size={16} />
                      <Text style={styles.warningText}>Contains disallowed foods</Text>
                    </View>
                  ) : (
                    <View style={styles.success}>
                      <CheckCircle color="#22c55e" size={16} />
                      <Text style={styles.successText}>Approved</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {meal.description && (
                <Text style={styles.mealDescription}>{meal.description}</Text>
              )}
              
              <View style={styles.mealFooter}>
                <Text style={[
                  styles.netCarbs,
                  { color: meal.netCarbs > 15 ? '#ef4444' : '#22c55e' }
                ]}>
                  {meal.netCarbs.toFixed(1)}g net carbs
                </Text>
                {meal.netCarbs > 15 && (
                  <Text style={styles.carbsWarning}>Over 15g limit</Text>
                )}
              </View>

              {meal.disallowedFoods.length > 0 && (
                <View style={styles.disallowedFoods}>
                  <Text style={styles.disallowedTitle}>Disallowed ingredients:</Text>
                  <Text style={styles.disallowedList}>
                    {meal.disallowedFoods.join(', ')}
                  </Text>
                </View>
              )}

              {meal.aiAnalysis && !meal.isAnalyzing && (
                <View style={styles.aiAnalysis}>
                  <Text style={styles.aiAnalysisTitle}>AI Analysis:</Text>
                  <Text style={styles.aiAnalysisText}>{meal.aiAnalysis}</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#22c55e',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#fef3c7',
    textAlign: 'center',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addMealForm: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  mealCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  mealTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  mealStatus: {
    alignItems: 'flex-end',
  },
  analyzing: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 4,
    fontWeight: '600',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  successText: {
    fontSize: 12,
    color: '#22c55e',
    marginLeft: 4,
    fontWeight: '600',
  },
  mealDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  mealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netCarbs: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  carbsWarning: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  disallowedFoods: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  disallowedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 4,
  },
  disallowedList: {
    fontSize: 12,
    color: '#991b1b',
  },
  aiAnalysis: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  aiAnalysisTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4,
  },
  aiAnalysisText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 16,
  },
});