// SnapCarb Health Metrics - Comprehensive Health Tracking System
// This defines all the health metrics users can track in the app

export interface HealthMetrics {
  // Basic Profile
  profile: UserProfile;
  
  // Blood Work & Medical
  bloodWork: BloodWorkMetrics;
  
  // Body Measurements
  bodyMeasurements: BodyMeasurements;
  
  // Vital Signs
  vitalSigns: VitalSigns;
  
  // Fasting & Metabolic
  fastingMetrics: FastingMetrics;
  
  // Lifestyle & Wellness
  lifestyleMetrics: LifestyleMetrics;
  
  // Digestive Health
  digestiveHealth: DigestiveHealth;
  
  // Progress Tracking
  progress: ProgressMetrics;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height: number; // in cm
  activityLevel: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  goals: string[];
  dietaryRestrictions: string[];
  medicalConditions: string[];
  medications: string[];
  allergies: string[];
  updatedAt: string;
}

export interface BloodWorkMetrics {
  id: string;
  userId: string;
  date: string;
  
  // Glucose & Diabetes
  fastingGlucose: number; // mg/dL
  hba1c: number; // %
  insulin: number; // mIU/L
  cPeptide: number; // ng/mL
  
  // Inflammation & Immune
  crp: number; // mg/L
  esr: number; // mm/hr
  whiteBloodCellCount: number; // K/µL
  
  // Vitamins & Minerals
  vitaminD: number; // ng/mL
  vitaminB12: number; // pg/mL
  folate: number; // ng/mL
  iron: number; // µg/dL
  ferritin: number; // ng/mL
  tIbc: number; // µg/dL
  
  // Thyroid Function
  tsh: number; // mIU/L
  freeT3: number; // pg/mL
  freeT4: number; // ng/dL
  
  // Liver Function
  alt: number; // U/L
  ast: number; // U/L
  ggt: number; // U/L
  alkalinePhosphatase: number; // U/L
  bilirubin: number; // mg/dL
  
  // Kidney Function
  creatinine: number; // mg/dL
  egfr: number; // mL/min/1.73m²
  bun: number; // mg/dL
  
  // Lipids
  totalCholesterol: number; // mg/dL
  hdl: number; // mg/dL
  ldl: number; // mg/dL
  triglycerides: number; // mg/dL
  
  // Other Important
  uricAcid: number; // mg/dL
  homocysteine: number; // µmol/L
  
  notes: string;
  labName: string;
  updatedAt: string;
}

export interface BodyMeasurements {
  id: string;
  userId: string;
  date: string;
  
  // Basic Measurements
  weight: number; // kg
  bodyFatPercentage: number; // %
  muscleMass: number; // kg
  waterPercentage: number; // %
  boneDensity: number; // g/cm²
  
  // Circumference Measurements
  waist: number; // cm
  hip: number; // cm
  neck: number; // cm
  chest: number; // cm
  biceps: number; // cm
  forearms: number; // cm
  thighs: number; // cm
  calves: number; // cm
  
  // Body Composition
  visceralFat: number; // level 1-30
  subcutaneousFat: number; // kg
  leanBodyMass: number; // kg
  
  // Calculated Metrics
  bmi: number;
  waistToHipRatio: number;
  bodyFatMass: number; // kg
  
  notes: string;
  updatedAt: string;
}

export interface VitalSigns {
  id: string;
  userId: string;
  date: string;
  time: string;
  
  // Cardiovascular
  systolicBP: number; // mmHg
  diastolicBP: number; // mmHg
  restingHeartRate: number; // bpm
  heartRateVariability: number; // ms
  
  // Other Vital Signs
  bodyTemperature: number; // °C
  oxygenSaturation: number; // %
  respiratoryRate: number; // breaths/min
  
  // Context
  measurementContext: 'resting' | 'post-exercise' | 'post-meal' | 'stressful-situation';
  notes: string;
  updatedAt: string;
}

export interface FastingMetrics {
  id: string;
  userId: string;
  date: string;
  
  // Fasting Session
  fastingStartTime: string;
  fastingEndTime: string;
  fastingDuration: number; // hours
  isActive: boolean;
  
