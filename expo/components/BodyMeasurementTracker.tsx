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
  Scale, 
  Ruler, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Trophy,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react-native';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface BodyMeasurement {
  id: string;
  date: string;
  weight: number; // kg
  waist: number; // cm
  hip: number; // cm
  chest: number; // cm
  biceps: number; // cm
  thighs: number; // cm
  bodyFatPercentage?: number; // %
  muscleMass?: number; // kg
  notes?: string;
}

interface ProgressInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  icon: React.ReactNode;
}

export default function BodyMeasurementTracker() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [currentMeasurement, setCurrentMeasurement] = useState<Partial<BodyMeasurement>>({});
  const [showInputForm, setShowInputForm] = useState(false);
  const [progressInsights, setProgressInsights] = useState<ProgressInsight[]>([]);

  useEffect(() => {
    loadMeasurements();
  }, []);

  useEffect(() => {
    analyzeProgress();
  }, [measurements]);

  const loadMeasurements = async () => {
    // TODO: Load from Supabase
    // For now, using mock data
    const mockData: BodyMeasurement[] = [
      {
        id: '1',
        date: '2024-01-01',
        weight: 80.0,
        waist: 95,
        hip: 105,
        chest: 100,
        biceps: 32,
        thighs: 58,
        bodyFatPercentage: 25,
        muscleMass: 60
      },
      {
        id: '2',
        date: '2024-01-15',
        weight: 79.5,
        waist: 93,
        hip: 103,
        chest: 101,
        biceps: 33,
        thighs: 59,
        bodyFatPercentage: 24,
        muscleMass: 60.5
      },
      {
        id: '3',
        date: '2024-01-30',
        weight: 79.0,
        waist: 91,
        hip: 102,
        chest: 102,
        biceps: 34,
        thighs: 60,
        bodyFatPercentage: 23,
        muscleMass: 61
      }
    ];
    setMeasurements(mockData);
  };

  const analyzeProgress = () => {
    if (measurements.length < 2) return;

    const latest = measurements[measurements.length - 1];
    const previous = measurements[measurements.length - 2];
    const insights: ProgressInsight[] = [];

    // Weight change analysis
    const weightChange = latest.weight - previous.weight;
    const weightChangePercent = (weightChange / previous.weight) * 100;

    // Waist change analysis
    const waistChange = latest.waist - previous.waist;
    const waistChangePercent = (waistChange / previous.waist) * 100;

    // Muscle mass analysis
    if (latest.muscleMass && previous.muscleMass) {
      const muscleChange = latest.muscleMass - previous.muscleMass;
      const muscleChangePercent = (muscleChange / previous.muscleMass) * 100;

      // DR Davis Success Pattern Detection
      if (Math.abs(weightChangePercent) < 2 && waistChangePercent < -2 && muscleChangePercent > 1) {
        insights.push({
          type: 'success',
          title: '🎯 DR Davis Success Pattern Detected!',
          message: `Your weight stayed stable (${weightChange.toFixed(1)}kg), but you lost ${Math.abs(waistChange).toFixed(1)}cm from your waist and gained ${muscleChange.toFixed(1)}kg of muscle! This is body recomposition at its finest.`,
          icon: <Trophy size={24} color={colors.success} />
        });
      }
    }

    // Waist-to-hip ratio improvement
    if (latest.waist && latest.hip && previous.waist && previous.hip) {
      const currentRatio = latest.waist / latest.hip;
      const previousRatio = previous.waist / previous.hip;
      
      if (currentRatio < previousRatio) {
        insights.push({
          type: 'success',
          title: '📏 Waist-to-Hip Ratio Improving',
          message: `Your waist-to-hip ratio improved from ${previousRatio.toFixed(2)} to ${currentRatio.toFixed(2)}. This indicates better metabolic health and fat distribution.`,
          icon: <TrendingDown size={24} color={colors.success} />
        });
      }
    }

    // Body fat percentage improvement
    if (latest.bodyFatPercentage && previous.bodyFatPercentage) {
      const fatChange = latest.bodyFatPercentage - previous.bodyFatPercentage;
      if (fatChange < -1) {
        insights.push({
          type: 'success',
          title: '🔥 Body Fat Decreasing',
          message: `Your body fat percentage decreased by ${Math.abs(fatChange).toFixed(1)}%. This is excellent progress!`,
          icon: <TrendingDown size={24} color={colors.success} />
        });
      }
    }

    setProgressInsights(insights);
  };

  const saveMeasurement = async () => {
    if (!currentMeasurement.weight || !currentMeasurement.waist) {
      Alert.alert('Missing Data', 'Please enter at least weight and waist measurements.');
      return;
    }

    const newMeasurement: BodyMeasurement = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      weight: currentMeasurement.weight!,
      waist: currentMeasurement.waist!,
      hip: currentMeasurement.hip || 0,
      chest: currentMeasurement.chest || 0,
      biceps: currentMeasurement.biceps || 0,
      thighs: currentMeasurement.thighs || 0,
      bodyFatPercentage: currentMeasurement.bodyFatPercentage,
      muscleMass: currentMeasurement.muscleMass,
      notes: currentMeasurement.notes
    };

    setMeasurements(prev => [newMeasurement, ...prev]);
    setCurrentMeasurement({});
    setShowInputForm(false);
    
    // TODO: Save to Supabase
    Alert.alert('Success', 'Measurement saved successfully!');
  };

  const renderProgressInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Progress Insights</Text>
      {progressInsights.length > 0 ? (
        progressInsights.map((insight, index) => (
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
            Track at least 2 measurements to see progress insights and detect DR Davis success patterns.
          </Text>
        </View>
      )}
    </View>
  );

  const renderMeasurementForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Add New Measurement</Text>
      
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.weight?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, weight: parseFloat(text) || undefined }))}
            placeholder="75.5"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Waist (cm) *</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.waist?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, waist: parseFloat(text) || undefined }))}
            placeholder="85"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Hip (cm)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.hip?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, hip: parseFloat(text) || undefined }))}
            placeholder="95"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Chest (cm)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.chest?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, chest: parseFloat(text) || undefined }))}
            placeholder="100"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Biceps (cm)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.biceps?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, biceps: parseFloat(text) || undefined }))}
            placeholder="32"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Thighs (cm)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.thighs?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, thighs: parseFloat(text) || undefined }))}
            placeholder="58"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Body Fat (%)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.bodyFatPercentage?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, bodyFatPercentage: parseFloat(text) || undefined }))}
            placeholder="22"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Muscle Mass (kg)</Text>
          <TextInput
            style={styles.input}
            value={currentMeasurement.muscleMass?.toString() || ''}
            onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, muscleMass: parseFloat(text) || undefined }))}
            placeholder="60"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Notes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentMeasurement.notes || ''}
          onChangeText={(text) => setCurrentMeasurement(prev => ({ ...prev, notes: text }))}
          placeholder="How are you feeling? Any changes in energy, mood, or symptoms?"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowInputForm(false)}
          accessibilityLabel="Cancel adding body measurement"
          accessibilityRole="button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveMeasurement}
          accessibilityLabel="Save body measurement"
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>Save Measurement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMeasurementsHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Measurement History</Text>
      {measurements.map((measurement, index) => (
        <View key={measurement.id} style={styles.measurementCard}>
          <View style={styles.measurementHeader}>
            <Text style={styles.measurementDate}>{measurement.date}</Text>
            <Text style={styles.measurementWeight}>{measurement.weight} kg</Text>
          </View>
          
          <View style={styles.measurementGrid}>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Waist</Text>
              <Text style={styles.measurementValue}>{measurement.waist} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Hip</Text>
              <Text style={styles.measurementValue}>{measurement.hip} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Chest</Text>
              <Text style={styles.measurementValue}>{measurement.chest} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Biceps</Text>
              <Text style={styles.measurementValue}>{measurement.biceps} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Thighs</Text>
              <Text style={styles.measurementValue}>{measurement.thighs} cm</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementLabel}>Body Fat</Text>
              <Text style={styles.measurementValue}>{measurement.bodyFatPercentage || '--'}%</Text>
            </View>
          </View>

          {measurement.notes && (
            <Text style={styles.measurementNotes}>{measurement.notes}</Text>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Body Measurements</Text>
        <Text style={styles.headerSubtitle}>
          Track your DR Davis progress beyond the scale
        </Text>
      </LinearGradient>

      {renderProgressInsights()}

      {!showInputForm ? (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowInputForm(true)}
          accessibilityLabel="Add new body measurement"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ Add New Measurement</Text>
        </TouchableOpacity>
      ) : (
        renderMeasurementForm()
      )}

      {renderMeasurementsHistory()}
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
  measurementCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  measurementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  measurementDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  measurementWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  measurementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementItem: {
    width: '48%',
    marginBottom: 12,
  },
  measurementLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  measurementNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});


