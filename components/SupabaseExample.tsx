import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { supabase } from '../config/supabase';
import { mealService, authService } from '../services/supabase-service';

// Example component showing Supabase integration
export default function SupabaseExample() {
  const [user, setUser] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mealName, setMealName] = useState('');
  const [netCarbs, setNetCarbs] = useState('');

  useEffect(() => {
    // Check if user is already signed in
    checkUser();
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        if (session?.user) {
          loadUserMeals(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setMeals([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadUserMeals(currentUser.id);
    }
  };

  const loadUserMeals = async (userId: string) => {
    try {
      const userMeals = await mealService.getUserMeals(userId);
      setMeals(userMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      await authService.signUp('test@example.com', 'password123', 'testuser', {
        firstName: 'Test',
        lastName: 'User',
        goals: ['Weight Loss', 'Better Health'],
        fastingWindow: 16,
        eatingWindow: 8,
      });
      Alert.alert('Success', 'Account created! Check your email to verify.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await authService.signIn('test@example.com', 'password123');
      Alert.alert('Success', 'Signed in!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      Alert.alert('Success', 'Signed out!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleAddMeal = async () => {
    if (!user || !mealName || !netCarbs) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const newMeal = await mealService.createMeal({
        userId: user.id,
        name: mealName,
        netCarbs: parseFloat(netCarbs),
        timestamp: new Date().toISOString(),
        description: 'Added via example component',
        complianceScore: 8,
      });

      setMeals([newMeal, ...meals]);
      setMealName('');
      setNetCarbs('');
      Alert.alert('Success', 'Meal added!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Supabase Integration Example
      </Text>

      {/* Authentication Section */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
          Authentication
        </Text>
        
        {!user ? (
          <View>
            <TouchableOpacity
              style={{
                backgroundColor: '#007AFF',
                padding: 15,
                borderRadius: 8,
                marginBottom: 10,
              }}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                {loading ? 'Creating Account...' : 'Create Test Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#34C759',
                padding: 15,
                borderRadius: 8,
              }}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={{ marginBottom: 10 }}>
              Signed in as: {user.email}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#FF3B30',
                padding: 15,
                borderRadius: 8,
              }}
              onPress={handleSignOut}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Meal Section */}
      {user && (
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
            Add Meal
          </Text>
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 15,
              marginBottom: 10,
            }}
            placeholder="Meal Name"
            value={mealName}
            onChangeText={setMealName}
          />
          
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#ccc',
              borderRadius: 8,
              padding: 15,
              marginBottom: 15,
            }}
            placeholder="Net Carbs"
            value={netCarbs}
            onChangeText={setNetCarbs}
            keyboardType="numeric"
          />
          
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 8,
            }}
            onPress={handleAddMeal}
            disabled={loading}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
              {loading ? 'Adding...' : 'Add Meal'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Meals List */}
      {user && meals.length > 0 && (
        <View>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>
            Your Meals ({meals.length})
          </Text>
          
          {meals.map((meal) => (
            <View
              key={meal.id}
              style={{
                backgroundColor: '#f8f9fa',
                padding: 15,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: '600', fontSize: 16 }}>
                {meal.name}
              </Text>
              <Text style={{ color: '#666', marginTop: 5 }}>
                Net Carbs: {meal.net_carbs}g
              </Text>
              <Text style={{ color: '#666', fontSize: 12, marginTop: 5 }}>
                {new Date(meal.timestamp).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={{ marginTop: 30, padding: 20, backgroundColor: '#f0f8ff', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          How to Use This Example:
        </Text>
        <Text style={{ marginBottom: 5 }}>
          1. Create a Supabase project and add your credentials to .env
        </Text>
        <Text style={{ marginBottom: 5 }}>
          2. Run the schema.sql in your Supabase SQL editor
        </Text>
        <Text style={{ marginBottom: 5 }}>
          3. Create the storage buckets mentioned in the setup guide
        </Text>
        <Text style={{ marginBottom: 5 }}>
          4. Test the authentication and meal creation
        </Text>
        <Text>
          5. Replace your existing components with Supabase service calls
        </Text>
      </View>
    </ScrollView>
  );
}



