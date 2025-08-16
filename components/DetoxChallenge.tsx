import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, CheckCircle, Award, Share2, TrendingUp, Leaf, Heart, Star } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHealth } from '@/hooks/health-store';

interface DetoxDay {
  day: number;
  date: string;
  mealLog: string;
  symptoms: string;
  netCarbs: number;
  completed: boolean;
  badge?: string;
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  energy: 'high' | 'medium' | 'low';
}

const DetoxChallenge = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [mealLog, setMealLog] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [netCarbs, setNetCarbs] = useState('');
  const [mood, setMood] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [detoxDays, setDetoxDays] = useState<DetoxDay[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { challenge, updateChallengeDay } = useHealth();
  const totalDays = 10;

  useEffect(() => {
    loadDetoxProgress();
  }, []);

  const loadDetoxProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem('detoxChallenge');
      if (stored) {
        const days = JSON.parse(stored);
        setDetoxDays(days);
        const lastCompleted = days.filter((d: DetoxDay) => d.completed).length;
        setCurrentDay(Math.min(lastCompleted + 1, totalDays));
      } else {
        // Initialize challenge days
        const initialDays = Array.from({ length: totalDays }, (_, i) => ({
          day: i + 1,
          date: new Date(2025, 7, 13 + i).toDateString(), // Aug 13-22
          mealLog: '',
          symptoms: '',
          netCarbs: 0,
          completed: false,
          mood: 'good' as const,
          energy: 'medium' as const,
        }));
        setDetoxDays(initialDays);
        await AsyncStorage.setItem('detoxChallenge', JSON.stringify(initialDays));
      }
    } catch (error) {
      console.error('Error loading detox progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (day: number, netCarbs: number, symptoms: string): string => {
    if (day === 1) return '🌱 Beginner';
    if (day === 3) return '🔥 Detox Warrior';
    if (day === 5) return '💪 Halfway Hero';
    if (day === 7) return '🌟 Wheat-Free Champion';
    if (day === 10) return '👑 InfiniteHealth Master';
    if (netCarbs <= 15 && symptoms.toLowerCase().includes('none')) return '✅ Perfect Day';
    if (netCarbs <= 15) return '🎯 Carb Goal Met';
    return '📝 Progress Made';
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'excellent': return '😄';
      case 'good': return '🙂';
      case 'fair': return '😐';
      case 'poor': return '😔';
      default: return '😐';
    }
  };

  const getEnergyIcon = (energy: string) => {
    switch (energy) {
      case 'high': return '⚡';
      case 'medium': return '🔋';
      case 'low': return '🪫';
      default: return '🔋';
    }
  };

  const checkIn = async () => {
    if (!mealLog.trim()) {
      Alert.alert('Error', 'Please log your meal');
      return;
    }

    if (!symptoms.trim()) {
      Alert.alert('Error', 'Please note any symptoms (even if none)');
      return;
    }

    const carbs = parseFloat(netCarbs) || 0;
    const badge = getBadge(currentDay, carbs, symptoms);

    const updatedDay: DetoxDay = {
      day: currentDay,
      date: new Date().toDateString(),
      mealLog: mealLog.trim(),
      symptoms: symptoms.trim(),
      netCarbs: carbs,
      completed: true,
      badge,
      mood,
      energy,
    };

    const updatedDays = detoxDays.map(day => 
      day.day === currentDay ? updatedDay : day
    );

    setDetoxDays(updatedDays);
    await AsyncStorage.setItem('detoxChallenge', JSON.stringify(updatedDays));

    // Update health store
    await updateChallengeDay(currentDay, {
      completed: true,
      mealsLogged: 1,
      symptomsNoted: true,
      symptoms: [symptoms.trim()],
      notes: `Net carbs: ${carbs}g, Mood: ${mood}, Energy: ${energy}`,
    });

    // Show completion alert
    Alert.alert(
      'Day Completed! 🎉',
      `Congratulations on completing Day ${currentDay}!\n\nBadge: ${badge}\n\nNet Carbs: ${carbs}g\nMood: ${getMoodIcon(mood)} ${mood}\nEnergy: ${getEnergyIcon(energy)} ${energy}`,
      [
        { text: 'Share Progress', onPress: () => shareProgress(updatedDay) },
        { text: 'Continue', onPress: () => {
          setMealLog('');
          setSymptoms('');
          setNetCarbs('');
          setMood('good');
          setEnergy('medium');
          if (currentDay < totalDays) {
            setCurrentDay(currentDay + 1);
          }
        }}
      ]
    );
  };

  const shareProgress = async (day: DetoxDay) => {
    try {
      const message = `🎯 SnapCarb Detox Challenge - Day ${day.day} Complete!\n\n` +
        `🍽️ Meal: ${day.mealLog}\n` +
        `📊 Net Carbs: ${day.netCarbs}g\n` +
        `😊 Mood: ${getMoodIcon(day.mood)} ${day.mood}\n` +
        `⚡ Energy: ${getEnergyIcon(day.energy)} ${day.energy}\n` +
        `🏆 Badge: ${day.badge}\n\n` +
        `#SnapCarb #InfiniteHealth #WheatBelly #DetoxChallenge`;

      await Share.share({
        message,
        title: 'SnapCarb Detox Progress',
      });
    } catch (error) {
      console.error('Error sharing progress:', error);
    }
  };

  const getProgressPercentage = () => {
    const completed = detoxDays.filter(day => day.completed).length;
    return (completed / totalDays) * 100;
  };

  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = 0; i < detoxDays.length; i++) {
      if (detoxDays[i]?.completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading detox challenge...</Text>
      </View>
    );
  }

  const progressPercentage = getProgressPercentage();
  const currentStreak = getCurrentStreak();
  const isChallengeComplete = currentDay > totalDays;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Target color="#ffffff" size={32} />
          <Text style={styles.headerTitle}>Wheat Belly Detox Challenge</Text>
          <Text style={styles.headerSubtitle}>August 13-22, 2025</Text>
        </View>
      </LinearGradient>

      {/* Progress Overview */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Current Day</Text>
            <Text style={styles.progressValue}>{currentDay}/{totalDays}</Text>
          </View>
          <View style={styles.progressItem}>
            <Text style={styles.progressLabel}>Streak</Text>
            <Text style={styles.progressValue}>{currentStreak} 🔥</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
            />
          </View>
        </View>
      </View>

      {/* Current Day Check-In */}
      {!isChallengeComplete && (
        <View style={styles.checkInSection}>
          <Text style={styles.sectionTitle}>Day {currentDay} Check-In</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meal Log</Text>
            <TextInput
              style={styles.textInput}
              value={mealLog}
              onChangeText={setMealLog}
              placeholder="Describe your meal (e.g., 'Grilled chicken with broccoli')"
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Net Carbs (g)</Text>
            <TextInput
              style={styles.textInput}
              value={netCarbs}
              onChangeText={setNetCarbs}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text style={styles.carbNote}>
              {parseFloat(netCarbs) > 15 ? '⚠️ Over 15g limit' : '✅ Within limit'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Symptoms</Text>
            <TextInput
              style={styles.textInput}
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Any symptoms? (e.g., 'none', 'bloating', 'energy boost')"
              multiline
            />
          </View>

          {/* Mood and Energy Selection */}
          <View style={styles.moodEnergySection}>
            <View style={styles.selectionGroup}>
              <Text style={styles.inputLabel}>Mood</Text>
              <View style={styles.selectionButtons}>
                {(['excellent', 'good', 'fair', 'poor'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.selectionButton,
                      mood === m && styles.selectionButtonActive
                    ]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      mood === m && styles.selectionButtonTextActive
                    ]}>
                      {getMoodIcon(m)} {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectionGroup}>
              <Text style={styles.inputLabel}>Energy Level</Text>
              <View style={styles.selectionButtons}>
                {(['high', 'medium', 'low'] as const).map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[
                      styles.selectionButton,
                      energy === e && styles.selectionButtonActive
                    ]}
                    onPress={() => setEnergy(e)}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      energy === e && styles.selectionButtonTextActive
                    ]}>
                      {getEnergyIcon(e)} {e}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkInButton}
            onPress={checkIn}
          >
            <CheckCircle color="#ffffff" size={20} />
            <Text style={styles.checkInButtonText}>Complete Day {currentDay}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Challenge Complete */}
      {isChallengeComplete && (
        <View style={styles.completionSection}>
          <Award color="#f59e0b" size={64} />
          <Text style={styles.completionTitle}>Challenge Complete! 🎉</Text>
          <Text style={styles.completionSubtitle}>
            Congratulations! You've completed the 10-day Wheat Belly Detox Challenge.
          </Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => shareProgress({ day: 10, date: '', mealLog: '', symptoms: '', netCarbs: 0, completed: true, mood: 'excellent', energy: 'high' })}
          >
            <Share2 color="#ffffff" size={20} />
            <Text style={styles.shareButtonText}>Share Achievement</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Previous Days */}
      <View style={styles.previousDaysSection}>
        <Text style={styles.sectionTitle}>Previous Days</Text>
        {detoxDays.slice(0, currentDay - 1).reverse().map((day) => (
          <View key={day.day} style={styles.previousDayCard}>
            <View style={styles.previousDayHeader}>
              <Text style={styles.previousDayTitle}>Day {day.day}</Text>
              <Text style={styles.previousDayDate}>{day.date}</Text>
            </View>
            
            <View style={styles.previousDayContent}>
              <Text style={styles.previousDayMeal}>{day.mealLog}</Text>
              <Text style={styles.previousDayCarbs}>Net Carbs: {day.netCarbs}g</Text>
              <Text style={styles.previousDaySymptoms}>Symptoms: {day.symptoms}</Text>
              <View style={styles.previousDayMood}>
                <Text>Mood: {getMoodIcon(day.mood)} {day.mood}</Text>
                <Text>Energy: {getEnergyIcon(day.energy)} {day.energy}</Text>
              </View>
            </View>

            {day.badge && (
              <View style={styles.badgeContainer}>
                <Star color="#f59e0b" size={16} />
                <Text style={styles.badgeText}>{day.badge}</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.shareDayButton}
              onPress={() => shareProgress(day)}
            >
              <Share2 color="#6b7280" size={16} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
    opacity: 0.9,
  },
  progressSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  checkInSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minHeight: 48,
  },
  carbNote: {
    fontSize: 14,
    marginTop: 4,
    fontStyle: 'italic',
  },
  moodEnergySection: {
    marginBottom: 20,
  },
  selectionGroup: {
    marginBottom: 16,
  },
  selectionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  selectionButtonActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  selectionButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectionButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  checkInButton: {
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  checkInButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  completionSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previousDaysSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previousDayCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  previousDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previousDayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  previousDayDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  previousDayContent: {
    marginBottom: 12,
  },
  previousDayMeal: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  previousDayCarbs: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginBottom: 4,
  },
  previousDaySymptoms: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  previousDayMood: {
    flexDirection: 'row',
    gap: 16,
  },
  previousDayMood: {
    flexDirection: 'row',
    gap: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 4,
  },
  shareDayButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});

export default DetoxChallenge;








