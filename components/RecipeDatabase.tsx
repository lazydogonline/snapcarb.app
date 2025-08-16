import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Clock, Users, Target, Star, Plus, Bookmark, Share2, Utensils } from 'lucide-react-native';
import { Recipe } from '@/types/health';
import { aiService } from '@/services/ai-service';

interface RecipeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const recipeCategories: RecipeCategory[] = [
  { id: 'breakfast', name: 'Breakfast', icon: <Utensils size={20} color="#ffffff" />, color: '#f59e0b' },
  { id: 'lunch', name: 'Lunch', icon: <Utensils size={20} color="#ffffff" />, color: '#22c55e' },
  { id: 'dinner', name: 'Dinner', icon: <Utensils size={20} color="#ffffff" />, color: '#8b5cf6' },
  { id: 'snacks', name: 'Snacks', icon: <Utensils size={20} color="#ffffff" />, color: '#ef4444' },
  { id: 'desserts', name: 'Desserts', icon: <Utensils size={20} color="#ffffff" />, color: '#ec4899' },
];

const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Grilled Chicken Caesar Salad',
    ingredients: ['chicken breast', 'romaine lettuce', 'parmesan cheese', 'caesar dressing', 'croutons'],
    instructions: [
      'Grill chicken breast until cooked through',
      'Chop romaine lettuce and place in bowl',
      'Add grilled chicken, parmesan cheese, and croutons',
      'Drizzle with caesar dressing and toss gently'
    ],
    netCarbs: 8,
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    tags: ['low-carb', 'high-protein', 'salad', 'quick'],
    complianceScore: 9,
    photoUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
  },
  {
    id: '2',
    name: 'Avocado & Egg Breakfast Bowl',
    ingredients: ['avocado', 'eggs', 'spinach', 'cherry tomatoes', 'olive oil'],
    instructions: [
      'Poach eggs in simmering water',
      'Sauté spinach in olive oil',
      'Slice avocado and tomatoes',
      'Arrange in bowl and top with poached eggs'
    ],
    netCarbs: 6,
    prepTime: 10,
    cookTime: 8,
    servings: 1,
    tags: ['breakfast', 'keto', 'vegetarian', 'healthy-fats'],
    complianceScore: 10,
    photoUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
  },
  {
    id: '3',
    name: 'Salmon with Roasted Vegetables',
    ingredients: ['salmon fillet', 'broccoli', 'cauliflower', 'olive oil', 'lemon', 'herbs'],
    instructions: [
      'Preheat oven to 400°F',
      'Season salmon with herbs and lemon',
      'Toss vegetables with olive oil and seasonings',
      'Roast for 20-25 minutes until vegetables are tender'
    ],
    netCarbs: 12,
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    tags: ['dinner', 'omega-3', 'roasted', 'nutrient-dense'],
    complianceScore: 8,
    photoUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
  },
  {
    id: '4',
    name: 'Berry Protein Smoothie Bowl',
    ingredients: ['mixed berries', 'protein powder', 'almond milk', 'chia seeds', 'coconut flakes'],
    instructions: [
      'Blend berries with protein powder and almond milk',
      'Pour into bowl and top with chia seeds and coconut flakes',
      'Add fresh berries for garnish'
    ],
    netCarbs: 14,
    prepTime: 8,
    cookTime: 0,
    servings: 1,
    tags: ['smoothie', 'protein', 'antioxidants', 'quick'],
    complianceScore: 7,
    photoUrl: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400',
  },
  {
    id: '5',
    name: 'Zucchini Noodles with Pesto',
    ingredients: ['zucchini', 'basil pesto', 'pine nuts', 'parmesan cheese', 'olive oil'],
    instructions: [
      'Spiralize zucchini into noodles',
      'Sauté zucchini noodles in olive oil for 2-3 minutes',
      'Toss with pesto and top with pine nuts and parmesan'
    ],
    netCarbs: 9,
    prepTime: 12,
    cookTime: 5,
    servings: 2,
    tags: ['pasta-alternative', 'vegetarian', 'gluten-free', 'quick'],
    complianceScore: 9,
    photoUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d8a9?w=400',
  },
];

