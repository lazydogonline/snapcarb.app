import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Utensils, Pill, Target, TrendingUp } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';
import ProgressCard from '@/components/ProgressCard';

export default function HomeScreen() {
  const { getTodayProgress, challenge } = useHealth();
  const progress = getTodayProgress();
  
  const completedDays = challenge.filter(day => day.completed).length;
  const currentDay = challenge.find(day => day.date === new Date().toDateString());

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>SnapCarb</Text>
        <Text style={styles.headerSubtitle}>Infinite Health Companion</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
        
        <View style={styles.progressGrid}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Net Carbs"
                value={`${progress.totalNetCarbs}g`}
                subtitle={progress.totalNetCarbs <= 15 ? "Great!" : "Over limit"}
                color={progress.totalNetCarbs <= 15 ? "#22c55e" : "#ef4444"}
                icon={<Utensils color="#ffffff" size={20} />}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Meals Logged"
                value={progress.mealsLogged}
                subtitle="Today"
                color="#3b82f6"
                icon={<Utensils color="#ffffff" size={20} />}
              />
            </View>
          </View>
          
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Supplements"
                value={`${progress.supplementsTaken}/${progress.totalSupplements}`}
                subtitle="Taken today"
                color="#8b5cf6"
                icon={<Pill color="#ffffff" size={20} />}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Challenge"
                value={`${completedDays}/10`}
                subtitle="Days completed"
                color="#f59e0b"
                icon={<Target color="#ffffff" size={20} />}
              />
            </View>
          </View>
        </View>

        {currentDay && (
          <View style={styles.challengeSection}>
            <Text style={styles.sectionTitle}>Today&apos;s Challenge</Text>
            <View style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Target color="#22c55e" size={24} />
                <Text style={styles.challengeTitle}>Day {currentDay.day} - Detox Challenge</Text>
              </View>
              <Text style={styles.challengeDescription}>
                Log your meals, track symptoms, and stay wheat-free!
              </Text>
              <View style={styles.challengeStatus}>
                <Text style={[
                  styles.challengeStatusText,
                  { color: currentDay.completed ? '#22c55e' : '#6b7280' }
                ]}>
                  {currentDay.completed ? '✓ Completed' : 'In Progress'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Daily Tips</Text>
          <View style={styles.tipCard}>
            <TrendingUp color="#22c55e" size={20} />
            <Text style={styles.tipText}>
              Keep net carbs under 15g per meal for optimal metabolic health
            </Text>
          </View>
          <View style={styles.tipCard}>
            <Pill color="#8b5cf6" size={20} />
            <Text style={styles.tipText}>
              Take magnesium before bed for better sleep and muscle recovery
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  progressGrid: {
    marginBottom: 24,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  progressItem: {
    flex: 1,
  },
  challengeSection: {
    marginBottom: 24,
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 12,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeStatus: {
    alignItems: 'flex-end',
  },
  challengeStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  tipText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});