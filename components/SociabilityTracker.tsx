import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Users, TrendingUp, Smile, MessageCircle, Calendar, BarChart3, Target, Award } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';

interface SocialInteraction {
  id: string;
  date: Date;
  type: 'conversation' | 'meeting' | 'social_event' | 'family_time' | 'friend_meetup';
  mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
  energy: 1 | 2 | 3 | 4 | 5;
  social_confidence: 1 | 2 | 3 | 4 | 5;
  notes: string;
  microbiome_habits: string[];
}

interface SociabilityMetrics {
  totalInteractions: number;
  averageMood: number;
  averageEnergy: number;
  averageConfidence: number;
  streakDays: number;
  weeklyProgress: number;
}

export default function SociabilityTracker() {
  const [interactions, setInteractions] = useState<SocialInteraction[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInteraction, setNewInteraction] = useState<Partial<SocialInteraction>>({
    type: 'conversation',
    mood: 'good',
    energy: 3,
    social_confidence: 3,
    notes: '',
    microbiome_habits: []
  });

  const microbiomeHabits = [
    'L. reuteri yogurt',
    'Kefir',
    'Fermented vegetables',
    'Prebiotic fiber',
    'Probiotic supplement',
    'Apple cider vinegar',
    'Bone broth',
    'None today'
  ];

  const moodColors = {
    excellent: '#10B981',
    good: '#3B82F6',
    neutral: '#6B7280',
    poor: '#F59E0B',
    terrible: '#DC2626'
  };

  const moodLabels = {
    excellent: 'Excellent',
    good: 'Good',
    neutral: 'Neutral',
    poor: 'Poor',
    terrible: 'Terrible'
  };

  const typeLabels = {
    conversation: 'Conversation',
    meeting: 'Meeting',
    social_event: 'Social Event',
    family_time: 'Family Time',
    friend_meetup: 'Friend Meetup'
  };

  const calculateMetrics = (): SociabilityMetrics => {
    if (interactions.length === 0) {
      return {
        totalInteractions: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageConfidence: 0,
        streakDays: 0,
        weeklyProgress: 0
      };
    }

    const moodValues = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
    
    const totalInteractions = interactions.length;
    const averageMood = interactions.reduce((sum, i) => sum + moodValues[i.mood], 0) / totalInteractions;
    const averageEnergy = interactions.reduce((sum, i) => sum + i.energy, 0) / totalInteractions;
    const averageConfidence = interactions.reduce((sum, i) => sum + i.social_confidence, 0) / totalInteractions;

    // Calculate streak (consecutive days with interactions)
    let streakDays = 0;
    const sortedInteractions = [...interactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedInteractions.length; i++) {
      const interactionDate = new Date(sortedInteractions[i].date);
      interactionDate.setHours(0, 0, 0, 0);
      
      if (interactionDate.getTime() === today.getTime() - (i * 24 * 60 * 60 * 1000)) {
        streakDays++;
      } else {
        break;
      }
    }

    // Weekly progress (interactions this week vs last week)
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = interactions.filter(i => i.date >= oneWeekAgo).length;
    const lastWeek = interactions.filter(i => {
      const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      return i.date >= twoWeeksAgo && i.date < oneWeekAgo;
    }).length;
    
    const weeklyProgress = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

    return {
      totalInteractions,
      averageMood,
      averageEnergy,
      averageConfidence,
      streakDays,
      weeklyProgress
    };
  };

  const addInteraction = () => {
    if (!newInteraction.type || !newInteraction.mood || !newInteraction.notes.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const interaction: SocialInteraction = {
      id: Date.now().toString(),
      date: new Date(),
      type: newInteraction.type!,
      mood: newInteraction.mood!,
      energy: newInteraction.energy!,
      social_confidence: newInteraction.social_confidence!,
      notes: newInteraction.notes!,
      microbiome_habits: newInteraction.microbiome_habits || []
    };

    setInteractions([interaction, ...interactions]);
    setNewInteraction({
      type: 'conversation',
      mood: 'good',
      energy: 3,
      social_confidence: 3,
      notes: '',
      microbiome_habits: []
    });
    setShowAddForm(false);
    
    Alert.alert('Success!', 'Social interaction logged successfully.');
  };

  const toggleMicrobiomeHabit = (habit: string) => {
    const currentHabits = newInteraction.microbiome_habits || [];
    if (currentHabits.includes(habit)) {
      setNewInteraction({
        ...newInteraction,
        microbiome_habits: currentHabits.filter(h => h !== habit)
      });
    } else {
      setNewInteraction({
        ...newInteraction,
        microbiome_habits: [...currentHabits, habit]
      });
    }
  };

  const metrics = calculateMetrics();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Sociability Project</Text>
        <Text style={styles.headerSubtitle}>Track your social connections & microbiome impact</Text>
        <Text style={styles.headerDescription}>
          Research shows L. reuteri and other probiotics boost oxytocin, improving social confidence and connections
        </Text>
      </LinearGradient>

      {/* Metrics Overview */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Users size={24} color="#8B5CF6" />
          <Text style={styles.metricValue}>{metrics.totalInteractions}</Text>
          <Text style={styles.metricLabel}>Total Interactions</Text>
        </View>
        <View style={styles.metricCard}>
          <Smile size={24} color="#10B981" />
          <Text style={styles.metricValue}>{metrics.averageMood.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>Avg Mood</Text>
        </View>
        <View style={styles.metricCard}>
          <TrendingUp size={24} color="#3B82F6" />
          <Text style={styles.metricValue}>{metrics.streakDays}</Text>
          <Text style={styles.metricLabel}>Day Streak</Text>
        </View>
        <View style={styles.metricCard}>
          <BarChart3 size={24} color="#F59E0B" />
          <Text style={styles.metricValue}>
            {metrics.weeklyProgress > 0 ? '+' : ''}{metrics.weeklyProgress.toFixed(0)}%
          </Text>
          <Text style={styles.metricLabel}>Weekly Progress</Text>
        </View>
      </View>

      {/* Add Interaction Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Users size={20} color="white" />
          <Text style={styles.addButtonText}>Log Social Interaction</Text>
        </TouchableOpacity>
      </View>

      {/* Add Interaction Form */}
      {showAddForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Log Your Social Interaction</Text>
          
          {/* Interaction Type */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Type of Interaction</Text>
            <View style={styles.typeButtons}>
              {Object.entries(typeLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.typeButton,
                    newInteraction.type === key && styles.typeButtonActive
                  ]}
                  onPress={() => setNewInteraction({...newInteraction, type: key as any})}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newInteraction.type === key && styles.typeButtonTextActive
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Mood Rating */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>How was your mood?</Text>
            <View style={styles.moodButtons}>
              {Object.entries(moodLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.moodButton,
                    { borderColor: moodColors[key as keyof typeof moodColors] },
                    newInteraction.mood === key && { backgroundColor: moodColors[key as keyof typeof moodColors] }
                  ]}
                  onPress={() => setNewInteraction({...newInteraction, mood: key as any})}
                >
                  <Text style={[
                    styles.moodButtonText,
                    { color: moodColors[key as keyof typeof moodColors] },
                    newInteraction.mood === key && styles.moodButtonTextActive
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Energy & Confidence */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Energy Level (1-5)</Text>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    newInteraction.energy === rating && styles.ratingButtonActive
                  ]}
                  onPress={() => setNewInteraction({...newInteraction, energy: rating as any})}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    newInteraction.energy === rating && styles.ratingButtonTextActive
                  ]}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Social Confidence (1-5)</Text>
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    newInteraction.social_confidence === rating && styles.ratingButtonActive
                  ]}
                  onPress={() => setNewInteraction({...newInteraction, social_confidence: rating as any})}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    newInteraction.social_confidence === rating && styles.ratingButtonTextActive
                  ]}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Microbiome Habits */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Microbiome Habits Today</Text>
            <Text style={styles.formSubtext}>Select all that apply (these may impact your sociability)</Text>
            <View style={styles.habitsGrid}>
              {microbiomeHabits.map((habit) => (
                <TouchableOpacity
                  key={habit}
                  style={[
                    styles.habitButton,
                    newInteraction.microbiome_habits?.includes(habit) && styles.habitButtonActive
                  ]}
                  onPress={() => toggleMicrobiomeHabit(habit)}
                >
                  <Text style={[
                    styles.habitButtonText,
                    newInteraction.microbiome_habits?.includes(habit) && styles.habitButtonTextActive
                  ]}>{habit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Notes about the interaction</Text>
            <TextInput
              style={styles.notesInput}
              value={newInteraction.notes}
              onChangeText={(text) => setNewInteraction({...newInteraction, notes: text})}
              placeholder="Describe your social interaction, how you felt, any insights..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={addInteraction}
            >
              <Text style={styles.saveButtonText}>Save Interaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Interactions */}
      <View style={styles.interactionsContainer}>
        <Text style={styles.sectionTitle}>Recent Interactions</Text>
        {interactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>No interactions logged yet</Text>
            <Text style={styles.emptyStateSubtext}>Start tracking your social connections and mood</Text>
          </View>
        ) : (
          interactions.map((interaction) => (
            <View key={interaction.id} style={styles.interactionCard}>
              <View style={styles.interactionHeader}>
                <View style={styles.interactionType}>
                  <Text style={styles.interactionTypeText}>{typeLabels[interaction.type]}</Text>
                </View>
                <Text style={styles.interactionDate}>
                  {interaction.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              
              <View style={styles.interactionMetrics}>
                <View style={styles.metricItem}>
                  <Smile size={16} color={moodColors[interaction.mood]} />
                  <Text style={styles.metricItemText}>{moodLabels[interaction.mood]}</Text>
                </View>
                <View style={styles.metricItem}>
                  <TrendingUp size={16} color="#3B82F6" />
                  <Text style={styles.metricItemText}>Energy: {interaction.energy}/5</Text>
                </View>
                <View style={styles.metricItem}>
                  <Target size={16} color="#10B981" />
                  <Text style={styles.metricItemText}>Confidence: {interaction.social_confidence}/5</Text>
                </View>
              </View>

              {interaction.notes && (
                <Text style={styles.interactionNotes}>{interaction.notes}</Text>
              )}

              {interaction.microbiome_habits.length > 0 && (
                <View style={styles.habitsDisplay}>
                  <Text style={styles.habitsLabel}>Microbiome habits:</Text>
                  <View style={styles.habitsTags}>
                    {interaction.microbiome_habits.map((habit, index) => (
                      <View key={index} style={styles.habitTag}>
                        <Text style={styles.habitTagText}>{habit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Insights */}
      <View style={styles.insightsContainer}>
        <LinearGradient
          colors={['#FEF3C7', '#FDE68A']}
          style={styles.insightsGradient}
        >
          <Text style={styles.insightsTitle}>💡 Sociability Insights</Text>
          <Text style={styles.insightsText}>
            • L. reuteri yogurt has been shown to increase oxytocin levels by up to 40%
          </Text>
          <Text style={styles.insightsText}>
            • Regular probiotic intake correlates with improved social confidence
          </Text>
          <Text style={styles.insightsText}>
            • Track your microbiome habits alongside social interactions to see patterns
          </Text>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  addButtonContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  formSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  moodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  moodButtonTextActive: {
    color: 'white',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingButtonActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  ratingButtonTextActive: {
    color: 'white',
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  habitButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  habitButtonTextActive: {
    color: 'white',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#374151',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  interactionsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  interactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  interactionType: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interactionTypeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  interactionDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  interactionMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricItemText: {
    fontSize: 12,
    color: '#6B7280',
  },
  interactionNotes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  habitsDisplay: {
    marginTop: 8,
  },
  habitsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  habitsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  habitTagText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '500',
  },
  insightsContainer: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  insightsGradient: {
    padding: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    marginBottom: 6,
  },
});








