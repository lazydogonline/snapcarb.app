import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Scale, 
  TrendingUp, 
  Target, 
  AlertCircle, 
  Plus,
  Share2,
  BarChart3,
  Calendar,
  Trophy
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { 
  HealthMetrics, 
  MetricCategory, 
  MetricTrend, 
  MetricAlert, 
  HealthGoal 
} from '../types/health-metrics';

const { width } = Dimensions.get('window');

interface HealthDashboardProps {
  userId: string;
}

export default function HealthDashboard({ userId }: HealthDashboardProps) {
  const [activeTab, setActiveTab] = useState<MetricCategory>('bodyMeasurements');
  const [metrics, setMetrics] = useState<Partial<HealthMetrics>>({});
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthData();
  }, [userId]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      // TODO: Load actual data from Supabase
      // For now, using mock data
      setMetrics(getMockHealthData());
      setAlerts(getMockAlerts());
      setGoals(getMockGoals());
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const getMockHealthData = (): Partial<HealthMetrics> => ({
    bodyMeasurements: {
      id: '1',
      userId,
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
      userId,
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
  });

  const getMockAlerts = (): MetricAlert[] => [
    {
      id: '1',
      userId,
      metricType: 'bodyMeasurements',
      metricName: 'Weight',
      currentValue: 75.5,
      thresholdValue: 70,
      alertType: 'warning',
      message: 'Weight is above your target goal',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  const getMockGoals = (): HealthGoal[] => [
    {
      id: '1',
      userId,
      category: 'bodyMeasurements',
      metricName: 'Weight',
      targetValue: 70,
      currentValue: 75.5,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'high',
      isAchieved: false,
      progressPercentage: 45,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const getMetricTrend = (metricName: string): MetricTrend => {
    // TODO: Calculate actual trend from historical data
    return 'improving';
  };

  const getTrendColor = (trend: MetricTrend): string => {
    switch (trend) {
      case 'improving': return colors.success;
      case 'stable': return colors.warning;
      case 'declining': return colors.error;
      case 'fluctuating': return colors.secondary;
      default: return colors.textSecondary;
    }
  };

  const getTrendIcon = (trend: MetricTrend) => {
    switch (trend) {
      case 'improving': return <TrendingUp size={16} color={colors.success} />;
      case 'stable': return <BarChart3 size={16} color={colors.warning} />;
      case 'declining': return <TrendingUp size={16} color={colors.error} style={{ transform: [{ rotate: '180deg' }] }} />;
      case 'fluctuating': return <Activity size={16} color={colors.secondary} />;
      default: return <BarChart3 size={16} color={colors.textSecondary} />;
    }
  };

  const renderMetricCard = (title: string, value: string, unit: string, trend: MetricTrend, icon: React.ReactNode) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
        {getTrendIcon(trend)}
      </View>
      <View style={styles.metricValue}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </View>
  );

  const renderTabButton = (category: MetricCategory, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === category && styles.activeTabButton]}
      onPress={() => setActiveTab(category)}
    >
      {icon}
      <Text style={[styles.tabButtonText, activeTab === category && styles.activeTabButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderBodyMeasurements = () => (
    <View style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        {renderMetricCard('Weight', '75.5', 'kg', getMetricTrend('weight'), <Scale size={20} color={colors.primary} />)}
        {renderMetricCard('Body Fat', '18.5', '%', getMetricTrend('bodyFat'), <Droplets size={20} color={colors.primary} />)}
        {renderMetricCard('Muscle Mass', '58.2', 'kg', getMetricTrend('muscleMass'), <Activity size={20} color={colors.primary} />)}
        {renderMetricCard('BMI', '23.4', '', getMetricTrend('bmi'), <Target size={20} color={colors.primary} />)}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Circumference Measurements</Text>
        <View style={styles.measurementsRow}>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Waist</Text>
            <Text style={styles.measurementValue}>82 cm</Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Hip</Text>
            <Text style={styles.measurementValue}>98 cm</Text>
          </View>
        </View>
        <View style={styles.measurementsRow}>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Waist/Hip Ratio</Text>
            <Text style={styles.measurementValue}>0.84</Text>
          </View>
          <View style={styles.measurementItem}>
            <Text style={styles.measurementLabel}>Neck</Text>
            <Text style={styles.measurementValue}>38 cm</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderFastingMetrics = () => (
    <View style={styles.tabContent}>
      <View style={styles.fastingOverview}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.fastingCard}>
          <Text style={styles.fastingTitle}>Current Fasting Status</Text>
          <View style={styles.fastingStats}>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>16h</Text>
              <Text style={styles.fastingStatLabel}>Fasting</Text>
            </View>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>8h</Text>
              <Text style={styles.fastingStatLabel}>Eating Window</Text>
            </View>
          </View>
          <View style={styles.metabolicMarkers}>
            <View style={styles.marker}>
              <Text style={styles.markerLabel}>Ketones</Text>
              <Text style={styles.markerValue}>1.2 mmol/L</Text>
            </View>
            <View style={styles.marker}>
              <Text style={styles.markerLabel}>Glucose</Text>
              <Text style={styles.markerValue}>85 mg/dL</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bodyMeasurements':
        return renderBodyMeasurements();
      case 'fastingMetrics':
        return renderFastingMetrics();
      default:
        return (
          <View style={styles.tabContent}>
            <Text style={styles.comingSoon}>Coming Soon!</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Activity size={64} color={colors.primary} />
        <Text style={styles.loadingText}>Loading your health data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Health Dashboard</Text>
          <TouchableOpacity style={styles.shareButton}>
            <Share2 size={24} color={colors.background} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Track your SnapCarb health journey</Text>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Trophy size={24} color={colors.primary} />
          <Text style={styles.statValue}>45%</Text>
          <Text style={styles.statLabel}>Goal Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={24} color={colors.primary} />
          <Text style={styles.statValue}>16h</Text>
          <Text style={styles.statLabel}>Avg Fast</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={styles.statValue}>-2.3kg</Text>
          <Text style={styles.statLabel}>Weight Loss</Text>
        </View>
      </View>

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.alertsSection}>
          <View style={styles.alertsHeader}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={styles.alertsTitle}>Health Alerts</Text>
          </View>
          {alerts.map(alert => (
            <View key={alert.id} style={styles.alertItem}>
              <Text style={styles.alertMessage}>{alert.message}</Text>
              <Text style={styles.alertValue}>
                {alert.currentValue} {alert.metricName}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('bodyMeasurements', 'Body', <Scale size={20} color={activeTab === 'bodyMeasurements' ? colors.primary : colors.textSecondary} />)}
        {renderTabButton('bloodWork', 'Blood', <Droplets size={20} color={activeTab === 'bloodWork' ? colors.primary : colors.textSecondary} />)}
        {renderTabButton('vitalSigns', 'Vitals', <Heart size={20} color={activeTab === 'vitalSigns' ? colors.primary : colors.textSecondary} />)}
        {renderTabButton('fastingMetrics', 'Fasting', <Activity size={20} color={activeTab === 'fastingMetrics' ? colors.primary : colors.textSecondary} />)}
        {renderTabButton('lifestyleMetrics', 'Lifestyle', <BarChart3 size={20} color={activeTab === 'lifestyleMetrics' ? colors.primary : colors.textSecondary} />)}
      </View>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Add Metric Button */}
      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color={colors.background} />
        <Text style={styles.addButtonText}>Add New Metric</Text>
      </TouchableOpacity>
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
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
  },
  shareButton: {
    padding: 8,
  },
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
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
    color: colors.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  alertsSection: {
    margin: 20,
    backgroundColor: colors.warningBackground,
    borderRadius: 12,
    padding: 16,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.warning,
    marginLeft: 8,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.warningBackground,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  alertValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    marginHorizontal: 20,
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
  tabContent: {
    padding: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginLeft: 8,
  },
  metricValue: {
    alignItems: 'center',
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  unitText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  measurementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  measurementItem: {
    flex: 1,
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  fastingOverview: {
    marginBottom: 20,
  },
  fastingCard: {
    borderRadius: 16,
    padding: 20,
  },
  fastingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 20,
  },
  fastingStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  fastingStat: {
    alignItems: 'center',
  },
  fastingStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
  },
  fastingStatLabel: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.9,
    marginTop: 4,
  },
  metabolicMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  marker: {
    alignItems: 'center',
  },
  markerLabel: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.9,
    marginBottom: 4,
  },
  markerValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  comingSoon: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
