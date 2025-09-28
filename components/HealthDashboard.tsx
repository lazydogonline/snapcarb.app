import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert, Modal, TextInput, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { useHealth } from '@/hooks/health-store';
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
  const { healthMetrics, updateHealthMetrics } = useHealth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MetricCategory>('bodyMeasurements');
  const [metrics, setMetrics] = useState<Partial<HealthMetrics>>({});
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [selectedMetricType, setSelectedMetricType] = useState<string>('');
  const [fastingStartTime, setFastingStartTime] = useState(new Date());
  const [fastingEndTime, setFastingEndTime] = useState(new Date());
  
  // Input values for different metrics
  const [waistValue, setWaistValue] = useState('');
  const [preMealGlucose, setPreMealGlucose] = useState('');
  const [postMealGlucose, setPostMealGlucose] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [noWheat, setNoWheat] = useState(true);
  const [noSugar, setNoSugar] = useState(true);
  const [noGrains, setNoGrains] = useState(true);
  const [useMetric, setUseMetric] = useState(true); // true = metric (cm), false = imperial (inches)

  useEffect(() => {
    loadHealthData();
  }, [userId]);

  // Calculate suggested end time (8 hours after start) but allow manual override
  useEffect(() => {
    const suggestedEndTime = new Date(fastingStartTime);
    suggestedEndTime.setHours(suggestedEndTime.getHours() + 8);
    setFastingEndTime(suggestedEndTime);
  }, [fastingStartTime]);

  const handleMetricClick = (metricType: string) => {
    setSelectedMetricType(metricType);
    setShowMetricModal(true);
    
    // Reset input values when opening modal
    setWaistValue('');
    setPreMealGlucose('');
    setPostMealGlucose('');
    setNoWheat(true);
    setNoSugar(true);
    setNoGrains(true);
  };

  const handleSaveMetric = async () => {
    try {
      // Save the metric based on type
      switch (selectedMetricType) {
        case 'Waist':
          if (waistValue) {
            const unit = useMetric ? 'cm' : 'inches';
            // Convert to cm for storage if needed
            const waistInCm = useMetric ? parseFloat(waistValue) : parseFloat(waistValue) * 2.54;
            
            await updateHealthMetrics({
              waistMeasurement: waistInCm
            });
            Alert.alert('Success', `Waist measurement saved: ${waistValue}${unit}`);
          }
          break;
        case 'Glucose':
          if (preMealGlucose && postMealGlucose) {
              const change = Math.abs(parseFloat(postMealGlucose) - parseFloat(preMealGlucose));
              const isGood = change <= 15; // No change rule: glucose should stay within 15 points
              
              await updateHealthMetrics({
                glucoseLevel: parseFloat(postMealGlucose)
              });
              
              Alert.alert(
                isGood ? 'Excellent! ✅' : 'High Change ⚠️', 
                `Pre: ${preMealGlucose}mg/dL → Post: ${postMealGlucose}mg/dL\nChange: ${change.toFixed(1)}mg/dL\n\n${isGood ? 'Following the No Change Rule!' : 'Consider adjusting your meal choices.'}`
              );
            } else {
              Alert.alert('Missing Data', 'Please enter both pre-meal and post-meal glucose readings.');
            }
          break;
        case 'Fasting':
          const duration = Math.round((fastingEndTime.getTime() - fastingStartTime.getTime()) / (1000 * 60 * 60));
          await updateHealthMetrics({
            fastingData: {
              startTime: fastingStartTime,
              endTime: fastingEndTime,
              duration: duration,
              isActive: true
            }
          });
          Alert.alert('Success', `Fasting window saved: ${fastingStartTime.toLocaleTimeString()} - ${fastingEndTime.toLocaleTimeString()}\nDuration: ${duration} hours`);
          break;
        case 'No Wheat':
          await updateHealthMetrics({
            programRules: {
              ...healthMetrics.programRules,
              noWheat: noWheat
            }
          });
          Alert.alert('Success', `Wheat compliance saved: ${noWheat ? 'Avoided wheat ✅' : 'Ate wheat ❌'}`);
          break;
        case 'No Sugar':
          await updateHealthMetrics({
            programRules: {
              ...healthMetrics.programRules,
              noSugar: noSugar
            }
          });
          Alert.alert('Success', `Sugar compliance saved: ${noSugar ? 'Avoided sugar ✅' : 'Ate sugar ❌'}`);
          break;
        case 'No Grains':
          await updateHealthMetrics({
            programRules: {
              ...healthMetrics.programRules,
              noGrains: noGrains
            }
          });
          Alert.alert('Success', `Grains compliance saved: ${noGrains ? 'Avoided grains ✅' : 'Ate grains ❌'}`);
          break;
        default:
          Alert.alert('Success', 'Metric saved successfully!');
      }
      
      setShowMetricModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save metric');
    }
  };

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
      weight: 75.5, // Keep for BMI calculation but don't display prominently
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

  const getMockAlerts = (): MetricAlert[] => [];

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
    <TouchableOpacity 
      style={styles.metricCard} 
      onPress={() => handleMetricClick(title)}
      accessibilityLabel={`Edit ${title} value: ${value} ${unit}`}
      accessibilityRole="button"
    >
      <View style={styles.metricHeader}>
        {icon}
        <Text style={styles.metricTitle}>{title}</Text>
        {getTrendIcon(trend)}
      </View>
      <View style={styles.metricValue}>
        <Text style={styles.valueText}>{value}</Text>
        <Text style={styles.unitText}>{unit}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (category: MetricCategory, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === category && styles.activeTabButton]}
      onPress={() => setActiveTab(category)}
      accessibilityLabel={`Switch to ${label} health metrics`}
      accessibilityRole="button"
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
        {renderMetricCard('Waist', useMetric ? `${healthMetrics.waistMeasurement || 82}` : `${((healthMetrics.waistMeasurement || 82) / 2.54).toFixed(1)}`, useMetric ? 'cm' : 'in', getMetricTrend('waist'), <Scale size={20} color={colors.primary} />)}
        {renderMetricCard('Glucose', '85', 'mg/dL', getMetricTrend('glucose'), <Droplets size={20} color={colors.primary} />)}
      </View>
      
    </View>
  );

  const renderFastingMetrics = () => (
    <View style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        {renderMetricCard('Fasting', (healthMetrics.fastingData?.duration || 0).toString(), 'hours', getMetricTrend('fasting'), <Activity size={20} color={colors.primary} />)}
      </View>
      
      <View style={styles.fastingOverview}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.fastingCard}>
          <Text style={styles.fastingTitle}>Current Fasting Status</Text>
          <View style={styles.fastingStats}>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>{healthMetrics.fastingData?.duration || 0}h</Text>
              <Text style={styles.fastingStatLabel}>Duration</Text>
            </View>
            <View style={styles.fastingStat}>
              <Text style={styles.fastingStatValue}>{healthMetrics.fastingData?.isActive ? 'Active' : 'Inactive'}</Text>
              <Text style={styles.fastingStatLabel}>Status</Text>
            </View>
          </View>
          {healthMetrics.fastingData?.startTime && (
            <View style={styles.fastingTimes}>
              <Text style={styles.fastingTimeText}>
                Start: {new Date(healthMetrics.fastingData.startTime).toLocaleTimeString()}
              </Text>
              {healthMetrics.fastingData.endTime && (
                <Text style={styles.fastingTimeText}>
                  End: {new Date(healthMetrics.fastingData.endTime).toLocaleTimeString()}
                </Text>
              )}
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );

  const renderDRDavisMarkers = () => (
    <View style={styles.tabContent}>
      {/* DR Davis Program Overview */}
      <View style={styles.drDavisOverview}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.drDavisCard}>
          <Text style={styles.drDavisTitle}>DR Davis Infinite Health Program</Text>
          <Text style={styles.drDavisSubtitle}>Focus on NET CARBS, not calories!</Text>
          <View style={styles.drDavisPrinciple}>
            <Text style={styles.drDavisPrincipleText}>🎯 15g Net Carbs per meal maximum</Text>
            <Text style={styles.drDavisPrincipleText}>💪 Fat is your friend</Text>
            <Text style={styles.drDavisPrincipleText}>🥗 Real foods only</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Critical Health Markers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Critical Health Markers</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Fasting Glucose', '85', 'mg/dL', getMetricTrend('fastingGlucose'), <Droplets size={20} color={colors.primary} />)}
          {renderMetricCard('HbA1c', '5.2', '%', getMetricTrend('hba1c'), <Target size={20} color={colors.primary} />)}
          {renderMetricCard('Blood Pressure', '115/75', 'mmHg', getMetricTrend('systolicBP'), <Heart size={20} color={colors.primary} />)}
          {renderMetricCard('Triglycerides', '45', 'mg/dL', getMetricTrend('triglycerides'), <Activity size={20} color={colors.primary} />)}
        </View>
      </View>

      {/* Supplement Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Supplements</Text>
        <View style={styles.supplementGrid}>
          <View style={styles.supplementItem}>
            <Text style={styles.supplementName}>Vitamin D</Text>
            <Text style={styles.supplementDose}>4000-6000 IU</Text>
            <View style={[styles.supplementStatus, { backgroundColor: colors.success }]}>
              <Text style={styles.supplementStatusText}>✓ Taken</Text>
            </View>
          </View>
          <View style={styles.supplementItem}>
            <Text style={styles.supplementName}>Fish Oil</Text>
            <Text style={styles.supplementDose}>3000-3600 mg</Text>
            <View style={[styles.supplementStatus, { backgroundColor: colors.warning }]}>
              <Text style={styles.supplementStatusText}>⚠️ Pending</Text>
            </View>
          </View>
          <View style={styles.supplementItem}>
            <Text style={styles.supplementName}>Magnesium</Text>
            <Text style={styles.supplementDose}>400-500 mg</Text>
            <View style={[styles.supplementStatus, { backgroundColor: colors.error }]}>
              <Text style={styles.supplementStatusText}>✗ Not Taken</Text>
            </View>
          </View>
          <View style={styles.supplementItem}>
            <Text style={styles.supplementName}>Iodine</Text>
            <Text style={styles.supplementDose}>500 mcg</Text>
            <View style={[styles.supplementStatus, { backgroundColor: colors.warning }]}>
              <Text style={styles.supplementStatusText}>⚠️ Pending</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Prebiotic Fiber Tracking */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prebiotic Fiber Challenge</Text>
        <View style={styles.fiberCard}>
          <Text style={styles.fiberTarget}>Target: 20g per day</Text>
          <Text style={styles.fiberCurrent}>Current: 15g</Text>
          <View style={styles.fiberProgress}>
            <View style={[styles.fiberProgressBar, { width: '75%' }]} />
          </View>
          <Text style={styles.fiberTip}>💡 Add inulin to coffee, raw potato to salads</Text>
        </View>
      </View>
    </View>
  );

  const renderProgramRules = () => {
    // Calculate compliance based on saved metrics from shared health store
    const wheatCompliant = healthMetrics.programRules?.noWheat !== false;
    const sugarCompliant = healthMetrics.programRules?.noSugar !== false;
    const grainsCompliant = healthMetrics.programRules?.noGrains !== false;
    
    const complianceCount = [wheatCompliant, sugarCompliant, grainsCompliant].filter(Boolean).length;
    const compliancePercent = Math.round((complianceCount / 3) * 100);
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.metricsGrid}>
          {renderMetricCard('No Wheat', wheatCompliant ? '✓' : '✗', 'today', wheatCompliant ? 'improving' : 'declining', 
            <AlertCircle size={20} color={wheatCompliant ? colors.primary : '#ef4444'} />)}
          {renderMetricCard('No Sugar', sugarCompliant ? '✓' : '✗', 'today', sugarCompliant ? 'improving' : 'declining', 
            <AlertCircle size={20} color={sugarCompliant ? colors.primary : '#ef4444'} />)}
          {renderMetricCard('No Grains', grainsCompliant ? '✓' : '✗', 'today', grainsCompliant ? 'improving' : 'declining', 
            <AlertCircle size={20} color={grainsCompliant ? colors.primary : '#ef4444'} />)}
        </View>
        
        {/* Compliance Score Display (Non-clickable) */}
        <View style={styles.complianceScoreCard}>
          <View style={styles.complianceHeader}>
            <Target size={24} color={compliancePercent >= 67 ? colors.primary : '#ef4444'} />
            <Text style={styles.complianceTitle}>SnapCarb Compliance</Text>
          </View>
          <Text style={styles.complianceScore}>{compliancePercent}%</Text>
          <Text style={styles.complianceSubtitle}>
            {complianceCount}/3 rules followed today
          </Text>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bodyMeasurements':
        return renderBodyMeasurements();
      case 'fastingMetrics':
        return renderFastingMetrics();
      case 'programRules':
        return renderProgramRules();
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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={{ paddingBottom: 400 }}
      showsVerticalScrollIndicator={false}
    >

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Calendar size={24} color={colors.primary} />
          <Text style={styles.statValue}>{healthMetrics.fastingData?.duration || 0}h</Text>
          <Text style={styles.statLabel}>Avg Fast</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={colors.primary} />
          <Text style={styles.statValue}>{(82 - (healthMetrics.waistMeasurement || 82)) > 0 ? `-${(82 - (healthMetrics.waistMeasurement || 82))}cm` : '0cm'}</Text>
          <Text style={styles.statLabel}>Waist Reduction</Text>
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
        {renderTabButton('fastingMetrics', 'Fasting', <Activity size={20} color={activeTab === 'fastingMetrics' ? colors.primary : colors.textSecondary} />)}
        {renderTabButton('programRules', 'Rules', <Target size={20} color={activeTab === 'programRules' ? colors.primary : colors.textSecondary} />)}
      </View>

      {/* Tab Content */}
      {renderTabContent()}


      {/* Metric Entry Modal */}
      <Modal visible={showMetricModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add {selectedMetricType}</Text>
            
            {selectedMetricType === 'Waist' && (
              <View>
                <View style={styles.unitToggle}>
                  <TouchableOpacity 
                    style={[styles.unitButton, useMetric && styles.unitButtonActive]}
                    onPress={() => setUseMetric(true)}
                    accessibilityLabel="Use metric units (cm)"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.unitButtonText, useMetric && styles.unitButtonTextActive]}>cm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.unitButton, !useMetric && styles.unitButtonActive]}
                    onPress={() => setUseMetric(false)}
                    accessibilityLabel="Use imperial units (inches)"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.unitButtonText, !useMetric && styles.unitButtonTextActive]}>inches</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.inputLabel}>Waist Measurement ({useMetric ? 'cm' : 'inches'}):</Text>
                <TextInput
                  style={styles.textInput}
                  value={waistValue}
                  onChangeText={setWaistValue}
                  placeholder={`Enter waist measurement in ${useMetric ? 'cm' : 'inches'}`}
                  keyboardType="numeric"
                />
              </View>
            )}

            {selectedMetricType === 'Glucose' && (
              <View>
                <Text style={styles.modalTitle}>The "No Change Rule"</Text>
                <Text style={styles.ruleDescription}>
                  Blood sugar 30-60 minutes after meal start should be approximately the same as before the meal
                </Text>
                
                <Text style={styles.inputLabel}>SnapCarb No Change Test</Text>
                <Text style={styles.helperText}>Test if your meal follows the no-change rule</Text>

                <View>
                    <Text style={styles.inputLabel}>Pre-Meal Glucose (mg/dL):</Text>
                    <TextInput
                      style={styles.textInput}
                      value={preMealGlucose}
                      onChangeText={setPreMealGlucose}
                      placeholder="Before eating"
                      keyboardType="numeric"
                    />
                    
                    <Text style={styles.inputLabel}>Post-Meal Glucose (mg/dL):</Text>
                    <Text style={styles.timeHelperText}>30-60 minutes after meal start</Text>
                    <TextInput
                      style={styles.textInput}
                      value={postMealGlucose}
                      onChangeText={setPostMealGlucose}
                      placeholder="30-60 min after eating"
                      keyboardType="numeric"
                    />
                    
                    {preMealGlucose && postMealGlucose && (
                      <View style={styles.glucoseResult}>
                        <Text style={styles.glucoseResultText}>
                          Change: {(parseFloat(postMealGlucose) - parseFloat(preMealGlucose)).toFixed(1)} mg/dL
                        </Text>
                        <Text style={[styles.glucoseStatus, {
                          color: (() => {
                            const change = parseFloat(postMealGlucose) - parseFloat(preMealGlucose);
                            if (change < 0) return '#22c55e'; // Green for drops
                            if (change <= 10) return '#22c55e'; // Green for stable
                            if (change <= 30) return '#f59e0b'; // Orange for moderate rise
                            return '#ef4444'; // Red for high spike
                          })()
                        }]}>
                          {(() => {
                            const change = parseFloat(postMealGlucose) - parseFloat(preMealGlucose);
                            
                            if (change < 0) return '✅ Excellent! (Dropped)';
                            if (change <= 10) return '✅ Good! (Stable)';
                            if (change <= 30) return '⚠️ Moderate Rise';
                            if (change <= 50) return '🚨 High Spike!';
                            return '💥 EPIC FAIL!';
                          })()}
                        </Text>
                      </View>
                    )}
                  </View>
                
              </View>
            )}
            
            {selectedMetricType === 'Fasting' && (
              <View>
                <Text style={styles.inputLabel}>Fasting Start Time:</Text>
                <TouchableOpacity 
                  style={styles.timeButton}
                  onPress={() => setShowStartTimePicker(true)}
                  accessibilityLabel="Select fasting start time"
                  accessibilityRole="button"
                >
                  <Text style={styles.timeButtonText}>{fastingStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </TouchableOpacity>
                
                <Text style={styles.inputLabel}>Fasting End Time:</Text>
                <Text style={styles.helperText}>Suggested: 8 hours after start (tap to adjust)</Text>
                <TouchableOpacity 
                  style={[styles.timeButton, styles.calculatedTimeButton]}
                  onPress={() => setShowEndTimePicker(true)}
                  accessibilityLabel="Select fasting end time"
                  accessibilityRole="button"
                >
                  <Text style={[styles.timeButtonText, styles.paleTimeText]}>{fastingEndTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </TouchableOpacity>
                
                <View style={styles.calculatedTime}>
                  <Text style={styles.calculatedTimeText}>
                    Duration: {Math.round((fastingEndTime.getTime() - fastingStartTime.getTime()) / (1000 * 60 * 60))} hours
                  </Text>
                </View>

                {showStartTimePicker && (
                  <DateTimePicker
                    value={fastingStartTime}
                    mode="time"
                    is24Hour={false}
                    onChange={(event, selectedTime) => {
                      setShowStartTimePicker(Platform.OS === 'ios');
                      if (selectedTime) {
                        setFastingStartTime(selectedTime);
                      }
                    }}
                  />
                )}

                {showEndTimePicker && (
                  <DateTimePicker
                    value={fastingEndTime}
                    mode="time"
                    is24Hour={false}
                    onChange={(event, selectedTime) => {
                      setShowEndTimePicker(Platform.OS === 'ios');
                      if (selectedTime) {
                        setFastingEndTime(selectedTime);
                      }
                    }}
                  />
                )}
              </View>
            )}

            {selectedMetricType === 'No Wheat' && (
              <View>
                <Text style={styles.inputLabel}>Did you avoid wheat today?</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={[styles.checkbox, noWheat && styles.checkboxChecked]}
                    onPress={() => setNoWheat(!noWheat)}
                    accessibilityLabel={`Mark wheat avoidance as ${noWheat ? 'not followed' : 'followed'}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.checkboxText}>{noWheat ? '✅ Yes, I avoided wheat' : '❌ No, I ate wheat'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedMetricType === 'No Sugar' && (
              <View>
                <Text style={styles.inputLabel}>Did you avoid sugar today?</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={[styles.checkbox, noSugar && styles.checkboxChecked]}
                    onPress={() => setNoSugar(!noSugar)}
                    accessibilityLabel={`Mark sugar avoidance as ${noSugar ? 'not followed' : 'followed'}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.checkboxText}>{noSugar ? '✅ Yes, I avoided sugar' : '❌ No, I ate sugar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedMetricType === 'No Grains' && (
              <View>
                <Text style={styles.inputLabel}>Did you avoid grains today?</Text>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity 
                    style={[styles.checkbox, noGrains && styles.checkboxChecked]}
                    onPress={() => setNoGrains(!noGrains)}
                    accessibilityLabel={`Mark grains avoidance as ${noGrains ? 'not followed' : 'followed'}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.checkboxText}>{noGrains ? '✅ Yes, I avoided grains' : '❌ No, I ate grains'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowMetricModal(false)}
                accessibilityLabel="Cancel adding health metric"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveMetric}
                accessibilityLabel="Save health metric"
                accessibilityRole="button"
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  
  // DR Davis Markers Styles
  drDavisOverview: {
    marginBottom: 20,
  },
  drDavisCard: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
  },
  drDavisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.background,
    textAlign: 'center',
    marginBottom: 8,
  },
  drDavisSubtitle: {
    fontSize: 16,
    color: colors.background,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
  },
  drDavisPrinciple: {
    alignItems: 'center',
  },
  drDavisPrincipleText: {
    fontSize: 14,
    color: colors.background,
    marginBottom: 4,
    fontWeight: '600',
  },
  supplementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  supplementItem: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  supplementDose: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  supplementStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  supplementStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.background,
  },
  fiberCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fiberTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  fiberCurrent: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  fiberProgress: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  fiberProgressBar: {
    height: '100%',
    backgroundColor: colors.success,
    width: '75%',
  },
  fiberTip: {
    fontSize: 14,
    color: colors.primary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.textSecondary + '40',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  timeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timeButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkbox: {
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  checkboxText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  unitButtonActive: {
    backgroundColor: colors.primary,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  unitButtonTextActive: {
    color: colors.background,
  },
  ruleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  timeHelperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  glucoseResult: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },
  glucoseResultText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  glucoseStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  fastingTimes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  fastingTimeText: {
    color: colors.background,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  calculatedTime: {
    backgroundColor: colors.secondary + '20',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  calculatedTimeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  calculatedLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.textSecondary + '20',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  calculatedTimeButton: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.8,
  },
  paleTimeText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  complianceScoreCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  complianceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  complianceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  complianceScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  complianceSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

