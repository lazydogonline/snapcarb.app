import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Scan, X, AlertTriangle, CheckCircle, Info, Search } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface ScannedProduct {
  name: string;
  ingredients: string[];
  warnings: string[];
  isSnapCarbApproved: boolean;
  netCarbs?: number;
  fiber?: number;
}

export default function BarcodeScanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [searching, setSearching] = useState(false);

  const searchProduct = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a product name or barcode');
      return;
    }

    setSearching(true);
    
    // Simulate product lookup - in real app, this would call Open Food Facts API
    const mockProduct = await lookupProduct(searchQuery);
    setProduct(mockProduct);
    setSearching(false);
  };

  const lookupProduct = async (query: string): Promise<ScannedProduct> => {
    // Mock product lookup - replace with real API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate different products based on query
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('jerky') || lowerQuery.includes('beef')) {
      return {
        name: "Organic Grass-Fed Beef Jerky",
        ingredients: ["Grass-fed beef", "Sea salt", "Black pepper", "Garlic powder"],
        warnings: [],
        isSnapCarbApproved: true,
        netCarbs: 2,
        fiber: 0
      };
    } else if (lowerQuery.includes('protein') || lowerQuery.includes('bar')) {
      return {
        name: "Protein Bar (Avoid!)",
        ingredients: ["Whey protein", "Maltitol", "Wheat flour", "Soy lecithin", "Xanthan gum", "Potassium sorbate"],
        warnings: [
          "Contains wheat (hidden in many products)",
          "Maltitol - artificial sweetener that can spike blood sugar",
          "Soy lecithin - can irritate gut lining",
          "Xanthan gum - stabilizer that breaks down mucous barrier",
          "Potassium sorbate - preservative that can cause inflammation"
        ],
        isSnapCarbApproved: false,
        netCarbs: 15,
        fiber: 3
      };
    } else if (lowerQuery.includes('almond') || lowerQuery.includes('butter')) {
      return {
        name: "Sugar-Free Almond Butter",
        ingredients: ["Dry roasted almonds", "Sea salt"],
        warnings: [],
        isSnapCarbApproved: true,
        netCarbs: 3,
        fiber: 3
      };
    } else if (lowerQuery.includes('yogurt') || lowerQuery.includes('greek')) {
      return {
        name: "Greek Yogurt (Check Ingredients!)",
        ingredients: ["Milk", "Live cultures", "Sugar", "Modified corn starch", "Natural flavors"],
        warnings: [
          "Contains added sugar - can spike blood glucose",
          "Modified corn starch - processed ingredient that may irritate gut",
          "Natural flavors - often code for hidden MSG or other additives"
        ],
        isSnapCarbApproved: false,
        netCarbs: 12,
        fiber: 0
      };
    } else if (lowerQuery.includes('bread') || lowerQuery.includes('wheat')) {
      return {
        name: "Whole Wheat Bread (AVOID!)",
        ingredients: ["Whole wheat flour", "Water", "Sugar", "Yeast", "Salt", "Soybean oil", "Calcium propionate"],
        warnings: [
          "WHEAT - Major gut irritant and mucous barrier disruptor",
          "Sugar - spikes blood glucose and feeds harmful bacteria",
          "Soybean oil - inflammatory omega-6 fatty acids",
          "Calcium propionate - preservative that can cause digestive issues"
        ],
        isSnapCarbApproved: false,
        netCarbs: 25,
        fiber: 3
      };
    } else {
      return {
        name: `Product: ${query}`,
        ingredients: ["Unknown ingredients - check label carefully"],
        warnings: [
          "Always read ingredient labels",
          "Look for hidden wheat, sugar, and processed oils",
          "Choose single-ingredient foods when possible"
        ],
        isSnapCarbApproved: false,
        netCarbs: 0,
        fiber: 0
      };
    }
  };

  const resetScanner = () => {
    setProduct(null);
    setSearchQuery('');
  };

  if (product) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.productContainer}>
          <View style={styles.header}>
            <Text style={styles.productName}>{product.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: product.isSnapCarbApproved ? colors.primary : colors.error }]}>
              {product.isSnapCarbApproved ? (
                <CheckCircle size={16} color="white" />
              ) : (
                <AlertTriangle size={16} color="white" />
              )}
              <Text style={styles.statusText}>
                {product.isSnapCarbApproved ? 'SnapCarb Approved' : 'Avoid This'}
              </Text>
            </View>
          </View>

          {product.netCarbs !== undefined && (
            <View style={styles.nutritionContainer}>
              <Text style={styles.nutritionTitle}>Nutrition (per serving)</Text>
              <View style={styles.nutritionRow}>
                <Text style={styles.nutritionLabel}>Net Carbs:</Text>
                <Text style={styles.nutritionValue}>{product.netCarbs}g</Text>
              </View>
              {product.fiber !== undefined && (
                <View style={styles.nutritionRow}>
                  <Text style={styles.nutritionLabel}>Fiber:</Text>
                  <Text style={styles.nutritionValue}>{product.fiber}g</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.ingredientsContainer}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {product.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <CheckCircle size={16} color={colors.primary} />
                <Text style={styles.ingredientText}>{ingredient}</Text>
              </View>
            ))}
          </View>

          {product.warnings.length > 0 && (
            <View style={styles.warningsContainer}>
              <Text style={styles.sectionTitle}>⚠️ Red Flags</Text>
              <Text style={styles.warningSubtitle}>These ingredients can harm your gut health:</Text>
              {product.warnings.map((warning, index) => (
                <View key={index} style={styles.warningRow}>
                  <AlertTriangle size={16} color={colors.error} />
                  <Text style={styles.warningText}>{warning}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.scanAgainButton} onPress={resetScanner}>
              <Search size={20} color={colors.primary} />
              <Text style={styles.scanAgainText}>Search Another Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.welcomeContainer}>
        <Scan size={64} color={colors.primary} />
        <Text style={styles.welcomeTitle}>Food Scanner</Text>
        <Text style={styles.welcomeText}>
          Search for food products to see if they're SnapCarb approved
        </Text>
        <Text style={styles.welcomeSubtext}>
          Get instant ingredient analysis and warnings about harmful additives
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter product name or barcode..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchProduct}
          />
          <TouchableOpacity 
            style={[styles.searchButton, searching && styles.searchButtonDisabled]} 
            onPress={searchProduct}
            disabled={searching}
          >
            {searching ? (
              <Text style={styles.searchButtonText}>Searching...</Text>
            ) : (
              <>
                <Search size={20} color="white" />
                <Text style={styles.searchButtonText}>Search</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Search Tips</Text>
          <Text style={styles.tipText}>• Try: "beef jerky", "protein bar", "almond butter"</Text>
          <Text style={styles.tipText}>• Look for products with simple, recognizable ingredients</Text>
          <Text style={styles.tipText}>• Avoid products with long ingredient lists</Text>
          <Text style={styles.tipText}>• When in doubt, choose whole, single-ingredient foods</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 24,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 30,
  },
  searchInput: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  searchButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  tipsContainer: {
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  productContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  nutritionContainer: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  ingredientsContainer: {
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
  },
  warningsContainer: {
    backgroundColor: colors.errorBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  warningSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionsContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
