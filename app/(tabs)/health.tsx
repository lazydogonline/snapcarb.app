import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Moon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import HealthDashboard from '../../components/HealthDashboard';
import SleepTracker from '../../components/SleepTracker';

type HealthTab = 'dashboard' | 'sleep';

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
      case 'sleep':
        return <SleepTracker />;
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
        {renderTabButton('sleep', 'Sleep', <Moon size={20} color={activeTab === 'sleep' ? colors.background : colors.textSecondary} />)}
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
