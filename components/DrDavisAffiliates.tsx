import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { ExternalLink, BookOpen, Milk, Pill, Leaf } from 'lucide-react-native';

interface Product {
  title: string;
  url: string;
}

interface ProductCategory {
  name: string;
  products: Product[];
  icon: React.ReactNode;
  color: string;
}

const DrDavisAffiliates: React.FC = () => {
  const productCategories: ProductCategory[] = [
    {
      name: 'Books',
      products: [
        { title: "Wheat Belly (Revised and Expanded Edition)", url: "https://www.amazon.com/dp/1984824945?tag=lazydogonline-20" },
        { title: "Super Gut", url: "https://www.amazon.com/dp/0316333496?tag=lazydogonline-20" },
        { title: "Undoctored", url: "https://www.amazon.com/dp/0451493984?tag=lazydogonline-20" },
        { title: "Wheat Belly 10-Day Grain Detox", url: "https://www.amazon.com/dp/1623366360?tag=lazydogonline-20" },
        { title: "Wheat Belly Total Health", url: "https://www.amazon.com/dp/1623364082?tag=lazydogonline-20" }
      ],
      icon: <BookOpen size={24} color="#FFFFFF" />,
      color: '#8B5CF6'
    },
    {
      name: 'Fermentation Gear',
      products: [
        { title: "Luvelle Yogurt Maker", url: "https://www.amazon.com/dp/B009S77NLA?tag=lazydogonline-20" },
        { title: "Sous Vide Precision Cooker", url: "https://www.amazon.com/dp/B00UKPBXM4?tag=lazydogonline-20" },
        { title: "Sous Vide Water Bath Container", url: "https://www.amazon.com/dp/B01M8MMLBI?tag=lazydogonline-20" }
      ],
      icon: <Milk size={24} color="#FFFFFF" />,
      color: '#10B981'
    },
    {
      name: 'BiotiQuest Probiotics',
      products: [
        { title: "Sugar Shift Probiotics", url: "https://www.amazon.com/dp/B0B1NTMS9R?tag=lazydogonline-20" },
        { title: "Simple Slumber Probiotics", url: "https://www.amazon.com/dp/B0BHTKR2PF?tag=lazydogonline-20" },
        { title: "Ideal Immunity Probiotics", url: "https://www.amazon.com/dp/B0B1NYJPDM?tag=lazydogonline-20" },
        { title: "Antibiotic Antidote Probiotics", url: "https://www.amazon.com/dp/B0B1NYZJX2?tag=lazydogonline-20" }
      ],
      icon: <Pill size={24} color="#FFFFFF" />,
      color: '#F59E0B'
    },
    {
      name: 'Probiotics & Supplements',
      products: [
        { title: "Florastor Daily Probiotic (100 ct)", url: "https://www.amazon.com/dp/B01NB0G1V8?tag=lazydogonline-20" },
        { title: "Jarrow Formulas Jarro-Dophilus", url: "https://www.amazon.com/dp/B0013OUKTS?tag=lazydogonline-20" },
        { title: "Jarrow Ideal Bowel Support", url: "https://www.amazon.com/dp/B00O4BPX9O?tag=lazydogonline-20" },
        { title: "Jarrow Fem-Dophilus Advanced", url: "https://www.amazon.com/dp/B0BP4371FK?tag=lazydogonline-20" },
        { title: "Oxiceutics MyReuteri Probiotic", url: "https://www.amazon.com/dp/B0BXFXZLZP?tag=lazydogonline-20" },
        { title: "Oxiceutics MyReuteri (Foundational Strength)", url: "https://www.amazon.com/dp/B0FBQQW4M1?tag=lazydogonline-20" }
      ],
      icon: <Pill size={24} color="#FFFFFF" />,
      color: '#EF4444'
    },
    {
      name: 'Prebiotics & Fibers',
      products: [
        { title: "It's Just! Inulin Prebiotic Fiber (Chicory Root)", url: "https://www.amazon.com/dp/B085LV5ZSZ?tag=lazydogonline-20" }
      ],
      icon: <Leaf size={24} color="#FFFFFF" />,
      color: '#06B6D4'
    }
  ];

  const handleProductPress = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dr. Davis Approved Products</Text>
        <Text style={styles.subtitle}>
          Trusted products recommended by Dr. William Davis for optimal gut health and wellness
        </Text>
      </View>

      {productCategories.map((category, index) => (
        <View key={index} style={styles.categoryContainer}>
          <View style={[styles.categoryHeader, { backgroundColor: category.color }]}>
            <View style={styles.iconContainer}>
              {category.icon}
            </View>
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
          
          <View style={styles.productsContainer}>
            {category.products.map((product, productIndex) => (
              <TouchableOpacity
                key={productIndex}
                style={styles.productCard}
                onPress={() => handleProductPress(product.url, product.title)}
                activeOpacity={0.7}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productTitle} numberOfLines={2}>
                    {product.title}
                  </Text>
                  <View style={styles.amazonBadge}>
                    <Text style={styles.amazonText}>Amazon</Text>
                  </View>
                </View>
                <ExternalLink size={20} color="#6B7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.disclaimer}>
          * These are affiliate links. Purchasing through these links supports our work at no extra cost to you.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    lineHeight: 22,
  },
  amazonBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  amazonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    marginTop: 20,
  },
  disclaimer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default DrDavisAffiliates;






