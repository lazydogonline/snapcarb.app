import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplets, Heart, Ruler, Target, TrendingUp, Pill, AlertTriangle } from 'lucide-react-native';
import { useHealth } from '@/hooks/health-store';
import ProgressCard from '@/components/ProgressCard';

export default function HomeScreen() {
  const { getTodayProgress, challenge, healthMetrics } = useHealth();
  const progress = getTodayProgress();
  
  const completedDays = challenge.filter(day => day.completed).length;
  const currentDay = challenge.find(day => day.date === new Date().toDateString());

  const getChallengeStatusColor = () => {
    console.log('Home screen - challenge data:', challenge.map(d => ({ day: d.day, date: d.date, completed: d.completed })));
    
    const today = new Date();
    const todayString = today.toDateString();
    
    const missedDays = challenge.filter(day => {
      const dayDate = new Date(day.date);
      const isPast = dayDate < today;
      const isToday = day.date === todayString;
      
      console.log(`Day ${day.day}: date=${day.date}, isPast=${isPast}, isToday=${isToday}, completed=${day.completed}`);
      
      // Don't count today as "missed" - only count truly past days
      return isPast && !isToday && !day.completed;
    }).length;

    console.log('Home screen - missedDays:', missedDays, 'completedDays:', completedDays);
    
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
    return `${completedDays}/10 Days`;
  };

  // Calculate compliance percentage
  const getComplianceScore = () => {
    const rules = healthMetrics.programRules;
    const complianceCount = [rules.noWheat, rules.noSugar, rules.noGrains].filter(Boolean).length;
    return Math.round((complianceCount / 3) * 100);
  };

  const getComplianceColor = () => {
    const score = getComplianceScore();
    if (score === 100) return '#22c55e'; // Green
    if (score >= 67) return '#f59e0b';   // Orange  
    return '#ef4444'; // Red
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>SnapCarb</Text>
        <Text style={styles.headerSubtitle}>Your journey to better health</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Today&apos;s Progress</Text>
        
        <View style={styles.progressGrid}>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Glucose Test"
                value={healthMetrics.glucoseLevel.toString()}
                subtitle="mg/dL latest"
                color="#22c55e"
                icon={<Droplets color="#ffffff" size={20} />}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Program Rules"
                value={`${getComplianceScore()}%`}
                subtitle="Compliance Score"
                color={getComplianceColor()}
                icon={<Heart color="#ffffff" size={20} />}
              />
            </View>
          </View>
          
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Waist Goal"
                value="82cm"
                subtitle="Latest measurement"
                color="#22c55e"
                icon={<Ruler color="#ffffff" size={20} />}
              />
            </View>
            <View style={styles.progressItem}>
              <ProgressCard
                title="Challenge"
                value={getChallengeStatusText()}
                subtitle="Challenge status"
                color={getChallengeStatusColor()}
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

        {/* Medical Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={16} color="#DC2626" />
          <Text style={styles.warningText}>
            <Text style={styles.warningBold}>NOT MEDICAL ADVICE:</Text> This app is for informational purposes only. Always consult healthcare providers for medical decisions.
          </Text>
        </View>

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
    height: 140, // Fixed height for each row
  },
  progressItem: {
    flex: 1,
    height: '100%', // Fill the row height
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
  warningBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: '#991B1B',
  },
  warningBold: {
    fontWeight: '700',
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