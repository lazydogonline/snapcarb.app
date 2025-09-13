import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Switch,
  TextInput
} from 'react-native';
import { 
  CheckCircle, 
  XCircle, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Info,
  Calendar,
  Plus
} from 'lucide-react-native';
import { colors } from '../constants/colors';

interface ComplianceRecord {
  id: string;
  date: string;
  // Food Avoidance
  avoidedWheat: boolean;
  avoidedGrains: boolean;
  avoidedSugar: boolean;
  avoidedProcessedFoods: boolean;
  avoidedSeedOils: boolean;
  // Meal Compliance
  mealsUnder15gCarbs: number;
  totalMeals: number;
  // Supplements
  tookVitaminD: boolean;
  tookFishOil: boolean;
  tookMagnesium: boolean;
  tookIodine: boolean;
  tookProbiotic: boolean;
  // Lifestyle
  sleptWell: boolean;
  exercised: boolean;
  hydrated: boolean;
  // Notes
  notes: string;
  // Calculated
  complianceScore: number;
}

export default function DRDavisComplianceTracker() {
  const [complianceRecords, setComplianceRecords] = useState<ComplianceRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ComplianceRecord | null>(null);
  
  // Form state
  const [avoidedWheat, setAvoidedWheat] = useState(true);
  const [avoidedGrains, setAvoidedGrains] = useState(true);
  const [avoidedSugar, setAvoidedSugar] = useState(true);
  const [avoidedProcessedFoods, setAvoidedProcessedFoods] = useState(true);
  const [avoidedSeedOils, setAvoidedSeedOils] = useState(true);
  const [mealsUnder15gCarbs, setMealsUnder15gCarbs] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [tookVitaminD, setTookVitaminD] = useState(false);
  const [tookFishOil, setTookFishOil] = useState(false);
  const [tookMagnesium, setTookMagnesium] = useState(false);
  const [tookIodine, setTookIodine] = useState(false);
  const [tookProbiotic, setTookProbiotic] = useState(false);
  const [sleptWell, setSleptWell] = useState(false);
  const [exercised, setExercised] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadComplianceRecords();
  }, []);

  const loadComplianceRecords = async () => {
    // TODO: Load from Supabase
    // For now, using mock data
    const mockData: ComplianceRecord[] = [
      {
        id: '1',
        date: '2024-01-30',
        avoidedWheat: true,
        avoidedGrains: true,
        avoidedSugar: true,
        avoidedProcessedFoods: true,
        avoidedSeedOils: true,
        mealsUnder15gCarbs: 3,
        totalMeals: 3,
        tookVitaminD: true,
        tookFishOil: true,
        tookMagnesium: true,
        tookIodine: true,
        tookProbiotic: true,
        sleptWell: true,
        exercised: true,
        hydrated: true,
        notes: 'Perfect compliance day!',
        complianceScore: 100
      },
      {
        id: '2',
        date: '2024-01-29',
        avoidedWheat: true,
        avoidedGrains: true,
        avoidedSugar: false, // Had dessert
        avoidedProcessedFoods: true,
        avoidedSeedOils: true,
        mealsUnder15gCarbs: 2,
        totalMeals: 3,
        tookVitaminD: true,
        tookFishOil: true,
        tookMagnesium: false,
        tookIodine: true,
        tookProbiotic: true,
        sleptWell: false,
        exercised: false,
        hydrated: true,
        notes: 'Had dessert, missed magnesium, poor sleep',
        complianceScore: 75
      }
    ];
    setComplianceRecords(mockData);
  };

  const calculateComplianceScore = (): number => {
    let score = 0;
    let totalPoints = 0;

    // Food Avoidance (40 points)
    if (avoidedWheat) score += 8;
    if (avoidedGrains) score += 8;
    if (avoidedSugar) score += 8;
    if (avoidedProcessedFoods) score += 8;
    if (avoidedSeedOils) score += 8;
    totalPoints += 40;

    // Meal Compliance (30 points)
    if (totalMeals > 0) {
      const carbCompliance = (mealsUnder15gCarbs / totalMeals) * 30;
      score += carbCompliance;
    }
    totalPoints += 30;

    // Supplements (20 points)
    if (tookVitaminD) score += 4;
    if (tookFishOil) score += 4;
    if (tookMagnesium) score += 4;
    if (tookIodine) score += 4;
    if (tookProbiotic) score += 4;
    totalPoints += 20;

    // Lifestyle (10 points)
    if (sleptWell) score += 3;
    if (exercised) score += 3;
    if (hydrated) score += 4;
    totalPoints += 10;

    return Math.round((score / totalPoints) * 100);
  };

  const resetForm = () => {
    setAvoidedWheat(true);
    setAvoidedGrains(true);
    setAvoidedSugar(true);
    setAvoidedProcessedFoods(true);
    setAvoidedSeedOils(true);
    setMealsUnder15gCarbs(0);
    setTotalMeals(0);
    setTookVitaminD(false);
    setTookFishOil(false);
    setTookMagnesium(false);
    setTookIodine(false);
    setTookProbiotic(false);
    setSleptWell(false);
    setExercised(false);
    setHydrated(false);
    setNotes('');
  };

  const openAddForm = () => {
    resetForm();
    setEditingRecord(null);
    setShowAddForm(true);
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingRecord(null);
    resetForm();
  };

  const saveRecord = async () => {
    if (totalMeals === 0) {
      Alert.alert('Missing Data', 'Please enter the number of meals you had today.');
      return;
    }

    const complianceScore = calculateComplianceScore();

    const newRecord: ComplianceRecord = {
      id: editingRecord?.id || Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      avoidedWheat,
      avoidedGrains,
      avoidedSugar,
      avoidedProcessedFoods,
      avoidedSeedOils,
      mealsUnder15gCarbs,
      totalMeals,
      tookVitaminD,
      tookFishOil,
      tookMagnesium,
      tookIodine,
      tookProbiotic,
      sleptWell,
      exercised,
      hydrated,
      notes,
      complianceScore
    };

    if (editingRecord) {
      setComplianceRecords(prev => prev.map(r => r.id === editingRecord.id ? newRecord : r));
      Alert.alert('Success', 'Compliance record updated!');
    } else {
      setComplianceRecords(prev => [newRecord, ...prev]);
      Alert.alert('Success', 'Compliance record saved!');
    }

    closeForm();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success;
    if (score >= 75) return colors.primary;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎯';
    if (score >= 75) return '👍';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  const renderAddForm = () => {
    if (!showAddForm) return null;

    const currentScore = calculateComplianceScore();

    return (
      <View style={styles.formOverlay}>
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {editingRecord ? 'Edit Compliance Record' : 'Add Compliance Record'}
            </Text>
            <TouchableOpacity onPress={closeForm} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Live Score Preview */}
          <View style={styles.scorePreview}>
            <Text style={styles.scorePreviewTitle}>Live Compliance Score:</Text>
            <Text style={[styles.scorePreviewValue, { color: getScoreColor(currentScore) }]}>
              {getScoreEmoji(currentScore)} {currentScore}%
            </Text>
          </View>

          {/* Food Avoidance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚫 What You DIDN'T Eat Today</Text>
            <Text style={styles.sectionSubtitle}>Avoiding these is crucial for program compliance</Text>
            
            <View style={styles.checkboxRow}>
              <View style={styles.checkboxInfo}>
                <Text style={styles.checkboxLabel}>Wheat & Gluten</Text>
                <Text style={styles.checkboxDesc}>Bread, pasta, cereals</Text>
              </View>
              <Switch
                value={avoidedWheat}
                onValueChange={setAvoidedWheat}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={avoidedWheat ? colors.success : colors.error}
              />
            </View>

            <View style={styles.checkboxRow}>
              <View style={styles.checkboxInfo}>
                <Text style={styles.checkboxLabel}>All Grains</Text>
                <Text style={styles.checkboxDesc}>Rice, corn, oats, quinoa</Text>
              </View>
              <Switch
                value={avoidedGrains}
                onValueChange={setAvoidedGrains}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={avoidedGrains ? colors.success : colors.error}
              />
            </View>

            <View style={styles.checkboxRow}>
              <View style={styles.checkboxInfo}>
                <Text style={styles.checkboxLabel}>Added Sugars</Text>
                <Text style={styles.checkboxDesc}>Candy, desserts, sweeteners</Text>
              </View>
              <Switch
                value={avoidedSugar}
                onValueChange={setAvoidedSugar}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={avoidedSugar ? colors.success : colors.error}
              />
            </View>

            <View style={styles.checkboxRow}>
              <View style={styles.checkboxInfo}>
                <Text style={styles.checkboxLabel}>Processed Foods</Text>
                <Text style={styles.checkboxDesc}>Packaged snacks, deli meats</Text>
              </View>
              <Switch
                value={avoidedProcessedFoods}
                onValueChange={setAvoidedProcessedFoods}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={avoidedProcessedFoods ? colors.success : colors.error}
              />
            </View>

            <View style={styles.checkboxRow}>
              <View style={styles.checkboxInfo}>
                <Text style={styles.checkboxLabel}>Seed Oils</Text>
                <Text style={styles.checkboxDesc}>Canola, soybean, vegetable oils</Text>
              </View>
              <Switch
                value={avoidedSeedOils}
                onValueChange={setAvoidedSeedOils}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={avoidedSeedOils ? colors.success : colors.error}
              />
            </View>
          </View>

          {/* Meal Compliance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Meal Carb Compliance</Text>
            <Text style={styles.sectionSubtitle}>Program rule: ≤15g net carbs per meal</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Total Meals Today</Text>
                <TextInput
                  style={styles.input}
                  value={totalMeals.toString()}
                  onChangeText={(text) => setTotalMeals(parseInt(text) || 0)}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Meals Under 15g Carbs</Text>
                <TextInput
                  style={styles.input}
                  value={mealsUnder15gCarbs.toString()}
                  onChangeText={(text) => setMealsUnder15gCarbs(parseInt(text) || 0)}
                  placeholder="3"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {totalMeals > 0 && (
              <View style={styles.compliancePreview}>
                <Text style={styles.compliancePreviewText}>
                  Carb Compliance: {mealsUnder15gCarbs}/{totalMeals} meals ({Math.round((mealsUnder15gCarbs / totalMeals) * 100)}%)
                </Text>
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any challenges, observations, or achievements today..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Form Buttons */}
          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={closeForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveRecord}>
              <Text style={styles.saveButtonText}>
                {editingRecord ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderComplianceRecord = (record: ComplianceRecord) => (
    <View key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordDate}>
          <Calendar size={16} color={colors.textSecondary} />
          <Text style={styles.recordDateText}>{record.date}</Text>
        </View>
        <View style={styles.recordScore}>
          <Text style={[styles.recordScoreValue, { color: getScoreColor(record.complianceScore) }]}>
            {getScoreEmoji(record.complianceScore)} {record.complianceScore}%
          </Text>
        </View>
      </View>

      <View style={styles.recordContent}>
        {/* Food Avoidance Summary */}
        <View style={styles.complianceSummary}>
          <Text style={styles.summaryTitle}>Food Avoidance:</Text>
          <View style={styles.summaryGrid}>
            <Text style={[styles.summaryItem, record.avoidedWheat && styles.summaryGood]}>
              {record.avoidedWheat ? '✅' : '❌'} Wheat
            </Text>
            <Text style={[styles.summaryItem, record.avoidedGrains && styles.summaryGood]}>
              {record.avoidedGrains ? '✅' : '❌'} Grains
            </Text>
            <Text style={[styles.summaryItem, record.avoidedSugar && styles.summaryGood]}>
              {record.avoidedSugar ? '✅' : '❌'} Sugar
            </Text>
            <Text style={[styles.summaryItem, record.avoidedProcessedFoods && styles.summaryGood]}>
              {record.avoidedProcessedFoods ? '✅' : '❌'} Processed
            </Text>
            <Text style={[styles.summaryItem, record.avoidedSeedOils && styles.summaryGood]}>
              {record.avoidedSeedOils ? '✅' : '❌'} Seed Oils
            </Text>
          </View>
        </View>

        {/* Meal Compliance */}
        <View style={styles.complianceSummary}>
          <Text style={styles.summaryTitle}>Meal Compliance:</Text>
          <Text style={styles.summaryText}>
            {record.mealsUnder15gCarbs}/{record.totalMeals} meals under 15g carbs ({Math.round((record.mealsUnder15gCarbs / record.totalMeals) * 100)}%)
          </Text>
        </View>

        {/* Supplements */}
        <View style={styles.complianceSummary}>
          <Text style={styles.summaryTitle}>Supplements:</Text>
          <View style={styles.summaryGrid}>
            <Text style={[styles.summaryItem, record.tookVitaminD && styles.summaryGood]}>
              {record.tookVitaminD ? '✅' : '❌'} Vit D
            </Text>
            <Text style={[styles.summaryItem, record.tookFishOil && styles.summaryGood]}>
              {record.tookFishOil ? '✅' : '❌'} Fish Oil
            </Text>
            <Text style={[styles.summaryItem, record.tookMagnesium && styles.summaryGood]}>
              {record.tookMagnesium ? '✅' : '❌'} Mg
            </Text>
            <Text style={[styles.summaryItem, record.tookIodine && styles.summaryGood]}>
              {record.tookIodine ? '✅' : '❌'} Iodine
            </Text>
            <Text style={[styles.summaryItem, record.tookProbiotic && styles.summaryGood]}>
              {record.tookProbiotic ? '✅' : '❌'} Probiotic
            </Text>
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.complianceSummary}>
          <Text style={styles.summaryTitle}>Lifestyle:</Text>
          <View style={styles.summaryGrid}>
            <Text style={[styles.summaryItem, record.sleptWell && styles.summaryGood]}>
              {record.sleptWell ? '✅' : '❌'} Sleep
            </Text>
            <Text style={[styles.summaryItem, record.exercised && styles.summaryGood]}>
              {record.exercised ? '✅' : '❌'} Exercise
            </Text>
            <Text style={[styles.summaryItem, record.hydrated && styles.summaryGood]}>
              {record.hydrated ? '✅' : '❌'} Hydration
            </Text>
          </View>
        </View>

        {record.notes && (
          <Text style={styles.recordNotes}>📝 {record.notes}</Text>
        )}
      </View>
    </View>
  );

  const renderComplianceInsights = () => {
    if (complianceRecords.length < 2) return null;

    const avgScore = complianceRecords.reduce((sum, r) => sum + r.complianceScore, 0) / complianceRecords.length;
    const recentScore = complianceRecords[0]?.complianceScore || 0;
    const trend = recentScore > avgScore ? 'up' : recentScore < avgScore ? 'down' : 'stable';

    return (
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Compliance Insights</Text>
        <View style={styles.insightsGrid}>
          <View style={styles.insightCard}>
            <Target size={24} color={colors.primary} />
            <Text style={styles.insightValue}>{recentScore}%</Text>
            <Text style={styles.insightLabel}>Today's Score</Text>
          </View>
          <View style={styles.insightCard}>
            <TrendingUp size={24} color={trend === 'up' ? colors.success : trend === 'down' ? colors.error : colors.warning} />
            <Text style={styles.insightValue}>{avgScore.toFixed(0)}%</Text>
            <Text style={styles.insightLabel}>Average Score</Text>
          </View>
          <View style={styles.insightCard}>
            <CheckCircle size={24} color={colors.success} />
            <Text style={styles.insightValue}>{complianceRecords.length}</Text>
            <Text style={styles.insightLabel}>Days Tracked</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <CheckCircle size={32} color={colors.primary} />
          <Text style={styles.headerTitle}>Program Compliance</Text>
          <Text style={styles.headerSubtitle}>Track what you DIDN'T eat and what you DID do</Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
          <Plus size={20} color={colors.background} />
          <Text style={styles.addButtonText}>Add Compliance Record</Text>
        </TouchableOpacity>

        {/* Compliance Insights */}
        {renderComplianceInsights()}

        {/* Compliance Records */}
        <View style={styles.recordsSection}>
          <Text style={styles.sectionTitle}>Compliance History</Text>
          {complianceRecords.length > 0 ? (
            complianceRecords.map(renderComplianceRecord)
          ) : (
            <View style={styles.emptyState}>
              <CheckCircle size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No compliance records yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your program compliance to see your progress
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Form */}
      {renderAddForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  recordsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDateText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  recordScore: {
    alignItems: 'center',
  },
  recordScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordContent: {
    gap: 16,
  },
  complianceSummary: {
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryGood: {
    color: colors.success,
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 14,
    color: colors.text,
  },
  recordNotes: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  formContainer: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  scorePreview: {
    backgroundColor: colors.primary + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  scorePreviewValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxInfo: {
    flex: 1,
    marginRight: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  checkboxDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.cardBackground,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  compliancePreview: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  compliancePreviewText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});