  // Eating Window
  eatingWindowStart: string;
  eatingWindowEnd: string;
  eatingWindowDuration: number; // hours
  
  // Metabolic Markers
  ketoneLevel: number; // mmol/L
  ketoneType: 'blood' | 'breath' | 'urine';
  glucoseLevel: number; // mg/dL
  
  // Subjective Metrics
  hungerLevel: 1 | 2 | 3 | 4 | 5; // 1=no hunger, 5=very hungry
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  mentalClarity: 1 | 2 | 3 | 4 | 5; // 1=very foggy, 5=very clear
  
  // Context
  fastingType: 'intermittent' | 'extended' | 'alternate-day' | 'custom';
  notes: string;
  updatedAt: string;
}

export interface LifestyleMetrics {
  id: string;
  userId: string;
  date: string;
  
  // Sleep
  sleepDuration: number; // hours
  sleepQuality: 1 | 2 | 3 | 4 | 5; // 1=very poor, 5=excellent
  sleepEfficiency: number; // %
  deepSleepPercentage: number; // %
  remSleepPercentage: number; // %
  
  // Exercise
  exerciseDuration: number; // minutes
  exerciseType: string[];
  exerciseIntensity: 'low' | 'moderate' | 'high';
  steps: number;
  caloriesBurned: number;
  
  // Stress & Wellness
  stressLevel: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  mood: 'excellent' | 'good' | 'fair' | 'poor';
  energyLevel: 1 | 2 | 3 | 4 | 5; // 1=very low, 5=very high
  
  // Environmental
  sunExposure: number; // minutes
  waterIntake: number; // liters
  alcoholConsumption: number; // standard drinks
  caffeineIntake: number; // mg
  
  // Social & Mental
  socialInteractions: number; // count
  meditationDuration: number; // minutes
  readingTime: number; // minutes
  
  notes: string;
  updatedAt: string;
}

export interface DigestiveHealth {
  id: string;
  userId: string;
  date: string;
  
  // Bowel Movements
  bmFrequency: number; // per day
  bmConsistency: 'hard' | 'firm' | 'soft' | 'liquid';
  bmColor: string;
  bmEase: 1 | 2 | 3 | 4 | 5; // 1=very difficult, 5=very easy
  
  // Digestive Symptoms
  bloating: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
  gas: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
  abdominalPain: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
  heartburn: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
  nausea: 1 | 2 | 3 | 4 | 5; // 1=none, 5=severe
  
  // Food Reactions
  foodIntolerances: string[];
  allergicReactions: string[];
  triggerFoods: string[];
  
  // Gut Health Score
  gutHealthScore: number; // 0-100
  
  notes: string;
  updatedAt: string;
}

export interface ProgressMetrics {
  id: string;
  userId: string;
  date: string;
  
  // Weight Progress
  weightChange: number; // kg (positive = gain, negative = loss)
  weightChangePercentage: number; // %
  
  // Body Composition Progress
  bodyFatChange: number; // % (positive = gain, negative = loss)
  muscleMassChange: number; // kg (positive = gain, negative = loss)
  
  // Measurement Progress
  waistChange: number; // cm
  hipChange: number; // cm
  
  // Health Markers Progress
  glucoseImprovement: boolean;
  hba1cImprovement: boolean;
  bloodPressureImprovement: boolean;
  
  // Achievement Tracking
  goalsAchieved: string[];
  milestonesReached: string[];
  streakDays: number;
  
  // Progress Score
  overallProgressScore: number; // 0-100
  
  notes: string;
  updatedAt: string;
}

// Utility types for tracking
export type MetricCategory = 
  | 'bloodWork' 
  | 'bodyMeasurements' 
  | 'vitalSigns' 
  | 'fastingMetrics' 
  | 'lifestyleMetrics' 
  | 'digestiveHealth' 
  | 'progress';

export type MetricTrend = 'improving' | 'stable' | 'declining' | 'fluctuating';

export interface MetricAlert {
  id: string;
  userId: string;
  metricType: MetricCategory;
  metricName: string;
  currentValue: number;
  thresholdValue: number;
  alertType: 'warning' | 'critical' | 'improvement';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface HealthGoal {
  id: string;
  userId: string;
  category: MetricCategory;
  metricName: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  isAchieved: boolean;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}
