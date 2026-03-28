import { supabase } from '../config/supabase';
import { 
  HealthMetrics, 
  MetricCategory, 
  MetricTrend, 
  MetricAlert, 
  HealthGoal 
} from '../types/health-metrics';

// Health Service for DR Davis Infinite Health Program
export class HealthService {
  
  // ===== USER HEALTH PROFILES =====
  
  static async createHealthProfile(userId: string, profileData: Partial<HealthMetrics['profile']>) {
    try {
      const { data, error } = await supabase
        .from('user_health_profiles')
        .insert({
          user_id: userId,
          ...profileData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating health profile:', error);
      throw error;
    }
  }

  static async getHealthProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting health profile:', error);
      throw error;
    }
  }

  static async updateHealthProfile(userId: string, updates: Partial<HealthMetrics['profile']>) {
    try {
      const { data, error } = await supabase
        .from('user_health_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating health profile:', error);
      throw error;
    }
  }

  // ===== DAILY HEALTH METRICS =====
  
  static async logDailyMetrics(userId: string, date: string, metrics: any) {
    try {
      const { data, error } = await supabase
        .from('daily_health_metrics')
        .upsert({
          user_id: userId,
          date,
          ...metrics,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging daily metrics:', error);
      throw error;
    }
  }

  static async getDailyMetrics(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error getting daily metrics:', error);
      throw error;
    }
  }

  static async getMetricsHistory(userId: string, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('daily_health_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting metrics history:', error);
      throw error;
    }
  }

  // ===== BLOOD WORK RESULTS =====
  
