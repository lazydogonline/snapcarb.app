import { 
  HealthMetrics, 
  MetricCategory, 
  MetricTrend, 
  MetricAlert, 
  HealthGoal,
  BodyMeasurements,
  FastingMetrics,
  BloodWorkMetrics,
  VitalSigns,
  LifestyleMetrics,
  DigestiveHealth,
  ProgressMetrics
} from '../types/health-metrics';

export interface HealthDataInput {
  weight?: number;
  bodyFatPercentage?: number;
  waist?: number;
  hip?: number;
  fastingDuration?: number;
  eatingWindowDuration?: number;
  ketoneLevel?: number;
  glucoseLevel?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  sleepDuration?: number;
  exerciseDuration?: number;
  stressLevel?: 1 | 2 | 3 | 4 | 5;
  mood?: 'excellent' | 'good' | 'fair' | 'poor';
}

export class HealthDataService {
  private static userData: Map<string, Partial<HealthMetrics>> = new Map();
  private static userInputs: Map<string, HealthDataInput[]> = new Map();

  /**
   * Add user health data input
   */
  static addUserInput(userId: string, input: HealthDataInput): void {
    if (!this.userInputs.has(userId)) {
      this.userInputs.set(userId, []);
    }
    this.userInputs.get(userId)!.push(input);
    
    // Update calculated metrics
    this.updateUserMetrics(userId);
  }

  /**
   * Get user's health metrics
   */
  static getUserMetrics(userId: string): Partial<HealthMetrics> {
    if (!this.userData.has(userId)) {
      this.userData.set(userId, this.generateInitialMetrics(userId));
    }
    return this.userData.get(userId)!;
  }

