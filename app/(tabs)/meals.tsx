import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Utensils, Share2, BookOpen } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import RecipeSearch from '../../components/RecipeSearch';
import RecipeCollection from '../../components/RecipeCollection';
import appDownloadLinks from '../../config/app-links';

export default function MealsScreen() {
  const [showRecipeCollection, setShowRecipeCollection] = useState(false);

  const handleShareApp = () => {
    const message = `🍎 Discover SnapCarb - The Revolutionary Health App!

Transform your health with:
✅ AI-powered recipe generation
✅ Real USDA nutrition data
✅ SnapCarb diet compliance
✅ Health tracking & insights
✅ Community support

Download now: ${appDownloadLinks.getDownloadLink()}

#SnapCarb #Health #Wellness #LowCarb #Nutrition`;

    Alert.alert('Share SnapCarb', message, [
      { text: 'Copy', onPress: () => Alert.alert('Copied!', 'App link copied to clipboard') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleMyRecipes = () => {
    setShowRecipeCollection(true);
  };

  const handleBackToSearch = () => {
    setShowRecipeCollection(false);
  };

  if (showRecipeCollection) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToSearch}>
              <BookOpen size={32} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
              <Share2 size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>My Recipe Collection</Text>
          <Text style={styles.subtitle}>Manage your saved SnapCarb recipes</Text>
        </View>
        <RecipeCollection userId="user-123" />
      </View>
    );
  }

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

      {/* My Recipes Button */}
      <View style={styles.myRecipesSection}>
        <TouchableOpacity style={styles.myRecipesButton} onPress={handleMyRecipes}>
          <BookOpen size={20} color={colors.background} />
          <Text style={styles.myRecipesButtonText}>My Recipe Collection</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <RecipeSearch />
      </View>
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
  backButton: {
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
  myRecipesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  myRecipesButton: {
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
  myRecipesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
});