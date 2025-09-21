import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Switch,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Scale, 
  Target, 
  Plus,
  Clock,
  Pill,
  Utensils,
  Leaf,
  CheckCircle,
  TrendingUp,
  Calendar,
  Trophy,
  Ruler
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import HealthService from '../services/health-service';
import { useAuth } from '../hooks/auth-context';
import BodyMeasurementTracker from './BodyMeasurementTracker';
import BloodGlucoseTracker from './BloodGlucoseTracker';

const { width } = Dimensions.get('window');

interface DailyMetrics {
  weight_kg?: number;
  fasting_glucose_mgdl?: number;
  postprandial_glucose_mgdl?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  fasting_duration_hours?: number;
  prebiotic_fiber_grams?: number;
  energy_level?: number;
  mood_level?: number;
  morning_blue_light_minutes?: number;
  evening_red_light_minutes?: number;
  sleep_quality?: number;
  withdrawal_symptoms?: string[];
  notes?: string;
}

interface MealData {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_carbs_g: number;
  fiber_g: number;
  protein_g?: number;
  fat_g?: number;
  food_items: string[];
  notes?: string;
}

export default function IntegratedHealthTracker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking' | 'meals' | 'supplements' | 'body' | 'glucose'>('overview');
  const [today, setToday] = useState(new Date().toISOString().split('T')[0]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>({});
  const [drDavisProgress, setDrDavisProgress] = useState<any>(null);
  const [supplements, setSupplements] = useState<any[]>([]);
  const [supplementLog, setSupplementLog] = useState<any[]>([]);
  const [meals, setMeals] = useState<any[]>([]);
  const [dailyNetCarbs, setDailyNetCarbs] = useState({ totalNetCarbs: 0, mealsWithinLimit: 0, totalMeals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user, today]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      
      const progress = await HealthService.getDRDavisProgress(user!.id);
      setDrDavisProgress(progress);
      
      const metrics = await HealthService.getDailyMetrics(user!.id, today);
      if (metrics) {
        setDailyMetrics(metrics);
      }
      
      const userSupplements = await HealthService.getSupplements(user!.id);
      setSupplements(userSupplements);
      
      const todaySupplementLog = await HealthService.getSupplementLog(user!.id, today);
      setSupplementLog(todaySupplementLog);
      
      const todayMeals = await HealthService.getMealsForDate(user!.id, today);
      setMeals(todayMeals);
      
      const netCarbs = await HealthService.getDailyNetCarbs(user!.id, today);
      setDailyNetCarbs(netCarbs);
      
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startDRDavisProgram = async () => {
    try {
      const progress = await HealthService.startDRDavisProgram(user!.id);
      setDrDavisProgress(progress);
      Alert.alert('Program Started!', 'Welcome to the DR Davis Infinite Health Program! 🎉');
    } catch (error) {
      Alert.alert('Error', 'Failed to start DR Davis program');
    }
  };

  const logDailyMetrics = async () => {
    try {
      await HealthService.logDailyMetrics(user!.id, today, dailyMetrics);
      Alert.alert('Success', 'Daily metrics logged successfully!');
      loadHealthData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log daily metrics');
    }
  };

  const logMeal = async (mealData: MealData) => {
    try {
      await HealthService.logMeal(user!.id, {
        ...mealData,
        date: today,
        meal_time: new Date().toISOString()
      });
      Alert.alert('Success', 'Meal logged successfully!');
      loadHealthData();
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal');
    }
  };

  const toggleSupplement = async (supplementId: string, wasTaken: boolean) => {
    try {
      await HealthService.logSupplementTaken(user!.id, supplementId, today, wasTaken);
      loadHealthData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update supplement');
    }
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* DR Davis Program Status */}
      <View style={styles.programStatusCard}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.programStatus}>
          <Text style={styles.programStatusTitle}>
            {drDavisProgress ? 'DR Davis Program Active' : 'Start Your Health Journey'}
          </Text>
          <Text style={styles.programStatusSubtitle}>
            {drDavisProgress 
              ? `Day ${drDavisProgress.current_day} of 10 - ${drDavisProgress.current_phase.replace('-', ' ')}`
              : 'Begin the 10-day detox program'
            }
          </Text>
          {drDavisProgress && (
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
              <Text style={styles.progressText}>
                {Math.round((drDavisProgress.current_day / 10) * 100)}% Complete
              </Text>
            </View>
          )}
          {!drDavisProgress && (
            <TouchableOpacity 
              style={styles.startProgramButton} 
              onPress={startDRDavisProgram}
              accessibilityLabel="Start DR Davis Program"
              accessibilityRole="button"
            >
              <Text style={styles.startProgramButtonText}>Start Program</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>

      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Droplets size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>
              {dailyMetrics.fasting_glucose_mgdl || '--'} mg/dL
            </Text>
            <Text style={styles.summaryLabel}>Fasting Glucose</Text>
          </View>
          <View style={styles.summaryCard}>
            <Utensils size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>
              {dailyNetCarbs.totalNetCarbs}g
            </Text>
            <Text style={styles.summaryLabel}>Total Net Carbs</Text>
          </View>
          <View style={styles.summaryCard}>
            <Clock size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>
              {dailyMetrics.fasting_duration_hours || '--'}h
            </Text>
            <Text style={styles.summaryLabel}>Fasting Duration</Text>
          </View>
          <View style={styles.summaryCard}>
            <Leaf size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>
              {dailyMetrics.prebiotic_fiber_grams || '--'}g
            </Text>
            <Text style={styles.summaryLabel}>Fiber Intake</Text>
          </View>
        </View>
      </View>

      {/* Light Therapy Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Light Therapy</Text>
        <View style={styles.lightTherapyGrid}>
          <View style={styles.lightCard}>
            <Text style={styles.lightIcon}>☀️</Text>
            <Text style={styles.lightValue}>
              {dailyMetrics.morning_blue_light_minutes || '--'} min
            </Text>
            <Text style={styles.lightLabel}>Morning Blue Light</Text>
          </View>
          <View style={styles.lightCard}>
            <Text style={styles.lightIcon}>🌙</Text>
            <Text style={styles.lightValue}>
              {dailyMetrics.evening_red_light_minutes || '--'} min
            </Text>
            <Text style={styles.lightLabel}>Evening Red Light</Text>
          </View>
        </View>
      </View>

      {/* DR Davis Rules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DR Davis Rules</Text>
        <View style={styles.rulesList}>
          <View style={styles.ruleItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.ruleText}>Maximum 15g net carbs per meal</Text>
          </View>
          <View style={styles.ruleItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.ruleText}>No wheat, grains, or added sugars</Text>
          </View>
          <View style={styles.ruleItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.ruleText}>Focus on real, single-ingredient foods</Text>
          </View>
          <View style={styles.ruleItem}>
            <CheckCircle size={20} color={colors.success} />
            <Text style={styles.ruleText}>Fat is your friend - don't limit it</Text>
          </View>
        </View>
      </View>

      {/* Inner Circle Link */}
      <View style={styles.section}>
        <View style={styles.innerCircleCard}>
          <Text style={styles.innerCircleTitle}>Need More Advanced Features?</Text>
          <Text style={styles.innerCircleSubtitle}>
            Join the DR Davis Inner Circle for exclusive content, advanced tracking, and personalized coaching.
          </Text>
          <TouchableOpacity 
            style={styles.innerCircleButton}
            accessibilityLabel="Join DR Davis Inner Circle"
            accessibilityRole="button"
          >
            <Text style={styles.innerCircleButtonText}>Join Inner Circle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderTracking = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Health Metrics</Text>
        
        {/* Weight */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.weight_kg?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, weight_kg: parseFloat(text) || undefined }))}
            placeholder="75.5"
            keyboardType="numeric"
          />
        </View>

        {/* Blood Glucose */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fasting Glucose (mg/dL)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.fasting_glucose_mgdl?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, fasting_glucose_mgdl: parseFloat(text) || undefined }))}
            placeholder="85"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Post-Meal Glucose (mg/dL)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.postprandial_glucose_mgdl?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, postprandial_glucose_mgdl: parseFloat(text) || undefined }))}
            placeholder="95"
            keyboardType="numeric"
          />
        </View>

        {/* Blood Pressure */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Systolic BP</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.systolic_bp?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, systolic_bp: parseInt(text) || undefined }))}
              placeholder="115"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Diastolic BP</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.diastolic_bp?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, diastolic_bp: parseInt(text) || undefined }))}
              placeholder="75"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Fasting Duration */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fasting Duration (hours)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.fasting_duration_hours?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, fasting_duration_hours: parseFloat(text) || undefined }))}
            placeholder="16"
            keyboardType="numeric"
          />
        </View>

        {/* Prebiotic Fiber */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Prebiotic Fiber (grams)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.prebiotic_fiber_grams?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, prebiotic_fiber_grams: parseFloat(text) || undefined }))}
            placeholder="20"
            keyboardType="numeric"
          />
        </View>

        {/* Light Therapy */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Morning Blue Light (min)</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.morning_blue_light_minutes?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, morning_blue_light_minutes: parseInt(text) || undefined }))}
              placeholder="30"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Evening Red Light (min)</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.evening_red_light_minutes?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, evening_red_light_minutes: parseInt(text) || undefined }))}
              placeholder="20"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Energy, Mood & Sleep */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Energy Level (1-10)</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.energy_level?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, energy_level: parseInt(text) || undefined }))}
              placeholder="8"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mood Level (1-10)</Text>
            <TextInput
              style={styles.input}
              value={dailyMetrics.mood_level?.toString() || ''}
              onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, mood_level: parseInt(text) || undefined }))}
              placeholder="9"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Sleep Quality (1-10)</Text>
          <TextInput
            style={styles.input}
            value={dailyMetrics.sleep_quality?.toString() || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, sleep_quality: parseInt(text) || undefined }))}
            placeholder="8"
            keyboardType="numeric"
          />
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={dailyMetrics.notes || ''}
            onChangeText={(text) => setDailyMetrics(prev => ({ ...prev, notes: text }))}
            placeholder="How are you feeling today?"
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={logDailyMetrics}
          accessibilityLabel="Save Daily Metrics"
          accessibilityRole="button"
        >
          <Text style={styles.saveButtonText}>Save Daily Metrics</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMeals = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meal Tracking</Text>
        <Text style={styles.sectionSubtitle}>
          Focus on NET CARBS (Total Carbs - Fiber) - Maximum 15g per meal
        </Text>

        {/* Today's Meals */}
        {meals.length > 0 && (
          <View style={styles.mealsList}>
            <Text style={styles.subsectionTitle}>Today's Meals</Text>
            {meals.map((meal, index) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealType}>{meal.meal_type}</Text>
                  <View style={[
                    styles.complianceBadge,
                    { backgroundColor: meal.is_within_15g_limit ? colors.success : colors.error }
                  ]}>
                    <Text style={styles.complianceText}>
                      {meal.is_within_15g_limit ? '✓ Compliant' : '✗ Over Limit'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.mealDetails}>
                  Net Carbs: {meal.net_carbs_g}g | Protein: {meal.protein_g || '--'}g | Fat: {meal.fat_g || '--'}g
                </Text>
                <Text style={styles.mealFoods}>
                  {meal.food_items.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Add New Meal */}
        <View style={styles.addMealSection}>
          <Text style={styles.subsectionTitle}>Add New Meal</Text>
          <MealForm onSubmit={logMeal} />
        </View>
      </View>
    </View>
  );

  const renderSupplements = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supplement Tracking</Text>
        <Text style={styles.sectionSubtitle}>
          DR Davis Essential Four + Your Personal Supplements
        </Text>

        {/* DR Davis Program Info */}
        {drDavisProgress && (
          <View style={styles.programInfoCard}>
            <Text style={styles.programInfoTitle}>DR Davis 10-Day Protocol</Text>
            <Text style={styles.programInfoText}>
              Day {drDavisProgress.current_day}: {drDavisProgress.current_day <= 3 ? 'Start prebiotics at 10g/day' : 
                drDavisProgress.current_day >= 10 ? 'Full prebiotic dose (20g/day)' : 'Continue prebiotics'}
            </Text>
          </View>
        )}

        {/* Default DR Davis Supplements */}
        <View style={styles.supplementSection}>
          <Text style={styles.subsectionTitle}>DR Davis Essential Four</Text>
          {supplements.filter(s => !s.user_id).map((supplement) => (
            <View key={supplement.id} style={styles.supplementItem}>
              <View style={styles.supplementInfo}>
                <Text style={styles.supplementName}>{supplement.name}</Text>
                <Text style={styles.supplementDose}>{supplement.dose}</Text>
                <Text style={styles.supplementTime}>{supplement.time_of_day}</Text>
              </View>
              <View style={styles.supplementNotes}>
                <Text style={styles.supplementNotesText}>{supplement.notes}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Supplement Schedule Info */}
        <View style={styles.scheduleInfoCard}>
          <Text style={styles.scheduleInfoTitle}>Supplement Schedule</Text>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>🌅 Morning</Text>
            <Text style={styles.scheduleText}>Vitamin D (6000 IU), Fish Oil (900mg), Magnesium (1250mg), Iodine (400-500mcg)</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>🌙 Evening</Text>
            <Text style={styles.scheduleText}>Fish Oil (900mg), Magnesium (1250mg), Probiotic</Text>
          </View>
          <View style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>🍃 Prebiotics</Text>
            <Text style={styles.scheduleText}>Day 3: Start 10g/day, Day 10: Increase to 20g/day</Text>
          </View>
        </View>

        {/* User's Personal Supplements */}
        {supplements.filter(s => s.user_id).length > 0 && (
          <View style={styles.supplementSection}>
            <Text style={styles.subsectionTitle}>Your Supplements</Text>
            {supplements.filter(s => s.user_id).map((supplement) => {
              const takenToday = supplementLog.find(log => log.supplement_id === supplement.id)?.was_taken;
              return (
                <View key={supplement.id} style={styles.supplementItem}>
                  <View style={styles.supplementInfo}>
                    <Text style={styles.supplementName}>{supplement.name}</Text>
                    <Text style={styles.supplementDose}>{supplement.dose}</Text>
                    <Text style={styles.supplementTime}>{supplement.time_of_day}</Text>
                  </View>
                  <Switch
                    value={takenToday || false}
                    onValueChange={(value) => toggleSupplement(supplement.id, value)}
                            trackColor={{ false: colors.border, true: colors.success }}
        thumbColor={colors.cardBackground}
                  />
                </View>
              );
            })}
          </View>
        )}

        {/* Add New Supplement */}
        <TouchableOpacity 
          style={styles.addButton}
          accessibilityLabel="Add New Supplement"
          accessibilityRole="button"
        >
          <Plus size={20} color={colors.cardBackground} />
          <Text style={styles.addButtonText}>Add Supplement</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'tracking':
        return renderTracking();
      case 'meals':
        return renderMeals();
      case 'supplements':
        return renderSupplements();
      case 'body':
        return <BodyMeasurementTracker />;
      case 'glucose':
        return <BloodGlucoseTracker />;
      default:
        return renderOverview();
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
        <Text style={styles.headerTitle}>Health Tracker</Text>
        <Text style={styles.headerSubtitle}>Track your DR Davis Infinite Health journey</Text>
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'overview', label: 'Overview', icon: Activity },
          { key: 'tracking', label: 'Tracking', icon: Scale },
          { key: 'meals', label: 'Meals', icon: Utensils },
          { key: 'supplements', label: 'Supplements', icon: Pill },
          { key: 'body', label: 'Body', icon: Ruler },
          { key: 'glucose', label: 'Glucose', icon: Droplets }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key as any)}
              accessibilityLabel={`Switch to ${tab.label} tab`}
              accessibilityRole="button"
            >
              <IconComponent size={20} color={activeTab === tab.key ? colors.white : colors.primary} />
              <Text style={[styles.tabButtonText, activeTab === tab.key && styles.activeTabButtonText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </ScrollView>
  );
}

// Meal Form Component
function MealForm({ onSubmit }: { onSubmit: (meal: MealData) => void }) {
  const [mealData, setMealData] = useState<MealData>({
    meal_type: 'breakfast',
    total_carbs_g: 0,
    fiber_g: 0,
    food_items: []
  });

  const [foodItem, setFoodItem] = useState('');

  const addFoodItem = () => {
    if (foodItem.trim()) {
      setMealData(prev => ({
        ...prev,
        food_items: [...prev.food_items, foodItem.trim()]
      }));
      setFoodItem('');
    }
  };

  const removeFoodItem = (index: number) => {
    setMealData(prev => ({
      ...prev,
      food_items: prev.food_items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (mealData.food_items.length === 0) {
      Alert.alert('Error', 'Please add at least one food item');
      return;
    }
    onSubmit(mealData);
    setMealData({
      meal_type: 'breakfast',
      total_carbs_g: 0,
      fiber_g: 0,
      food_items: []
    });
  };

  return (
    <View style={styles.mealForm}>
      {/* Meal Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Meal Type</Text>
        <View style={styles.mealTypeButtons}>
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.mealTypeButton,
                mealData.meal_type === type && styles.activeMealTypeButton
              ]}
              onPress={() => setMealData(prev => ({ ...prev, meal_type: type }))}
            >
              <Text style={[
                styles.mealTypeButtonText,
                mealData.meal_type === type && styles.activeMealTypeButtonText
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Carbs and Fiber */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Total Carbs (g)</Text>
          <TextInput
            style={styles.input}
            value={mealData.total_carbs_g.toString()}
            onChangeText={(text) => setMealData(prev => ({ ...prev, total_carbs_g: parseFloat(text) || 0 }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Fiber (g)</Text>
          <TextInput
            style={styles.input}
            value={mealData.fiber_g.toString()}
            onChangeText={(text) => setMealData(prev => ({ ...prev, fiber_g: parseFloat(text) || 0 }))}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Net Carbs Display */}
      <View style={styles.netCarbsDisplay}>
        <Text style={styles.netCarbsLabel}>Net Carbs:</Text>
        <Text style={[
          styles.netCarbsValue,
          { color: (mealData.total_carbs_g - mealData.fiber_g) <= 15 ? colors.success : colors.error }
        ]}>
          {mealData.total_carbs_g - mealData.fiber_g}g
        </Text>
        <Text style={styles.netCarbsStatus}>
          {(mealData.total_carbs_g - mealData.fiber_g) <= 15 ? '✓ Within Limit' : '✗ Over 15g Limit'}
        </Text>
      </View>

      {/* Food Items */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Food Items</Text>
        <View style={styles.foodItemInput}>
          <TextInput
            style={styles.foodInput}
            value={foodItem}
            onChangeText={setFoodItem}
            placeholder="Add a food item..."
          />
          <TouchableOpacity style={styles.addFoodButton} onPress={addFoodItem}>
            <Plus size={20} color={colors.cardBackground} />
          </TouchableOpacity>
        </View>
        {mealData.food_items.map((item, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodItemText}>{item}</Text>
            <TouchableOpacity onPress={() => removeFoodItem(index)}>
              <Text style={styles.removeFoodButton}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>Log Meal</Text>
      </TouchableOpacity>
    </View>
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.cardBackground,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.cardBackground,
    opacity: 0.9,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: colors.cardBackground,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  programStatusCard: {
    marginBottom: 24,
  },
  programStatus: {
    padding: 20,
    borderRadius: 16,
  },
  programStatusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 8,
  },
  programStatusSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  startProgramButton: {
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  startProgramButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rulesList: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  innerCircleCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  innerCircleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  innerCircleSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  innerCircleButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  innerCircleButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  mealsList: {
    marginBottom: 24,
  },
  mealItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  complianceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  complianceText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mealDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  mealFoods: {
    fontSize: 14,
    color: colors.text,
  },
  addMealSection: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
  },
  mealForm: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGray,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeMealTypeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  mealTypeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  activeMealTypeButtonText: {
    color: colors.white,
  },
  netCarbsDisplay: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  netCarbsLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  netCarbsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  netCarbsStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  foodItemInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  foodInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addFoodButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  foodItemText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  removeFoodButton: {
    color: colors.error,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  supplementSection: {
    marginBottom: 24,
  },
  supplementItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplementInfo: {
    flex: 1,
  },
  supplementName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  supplementDose: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  supplementTime: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  supplementNotes: {
    flex: 1,
    marginLeft: 16,
  },
  supplementNotesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
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
  progressBar: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.cardBackground,
    height: '100%',
    width: '60%', // This will be dynamic based on progress
    borderRadius: 4,
  },
  progressText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  lightTherapyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lightCard: {
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lightIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  lightValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  lightLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  programInfoCard: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  programInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  programInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scheduleInfoCard: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  scheduleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    width: 80,
    marginRight: 12,
  },
  scheduleText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
