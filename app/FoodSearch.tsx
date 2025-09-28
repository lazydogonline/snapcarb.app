import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { FoodSearchService, FoodSearchResult } from '../services/food-search-service';

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);

  const searchFoods = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const foodSearchService = new FoodSearchService();
      const searchResults = await foodSearchService.searchFoods(query.trim());
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        Alert.alert('No Results', 'No foods found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search foods');
    } finally {
      setLoading(false);
    }
  };

  const showFoodDetails = (food: FoodSearchResult) => {
    setSelectedFood(food);
  };

  const renderFoodItem = ({ item }: { item: FoodSearchResult }) => (
    <TouchableOpacity
      style={[styles.foodItem, { borderLeftColor: getTrafficLightColor(item.traffic_light) }]}
      onPress={() => showFoodDetails(item)}
      accessibilityLabel={`View details for ${item.name} (${item.traffic_light} traffic light)`}
      accessibilityRole="button"
    >
      <View style={styles.foodHeader}>
        <Text style={styles.foodName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={[styles.trafficLight, { backgroundColor: getTrafficLightColor(item.traffic_light) }]}>
          <Text style={styles.trafficLightText}>{item.traffic_light.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionText}>
          🥩 Protein: {item.protein}g
        </Text>
        <Text style={styles.nutritionText}>
          🍞 Carbs: {item.carbs}g
        </Text>
        <Text style={styles.nutritionText}>
          🧈 Fat: {item.fat}g
        </Text>
      </View>
      
      <View style={styles.nutritionRow}>
        <Text style={styles.nutritionText}>
          🔥 Calories: {item.calories}
        </Text>
        <Text style={styles.nutritionText}>
          🌾 Fiber: {item.fiber}g
        </Text>
          <Text style={styles.nutritionText}>
          🍯 Sugar: {item.sugar}g
          </Text>
        </View>
      
      <View style={styles.scoreRow}>
        <Text style={styles.scoreText}>
          SnapCarb Score: {item.snapcarb_score}/12
        </Text>
        {item.net_carbs > 0 && (
          <Text style={styles.netCarbsText}>
            Net Carbs: {item.net_carbs}g
          </Text>
      )}
    </View>
    </TouchableOpacity>
  );

  const getTrafficLightColor = (trafficLight: string) => {
    switch (trafficLight.toLowerCase()) {
      case 'green':
        return '#4CAF50';
      case 'yellow':
        return '#FF9800';
      case 'red':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const keyExtractor = (item: FoodSearchResult) => item.id.toString();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for foods (e.g., chicken, steak, apple)..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchFoods}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={searchFoods}
          disabled={loading}
          accessibilityLabel="Search for foods"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>🔍 Search</Text>
          )}
        </TouchableOpacity>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Found {results.length} foods
          </Text>
          <Text style={styles.resultsSubtext}>
            Sorted by SnapCarb score (green first)
          </Text>
        </View>
      )}

          <FlatList
        data={results}
            renderItem={renderFoodItem}
        keyExtractor={keyExtractor}
            style={styles.resultsList}
        contentContainerStyle={styles.resultsContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of each item
          offset: 120 * index,
          index,
        })}
      />

      {selectedFood && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Food Details</Text>
              <TouchableOpacity
                onPress={() => setSelectedFood(null)}
                style={styles.closeButton}
                accessibilityLabel="Close food details"
                accessibilityRole="button"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalFoodName}>{selectedFood.name}</Text>
            
            <View style={styles.modalNutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>{selectedFood.calories}</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{selectedFood.protein}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{selectedFood.carbs}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fat</Text>
                <Text style={styles.nutritionValue}>{selectedFood.fat}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Fiber</Text>
                <Text style={styles.nutritionValue}>{selectedFood.fiber}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Sugar</Text>
                <Text style={styles.nutritionValue}>{selectedFood.sugar}g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Sodium</Text>
                <Text style={styles.nutritionValue}>{selectedFood.sodium}mg</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Net Carbs</Text>
                <Text style={styles.nutritionValue}>{selectedFood.net_carbs}g</Text>
              </View>
            </View>
            
            <View style={styles.modalScoreSection}>
              <Text style={styles.modalScoreLabel}>SnapCarb Score</Text>
              <Text style={[styles.modalScoreValue, { color: getTrafficLightColor(selectedFood.traffic_light) }]}>
                {selectedFood.snapcarb_score}/12
              </Text>
              <View style={[styles.modalTrafficLight, { backgroundColor: getTrafficLightColor(selectedFood.traffic_light) }]}>
                <Text style={styles.modalTrafficLightText}>
                  {selectedFood.traffic_light.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {selectedFood.brand && (
              <View style={styles.modalBrandSection}>
                <Text style={styles.modalBrandLabel}>Brand</Text>
                <Text style={styles.modalBrandValue}>{selectedFood.brand}</Text>
        </View>
      )}

            {selectedFood.ingredients && (
              <View style={styles.modalIngredientsSection}>
                <Text style={styles.modalIngredientsLabel}>Ingredients</Text>
                <Text style={styles.modalIngredientsValue}>{selectedFood.ingredients}</Text>
        </View>
      )}
    </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resultsSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  resultsList: {
    flex: 1,
  },
  resultsContent: {
    paddingBottom: 20,
  },
  foodItem: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  trafficLight: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  trafficLightText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  netCarbsText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalNutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalScoreSection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  modalScoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalTrafficLight: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  modalTrafficLightText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBrandSection: {
    marginBottom: 16,
  },
  modalBrandLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalBrandValue: {
    fontSize: 14,
    color: '#666',
  },
  modalIngredientsSection: {
    marginBottom: 16,
  },
  modalIngredientsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  modalIngredientsValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