export default function RecipeDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [maxCarbs, setMaxCarbs] = useState(15);
  const [cookingTime, setCookingTime] = useState(30);

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    let filtered = mockRecipes;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(recipe =>
        recipe.tags.some(tag => tag.includes(selectedCategory))
      );
    }

    // Tag filters
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedTags.some(tag => recipe.tags.includes(tag))
      );
    }

    // Carb limit filter
    filtered = filtered.filter(recipe => recipe.netCarbs <= maxCarbs);

    // Cooking time filter
    filtered = filtered.filter(recipe => 
      (recipe.prepTime + recipe.cookTime) <= cookingTime
    );

    return filtered;
  }, [searchQuery, selectedCategory, selectedTags, maxCarbs, cookingTime]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const generateRecipe = async () => {
    try {
      const ingredients = ['chicken', 'vegetables', 'herbs'];
      const preferences = ['low-carb', 'high-protein'];
      
      const recipe = await aiService.generateRecipeSuggestion(ingredients, preferences);
      
      if (recipe) {
        Alert.alert(
          'AI Recipe Generated!',
          `Generated: ${recipe.name}\nNet Carbs: ${recipe.netCarbs}g\nPrep Time: ${recipe.prepTime} min`,
          [
            { text: 'View Recipe', onPress: () => console.log('View recipe') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipe');
    }
  };

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <View style={styles.recipeCard}>
      <Image source={{ uri: item.photoUrl }} style={styles.recipeImage} />
      
      <View style={styles.recipeContent}>
        <View style={styles.recipeHeader}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <View style={styles.recipeScore}>
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.scoreText}>{item.complianceScore}/10</Text>
          </View>
        </View>

        <View style={styles.recipeStats}>
          <View style={styles.statItem}>
            <Target size={14} color="#22c55e" />
            <Text style={styles.statText}>{item.netCarbs}g net carbs</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={14} color="#6b7280" />
            <Text style={styles.statText}>{item.prepTime + item.cookTime} min</Text>
          </View>
          <View style={styles.statItem}>
            <Users size={14} color="#6b7280" />
            <Text style={styles.statText}>{item.servings} serving{item.servings > 1 ? 's' : ''}</Text>
          </View>
        </View>

        <View style={styles.recipeTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.recipeActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={16} color="#6b7280" />
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={16} color="#6b7280" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.cookButton]}>
            <Utensils size={16} color="#ffffff" />
            <Text style={[styles.actionText, styles.cookButtonText]}>Cook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategoryButton = (category: RecipeCategory) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(
        selectedCategory === category.id ? null : category.id
      )}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        {category.icon}
      </View>
      <Text style={[
        styles.categoryText,
        selectedCategory === category.id && styles.categoryTextActive
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterTag = (tag: string) => (
    <TouchableOpacity
      key={tag}
      style={[
        styles.filterTag,
        selectedTags.includes(tag) && styles.filterTagActive
      ]}
      onPress={() => toggleTag(tag)}
    >
      <Text style={[
        styles.filterTagText,
        selectedTags.includes(tag) && styles.filterTagTextActive
      ]}>
        {tag}
      </Text>
    </TouchableOpacity>
  );

  const allTags = Array.from(new Set(mockRecipes.flatMap(recipe => recipe.tags)));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#22c55e', '#16a34a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Recipe Database</Text>
        <Text style={styles.headerSubtitle}>Discover Healthy, Low-Carb Meals</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes, ingredients..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? '#22c55e' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recipeCategories.map(renderCategoryButton)}
        </ScrollView>
      </View>

      {/* AI Recipe Generator */}
      <View style={styles.aiSection}>
        <TouchableOpacity style={styles.aiButton} onPress={generateRecipe}>
          <Plus size={20} color="#ffffff" />
          <Text style={styles.aiButtonText}>Generate AI Recipe</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Filters</Text>
          
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Max Net Carbs: {maxCarbs}g</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setMaxCarbs(Math.max(5, maxCarbs - 5))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(maxCarbs / 30) * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setMaxCarbs(Math.min(30, maxCarbs + 5))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Max Cooking Time: {cookingTime} min</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setCookingTime(Math.max(15, cookingTime - 15))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${(cookingTime / 60) * 100}%` }]} />
              </View>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setCookingTime(Math.min(60, cookingTime + 15))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {allTags.map(renderFilterTag)}
            </View>
          </View>
        </View>
      )}

      {/* Recipe List */}
      <View style={styles.recipesSection}>
        <View style={styles.recipesHeader}>
          <Text style={styles.recipesTitle}>
            {filteredRecipes.length} Recipe{filteredRecipes.length !== 1 ? 's' : ''} Found
          </Text>
        </View>

        <FlatList
          data={filteredRecipes}
          renderItem={renderRecipeCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.recipesList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  filterButton: {
    padding: 8,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#22c55e',
  },
  aiSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  aiButton: {
    backgroundColor: '#8b5cf6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  filtersSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  sliderButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  filterTagActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  filterTagText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTagTextActive: {
    color: '#ffffff',
  },
  recipesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recipesHeader: {
    marginBottom: 20,
  },
  recipesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  recipesList: {
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: 200,
  },
  recipeContent: {
    padding: 20,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  recipeScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
  },
  recipeStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6b7280',
  },
  recipeTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    color: '#22c55e',
    fontWeight: '500',
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  cookButton: {
    backgroundColor: '#22c55e',
    flex: 1,
    justifyContent: 'center',
  },
  cookButtonText: {
    color: '#ffffff',
  },
});








