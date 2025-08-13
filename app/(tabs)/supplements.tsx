import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Pill, CheckCircle, Circle, RotateCcw } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';

export default function SupplementsScreen() {
  const { supplements, toggleSupplement, resetDailySupplements } = useHealth();
  
  const takenCount = supplements.filter(s => s.taken).length;
  const completionPercentage = (takenCount / supplements.length) * 100;

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Supplements</Text>
        <Text style={styles.headerSubtitle}>
          {takenCount}/{supplements.length} taken today ({completionPercentage.toFixed(0)}%)
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${completionPercentage}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>
            Daily Progress: {completionPercentage.toFixed(0)}%
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={resetDailySupplements}
          >
            <RotateCcw color="#6b7280" size={20} />
            <Text style={styles.resetButtonText}>Reset Daily Progress</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Today&apos;s Supplements</Text>

        {supplements.map((supplement) => (
          <TouchableOpacity
            key={supplement.id}
            style={[
              styles.supplementCard,
              supplement.taken && styles.supplementCardTaken
            ]}
            onPress={() => toggleSupplement(supplement.id)}
          >
            <View style={styles.supplementHeader}>
              <View style={styles.supplementIcon}>
                <Pill 
                  color={supplement.taken ? '#22c55e' : '#9ca3af'} 
                  size={24} 
                />
              </View>
              <View style={styles.supplementInfo}>
                <Text style={[
                  styles.supplementName,
                  supplement.taken && styles.supplementNameTaken
                ]}>
                  {supplement.name}
                </Text>
                <Text style={styles.supplementDosage}>
                  {supplement.dosage} • {supplement.frequency}
                </Text>
                {supplement.taken && supplement.takenAt && (
                  <Text style={styles.takenTime}>
                    Taken at {formatTime(supplement.takenAt)}
                  </Text>
                )}
              </View>
              <View style={styles.checkboxContainer}>
                {supplement.taken ? (
                  <CheckCircle color="#22c55e" size={28} />
                ) : (
                  <Circle color="#d1d5db" size={28} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Supplement Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🌅 Morning</Text>
            <Text style={styles.tipText}>
              Take Vitamin D3 with breakfast for better absorption
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🌙 Evening</Text>
            <Text style={styles.tipText}>
              Magnesium before bed helps with sleep and muscle recovery
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🍽️ With Food</Text>
            <Text style={styles.tipText}>
              Omega-3 and fat-soluble vitamins absorb better with meals
            </Text>
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
    backgroundColor: '#8b5cf6',
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
  content: {
    flex: 1,
    padding: 20,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resetButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  supplementCard: {
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
  supplementCardTaken: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  supplementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplementIcon: {
    marginRight: 12,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  supplementNameTaken: {
    color: '#16a34a',
  },
  supplementDosage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  takenTime: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  tipsSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  tipCard: {
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
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});