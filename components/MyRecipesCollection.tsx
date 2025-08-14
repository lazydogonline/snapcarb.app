import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { BookOpen, Heart, Clock, Star, Trash2, ChefHat, Share2 } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { RecipeService as SupabaseRecipeService } from '../services/supabase-service';
import { SnapCarbRecipe } from '../services/gemini-ai-service';
import RecipeCard from './RecipeCard';
import appDownloadLinks from '../config/app-links';

export default function MyRecipesCollection() {
  const [recipes, setRecipes] = useState<SnapCarbRecipe[]>([]);
  const [favorites, setFavorites] = useState<SnapCarbRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  // Mock user ID - in production this would come from auth
  const mockUserId = 'mock-user-123';

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const [userRecipes, favoriteRecipes] = await Promise.all([
        SupabaseRecipeService.getUserRecipes(mockUserId),
        SupabaseRecipeService.getFavoriteRecipes(mockUserId)
      ]);
      
      setRecipes(userRecipes);
      setFavorites(favoriteRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      Alert.alert('Error', 'Failed to load your recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (recipe: SnapCarbRecipe) => {
    try {
      // This would update the favorite status in the database
      // For now, just show an alert
      Alert.alert('Favorite', `${recipe.title} ${favorites.some(f => f.id === recipe.id) ? 'removed from' : 'added to'} favorites!`);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDeleteRecipe = async (recipe: SnapCarbRecipe) => {
    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${recipe.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SupabaseRecipeService.removeFromCollection(recipe.id, mockUserId);
              await loadRecipes(); // Reload the list
              Alert.alert('Success', 'Recipe deleted from your collection!');
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Error', 'Failed to delete recipe. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleShare = (recipe: SnapCarbRecipe) => {
    // Create a comprehensive share message with app download info
    const shareMessage = `🍽️ Check out this amazing SnapCarb recipe from my collection!

${recipe.title}
${recipe.description}

⏱️ Prep: ${recipe.prepTime}min | 🍳 Cook: ${recipe.cookTime}min
🥗 Net Carbs: ${recipe.netCarbs}g | 🎯 SnapCarb Approved!

📱 Want to create your own AI-generated SnapCarb recipes?
Download the SnapCarb app and start your health journey today!

🔗 Download:
🍎 iOS: ${appDownloadLinks.ios.appStore}
🤖 Android: ${appDownloadLinks.android.playStore}
🌐 Web: ${appDownloadLinks.web.downloadPage}

#SnapCarb #HealthyEating #AICooking #LowCarb`;

    Alert.alert(
      'Share Recipe', 
      'Share this recipe with friends and family!',
      [
        { text: 'Copy Message', onPress: () => {
          // In a real app, this would copy to clipboard
          Alert.alert('Copied!', 'Recipe details copied to clipboard');
        }},
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const renderRecipeItem = ({ item }: { item: SnapCarbRecipe }) => (
    <View style={styles.recipeItem}>
      <RecipeCard recipe={item} />
      
      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.favoriteButton]}
          onPress={() => handleToggleFavorite(item)}
        >
          <Heart 
            size={20} 
            color={favorites.some(f => f.id === item.id) ? colors.error : colors.textSecondary} 
            fill={favorites.some(f => f.id === item.id) ? colors.error : 'none'}
          />
          <Text style={styles.actionButtonText}>Favorite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={() => handleShare(item)}
        >
          <Share2 size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteRecipe(item)}
        >
          <Trash2 size={20} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const currentRecipes = activeTab === 'all' ? recipes : favorites;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ChefHat size={64} color={colors.primary} />
        <Text style={styles.loadingText}>Loading your recipe collection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Recipe Collection</Text>
        <Text style={styles.subtitle}>
          Your AI-generated SnapCarb masterpieces
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <BookOpen size={20} color={activeTab === 'all' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All Recipes ({recipes.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Heart size={20} color={activeTab === 'favorites' ? colors.primary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites ({favorites.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recipe List */}
      {currentRecipes.length === 0 ? (
        <View style={styles.emptyState}>
          <BookOpen size={64} color={colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>
            {activeTab === 'all' ? 'No Recipes Yet' : 'No Favorites Yet'}
          </Text>
          <Text style={styles.emptyStateText}>
            {activeTab === 'all' 
              ? 'Start searching for recipes to build your collection!'
              : 'Mark some recipes as favorites to see them here!'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentRecipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipeList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingTop: 30,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.primary,
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
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  recipeList: {
    padding: 20,
  },
  recipeItem: {
    marginBottom: 24,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  favoriteButton: {
    backgroundColor: colors.successBackground,
  },
  shareButton: {
    backgroundColor: colors.infoBackground,
  },
  deleteButton: {
    backgroundColor: colors.errorBackground,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: colors.error,
  },
});
