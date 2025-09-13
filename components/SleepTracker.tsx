import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SleepRecord {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  totalHours: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
  factors: string[];
}

export default function SleepTracker() {
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([
    {
      id: '1',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
      bedtime: '22:30',
      wakeTime: '06:30',
      totalHours: 8.0,
      quality: 'good',
      notes: 'Felt refreshed this morning',
      factors: ['Screen time before bed']
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
      bedtime: '23:00',
      wakeTime: '07:00',
      totalHours: 8.0,
      quality: 'excellent',
      notes: 'Perfect sleep, no interruptions',
      factors: []
    },
    {
      id: '3',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
      bedtime: '22:15',
      wakeTime: '06:15',
      totalHours: 8.0,
      quality: 'good',
      notes: 'Woke up once during the night',
      factors: ['Room too warm']
    }
  ]);

  // Clean up records older than 7 days
  useEffect(() => {
    const cleanOldRecords = () => {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      setSleepRecords(prevRecords => 
        prevRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= sevenDaysAgo;
        })
      );
    };

    // Clean immediately and then every day
    cleanOldRecords();
    const interval = setInterval(cleanOldRecords, 24 * 60 * 60 * 1000); // Check daily

    return () => clearInterval(interval);
  }, []);
  const [currentRecord, setCurrentRecord] = useState<Partial<SleepRecord>>({});
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [showBedtimePicker, setShowBedtimePicker] = useState(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState(false);
  const [bedtimeDate, setBedtimeDate] = useState(new Date());
  const [wakeTimeDate, setWakeTimeDate] = useState(new Date());

  const sleepQualityColors = {
    excellent: '#4CAF50',
    good: '#8BC34A',
    fair: '#FFC107',
    poor: '#F44336'
  };

  const sleepFactors = [
    'Caffeine after 2pm',
    'Screen time before bed',
    'Exercise late evening',
    'Large meal before bed',
    'Stress/anxiety',
    'Room too warm',
    'Noise/light pollution',
    'Alcohol consumption',
    'Irregular schedule',
    'Medications'
  ];

  const handleBedtimeChange = (event: any, selectedDate?: Date) => {
    setShowBedtimePicker(false);
    if (selectedDate) {
      setBedtimeDate(selectedDate);
      const timeString = selectedDate.toTimeString().slice(0, 5); // HH:MM format
      setCurrentRecord(prev => ({ ...prev, bedtime: timeString }));
      calculateSleepHours(timeString, currentRecord.wakeTime);
    }
  };

  const handleWakeTimeChange = (event: any, selectedDate?: Date) => {
    setShowWakeTimePicker(false);
    if (selectedDate) {
      setWakeTimeDate(selectedDate);
      const timeString = selectedDate.toTimeString().slice(0, 5); // HH:MM format
      setCurrentRecord(prev => ({ ...prev, wakeTime: timeString }));
      calculateSleepHours(currentRecord.bedtime, timeString);
    }
  };

  const calculateSleepHours = (bedtime?: string, wakeTime?: string) => {
    if (bedtime && wakeTime) {
      const [bedHour, bedMin] = bedtime.split(':').map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);
      
      let bedTimeMinutes = bedHour * 60 + bedMin;
      let wakeTimeMinutes = wakeHour * 60 + wakeMin;
      
      // Handle crossing midnight
      if (wakeTimeMinutes < bedTimeMinutes) {
        wakeTimeMinutes += 24 * 60; // Add 24 hours
      }
      
      const totalMinutes = wakeTimeMinutes - bedTimeMinutes;
      const totalHours = Math.round((totalMinutes / 60) * 10) / 10; // Round to 1 decimal
      
      setCurrentRecord(prev => ({ ...prev, totalHours }));
    }
  };

  const addSleepRecord = () => {
    if (!currentRecord.bedtime || !currentRecord.wakeTime || !currentRecord.quality) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      bedtime: currentRecord.bedtime!,
      wakeTime: currentRecord.wakeTime!,
      totalHours: currentRecord.totalHours || 0,
      quality: currentRecord.quality!,
      notes: currentRecord.notes || '',
      factors: currentRecord.factors || []
    };

    setSleepRecords([newRecord, ...sleepRecords]);
    setCurrentRecord({});
    setIsAddingRecord(false);
  };

  const calculateSleepScore = (hours: number, quality: string) => {
    let score = 0;
    
    // Hours scoring (7-9 hours is optimal)
    if (hours >= 7 && hours <= 9) score += 40;
    else if (hours >= 6 && hours <= 10) score += 30;
    else if (hours >= 5 && hours <= 11) score += 20;
    else score += 10;

    // Quality scoring
    switch (quality) {
      case 'excellent': score += 60; break;
      case 'good': score += 45; break;
      case 'fair': score += 30; break;
      case 'poor': score += 15; break;
    }

    return Math.min(100, score);
  };

  const getSleepAdvice = (score: number) => {
    if (score >= 80) return "Excellent sleep! Keep up your healthy habits.";
    if (score >= 60) return "Good sleep, but there's room for improvement.";
    if (score >= 40) return "Your sleep needs attention. Focus on consistency.";
    return "Poor sleep quality. Consider consulting a sleep specialist.";
  };

  const getWeeklyAverage = () => {
    if (sleepRecords.length === 0) return 0;
    const recentRecords = sleepRecords.slice(0, 7);
    const totalHours = recentRecords.reduce((sum, record) => sum + record.totalHours, 0);
    return totalHours / recentRecords.length;
  };

  const getWeeklyScore = () => {
    if (sleepRecords.length === 0) return 0;
    const recentRecords = sleepRecords.slice(0, 7);
    const totalScore = recentRecords.reduce((sum, record) => 
      sum + calculateSleepScore(record.totalHours, record.quality), 0);
    return totalScore / recentRecords.length;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="moon" size={24} color="#6B73FF" />
        <Text style={styles.title}>Sleep Tracker</Text>
      </View>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Week's Sleep</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Avg. Hours</Text>
            <Text style={styles.summaryValue}>{getWeeklyAverage().toFixed(1)}h</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Sleep Score</Text>
            <Text style={styles.summaryValue}>{getWeeklyScore().toFixed(0)}/100</Text>
          </View>
        </View>
        <Text style={styles.adviceText}>{getSleepAdvice(getWeeklyScore())}</Text>
      </View>

      {/* Add New Record */}
      {!isAddingRecord ? (
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setIsAddingRecord(true)}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add Sleep Record</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addRecordCard}>
          <Text style={styles.addRecordTitle}>Add Sleep Record</Text>
          
          {/* Time Inputs */}
          <View style={styles.timeInputRow}>
            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>Bedtime</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowBedtimePicker(true)}>
                <Text style={styles.timeButtonText}>
                  {currentRecord.bedtime || 'Set Time'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.inputLabel}>Wake Time</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => setShowWakeTimePicker(true)}>
                <Text style={styles.timeButtonText}>
                  {currentRecord.wakeTime || 'Set Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quality Selection */}
          <View style={styles.qualitySection}>
            <Text style={styles.inputLabel}>Sleep Quality</Text>
            <View style={styles.qualityButtons}>
              {(['excellent', 'good', 'fair', 'poor'] as const).map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.qualityButton,
                    currentRecord.quality === quality && styles.qualityButtonActive
                  ]}
                  onPress={() => setCurrentRecord({...currentRecord, quality})}
                >
                  <Text style={[
                    styles.qualityButtonText,
                    currentRecord.quality === quality && styles.qualityButtonTextActive
                  ]}>
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sleep Factors */}
          <View style={styles.factorsSection}>
            <Text style={styles.inputLabel}>Sleep Factors (Select all that apply)</Text>
            <View style={styles.factorsGrid}>
              {sleepFactors.map((factor) => (
                <TouchableOpacity
                  key={factor}
                  style={[
                    styles.factorButton,
                    currentRecord.factors?.includes(factor) && styles.factorButtonActive
                  ]}
                  onPress={() => {
                    const factors = currentRecord.factors || [];
                    const newFactors = factors.includes(factor)
                      ? factors.filter(f => f !== factor)
                      : [...factors, factor];
                    setCurrentRecord({...currentRecord, factors: newFactors});
                  }}
                >
                  <Text style={[
                    styles.factorButtonText,
                    currentRecord.factors?.includes(factor) && styles.factorButtonTextActive
                  ]}>
                    {factor}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
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
              onPress={addSleepRecord}
            >
              <Text style={styles.saveButtonText}>Save Record</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sleep Records */}
      {sleepRecords.length > 0 && (
        <View style={styles.recordsSection}>
          <Text style={styles.recordsTitle}>Recent Sleep Records</Text>
          {sleepRecords.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>{record.date}</Text>
                <View style={[
                  styles.qualityBadge,
                  { backgroundColor: sleepQualityColors[record.quality] }
                ]}>
                  <Text style={styles.qualityBadgeText}>{record.quality}</Text>
                </View>
              </View>
              <View style={styles.recordDetails}>
                <Text style={styles.recordTime}>
                  {record.bedtime} - {record.wakeTime} ({record.totalHours}h)
                </Text>
                <Text style={styles.recordScore}>
                  Score: {calculateSleepScore(record.totalHours, record.quality)}/100
                </Text>
              </View>
              {record.factors.length > 0 && (
                <View style={styles.recordFactors}>
                  <Text style={styles.factorsLabel}>Factors:</Text>
                  <Text style={styles.factorsText}>{record.factors.join(', ')}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Sleep Tips */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Sleep Optimization Tips</Text>
        <Text style={styles.tipText}>• Aim for 7-9 hours of quality sleep</Text>
        <Text style={styles.tipText}>• Avoid caffeine after 2pm</Text>
        <Text style={styles.tipText}>• Keep bedroom cool (65-68°F)</Text>
        <Text style={styles.tipText}>• No screens 1 hour before bed</Text>
        <Text style={styles.tipText}>• Consistent sleep/wake times</Text>
        <Text style={styles.tipText}>• Dark, quiet sleeping environment</Text>
      </View>

      {/* Time Pickers - Only show on mobile platforms */}
      {Platform.OS !== 'web' && showBedtimePicker && (
        <DateTimePicker
          value={bedtimeDate}
          mode="time"
          is24Hour={false}
          onChange={handleBedtimeChange}
        />
      )}
      
      {Platform.OS !== 'web' && showWakeTimePicker && (
        <DateTimePicker
          value={wakeTimeDate}
          mode="time"
          is24Hour={false}
          onChange={handleWakeTimeChange}
        />
      )}

      {/* Web fallback - Simple text input for time */}
      {Platform.OS === 'web' && showBedtimePicker && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.webTimeModal}>
            <View style={styles.webTimeContent}>
              <Text style={styles.webTimeTitle}>Set Bedtime</Text>
              <Text style={styles.webTimeLabel}>Enter time (HH:MM):</Text>
              <TouchableOpacity 
                style={styles.webTimeButton}
                onPress={() => {
                  const time = prompt('Enter bedtime (HH:MM format, e.g., 22:30)');
                  if (time && time.match(/^\d{1,2}:\d{2}$/)) {
                    setCurrentRecord(prev => ({ ...prev, bedtime: time }));
                    calculateSleepHours(time, currentRecord.wakeTime);
                  }
                  setShowBedtimePicker(false);
                }}
              >
                <Text style={styles.webTimeButtonText}>Enter Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.webTimeCancelButton}
                onPress={() => setShowBedtimePicker(false)}
              >
                <Text style={styles.webTimeCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'web' && showWakeTimePicker && (
        <Modal visible={true} transparent={true} animationType="slide">
          <View style={styles.webTimeModal}>
            <View style={styles.webTimeContent}>
              <Text style={styles.webTimeTitle}>Set Wake Time</Text>
              <Text style={styles.webTimeLabel}>Enter time (HH:MM):</Text>
              <TouchableOpacity 
                style={styles.webTimeButton}
                onPress={() => {
                  const time = prompt('Enter wake time (HH:MM format, e.g., 07:00)');
                  if (time && time.match(/^\d{1,2}:\d{2}$/)) {
                    setCurrentRecord(prev => ({ ...prev, wakeTime: time }));
                    calculateSleepHours(currentRecord.bedtime, time);
                  }
                  setShowWakeTimePicker(false);
                }}
              >
                <Text style={styles.webTimeButtonText}>Enter Time</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.webTimeCancelButton}
                onPress={() => setShowWakeTimePicker(false)}
              >
                <Text style={styles.webTimeCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B73FF',
  },
  adviceText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#6B73FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addRecordCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addRecordTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#666',
    fontSize: 16,
  },
  qualitySection: {
    marginBottom: 20,
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  qualityButtonActive: {
    backgroundColor: '#6B73FF',
    borderColor: '#6B73FF',
  },
  qualityButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  qualityButtonTextActive: {
    color: 'white',
  },
  factorsSection: {
    marginBottom: 20,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  factorButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    width: '48%',
    alignItems: 'center',
  },
  factorButtonActive: {
    backgroundColor: '#6B73FF',
    borderColor: '#6B73FF',
  },
  factorButtonText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  factorButtonTextActive: {
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6B73FF',
    borderRadius: 8,
    padding: 16,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recordsSection: {
    marginBottom: 20,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  recordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  recordDetails: {
    marginBottom: 8,
  },
  recordTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recordScore: {
    fontSize: 14,
    color: '#6B73FF',
    fontWeight: '500',
  },
  recordFactors: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  factorsLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  factorsText: {
    fontSize: 12,
    color: '#666',
  },
  tipsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  webTimeModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webTimeContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    minWidth: 280,
    alignItems: 'center',
  },
  webTimeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  webTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  webTimeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  webTimeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webTimeCancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  webTimeCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
