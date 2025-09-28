import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { CheckCircle, Circle, Calendar, Edit3, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHealth } from '@/hooks/health-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChallengeScreen() {
  const { challenge, updateChallengeDay, meals, loadData } = useHealth();
  const insets = useSafeAreaInsets();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const completedDays = challenge.filter(day => day.completed).length;

  const progressPercentage = (completedDays / 10) * 100;

  const handleEditDay = (day: number) => {
    // For current day or already completed days, always allow editing
    const dayData = challenge.find(d => d.day === day);
    const status = getDayStatus(dayData);
    
    if (status === 'current' || status === 'completed') {
      if (dayData) {
        setSymptoms(dayData.symptoms.join(', '));
        setNotes(dayData.notes);
        setEditingDay(day);
      }
      return;
    }
    
    if (!canCompleteDay(day)) {
      Alert.alert(
        'Cannot Complete Day',
        'You must complete the previous day first. The challenge must be done in sequential order without skipping days.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (dayData) {
      setSymptoms(dayData.symptoms.join(', '));
      setNotes(dayData.notes);
      setEditingDay(day);
    }
  };

  const handleSaveDay = async () => {
    if (editingDay === null) return;

    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(s => s);

    await updateChallengeDay(editingDay, {
      symptoms: symptomsArray,
      notes,
      symptomsNoted: symptomsArray.length > 0,
      completed: true,
    });

    setEditingDay(null);
    setSymptoms('');
    setNotes('');
    Alert.alert('Success', 'Day updated successfully!');
  };

  const handleResetChallenge = () => {
    Alert.alert(
      'Reset Challenge',
      'This will reset your entire challenge progress. You can start fresh from Day 1. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            resetChallengeData();
          }
        }
      ],
      { cancelable: true }
    );
  };

  const resetChallengeData = async () => {
    try {
      // Clear any editing state first
      setEditingDay(null);
      setSymptoms('');
      setNotes('');
      
      // Create a fresh challenge array with all days reset  
      const resetChallenge = [];
      const today = new Date();
      
      for (let dayNum = 1; dayNum <= 10; dayNum++) {
        const date = new Date(today);
        date.setDate(today.getDate() + dayNum - 1);
        
        resetChallenge.push({
          day: dayNum,
          date: date.toDateString(),
          completed: false,
          symptoms: [],
          notes: '',
          symptomsNoted: false,
          mealsLogged: 0,
          netCarbsTotal: 0,
          adherenceScore: 0
        });
      }
      
      // Save directly to AsyncStorage
      await AsyncStorage.setItem('challenge', JSON.stringify(resetChallenge));
      
      // Reload data from AsyncStorage to refresh the UI
      await loadData();
      Alert.alert('Challenge Reset', 'Your challenge has been reset successfully!');
      
    } catch (error: any) {
      console.error('Error resetting challenge:', error);
      Alert.alert('Error', `Failed to reset challenge: ${error?.message || 'Unknown error'}`);
    }
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

  const canCompleteDay = (dayNumber: number) => {
    // Can only complete day 1, or if previous day is completed
    if (dayNumber === 1) return true;
    const previousDay = challenge.find(d => d.day === dayNumber - 1);
    return previousDay?.completed || false;
  };

  const getChallengeStatusColor = () => {
    const today = new Date();
    const todayString = today.toDateString();
    
    const missedDays = challenge.filter(day => {
      const dayDate = new Date(day.date);
      const isPast = dayDate < today;
      const isToday = day.date === todayString;
      
      // Don't count today as "missed" - only count truly past days
      return isPast && !isToday && !day.completed;
    }).length;

    if (missedDays > 0) return '#ef4444'; // Red - bad (missed days)
    if (completedDays >= 7) return '#22c55e'; // Green - good (7+ days)
    return '#f59e0b'; // Orange - mediocre (in progress)
  };

  const getChallengeStatusText = () => {
    const today = new Date();
    const todayString = today.toDateString();
    
    const missedDays = challenge.filter(day => {
      const dayDate = new Date(day.date);
      const isPast = dayDate < today;
      const isToday = day.date === todayString;
      
      // Don't count today as "missed" - only count truly past days
      return isPast && !isToday && !day.completed;
    }).length;

    if (missedDays > 0) return 'Reset Required';
    if (completedDays === 10) return 'Completed!';
    if (completedDays >= 7) return 'Almost There!';
    return 'In Progress';
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: getChallengeStatusColor() }}>
        <View style={[styles.header, { backgroundColor: getChallengeStatusColor() }]}>
          <Text style={styles.headerTitle}>10-Day Detox Challenge</Text>
          <Text style={styles.headerSubtitle}>
            {completedDays}/10 days completed ({progressPercentage.toFixed(0)}%)
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 150 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Challenge Progress Section - Always at top */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Challenge Progress</Text>
          <View style={styles.resetButtons}>
            <TouchableOpacity 
              style={styles.resetButtonSmall} 
              onPress={() => {
                resetChallengeData();
              }}
              activeOpacity={0.7}
              accessibilityLabel="Reset challenge to start over"
              accessibilityRole="button"
            >
              <Text style={styles.resetButtonSmallText}>Reset Now</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {challenge.map((day) => {
          const status = getDayStatus(day);
          return (
            <View
              key={`${day.day}-${forceUpdate}`}
              style={[
                styles.dayCard,
                status === 'completed' && styles.dayCardCompleted,
                status === 'current' && styles.dayCardCurrent,
                status === 'missed' && styles.dayCardMissed,
              ]}
            >
              <View style={styles.dayHeader}>
                <View style={styles.dayInfo}>
                  <Text style={[
                    styles.dayTitle,
                    status === 'completed' && styles.dayTitleCompleted,
                    status === 'missed' && styles.dayTitleMissed
                  ]}>
                    Day {day.day}
                  </Text>
                  <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                </View>
                
                <View style={styles.dayActions}>
                  {(status === 'current' || status === 'completed') && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        handleEditDay(day.day);
                      }}
                      accessibilityLabel={`Edit day ${day.day} check-in`}
                      accessibilityRole="button"
                    >
                      <Edit3 color="#6b7280" size={20} />
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
                  
                  {!day.symptoms.length && !day.notes && (
                    <View style={styles.completedMessage}>
                      <Text style={styles.completedText}>✅ Day completed</Text>
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

              {/* Show edit form right after the day being edited */}
              {editingDay === day.day && (
                <View style={styles.editFormInline}>
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
                  
                  <View style={styles.formActions}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingDay(null);
                        setSymptoms('');
                        setNotes('');
                      }}
                      accessibilityLabel="Cancel editing day check-in"
                      accessibilityRole="button"
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSaveDay}
                      accessibilityLabel="Save day check-in"
                      accessibilityRole="button"
                    >
                      <Text style={styles.saveButtonText}>Save Check-in</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Warning for missed days */}
        {challenge.some(day => {
          const dayDate = new Date(day.date);
          const today = new Date();
          const todayString = today.toDateString();
          const isPast = dayDate < today;
          const isToday = day.date === todayString;
          
          // Don't count today as "missed" - only count truly past days
          return isPast && !isToday && !day.completed;
        }) && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>⚠️ Challenge Needs Reset</Text>
            <Text style={styles.warningText}>
              You've missed one or more days. The challenge must be completed sequentially without skipping days.
            </Text>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleResetChallenge}
              accessibilityLabel="Reset entire challenge"
              accessibilityRole="button"
            >
              <Text style={styles.resetButtonText}>Reset Challenge</Text>
            </TouchableOpacity>
          </View>
        )}



        <View style={styles.challengeInfo}>
          <TouchableOpacity 
            style={styles.guidelinesHeader}
            onPress={() => setShowGuidelines(!showGuidelines)}
            accessibilityLabel={showGuidelines ? "Hide challenge guidelines" : "Show challenge guidelines"}
            accessibilityRole="button"
          >
            <Text style={styles.sectionTitle}>Challenge Guidelines</Text>
            {showGuidelines ? (
              <ChevronUp size={24} color="#374151" />
            ) : (
              <ChevronDown size={24} color="#374151" />
            )}
          </TouchableOpacity>
          
          {showGuidelines && (
            <>
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
              onPress={async () => {
                try {
                  const url = 'https://innercircle.drdavisinfinitehealth.com/landing/';
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert('Error', 'Unable to open link. Please visit: https://innercircle.drdavisinfinitehealth.com/landing/');
                  }
                } catch (error) {
                  Alert.alert('Error', 'Unable to open link. Please visit: https://innercircle.drdavisinfinitehealth.com/landing/');
                }
              }}
              accessibilityLabel="Learn more about Dr Davis program (opens website)"
              accessibilityRole="button"
            >
              <Text style={styles.guidelineLinkText}>Learn More About DR Davis Program</Text>
            </TouchableOpacity>
          </View>
            </>
          )}
        </View>
      </ScrollView>
      <SafeAreaView style={{ backgroundColor: 'transparent' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 40,
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
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
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
  guidelinesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
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
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
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
    backgroundColor: '#22c55e',
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
  warningBanner: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#7f1d1d',
    lineHeight: 20,
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  editFormInline: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonSmall: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  resetButtonSmallText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  resetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  completedMessage: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '600',
  },
  dayTitleMissed: {
    color: '#dc2626',
  },
});