  static async addBloodWorkResult(userId: string, bloodWorkData: any) {
    try {
      const { data, error } = await supabase
        .from('blood_work_results')
        .insert({
          user_id: userId,
          ...bloodWorkData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding blood work result:', error);
      throw error;
    }
  }

  static async getBloodWorkHistory(userId: string) {
    try {
      const { data, error } = await supabase
        .from('blood_work_results')
        .select('*')
        .eq('user_id', userId)
        .order('test_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting blood work history:', error);
      throw error;
    }
  }

  // ===== SUPPLEMENT TRACKING =====
  
  static async getSupplements(userId: string) {
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting supplements:', error);
      throw error;
    }
  }

  static async addSupplement(userId: string, supplementData: any) {
    try {
      const { data, error } = await supabase
        .from('supplements')
        .insert({
          user_id: userId,
          ...supplementData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding supplement:', error);
      throw error;
    }
  }

  static async logSupplementTaken(userId: string, supplementId: string, date: string, wasTaken: boolean = true) {
    try {
      const { data, error } = await supabase
        .from('daily_supplement_log')
        .upsert({
          user_id: userId,
          supplement_id: supplementId,
          date,
          was_taken: wasTaken,
          time_taken: wasTaken ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,supplement_id,date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging supplement taken:', error);
      throw error;
    }
  }

  static async getSupplementLog(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('daily_supplement_log')
        .select(`
          *,
          supplements (
            name,
            dose,
            time_of_day
          )
        `)
        .eq('user_id', userId)
        .eq('date', date);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting supplement log:', error);
      throw error;
    }
  }

  // ===== MEAL TRACKING (NET CARBS FOCUS) =====
  
  static async logMeal(userId: string, mealData: any) {
    try {
      // Calculate net carbs if not provided
      if (mealData.total_carbs_g !== undefined && mealData.fiber_g !== undefined) {
        mealData.net_carbs_g = mealData.total_carbs_g - mealData.fiber_g;
        mealData.is_within_15g_limit = mealData.net_carbs_g <= 15; // DR Davis rule
      }
      
      // Check DR Davis compliance
      mealData.is_dr_davis_compliant = await this.checkDRDavisCompliance(mealData);
      
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: userId,
          ...mealData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging meal:', error);
      throw error;
    }
  }

  static async getMealsForDate(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('meal_time');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting meals for date:', error);
      throw error;
    }
  }

  static async getDailyNetCarbs(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('net_carbs_g, is_within_15g_limit')
        .eq('user_id', userId)
        .eq('date', date);
      
      if (error) throw error;
      
      const totalNetCarbs = data.reduce((sum, meal) => sum + (meal.net_carbs_g || 0), 0);
      const mealsWithinLimit = data.filter(meal => meal.is_within_15g_limit).length;
      
      return {
        totalNetCarbs,
        mealsWithinLimit,
        totalMeals: data.length
      };
    } catch (error) {
      console.error('Error getting daily net carbs:', error);
      throw error;
    }
  }

  // ===== HEALTH GOALS =====
  
  static async createHealthGoal(userId: string, goalData: any) {
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .insert({
          user_id: userId,
          ...goalData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating health goal:', error);
      throw error;
    }
  }

  static async getHealthGoals(userId: string, status?: string) {
    try {
      let query = supabase
        .from('health_goals')
        .select('*')
        .eq('user_id', userId);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting health goals:', error);
      throw error;
    }
  }

  static async updateGoalProgress(userId: string, goalId: string, currentValue: number) {
    try {
      const goal = await this.getGoalById(goalId);
      if (!goal || goal.user_id !== userId) {
        throw new Error('Goal not found or access denied');
      }
      
      let progressPercentage = 0;
      if (goal.target_value && goal.target_value > 0) {
        progressPercentage = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
      }
      
      const status = progressPercentage >= 100 ? 'completed' : goal.status;
      
      const { data, error } = await supabase
        .from('health_goals')
        .update({
          current_value: currentValue,
          progress_percentage: progressPercentage,
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  // ===== DR DAVIS PROGRAM PROGRESS =====
  
  static async startDRDavisProgram(userId: string, startDate: string = new Date().toISOString().split('T')[0]) {
    try {
      const { data, error } = await supabase
        .from('dr_davis_progress')
        .insert({
          user_id: userId,
          program_start_date: startDate,
          current_phase: '10-day-detox',
          current_day: 1,
          total_days_completed: 0,
          detox_start_date: startDate
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting DR Davis program:', error);
      throw error;
    }
  }

  static async getDRDavisProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .from('dr_davis_progress')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error getting DR Davis progress:', error);
      throw error;
    }
  }

  static async updateDRDavisProgress(userId: string, updates: any) {
    try {
      const progress = await this.getDRDavisProgress(userId);
      if (!progress) {
        throw new Error('DR Davis progress not found');
      }
      
      const { data, error } = await supabase
        .from('dr_davis_progress')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', progress.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating DR Davis progress:', error);
      throw error;
    }
  }

  // ===== HEALTH REMINDERS =====
  
  static async createHealthReminder(userId: string, reminderData: any) {
    try {
      const { data, error } = await supabase
        .from('health_reminders')
        .insert({
          user_id: userId,
          ...reminderData
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating health reminder:', error);
      throw error;
    }
  }

  static async getActiveReminders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('health_reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('time_of_day');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting active reminders:', error);
      throw error;
    }
  }

  // ===== UTILITY FUNCTIONS =====
  
  private static async checkDRDavisCompliance(mealData: any): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_dr_davis_compliance', {
        p_net_carbs: mealData.net_carbs_g || 0,
        p_contains_grains: mealData.contains_grains || false,
        p_contains_added_sugars: mealData.contains_added_sugars || false,
        p_contains_seed_oils: mealData.contains_seed_oils || false
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking DR Davis compliance:', error);
      // Fallback to manual check
      return (mealData.net_carbs_g || 0) <= 15 
        && !(mealData.contains_grains || mealData.contains_added_sugars || mealData.contains_seed_oils);
    }
  }

  private static async getGoalById(goalId: string) {
    try {
      const { data, error } = await supabase
        .from('health_goals')
        .select('*')
        .eq('id', goalId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting goal by ID:', error);
      throw error;
    }
  }

  // ===== HEALTH ANALYTICS =====
  
  static async getDailyHealthSummary(userId: string, date: string) {
    try {
      const { data, error } = await supabase.rpc('get_daily_health_summary', {
        p_user_id: userId,
        p_date: date
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting daily health summary:', error);
      throw error;
    }
  }

  static async getCurrentDRDavisPhase(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_current_dr_davis_phase', {
        p_user_id: userId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting current DR Davis phase:', error);
      throw error;
    }
  }

  // ===== MOCK DATA FOR TESTING =====
  
  static getMockHealthData(): Partial<HealthMetrics> {
    return {
      bodyMeasurements: {
        id: '1',
        userId: 'mock-user',
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
      }
    };
  }

  static getMockAlerts(): MetricAlert[] {
    return [
      {
        id: '1',
        type: 'warning',
        title: 'Blood Glucose Alert',
        message: 'Your fasting glucose is slightly elevated at 95 mg/dL',
        metric: 'fastingGlucose',
        value: 95,
        threshold: 90,
        date: new Date().toISOString()
      },
      {
        id: '2',
        type: 'info',
        title: 'Supplement Reminder',
        message: 'Remember to take your evening supplements',
        metric: 'supplements',
        value: 0,
        threshold: 0,
        date: new Date().toISOString()
      }
    ];
  }

  static getMockGoals(): HealthGoal[] {
    return [
      {
        id: '1',
        title: 'Reduce Fasting Glucose',
        description: 'Get fasting glucose below 90 mg/dL',
        category: 'blood_glucose',
        targetValue: 90,
        targetUnit: 'mg/dL',
        startDate: new Date().toISOString(),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        currentValue: 95,
        progressPercentage: 50,
        status: 'active'
      }
    ];
  }
}

export default HealthService;
