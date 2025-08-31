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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedMeals, storedSupplements, storedChallenge] = await Promise.all([
        AsyncStorage.getItem('meals'),
        AsyncStorage.getItem('supplements'),
        AsyncStorage.getItem('challenge'),
      ]);

      if (storedMeals) setMeals(JSON.parse(storedMeals));
      if (storedSupplements) setSupplements(JSON.parse(storedSupplements));
      if (storedChallenge) setChallenge(JSON.parse(storedChallenge));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return useMemo(() => ({
    meals,
    supplements,
    challenge,
    isLoading,
    addMeal,
    updateMeal,
    toggleSupplement,
    updateChallengeDay,
    getTodayProgress,
    resetDailySupplements,
  }), [meals, supplements, challenge, isLoading, addMeal, updateMeal, toggleSupplement, updateChallengeDay, getTodayProgress, resetDailySupplements]);
});