import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Share2, Users } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import HealthDashboard from '../../components/HealthDashboard';
import ProgressSharing from '../../components/ProgressSharing';
import ReferralSystem from '../../components/ReferralSystem';

type HealthTab = 'dashboard' | 'progress' | 'referrals';

export default function HealthScreen() {
  const [activeTab, setActiveTab] = useState<HealthTab>('dashboard');

  const renderTabButton = (tab: HealthTab, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HealthDashboard userId="user-123" />;
      case 'progress':
        return (
          <ProgressSharing 
            userId="user-123"
            metrics={{
              bodyMeasurements: {
                id: '1',
                userId: 'user-123',
                date: new Date().toISOString(),
                weight: 75.5,
                bodyFatPercentage: 18.5,
                muscleMass: 58.2,
                waterPercentage: 55.8,
                boneDensity: 1.2,
                waist: 82,
                hip: 98,
                neck: 38,
                chest: 95,
                biceps: 32,
                forearms: 28,
                thighs: 58,
                calves: 38,
                visceralFat: 8,
                subcutaneousFat: 12.3,
                leanBodyMass: 61.7,
                bmi: 23.4,
                waistToHipRatio: 0.84,
                bodyFatMass: 13.8,
                notes: '',
                updatedAt: new Date().toISOString()
              },
              fastingMetrics: {
                id: '1',
                userId: 'user-123',
                date: new Date().toISOString(),
                fastingStartTime: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
                fastingEndTime: new Date().toISOString(),
                fastingDuration: 16,
                isActive: false,
                eatingWindowStart: new Date().toISOString(),
                eatingWindowEnd: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
                eatingWindowDuration: 8,
                ketoneLevel: 1.2,
                ketoneType: 'blood',
                glucoseLevel: 85,
                hungerLevel: 2,
                energyLevel: 4,
                mentalClarity: 4,
                fastingType: 'intermittent',
                notes: 'Great energy today!',
                updatedAt: new Date().toISOString()
              }
            }}
            progress={{
              id: '1',
              userId: 'user-123',
              date: new Date().toISOString(),
              weightChange: -2.3,
              weightChangePercentage: -3.0,
              bodyFatChange: -1.2,
              muscleMassChange: 0.5,
              waistChange: -3,
              hipChange: -2,
              glucoseImprovement: true,
              hba1cImprovement: true,
              bloodPressureImprovement: false,
              goalsAchieved: ['Reach target weight', 'Improve fasting duration'],
              milestonesReached: ['First 16-hour fast', 'Lost 2kg'],
              streakDays: 14,
              overallProgressScore: 75,
              notes: 'Great progress this month!',
              updatedAt: new Date().toISOString()
            }}
          />
        );
      case 'referrals':
        return <ReferralSystem />;
      default:
        return <HealthDashboard userId="user-123" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <View style={styles.headerTop}>
          <Activity size={32} color={colors.background} />
          <Text style={styles.headerTitle}>Health & Wellness</Text>
        </View>
        <Text style={styles.headerSubtitle}>Track your SnapCarb health journey</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('dashboard', 'Dashboard', <Activity size={20} color={activeTab === 'dashboard' ? colors.background : colors.textSecondary} />)}
        {renderTabButton('progress', 'Progress', <Share2 size={20} color={activeTab === 'progress' ? colors.background : colors.textSecondary} />)}
        {renderTabButton('referrals', 'Referrals', <Users size={20} color={activeTab === 'referrals' ? colors.background : colors.textSecondary} />)}
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  activeTabButtonText: {
    color: colors.background,
  },
  content: {
    flex: 1,
  },
});
