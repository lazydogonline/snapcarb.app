import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GlucoseRecord {
  id: string;
  date: string;
  fastingTime: string;
  postMealTime: string;
  fastingGlucose: number;
  postMealGlucose: number;
  timeDifference: number; // minutes
  glucoseChange: number;
  drDavisScore: number; // 0-100
  mealDescription: string;
  notes: string;
}

export default function GlucoseTracker() {
  const [glucoseRecords, setGlucoseRecords] = useState<GlucoseRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Partial<GlucoseRecord>>({});
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  const calculateTimeDifference = (fastingTime: string, postMealTime: string): number => {
    const [fastingHour, fastingMin] = fastingTime.split(':').map(Number);
    const [postHour, postMin] = postMealTime.split(':').map(Number);
    
    let diff = (postHour * 60 + postMin) - (fastingHour * 60 + fastingMin);
    if (diff < 0) diff += 24 * 60; // Handle overnight
    return diff;
  };

  const calculateDRDavisScore = (glucoseChange: number): number => {
    // DR Davis "No Change Rule" - target: 0-10 mg/dL increase
    if (glucoseChange <= 10) return 100; // Perfect - no change
    if (glucoseChange <= 20) return 80;  // Good - minimal change
    if (glucoseChange <= 30) return 60;  // Fair - moderate change
    if (glucoseChange <= 40) return 40;  // Poor - significant change
    return 20; // Concerning - major spike
  };

  const addGlucoseRecord = () => {
    if (!currentRecord.fastingTime || !currentRecord.postMealTime || 
        !currentRecord.fastingGlucose || !currentRecord.postMealGlucose) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const timeDifference = calculateTimeDifference(
      currentRecord.fastingTime!, 
      currentRecord.postMealTime!
    );
    
    const glucoseChange = currentRecord.postMealGlucose! - currentRecord.fastingGlucose!;
    const drDavisScore = calculateDRDavisScore(glucoseChange);

    const newRecord: GlucoseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      fastingTime: currentRecord.fastingTime!,
      postMealTime: currentRecord.postMealTime!,
      fastingGlucose: currentRecord.fastingGlucose!,
      postMealGlucose: currentRecord.postMealGlucose!,
      timeDifference,
      glucoseChange,
      drDavisScore,
      mealDescription: currentRecord.mealDescription || '',
      notes: currentRecord.notes || ''
    };

    setGlucoseRecords([newRecord, ...glucoseRecords]);
    setCurrentRecord({});
    setIsAddingRecord(false);
  };

  const getDRDavisAdvice = (score: number, glucoseChange: number): string => {
    if (score >= 80) return "Excellent! You're following DR Davis 'No Change Rule' perfectly.";
    if (score >= 60) return "Good metabolic health. Consider adjusting your meal timing.";
    if (score >= 40) return "Moderate glucose spike. Review what caused this increase.";
    return "Significant glucose spike. This meal had hidden carbs/sugars.";
  };

  const getWeeklyAverage = () => {
    if (glucoseRecords.length === 0) return 0;
    const recentRecords = glucoseRecords.slice(0, 7);
    const totalScore = recentRecords.reduce((sum, record) => sum + record.drDavisScore, 0);
    return totalScore / recentRecords.length;
  };

  const getSuccessRate = () => {
    if (glucoseRecords.length === 0) return 0;
    const perfectRecords = glucoseRecords.filter(record => record.drDavisScore >= 80);
    return (perfectRecords.length / glucoseRecords.length) * 100;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🩸 Glucose Testing</Text>
        <Text style={styles.subtitle}>DR Davis "No Change Rule" Tracker</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{getWeeklyAverage().toFixed(0)}</Text>
          <Text style={styles.statLabel}>Weekly Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{getSuccessRate().toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{glucoseRecords.length}</Text>
          <Text style={styles.statLabel}>Tests Recorded</Text>
        </View>
      </View>

      {/* Add New Record Button */}
      {!isAddingRecord && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddingRecord(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Glucose Test</Text>
        </TouchableOpacity>
      )}

      {/* Add Record Form */}
      {isAddingRecord && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>New Glucose Test</Text>
          
          {/* Time Inputs */}
          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>🕐 Fasting Time</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                value={currentRecord.fastingTime}
                onChangeText={(text) => setCurrentRecord({...currentRecord, fastingTime: text})}
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>🕐 Post-Meal Time</Text>
              <TextInput
                style={styles.input}
                placeholder="10:30"
                value={currentRecord.postMealTime}
                onChangeText={(text) => setCurrentRecord({...currentRecord, postMealTime: text})}
              />
            </View>
          </View>

          {/* Glucose Inputs */}
          <View style={styles.glucoseContainer}>
            <View style={styles.glucoseInput}>
              <Text style={styles.inputLabel}>🩸 Fasting Glucose (mg/dL)</Text>
              <TextInput
                style={styles.input}
                placeholder="85"
                keyboardType="numeric"
                value={currentRecord.fastingGlucose?.toString()}
                onChangeText={(text) => setCurrentRecord({...currentRecord, fastingGlucose: Number(text)})}
              />
            </View>
            <View style={styles.glucoseInput}>
              <Text style={styles.inputLabel}>🩸 Post-Meal Glucose (mg/dL)</Text>
              <TextInput
                style={styles.input}
                placeholder="87"
                keyboardType="numeric"
                value={currentRecord.postMealGlucose?.toString()}
                onChangeText={(text) => setCurrentRecord({...currentRecord, postMealGlucose: Number(text)})}
              />
            </View>
          </View>

          {/* Meal Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🍽️ Meal Description</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What did you eat?"
              value={currentRecord.mealDescription}
              onChangeText={(text) => setCurrentRecord({...currentRecord, mealDescription: text})}
            />
          </View>

          {/* Notes */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>📝 Notes</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Any observations?"
              value={currentRecord.notes}
              onChangeText={(text) => setCurrentRecord({...currentRecord, notes: text})}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => {
                setIsAddingRecord(false);
                setCurrentRecord({});
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={addGlucoseRecord}
            >
              <Text style={styles.saveButtonText}>Save Test</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Recent Records */}
      <View style={styles.recordsContainer}>
        <Text style={styles.sectionTitle}>Recent Tests</Text>
        {glucoseRecords.map((record) => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordDate}>{record.date}</Text>
              <View style={[styles.scoreBadge, { backgroundColor: record.drDavisScore >= 80 ? '#4CAF50' : record.drDavisScore >= 60 ? '#8BC34A' : record.drDavisScore >= 40 ? '#FFC107' : '#F44336' }]}>
                <Text style={styles.scoreText}>{record.drDavisScore}</Text>
              </View>
            </View>
            
            <View style={styles.recordDetails}>
              <Text style={styles.recordText}>
                🕐 {record.fastingTime} → {record.postMealTime} ({record.timeDifference} min)
              </Text>
              <Text style={styles.recordText}>
                🩸 {record.fastingGlucose} → {record.postMealGlucose} mg/dL
              </Text>
              <Text style={styles.recordText}>
                📊 Change: {record.glucoseChange > 0 ? '+' : ''}{record.glucoseChange} mg/dL
              </Text>
              {record.mealDescription && (
                <Text style={styles.recordText}>🍽️ {record.mealDescription}</Text>
              )}
            </View>
            
            <Text style={styles.adviceText}>
              💡 {getDRDavisAdvice(record.drDavisScore, record.glucoseChange)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  formContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
  },
  glucoseContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  glucoseInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  recordsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  recordDetails: {
    marginBottom: 12,
  },
  recordText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  adviceText: {
    fontSize: 14,
    color: '#059669',
    fontStyle: 'italic',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
  },
});