  /**
   * Get user's health alerts
   */
  static getUserAlerts(userId: string): MetricAlert[] {
    const metrics = this.getUserMetrics(userId);
    const alerts: MetricAlert[] = [];

    // Weight alerts
    if (metrics.bodyMeasurements?.weight && metrics.bodyMeasurements.weight > 80) {
      alerts.push({
        id: 'weight-warning',
        userId,
        metricType: 'bodyMeasurements',
        metricName: 'Weight',
        currentValue: metrics.bodyMeasurements.weight,
        thresholdValue: 80,
        alertType: 'warning',
        message: 'Weight is above healthy range',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Blood pressure alerts
    if (metrics.vitalSigns?.systolicBP && metrics.vitalSigns.systolicBP > 140) {
      alerts.push({
        id: 'bp-warning',
        userId,
        metricType: 'vitalSigns',
        metricName: 'Blood Pressure',
        currentValue: metrics.vitalSigns.systolicBP,
        thresholdValue: 140,
        alertType: 'warning',
        message: 'Systolic blood pressure is elevated',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    // Glucose alerts
    if (metrics.bloodWork?.fastingGlucose && metrics.bloodWork.fastingGlucose > 100) {
      alerts.push({
        id: 'glucose-warning',
        userId,
        metricType: 'bloodWork',
        metricName: 'Fasting Glucose',
        currentValue: metrics.bloodWork.fastingGlucose,
        thresholdValue: 100,
        alertType: 'warning',
        message: 'Fasting glucose is above normal range',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    return alerts;
  }

  /**
   * Get user's health goals
   */
  static getUserGoals(userId: string): HealthGoal[] {
    const metrics = this.getUserMetrics(userId);
    const goals: HealthGoal[] = [];

    // Weight goal
    if (metrics.bodyMeasurements?.weight) {
      const targetWeight = Math.max(60, metrics.bodyMeasurements.weight - 5);
      const progress = Math.max(0, Math.min(100, 
        ((metrics.bodyMeasurements.weight - targetWeight) / 5) * 100
      ));
      
      goals.push({
        id: 'weight-goal',
        userId,
        category: 'bodyMeasurements',
        metricName: 'Weight',
        targetValue: targetWeight,
        currentValue: metrics.bodyMeasurements.weight,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'high',
        isAchieved: progress >= 100,
        progressPercentage: progress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Fasting goal
    if (metrics.fastingMetrics?.fastingDuration) {
      const targetFasting = Math.max(16, metrics.fastingMetrics.fastingDuration + 2);
      const progress = Math.max(0, Math.min(100, 
        (metrics.fastingMetrics.fastingDuration / targetFasting) * 100
      ));
      
      goals.push({
        id: 'fasting-goal',
        userId,
        category: 'fastingMetrics',
        metricName: 'Fasting Duration',
        targetValue: targetFasting,
        currentValue: metrics.fastingMetrics.fastingDuration,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium',
        isAchieved: progress >= 100,
        progressPercentage: progress,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return goals;
  }

  /**
   * Calculate metric trends based on user input history
   */
  static getMetricTrend(userId: string, metricName: string): MetricTrend {
    const inputs = this.userInputs.get(userId) || [];
    if (inputs.length < 2) return 'stable';

    // Simple trend calculation based on last 2 inputs
    const recent = inputs.slice(-2);
    const first = this.getMetricValue(recent[0], metricName);
    const last = this.getMetricValue(recent[1], metricName);

    if (first === null || last === null) return 'stable';
    
    const change = last - first;
    if (Math.abs(change) < 0.1) return 'stable';
    if (change > 0) return 'improving';
    return 'declining';
  }

  /**
   * Generate initial metrics for new users
   */
  private static generateInitialMetrics(userId: string): Partial<HealthMetrics> {
    const now = new Date().toISOString();
    
    return {
      bodyMeasurements: {
        id: 'initial',
        userId,
        date: now,
        weight: 75.0,
        bodyFatPercentage: 20.0,
        muscleMass: 55.0,
        waterPercentage: 55.0,
        boneDensity: 1.2,
        waist: 85,
        hip: 100,
        neck: 40,
        chest: 95,
        biceps: 30,
        forearms: 25,
        thighs: 55,
        calves: 35,
        visceralFat: 10,
        subcutaneousFat: 15.0,
        leanBodyMass: 60.0,
        bmi: 24.0,
        waistToHipRatio: 0.85,
        bodyFatMass: 15.0,
        notes: 'Initial measurements',
        updatedAt: now
      },
      fastingMetrics: {
        id: 'initial',
        userId,
        date: now,
        fastingStartTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        fastingEndTime: now,
        fastingDuration: 14,
        isActive: false,
        eatingWindowStart: now,
        eatingWindowEnd: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
        eatingWindowDuration: 10,
        ketoneLevel: 0.8,
        ketoneType: 'blood',
        glucoseLevel: 90,
        hungerLevel: 3,
        energyLevel: 3,
        mentalClarity: 3,
        fastingType: 'intermittent',
        notes: 'Starting SnapCarb journey',
        updatedAt: now
      },
      vitalSigns: {
        id: 'initial',
        userId,
        date: now,
        time: now,
        systolicBP: 120,
        diastolicBP: 80,
        restingHeartRate: 72,
        heartRateVariability: 45,
        bodyTemperature: 36.8,
        oxygenSaturation: 98,
        respiratoryRate: 16,
        measurementContext: 'resting',
        notes: 'Baseline vitals',
        updatedAt: now
      },
      lifestyleMetrics: {
        id: 'initial',
        userId,
        date: now,
        sleepDuration: 7.5,
        sleepQuality: 3,
        sleepEfficiency: 85,
        deepSleepPercentage: 20,
        remSleepPercentage: 25,
        exerciseDuration: 30,
        exerciseType: ['walking'],
        exerciseIntensity: 'moderate',
        steps: 8000,
        caloriesBurned: 200,
        stressLevel: 3,
        mood: 'good',
        energyLevel: 3,
        sunExposure: 20,
        waterIntake: 2.0,
        alcoholConsumption: 0,
        caffeineIntake: 150,
        socialInteractions: 5,
        meditationDuration: 0,
        readingTime: 15,
        notes: 'Starting healthy habits',
        updatedAt: now
      }
    };
  }

  /**
   * Update user metrics based on input history
   */
  private static updateUserMetrics(userId: string): void {
    const inputs = this.userInputs.get(userId) || [];
    if (inputs.length === 0) return;

    const latest = inputs[inputs.length - 1];
    const current = this.userData.get(userId) || {};
    
    // Update body measurements
    if (latest.weight !== undefined || latest.bodyFatPercentage !== undefined || 
        latest.waist !== undefined || latest.hip !== undefined) {
      current.bodyMeasurements = {
        ...current.bodyMeasurements,
        ...(latest.weight !== undefined && { weight: latest.weight }),
        ...(latest.bodyFatPercentage !== undefined && { bodyFatPercentage: latest.bodyFatPercentage }),
        ...(latest.waist !== undefined && { waist: latest.waist }),
        ...(latest.hip !== undefined && { hip: latest.hip }),
        updatedAt: new Date().toISOString()
      } as BodyMeasurements;
    }

    // Update fasting metrics
    if (latest.fastingDuration !== undefined || latest.eatingWindowDuration !== undefined ||
        latest.ketoneLevel !== undefined || latest.glucoseLevel !== undefined) {
      current.fastingMetrics = {
        ...current.fastingMetrics,
        ...(latest.fastingDuration !== undefined && { fastingDuration: latest.fastingDuration }),
        ...(latest.eatingWindowDuration !== undefined && { eatingWindowDuration: latest.eatingWindowDuration }),
        ...(latest.ketoneLevel !== undefined && { ketoneLevel: latest.ketoneLevel }),
        ...(latest.glucoseLevel !== undefined && { glucoseLevel: latest.glucoseLevel }),
        updatedAt: new Date().toISOString()
      } as FastingMetrics;
    }

    // Update vital signs
    if (latest.bloodPressure !== undefined) {
      current.vitalSigns = {
        ...current.vitalSigns,
        systolicBP: latest.bloodPressure.systolic,
        diastolicBP: latest.bloodPressure.diastolic,
        updatedAt: new Date().toISOString()
      } as VitalSigns;
    }

    // Update lifestyle metrics
    if (latest.sleepDuration !== undefined || latest.exerciseDuration !== undefined ||
        latest.stressLevel !== undefined || latest.mood !== undefined) {
      current.lifestyleMetrics = {
        ...current.lifestyleMetrics,
        ...(latest.sleepDuration !== undefined && { sleepDuration: latest.sleepDuration }),
        ...(latest.exerciseDuration !== undefined && { exerciseDuration: latest.exerciseDuration }),
        ...(latest.stressLevel !== undefined && { stressLevel: latest.stressLevel }),
        ...(latest.mood !== undefined && { mood: latest.mood }),
        updatedAt: new Date().toISOString()
      } as LifestyleMetrics;
    }

    this.userData.set(userId, current);
  }

  /**
   * Extract metric value from input data
   */
  private static getMetricValue(input: HealthDataInput, metricName: string): number | null {
    switch (metricName.toLowerCase()) {
      case 'weight': return input.weight || null;
      case 'bodyfat': return input.bodyFatPercentage || null;
      case 'waist': return input.waist || null;
      case 'hip': return input.hip || null;
      case 'fastingduration': return input.fastingDuration || null;
      case 'ketonelevel': return input.ketoneLevel || null;
      case 'glucoselevel': return input.glucoseLevel || null;
      case 'systolicbp': return input.bloodPressure?.systolic || null;
      case 'diastolicbp': return input.bloodPressure?.diastolic || null;
      case 'sleepduration': return input.sleepDuration || null;
      case 'exerciseduration': return input.exerciseDuration || null;
      case 'stresslevel': return input.stressLevel || null;
      default: return null;
    }
  }
}

export default HealthDataService;




