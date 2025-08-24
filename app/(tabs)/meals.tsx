import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Utensils, Share2, BookOpen, Camera, Search, BarChart3 } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import RecipeSearch from '../../components/RecipeSearch';
import FoodSearch from '../FoodSearch';
import PhotoMeal from '../PhotoMeal';
import appDownloadLinks from '../../config/app-links';

export default function MealsScreen() {
  const handleShareApp = () => {
    const shareMessage = `🎯 Discover SnapCarb - Your AI-Powered Health Companion!

🍽️ Generate unique, SnapCarb-approved recipes with AI
🥗 Track your nutrition and eating windows
🧠 Get personalized health insights
�� Follow Dr. Davis's proven health principles

📱 Download the app and start your health journey today!

🔗 Download:
�� iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
�� Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #Health #AI #Nutrition #Wellness`;

    Alert.alert(
      'Share SnapCarb App', 
      'Share the SnapCarb app with friends and family!',
      [
        { text: 'Copy Message', onPress: () => {
          Alert.alert('Copied!', 'App details copied to clipboard');
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleMyRecipes = () => {
    Alert.alert(
      'My Recipes', 
      'Access your saved recipe collection!',
      [
        { text: 'View Collection', onPress: () => {
          Alert.alert('Coming Soon!', 'Recipe collection will be available in the next update');
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Utensils size={32} color={colors.primary} />
          <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
            <Share2 size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>Food & Nutrition</Text>
        <Text style={styles.subtitle}>Find recipes and plan your meals</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleMyRecipes}>
            <BookOpen size={20} color={colors.background} />
            <Text style={styles.quickActionText}>My Recipes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => {}}>
            <BarChart3 size={20} color={colors.background} />
            <Text style={styles.quickActionText}>Daily Log</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Meal Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Analyze Your Meal</Text>
          <Text style={styles.sectionSubtitle}>Take a photo of your meal or ingredients for instant SnapCarb analysis</Text>
          <PhotoMeal />
        </View>

        {/* Food Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>�� Search Foods</Text>
          <Text style={styles.sectionSubtitle}>Look up any food for nutrition facts and SnapCarb compliance</Text>
          <FoodSearch />
        </View>

        {/* Recipe Search */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍽️ Find Recipes</Text>
          <Text style={styles.sectionSubtitle}>Generate AI-powered SnapCarb-approved recipes</Text>
          <RecipeSearch />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
    backgroundColor: colors.cardBackground,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  shareButton: {
    padding: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
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
});