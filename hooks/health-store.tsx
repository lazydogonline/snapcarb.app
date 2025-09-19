import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Meal, Supplement, ChallengeDay, DailyProgress } from '@/types/health';
import { defaultSupplements, challengeDays } from '@/constants/health-data';

export const [HealthProvider, useHealth] = createContextHook(() => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>(defaultSupplements);
  const [challenge, setChallenge] = useState<ChallengeDay[]>(challengeDays);
  const [isLoading, setIsLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState({
    glucoseLevel: 85,
    waistMeasurement: 82,
    fastingData: {
      startTime: null as Date | null,
      endTime: null as Date | null,
      duration: 0,
      isActive: false
    },
    programRules: {
      noWheat: true,
      noSugar: true,
      noGrains: true
    }
  });

  const loadData = useCallback(async () => {
    try {
      console.log('loadData called - reloading from AsyncStorage...');
      const [storedMeals, storedSupplements, storedChallenge, storedHealthMetrics] = await Promise.all([
        AsyncStorage.getItem('meals'),
        AsyncStorage.getItem('supplements'),
        AsyncStorage.getItem('challenge'),
        AsyncStorage.getItem('health-metrics'),
      ]);

      if (storedMeals) setMeals(JSON.parse(storedMeals));
      if (storedSupplements) {
        const stored = JSON.parse(storedSupplements);
        // Ensure we have all 8 supplements - merge with defaults if needed
        if (stored.length < defaultSupplements.length) {
          const mergedSupplements = defaultSupplements.map(defaultSup => {
            const storedSup = stored.find((s: Supplement) => s.id === defaultSup.id);
            return storedSup || defaultSup;
          });
          setSupplements(mergedSupplements);
          await AsyncStorage.setItem('supplements', JSON.stringify(mergedSupplements));
        } else {
          setSupplements(stored);
        }
      }
      if (storedChallenge) {
        console.log('Loading fresh challenge data:', JSON.parse(storedChallenge).map((d: ChallengeDay) => ({ day: d.day, completed: d.completed })));
        setChallenge(JSON.parse(storedChallenge));
      }
      if (storedHealthMetrics) {
        setHealthMetrics(JSON.parse(storedHealthMetrics));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addMeal = useCallback(async (meal: Omit<Meal, 'id'>) => {
    const newMeal: Meal = {
      ...meal,
      id: Date.now().toString(),
    };
    const updatedMeals = [...meals, newMeal];
    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
  }, [meals]);

  const updateMeal = useCallback(async (mealId: string, updates: Partial<Meal>) => {
    const updatedMeals = meals.map(meal => 
      meal.id === mealId ? { ...meal, ...updates } : meal
    );
    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
  }, [meals]);

  const toggleSupplement = useCallback(async (supplementId: string) => {
    const updatedSupplements = supplements.map(supplement => 
      supplement.id === supplementId 
        ? { 
            ...supplement, 
            taken: !supplement.taken,
            takenAt: !supplement.taken ? new Date() : undefined
          }
        : supplement
    );
    setSupplements(updatedSupplements);
    await AsyncStorage.setItem('supplements', JSON.stringify(updatedSupplements));
  }, [supplements]);

  const updateChallengeDay = useCallback(async (dayNumber: number, updates: Partial<ChallengeDay>) => {
    const updatedChallenge = challenge.map(day => 
      day.day === dayNumber ? { ...day, ...updates } : day
    );
    setChallenge(updatedChallenge);
    await AsyncStorage.setItem('challenge', JSON.stringify(updatedChallenge));
  }, [challenge]);

  const getTodayProgress = useCallback((): DailyProgress => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => 
      new Date(meal.timestamp).toDateString() === today
    );
    const todaySupplements = supplements.filter(s => s.taken);
    const todayChallenge = challenge.find(day => day.date === today);

    return {
      date: today,
      mealsLogged: todayMeals.length,
      totalNetCarbs: todayMeals.reduce((sum, meal) => sum + meal.netCarbs, 0),
      supplementsTaken: todaySupplements.length,
      totalSupplements: supplements.length,
      challengeCompleted: todayChallenge?.completed || false,
      fastingHours: 0, // TODO: Calculate actual fasting hours
      adherenceScore: todayChallenge?.adherenceScore || 0,
    };
  }, [meals, supplements, challenge]);

  const resetDailySupplements = useCallback(async () => {
    const resetSupplements = supplements.map(supplement => ({
      ...supplement,
      taken: false,
      takenAt: undefined,
    }));
    setSupplements(resetSupplements);
    await AsyncStorage.setItem('supplements', JSON.stringify(resetSupplements));
  }, [supplements]);

  const updateHealthMetrics = useCallback(async (updates: Partial<typeof healthMetrics>) => {
    console.log('🔄 Updating health metrics:', updates);
    console.log('🔄 Current metrics before update:', healthMetrics);
    const updatedMetrics = { ...healthMetrics, ...updates };
    console.log('🔄 New metrics after update:', updatedMetrics);
    setHealthMetrics(updatedMetrics);
    await AsyncStorage.setItem('health-metrics', JSON.stringify(updatedMetrics));
    console.log('✅ Health metrics saved to AsyncStorage');
  }, [healthMetrics]);

  return useMemo(() => ({
    meals,
    supplements,
    challenge,
    isLoading,
    healthMetrics,
    addMeal,
    updateMeal,
    toggleSupplement,
    updateChallengeDay,
    getTodayProgress,
    resetDailySupplements,
    updateHealthMetrics,
    loadData,
  }), [meals, supplements, challenge, isLoading, healthMetrics, addMeal, updateMeal, toggleSupplement, updateChallengeDay, getTodayProgress, resetDailySupplements, updateHealthMetrics, loadData]);
});