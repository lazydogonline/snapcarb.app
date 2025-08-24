import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { CheckCircle, Circle, Calendar, Edit3 } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';

export default function ChallengeScreen() {
  const { challenge, updateChallengeDay, meals } = useHealth();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');

  const completedDays = challenge.filter(day => day.completed).length;

  const progressPercentage = (completedDays / 10) * 100;

  const handleEditDay = (day: number) => {
    const dayData = challenge.find(d => d.day === day);
    if (dayData) {
      setSymptoms(dayData.symptoms.join(', '));
      setNotes(dayData.notes);
      setEditingDay(day);
    }
  };

  const handleSaveDay = async () => {
    if (editingDay === null) return;

    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);
    const todayMeals = meals.filter(meal => 
      new Date(meal.timestamp).toDateString() === new Date().toDateString()
    );

    await updateChallengeDay(editingDay, {
      symptoms: symptomsArray,
      notes,
      symptomsNoted: symptomsArray.length > 0,
      mealsLogged: todayMeals.length,
      completed: true,
    });

    setEditingDay(null);
    setSymptoms('');
    setNotes('');
    Alert.alert('Success', 'Day updated successfully!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDayStatus = (day: any) => {
    const dayDate = new Date(day.date);
    const today = new Date();
    const isToday = dayDate.toDateString() === today.toDateString();
    const isPast = dayDate < today;
    
    if (day.completed) return 'completed';
    if (isToday) return 'current';
    if (isPast) return 'missed';
    return 'upcoming';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>10-Day Detox Challenge</Text>
        <Text style={styles.headerSubtitle}>
          {completedDays}/10 days completed ({progressPercentage.toFixed(0)}%)
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {editingDay && (
          <>
            {/* Must Know Section - DR Davis Program Insights */}
            <View style={styles.mustKnowSection}>
              <Text style={styles.mustKnowTitle}>💡 Must Know: Your Path to Extraordinary Health</Text>
              <Text style={styles.mustKnowText}>
                {editingDay <= 7 ? 
                  "You're in the detox/withdrawal phase. This is normal and temporary - like having the flu. Focus on hydration, salt your food, and pamper yourself. Symptoms typically resolve in 5-7 days." :
                  "Great progress! You're past the toughest part. Continue with simple meals and supplements. Your body is healing and you should be feeling better now."
                }
              </Text>
              
              <View style={styles.mustKnowTips}>
                <Text style={styles.mustKnowTipTitle}>Key Tips for Day {editingDay}:</Text>
                {editingDay === 1 && (
                  <Text style={styles.mustKnowTip}>• Start supplements: Vitamin D, Fish Oil, Magnesium, Iodine, Probiotic</Text>
                )}
                {editingDay === 3 && (
                  <Text style={styles.mustKnowTip}>• Add 10g prebiotic fibers daily (inulin, jicama, small legumes)</Text>
                )}
                {editingDay === 10 && (
                  <Text style={styles.mustKnowTip}>• Increase prebiotic fibers to 20g daily</Text>
                )}
                <Text style={styles.mustKnowTip}>• Keep meals simple - familiar dishes only</Text>
                <Text style={styles.mustKnowTip}>• Hydrate more than usual, salt food lightly</Text>
                <Text style={styles.mustKnowTip}>• Avoid strenuous exercise, light walking is fine</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.innerCircleButton}
                onPress={() => {
                  Alert.alert(
                    'Join DR Davis Inner Circle',
                    'Get complete program details, live meetups with Dr. Davis, exclusive recipes, and ongoing support for your health journey.',
                    [
                      { text: 'Learn More', onPress: () => {
                        Alert.alert('Inner Circle', 'Visit: https://innercircle.undoctored.com/');
                      }},
                      { text: 'Maybe Later', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={styles.innerCircleButtonText}>🌟 Get Complete DR Davis Program Details</Text>
                <Text style={styles.innerCircleSubtext}>Join Inner Circle for Live Meetups & Full Support</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <Text style={styles.formTitle}>Day {editingDay} Check-in</Text>
            
            <Text style={styles.inputLabel}>Symptoms (comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., headache, fatigue, improved energy"
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
            />
            
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="How are you feeling? Any observations?"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
            
            <View style={styles.formButtons}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => setEditingDay(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSaveDay}>
                <Text style={styles.buttonText}>Save Check-in</Text>
              </TouchableOpacity>
                          </View>
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Challenge Progress</Text>

        {challenge.map((day) => {
          const status = getDayStatus(day);
          return (
            <View key={day.day} style={[
              styles.dayCard,
              status === 'completed' && styles.dayCardCompleted,
              status === 'current' && styles.dayCardCurrent,
              status === 'missed' && styles.dayCardMissed,
            ]}>
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={[
                    styles.dayTitle,
                    status === 'completed' && styles.dayTitleCompleted,
                    status === 'current' && styles.dayTitleCurrent,
                  ]}>
                    Day {day.day}
                  </Text>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                </View>
                
                <View style={styles.dayActions}>
                  {status === 'current' && (
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditDay(day.day)}
                    >
                      <Edit3 color="#f59e0b" size={20} />
                    </TouchableOpacity>
                  )}
                  
                  {status === 'completed' ? (
                    <CheckCircle color="#22c55e" size={28} />
                  ) : status === 'current' ? (
                    <Circle color="#f59e0b" size={28} />
                  ) : status === 'missed' ? (
                    <Circle color="#ef4444" size={28} />
                  ) : (
                    <Circle color="#d1d5db" size={28} />
                  )}
                </View>
              </View>

              {day.completed && (
                <View style={styles.dayDetails}>
                  <View style={styles.dayStats}>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{day.mealsLogged}</Text>
                      <Text style={styles.statLabel}>Meals</Text>
                    </View>
                    <View style={styles.stat}>
                      <Text style={styles.statValue}>{day.symptoms.length}</Text>
                      <Text style={styles.statLabel}>Symptoms</Text>
                    </View>
                  </View>
                  
                  {day.symptoms.length > 0 && (
                    <View style={styles.symptomsSection}>
                      <Text style={styles.symptomsTitle}>Symptoms:</Text>
                      <Text style={styles.symptomsText}>
                        {day.symptoms.join(', ')}
                      </Text>
                    </View>
                  )}
                  
                  {day.notes && (
                    <View style={styles.notesSection}>
                      <Text style={styles.notesTitle}>Notes:</Text>
                      <Text style={styles.notesText}>{day.notes}</Text>
                    </View>
                  )}
                </View>
              )}

              {status === 'current' && !day.completed && (
                <View style={styles.currentDayPrompt}>
                  <Calendar color="#f59e0b" size={20} />
                  <Text style={styles.currentDayText}>
                    Tap the edit button to complete today&apos;s check-in
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.challengeInfo}>
          <Text style={styles.sectionTitle}>Challenge Guidelines</Text>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>🚫 Avoid These Foods</Text>
            <Text style={styles.guidelineText}>
              Wheat, grains, seed oils (canola, soybean, vegetable oils), processed foods
            </Text>
          </View>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>✅ Focus On</Text>
            <Text style={styles.guidelineText}>
              Whole foods, healthy fats, vegetables, quality proteins, ≤15g net carbs per meal
            </Text>
          </View>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>📝 Daily Tasks</Text>
            <Text style={styles.guidelineText}>
              Log all meals, track symptoms, take supplements, note how you feel
            </Text>
          </View>
          
          <View style={styles.guidelineCard}>
            <Text style={styles.guidelineTitle}>🌟 DR Davis Program Insights</Text>
            <Text style={styles.guidelineText}>
              Based on the Infinite Health lifestyle. First 7 days focus on detox/withdrawal management. 
              Keep meals simple, hydrate well, and follow supplement schedule. Join the Inner Circle for complete details.
            </Text>
            <TouchableOpacity 
              style={styles.guidelineLinkButton}
              onPress={() => {
                Alert.alert('Inner Circle', 'Visit: https://innercircle.undoctored.com/');
              }}
            >
              <Text style={styles.guidelineLinkText}>Learn More About DR Davis Program</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#f59e0b',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 24,
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
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  editForm: {
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#f59e0b',
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
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCardCompleted: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  dayCardCurrent: {
    borderColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  dayCardMissed: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayInfo: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  dayTitleCompleted: {
    color: '#16a34a',
  },
  dayTitleCurrent: {
    color: '#d97706',
  },
  dayDate: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  dayDetails: {
    marginTop: 12,
  },
  dayStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  symptomsSection: {
    marginBottom: 8,
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 14,
    color: '#6b7280',
  },
  notesSection: {
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  currentDayPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  currentDayText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  challengeInfo: {
    marginTop: 24,
    marginBottom: 24,
  },
  guidelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  guidelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  // DR Davis Program Insights Styles
  mustKnowSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  mustKnowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  mustKnowText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 16,
  },
  mustKnowTips: {
    marginBottom: 16,
  },
  mustKnowTipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  mustKnowTip: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 18,
    marginBottom: 4,
  },
  innerCircleButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d97706',
  },
  innerCircleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  innerCircleSubtext: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    opacity: 0.9,
  },
  guidelineLinkButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  guidelineLinkText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});