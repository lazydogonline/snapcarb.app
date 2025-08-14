import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, ShoppingCart, Users, Star, ExternalLink, Heart, Award, TrendingUp } from 'lucide-react-native';

interface AffiliateProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  affiliateUrl: string;
  category: 'book' | 'supplement' | 'culture' | 'membership';
  imageUrl?: string;
  rating: number;
  benefits: string[];
}

const affiliateProducts: AffiliateProduct[] = [
  {
    id: '1',
    name: 'Wheat Belly',
    description: 'The groundbreaking book that started it all - eliminate wheat to lose weight and improve health',
    price: '$16.99',
    affiliateUrl: 'https://amazon.com/dp/B005UZWO6A',
    category: 'book',
    rating: 4.8,
    benefits: ['Weight loss', 'Reduced inflammation', 'Better energy', 'Improved digestion']
  },
  {
    id: '2',
    name: 'Super Gut',
    description: 'Dr. Davis\'s latest work on microbiome restoration and gut health optimization',
    price: '$24.99',
    affiliateUrl: 'https://amazon.com/dp/B09QKQZQZQ',
    category: 'book',
    rating: 4.9,
    benefits: ['Microbiome restoration', 'Probiotic guidance', 'Fermentation recipes', 'Gut health protocols']
  },
  {
    id: '3',
    name: 'Undoctored',
    description: 'Take control of your health beyond conventional medicine',
    price: '$19.99',
    affiliateUrl: 'https://amazon.com/dp/B06XKQZQZQ',
    category: 'book',
    rating: 4.7,
    benefits: ['Health empowerment', 'Self-care strategies', 'Alternative approaches', 'Preventive medicine']
  },
  {
    id: '4',
    name: 'Gut to Glow',
    description: 'Dr. Davis\'s signature supplement with astaxanthin and collagen for skin and gut health',
    price: '$49.99',
    affiliateUrl: 'https://amazon.com/dp/B0XXXXX',
    category: 'supplement',
    rating: 4.9,
    benefits: ['Skin health', 'Gut lining support', 'Anti-aging', 'Collagen boost']
  },
  {
    id: '5',
    name: 'Lactobacillus Reuteri Starter',
    description: 'Premium starter culture for making L. reuteri yogurt at home',
    price: '$29.99',
    affiliateUrl: 'https://amazon.com/dp/B0XXXXX',
    category: 'culture',
    rating: 4.8,
    benefits: ['Mood enhancement', 'Social connection', 'Libido boost', 'Skin improvement']
  },
  {
    id: '6',
    name: 'Milk Kefir Grains',
    description: 'Live kefir grains for making probiotic-rich milk kefir',
    price: '$19.99',
    affiliateUrl: 'https://amazon.com/dp/B0XXXXX',
    category: 'culture',
    rating: 4.7,
    benefits: ['Probiotic diversity', 'Gut health', 'Immune support', 'Digestive aid']
  },
  {
    id: '7',
    name: 'Inner Circle Membership',
    description: 'Exclusive access to Dr. Davis\'s latest research, videos, and community',
    price: '$19.95/month',
    affiliateUrl: 'https://drdavisinfinitehealth.com/inner-circle',
    category: 'membership',
    rating: 4.9,
    benefits: ['Live webinars', 'Expert Q&A', '150+ resources', 'Community access', 'Latest research']
  }
];

export default function DrDavisAffiliates() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleProductClick = async (product: AffiliateProduct) => {
    try {
      await Linking.openURL(product.affiliateUrl);
    } catch (error) {
      Alert.alert('Error', 'Could not open link. Please try again.');
    }
  };

  const filteredProducts = selectedCategory === 'all' 
    ? affiliateProducts 
    : affiliateProducts.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'book': return <BookOpen size={20} color="#4F46E5" />;
      case 'supplement': return <Heart size={20} color="#DC2626" />;
      case 'culture': return <TrendingUp size={20} color="#059669" />;
      case 'membership': return <Users size={20} color="#7C3AED" />;
      default: return <Star size={20} color="#F59E0B" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'book': return '#4F46E5';
      case 'supplement': return '#DC2626';
      case 'culture': return '#059669';
      case 'membership': return '#7C3AED';
      default: return '#F59E0B';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Dr. Davis Resources</Text>
        <Text style={styles.headerSubtitle}>Official products and recommendations</Text>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'all' && styles.categoryButtonTextActive
            ]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'book' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('book')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'book' && styles.categoryButtonTextActive
            ]}>Books</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'supplement' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('supplement')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'supplement' && styles.categoryButtonTextActive
            ]}>Supplements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'culture' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('culture')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'culture' && styles.categoryButtonTextActive
            ]}>Cultures</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'membership' && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory('membership')}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === 'membership' && styles.categoryButtonTextActive
            ]}>Membership</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Products Grid */}
      <View style={styles.productsContainer}>
        {filteredProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productCard}
            onPress={() => handleProductClick(product)}
          >
            <View style={styles.productHeader}>
              <View style={styles.categoryBadge}>
                {getCategoryIcon(product.category)}
                <Text style={[styles.categoryText, { color: getCategoryColor(product.category) }]}>
                  {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </Text>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingText}>{product.rating}</Text>
              </View>
            </View>

            <View style={styles.productContent}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDescription}>{product.description}</Text>
              
              <View style={styles.benefitsContainer}>
                {product.benefits.slice(0, 3).map((benefit, index) => (
                  <View key={index} style={styles.benefitTag}>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>{product.price}</Text>
                <View style={styles.buyButton}>
                  <ShoppingCart size={16} color="white" />
                  <Text style={styles.buyButtonText}>Buy Now</Text>
                  <ExternalLink size={14} color="white" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          * Affiliate links help support SnapCarb development. We only recommend products we believe in.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  categoryFilter: {
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  productsContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  benefitTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  benefitText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  disclaimer: {
    padding: 16,
    backgroundColor: '#FEF3C7',
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 16,
  },
});




