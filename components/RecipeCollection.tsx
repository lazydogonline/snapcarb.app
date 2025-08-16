import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  Share2, 
  Trash2, 
  Heart,
  Clock,
  Users,
  TrendingUp,
  Star
} from 'lucide-react-native';
import { colors } from '../constants/colors';
import { SnapCarbRecipe } from '../services/gemini-ai-service';
import { SupabaseRecipeService } from '../services/supabase-service';
import appDownloadLinks from '../config/app-links';

const { width } = Dimensions.get('window');

interface RecipeCollectionProps {
  userId: string;
}

export default function RecipeCollection({ userId }: RecipeCollectionProps) {
  const [recipes, setRecipes] = useState<SnapCarbRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SnapCarbRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'recent' | 'low-carb'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, [userId]);

  useEffect(() => {
    filterRecipes();
  }, [searchQuery, activeFilter, recipes]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      // Load recipes from Supabase
      const userRecipes = await SupabaseRecipeService.getUserRecipes(userId);
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error loading recipes:', error);
      // For now, show some sample recipes
      setRecipes(getSampleRecipes());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecipes();
    setRefreshing(false);
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply category filter
    switch (activeFilter) {
      case 'favorites':
        filtered = filtered.filter(recipe => recipe.isFavorite);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'low-carb':
        filtered = filtered.filter(recipe => recipe.netCarbs <= 10);
        break;
      default:
        break;
    }

    setFilteredRecipes(filtered);
  };

  const handleShareRecipe = (recipe: SnapCarbRecipe) => {
    const message = `🍎 SnapCarb Recipe: ${recipe.title}

📝 ${recipe.description}
⏱️ Prep: ${recipe.prepTime}min | Cook: ${recipe.cookTime}min
👥 Serves: ${recipe.servings}
📊 Net Carbs: ${recipe.netCarbs}g per serving

🥗 Ingredients:
${recipe.ingredients.map(ing => `• ${ing.amount} ${ing.name}`).join('\n')}

👨‍🍳 Instructions:
${recipe.instructions.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${appDownloadLinks.getDownloadMessage()}`;

    Alert.alert('Share Recipe', message, [
      { text: 'Copy', onPress: () => Alert.alert('Copied!', 'Recipe copied to clipboard') },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SupabaseRecipeService.deleteRecipe(recipeId);
              setRecipes(recipes.filter(r => r.id !== recipeId));
              Alert.alert('Success', 'Recipe deleted successfully');
            } catch (error) {
              console.error('Error deleting recipe:', error);
              Alert.alert('Error', 'Failed to delete recipe');
            }
          }
        }
      ]
    );
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      const updatedRecipes = recipes.map(recipe =>
        recipe.id === recipeId 
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe
      );
      setRecipes(updatedRecipes);
      
      // Update in Supabase
      await SupabaseRecipeService.updateRecipe(recipeId, { isFavorite: !recipes.find(r => r.id === recipeId)?.isFavorite });
    } catch (error) {
      console.error('Error updating favorite:', error);
    }
  };

  const getSampleRecipes = (): SnapCarbRecipe[] => [
    {
      id: '1',
      title: 'Grass-Fed Beef & Cauliflower Rice Bowl',
      description: 'A protein-packed bowl with tender grass-fed beef and fluffy cauliflower rice',
      difficulty: 'Easy',
      prepTime: 15,
      cookTime: 20,
      totalTime: 35,
      servings: 2,
      netCarbs: 8,
      ingredients: [
        { name: 'Grass-fed beef', amount: '200g', net_carbs_g: 0, fiber_g: 0, isAllowed: true },
        { name: 'Cauliflower rice', amount: '200g', net_carbs_g: 4, fiber_g: 2, isAllowed: true },
        { name: 'Broccoli', amount: '100g', net_carbs_g: 4, fiber_g: 3, isAllowed: true }
      ],
      instructions: [
        'Season beef with salt and pepper',
        'Cook beef in a hot pan for 3-4 minutes per side',
        'Steam cauliflower rice and broccoli',
        'Serve beef over vegetables'
      ],
      nutrition: { calories: 350, protein: 35, fat: 20, fiber: 5, netCarbs: 8 },
      tags: ['low-carb', 'high-protein', 'snapcarb-approved'],
      source: 'SnapCarb Chef Collection',
      isFavorite: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Salmon with Roasted Brussels Sprouts',
      description: 'Wild-caught salmon with crispy Brussels sprouts and lemon butter sauce',
      difficulty: 'Medium',
      prepTime: 10,
      cookTime: 25,
      totalTime: 35,
      servings: 2,
      netCarbs: 6,
      ingredients: [
        { name: 'Wild salmon fillet', amount: '200g', net_carbs_g: 0, fiber_g: 0, isAllowed: true },
        { name: 'Brussels sprouts', amount: '300g', net_carbs_g: 6, fiber_g: 6, isAllowed: true },
        { name: 'Butter', amount: '30g', net_carbs_g: 0, fiber_g: 0, isAllowed: true }
      ],
      instructions: [
        'Preheat oven to 400°F',
        'Toss Brussels sprouts with olive oil and roast for 20 minutes',
        'Season salmon and cook for 12-15 minutes',
        'Serve with lemon butter sauce'
      ],
      nutrition: { calories: 420, protein: 38, fat: 28, fiber: 6, netCarbs: 6 },
      tags: ['omega-3', 'anti-inflammatory', 'snapcarb-approved'],
      source: 'SnapCarb Chef Collection',
      isFavorite: false,
      createdAt: new Date().toISOString()
    }
  ];

  const renderRecipeCard = (recipe: SnapCarbRecipe) => (
    <View key={recipe.id} style={styles.recipeCard}>
      <View style={styles.recipeHeader}>
        <View style={styles.recipeTitleSection}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeDescription} numberOfLines={2}>
            {recipe.description}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={() => handleToggleFavorite(recipe.id)}
        >
          <Heart 
            size={20} 
            color={recipe.isFavorite ? colors.error : colors.textSecondary} 
            fill={recipe.isFavorite ? colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.recipeStats}>
        <View style={styles.statItem}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{recipe.totalTime}min</Text>
        </View>
        <View style={styles.statItem}>
          <Users size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{recipe.servings}</Text>
        </View>
        <View style={styles.statItem}>
          <TrendingUp size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{recipe.netCarbs}g carbs</Text>
        </View>
        <View style={styles.statItem}>
          <Star size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{recipe.difficulty}</Text>
        </View>
      </View>

      <View style={styles.recipeTags}>
        {recipe.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.recipeActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleShareRecipe(recipe)}
        >
          <Share2 size={16} color={colors.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => handleDeleteRecipe(recipe.id)}
        >
          <Trash2 size={16} color={colors.error} />
          <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filter: 'all' | 'favorites' | 'recent' | 'low-carb', label: string) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <BookOpen size={64} color={colors.primary} />
        <Text style={styles.loadingText}>Loading your recipe collection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
        <View style={styles.headerTop}>
          <BookOpen size={32} color={colors.background} />
          <Text style={styles.headerTitle}>My Recipe Collection</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
        </Text>
      </LinearGradient>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <Text style={styles.searchInput} onPress={() => Alert.alert('Search', 'Search functionality coming soon!')}>
            Search recipes...
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.filterToggle} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {renderFilterButton('all', 'All')}
          {renderFilterButton('favorites', 'Favorites')}
          {renderFilterButton('recent', 'Recent')}
          {renderFilterButton('low-carb', 'Low-Carb')}
        </View>
      )}

      {/* Recipe List */}
      <ScrollView 
        style={styles.recipesList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={64} color={colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>No recipes found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search' : 'Start building your collection by saving recipes'}
            </Text>
            <TouchableOpacity style={styles.addFirstButton}>
              <Plus size={20} color={colors.background} />
              <Text style={styles.addFirstButtonText}>Add Your First Recipe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredRecipes.map(renderRecipeCard)
        )}
      </ScrollView>

      {/* Add Recipe Button */}
      <TouchableOpacity style={styles.addButton}>
        <Plus size={24} color={colors.background} />
        <Text style={styles.addButtonText}>Add New Recipe</Text>
      </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.background,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.background,
    opacity: 0.9,
  },
  searchSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  filterToggle: {
    padding: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardBackground,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeFilterButtonText: {
    color: colors.background,
  },
  recipesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipeCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  recipeTitleSection: {
    flex: 1,
    marginRight: 10,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  recipeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  favoriteButton: {
    padding: 5,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  recipeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  tag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.background,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  deleteButton: {
    backgroundColor: colors.errorBackground,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
    marginLeft: 8,
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
  },
});




