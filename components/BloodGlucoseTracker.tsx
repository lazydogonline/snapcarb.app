import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Activity
} from 'lucide-react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface BloodGlucoseReading {
  id: string;
  date: string;
  time: string;
  glucose_mgdl: number;
  reading_type: 'pre_meal' | 'post_meal_30_60min' | 'fasting' | 'bedtime';
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  minutes_post_meal?: number;
  notes?: string;
  energy_level?: number; // 1-10
  mood?: number; // 1-10
  symptoms?: string[];
}

interface GlucoseInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon: React.ReactNode;
  priority: number; // 1 = highest priority
}

export default function BloodGlucoseTracker() {
  const [readings, setReadings] = useState<BloodGlucoseReading[]>([]);
  const [currentReading, setCurrentReading] = useState<Partial<BloodGlucoseReading>>({});
  const [showInputForm, setShowInputForm] = useState(false);
  const [glucoseInsights, setGlucoseInsights] = useState<GlucoseInsight[]>([]);

  useEffect(() => {
    loadReadings();
  }, []);

  useEffect(() => {
    analyzeGlucosePatterns();
  }, [readings]);

  const loadReadings = async () => {
    // TODO: Load from Supabase
    // For now, using mock data to demonstrate insights
    const mockData: BloodGlucoseReading[] = [
      {
        id: '1',
        date: '2024-01-30',
        time: '07:00',
        glucose_mgdl: 95,
        reading_type: 'fasting',
        energy_level: 7,
        mood: 8
      },
      {
        id: '2',
        date: '2024-01-30',
        time: '09:30',
        glucose_mgdl: 125,
        reading_type: 'post_meal',
        meal_type: 'breakfast',
        minutes_post_meal: 90,
        energy_level: 6,
        mood: 7
      },
      {
        id: '3',
        date: '2024-01-30',
        time: '12:00',
        glucose_mgdl: 88,
        reading_type: 'fasting',
        energy_level: 8,
        mood: 9
      },
      {
        id: '4',
        date: '2024-01-30',
        time: '14:30',
        glucose_mgdl: 118,
        reading_type: 'post_meal',
        meal_type: 'lunch',
        minutes_post_meal: 90,
        energy_level: 7,
        mood: 8
      },
      {
        id: '5',
        date: '2024-01-29',
        time: '07:00',
        glucose_mgdl: 98,
        reading_type: 'fasting',
        energy_level: 6,
        mood: 7
      },
      {
        id: '6',
        date: '2024-01-29',
        time: '09:30',
        glucose_mgdl: 135,
        reading_type: 'post_meal',
        meal_type: 'breakfast',
        minutes_post_meal: 90,
        energy_level: 5,
        mood: 6
      }
    ];
    setReadings(mockData);
  };

  const analyzeGlucosePatterns = () => {
    if (readings.length < 2) return;

    const insights: GlucoseInsight[] = [];

    // Get latest readings by type
    const fastingReadings = readings.filter(r => r.reading_type === 'fasting').slice(-3);
    const postMealReadings = readings.filter(r => r.reading_type === 'post_meal').slice(-3);

    // Fasting glucose analysis
    if (fastingReadings.length >= 2) {
      const latestFasting = fastingReadings[fastingReadings.length - 1];
      const previousFasting = fastingReadings[fastingReadings.length - 2];
      
      if (latestFasting.glucose_mgdl < previousFasting.glucose_mgdl) {
        insights.push({
          type: 'success',
          title: '🎯 Fasting Glucose Improving!',
          message: `Your fasting glucose decreased from ${previousFasting.glucose_mgdl} to ${latestFasting.glucose_mgdl} mg/dL. This indicates better metabolic health and insulin sensitivity.`,
          icon: <TrendingDown size={24} color={colors.success} />,
          priority: 1
        });
      }

      // DR Davis Target Range Check
      if (latestFasting.glucose_mgdl <= 90) {
        insights.push({
          type: 'success',
          title: '✅ Optimal Fasting Glucose',
          message: `Your fasting glucose of ${latestFasting.glucose_mgdl} mg/dL is in the optimal DR Davis range (≤90 mg/dL). Excellent work!`,
          icon: <CheckCircle size={24} color={colors.success} />,
          priority: 2
        });
      } else if (latestFasting.glucose_mgdl <= 100) {
        insights.push({
          type: 'warning',
          title: '⚠️ Pre-Diabetic Range',
          message: `Your fasting glucose of ${latestFasting.glucose_mgdl} mg/dL is in the pre-diabetic range (90-100 mg/dL). Focus on reducing carbs and increasing fat.`,
          icon: <AlertTriangle size={24} color={colors.warning} />,
          priority: 1
        });
      } else {
        insights.push({
          type: 'danger',
          title: '🚨 High Fasting Glucose',
          message: `Your fasting glucose of ${latestFasting.glucose_mgdl} mg/dL is above 100 mg/dL. This requires immediate attention to diet and lifestyle.`,
          icon: <AlertTriangle size={24} color={colors.error} />,
          priority: 1
        });
      }
    }

    // Post-meal glucose analysis
    if (postMealReadings.length >= 2) {
      const latestPostMeal = postMealReadings[postMealReadings.length - 1];
      const previousPostMeal = postMealReadings[postMealReadings.length - 2];
      
      // DR Davis Post-Meal Target Check
      if (latestPostMeal.glucose_mgdl <= 120) {
        insights.push({
          type: 'success',
          title: '🎯 Post-Meal Glucose On Target',
          message: `Your post-meal glucose of ${latestPostMeal.glucose_mgdl} mg/dL is within the optimal DR Davis range (≤120 mg/dL). Your meal choices are working!`,
          icon: <CheckCircle size={24} color={colors.success} />,
          priority: 2
        });
      } else if (latestPostMeal.glucose_mgdl <= 140) {
        insights.push({
          type: 'warning',
          title: '⚠️ Post-Meal Glucose Elevated',
          message: `Your post-meal glucose of ${latestPostMeal.glucose_mgdl} mg/dL is above the optimal range. Consider reducing carbs in this meal.`,
          icon: <AlertTriangle size={24} color={colors.warning} />,
          priority: 2
        });
      } else {
        insights.push({
          type: 'danger',
          title: '🚨 High Post-Meal Glucose',
          message: `Your post-meal glucose of ${latestPostMeal.glucose_mgdl} mg/dL is significantly elevated. This meal likely had too many carbs.`,
          icon: <AlertTriangle size={24} color={colors.error} />,
          priority: 1
        });
      }

      // Glucose variability analysis
      if (Math.abs(latestPostMeal.glucose_mgdl - previousPostMeal.glucose_mgdl) > 30) {
        insights.push({
          type: 'warning',
          title: '📊 High Glucose Variability',
          message: `Your glucose readings vary significantly (${Math.abs(latestPostMeal.glucose_mgdl - previousPostMeal.glucose_mgdl)} mg/dL difference). This suggests inconsistent meal timing or composition.`,
          icon: <Activity size={24} color={colors.warning} />,
          priority: 2
        });
      }
    }

    // Energy and mood correlation
    const recentReadings = readings.slice(-5);
    const highGlucoseReadings = recentReadings.filter(r => r.glucose_mgdl > 120);
    const lowGlucoseReadings = recentReadings.filter(r => r.glucose_mgdl <= 90);
    
    if (highGlucoseReadings.length > 0 && lowGlucoseReadings.length > 0) {
      const avgHighEnergy = highGlucoseReadings.reduce((sum, r) => sum + (r.energy_level || 0), 0) / highGlucoseReadings.length;
      const avgLowEnergy = lowGlucoseReadings.reduce((sum, r) => sum + (r.energy_level || 0), 0) / lowGlucoseReadings.length;
      
      if (avgLowEnergy > avgHighEnergy + 1) {
        insights.push({
          type: 'success',
          title: '⚡ Energy Pattern Detected',
          message: `You have ${Math.round(avgLowEnergy - avgHighEnergy)}x better energy when glucose is ≤90 mg/dL vs >120 mg/dL. This confirms the DR Davis approach is working!`,
          icon: <TrendingUp size={24} color={colors.success} />,
          priority: 3
        });
      }
    }

    // Sort insights by priority and limit to top 5
    insights.sort((a, b) => a.priority - b.priority);
    setGlucoseInsights(insights.slice(0, 5));
  };

  const saveReading = async () => {
    if (!currentReading.glucose_mgdl || !currentReading.reading_type) {
      Alert.alert('Missing Data', 'Please enter glucose level and reading type.');
      return;
    }

    const newReading: BloodGlucoseReading = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: currentReading.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      glucose_mgdl: currentReading.glucose_mgdl!,
      reading_type: currentReading.reading_type!,
      meal_type: currentReading.meal_type,
      minutes_post_meal: currentReading.minutes_post_meal,
      notes: currentReading.notes,
      energy_level: currentReading.energy_level,
      mood: currentReading.mood,
      symptoms: currentReading.symptoms
    };

    setReadings(prev => [newReading, ...prev]);
    setCurrentReading({});
    setShowInputForm(false);
    
    // TODO: Save to Supabase
    Alert.alert('Success', 'Glucose reading saved successfully!');
  };

  const getGlucoseStatus = (glucose: number, readingType: string) => {
    if (readingType === 'fasting') {
      if (glucose <= 90) return { status: 'Optimal', color: colors.success };
      if (glucose <= 100) return { status: 'Pre-Diabetic', color: colors.warning };
      return { status: 'High', color: colors.error };
    } else {
      if (glucose <= 120) return { status: 'Optimal', color: colors.success };
      if (glucose <= 140) return { status: 'Elevated', color: colors.warning };
      return { status: 'High', color: colors.error };
    }
  };

  const renderGlucoseInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Glucose Insights</Text>
      {glucoseInsights.length > 0 ? (
        glucoseInsights.map((insight, index) => (
          <View key={index} style={[styles.insightCard, styles[`insight${insight.type}`]]}>
            <View style={styles.insightHeader}>
              {insight.icon}
              <Text style={styles.insightTitle}>{insight.title}</Text>
            </View>
            <Text style={styles.insightMessage}>{insight.message}</Text>
          </View>
        ))
      ) : (
        <View style={styles.noInsightsCard}>
          <Info size={24} color={colors.textSecondary} />
          <Text style={styles.noInsightsText}>
            Track at least 2 glucose readings to see insights and detect patterns.
          </Text>
        </View>
      )}
    </View>
  );

  const renderInputForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add Glucose Reading</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Glucose (mg/dL) *</Text>
          <TextInput
            style={styles.input}
            value={currentReading.glucose_mgdl?.toString() || ''}
            onChangeText={(text) => setCurrentReading(prev => ({ ...prev, glucose_mgdl: parseInt(text) || undefined }))}
            placeholder="95"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Time</Text>
          <TextInput
            style={styles.input}
            value={currentReading.time || ''}
            onChangeText={(text) => setCurrentReading(prev => ({ ...prev, time: text }))}
            placeholder="07:00"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reading Type *</Text>
          <View style={styles.typeButtons}>
            {(['fasting', 'post_meal', 'random', 'bedtime'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  currentReading.reading_type === type && styles.typeButtonActive
                ]}
                onPress={() => setCurrentReading(prev => ({ ...prev, reading_type: type }))}
              >
                <Text style={[
                  styles.typeButtonText,
                  currentReading.reading_type === type && styles.typeButtonTextActive
                ]}>
                  {type.replace('_', ' ').toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {currentReading.reading_type === 'post_meal' && (
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meal Type</Text>
            <View style={styles.mealTypeButtons}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                <TouchableOpacity
                  key={meal}
                  style={[
                    styles.mealTypeButton,
                    currentReading.meal_type === meal && styles.mealTypeButtonActive
                  ]}
                  onPress={() => setCurrentReading(prev => ({ ...prev, meal_type: meal }))}
                >
                  <Text style={[
                    styles.mealTypeButtonText,
                    currentReading.meal_type === meal && styles.mealTypeButtonTextActive
                  ]}>
                    {meal.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minutes Post-Meal</Text>
            <TextInput
              style={styles.input}
              value={currentReading.minutes_post_meal?.toString() || ''}
              onChangeText={(text) => setCurrentReading(prev => ({ ...prev, minutes_post_meal: parseInt(text) || undefined }))}
              placeholder="90"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Energy Level (1-10)</Text>
          <TextInput
            style={styles.input}
            value={currentReading.energy_level?.toString() || ''}
            onChangeText={(text) => setCurrentReading(prev => ({ ...prev, energy_level: parseInt(text) || undefined }))}
            placeholder="8"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mood (1-10)</Text>
          <TextInput
            style={styles.input}
            value={currentReading.mood?.toString() || ''}
            onChangeText={(text) => setCurrentReading(prev => ({ ...prev, mood: parseInt(text) || undefined }))}
            placeholder="8"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentReading.notes || ''}
          onChangeText={(text) => setCurrentReading(prev => ({ ...prev, notes: text }))}
          placeholder="Any symptoms? How do you feel? What did you eat?"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowInputForm(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveReading}
        >
          <Text style={styles.saveButtonText}>Save Reading</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReadingsHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Glucose History</Text>
      {readings.map((reading) => {
        const status = getGlucoseStatus(reading.glucose_mgdl, reading.reading_type);
        return (
          <View key={reading.id} style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <View>
                <Text style={styles.readingDateTime}>
                  {reading.date} at {reading.time}
                </Text>
                <Text style={styles.readingType}>
                  {reading.reading_type.replace('_', ' ').toUpperCase()}
                  {reading.meal_type && ` - ${reading.meal_type}`}
                </Text>
              </View>
              <View style={styles.glucoseDisplay}>
                <Text style={styles.glucoseValue}>{reading.glucose_mgdl}</Text>
                <Text style={styles.glucoseUnit}>mg/dL</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                  <Text style={[styles.statusText, { color: status.color }]}>
                    {status.status}
                  </Text>
                </View>
              </View>
            </View>
            
            {reading.energy_level && (
              <View style={styles.metricsRow}>
                <Text style={styles.metricLabel}>Energy: {reading.energy_level}/10</Text>
                <Text style={styles.metricLabel}>Mood: {reading.mood}/10</Text>
              </View>
            )}

            {reading.notes && (
              <Text style={styles.readingNotes}>{reading.notes}</Text>
            )}
          </View>
        );
      })}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Blood Glucose Tracker</Text>
        <Text style={styles.headerSubtitle}>
          Monitor your metabolic health with DR Davis targets
        </Text>
      </LinearGradient>

      {renderGlucoseInsights()}

      {!showInputForm ? (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowInputForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Glucose Reading</Text>
        </TouchableOpacity>
      ) : (
        renderInputForm()
      )}

      {renderReadingsHistory()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightsuccess: {
    backgroundColor: colors.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  insightwarning: {
    backgroundColor: colors.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  insightdanger: {
    backgroundColor: colors.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  insightinfo: {
    backgroundColor: colors.info + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  insightMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noInsightsCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  noInsightsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 16,
    margin: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.cardBackground,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  mealTypeButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
  },
  mealTypeButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  mealTypeButtonText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  mealTypeButtonTextActive: {
    color: colors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  readingCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  readingDateTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  readingType: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  glucoseDisplay: {
    alignItems: 'center',
  },
  glucoseValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  glucoseUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  readingNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
