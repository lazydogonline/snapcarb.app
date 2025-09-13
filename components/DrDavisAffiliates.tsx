import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import { ExternalLink, BookOpen, Star, Milk, Pill, Leaf, ChevronDown, ChevronUp } from 'lucide-react-native';

interface Product {
  title: string;
  url: string;
  drDavisRecommended?: boolean;
}

interface ProductCategory {
  name: string;
  products: Product[];
  icon: React.ReactNode;
  color: string;
}

const DrDavisAffiliates: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([0])); // Start with first category expanded

  const toggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCategories(newExpanded);
  };

  const productCategories: ProductCategory[] = [
    {
      name: 'Books',
      products: [
        { title: "Wheat Belly (Revised and Expanded Edition)", url: "https://www.amazon.com/Wheat-Belly-Revised-Expanded-Lose/dp/1984824945", drDavisRecommended: true },
        { title: "Super Gut", url: "https://www.amazon.com/Super-Gut-Four-Week-Transform-Health/dp/0316333492", drDavisRecommended: true },
        { title: "Undoctored", url: "https://www.amazon.com/Undoctored-Health-Failed-Become-Smarter/dp/1623368669/ref=sr_1_1?dib=eyJ2IjoiMSJ9.Q16wp5ZTj67HEii1V3wGnbjLCsw1QiyRMs3HAHr2U8Tiw2iKjoB7wwKhb0ifkUfSa2-Q7Vf1rZ2I1Tu3dJaFB0lyzE0UB3p6u5ORHCxrTWIC3_H323uFfVp7WBj6ujzThVkTYKgmSnI69hpLEixCFrlcUBFMnwPgUGRbmKNVI9LNEKdVgKhdIHRyjGTJ9Uf__dRCQdUouc2aXysp_kqWjzfREWqvrX0906OzNuwzd1U.5HwFPTvk3qwOEopHMtIy2llHQLjhC1Zh1zZ7w2PJvzQ&dib_tag=se&keywords=undoctored&qid=1757789915&sr=8-1&tag=lazydogonline-20", drDavisRecommended: true },
        { title: "Wheat Belly 10-Day Grain Detox", url: "https://www.amazon.com/Wheat-Belly-10-Day-Grain-Detox/dp/1623366364", drDavisRecommended: true },
        { title: "Wheat Belly Total Health", url: "https://www.amazon.com/Wheat-Belly-Total-Health-Ultimate/dp/1623364086", drDavisRecommended: true }
      ],
      icon: <BookOpen size={24} color="#FFFFFF" />,
      color: '#8B5CF6'
    },
    {
      name: 'Fermentation Gear',
      products: [
        { title: "Luvelle Yogurt Maker", url: "https://www.amazon.com/Luvele-Pure-Plus-Yogurt-Maker/dp/B009S77NLA" },
        { title: "Sous Vide Precision Cooker", url: "https://www.amazon.com/Anova-Culinary-Precision-Cooker-Black/dp/B00UKPBXM4" },
        { title: "Sous Vide Water Bath Container", url: "https://www.amazon.com/EVERIE-Container-Anova-Joule-Cookers/dp/B077S8QZPX" }
      ],
      icon: <Milk size={24} color="#FFFFFF" />,
      color: '#10B981'
    },
    {
      name: 'BiotiQuest Probiotics',
      products: [
        { title: "Sugar Shift Probiotics", url: "https://www.amazon.com/BiotiQuest-Sugar-Shift-Probiotic-Capsules/dp/B0B1NTMS9R" },
        { title: "Simple Slumber Probiotics", url: "https://www.amazon.com/BiotiQuest-Simple-Slumber-Sleep-Probiotic/dp/B0BHTKR2PF" },
        { title: "Ideal Immunity Probiotics", url: "https://www.amazon.com/BiotiQuest-Ideal-Immunity-Probiotic-Capsules/dp/B0B1NYJPDM" },
        { title: "Antibiotic Antidote Probiotics", url: "https://www.amazon.com/BiotiQuest-Antibiotic-Antidote-Probiotic-Capsules/dp/B0B1NYZJX2" }
      ],
      icon: <Pill size={24} color="#FFFFFF" />,
      color: '#F59E0B'
    },
    {
      name: 'Probiotics & Supplements',
      products: [
        { title: "Florastor Daily Probiotic (100 ct)", url: "https://www.amazon.com/Florastor-Probiotic-Supplement-Digestive-Saccharomyces/dp/B01NB0G1V8" },
        { title: "Jarrow Formulas Jarro-Dophilus", url: "https://www.amazon.com/Jarrow-Formulas-Jarro-Dophilus-Probiotic-Capsules/dp/B0013OUKTS" },
        { title: "Jarrow Ideal Bowel Support", url: "https://www.amazon.com/Jarrow-Formulas-Ideal-Bowel-Support/dp/B00O4BPX9O" },
        { title: "Jarrow Fem-Dophilus Advanced", url: "https://www.amazon.com/Jarrow-Formulas-Fem-Dophilus-Advanced-Capsules/dp/B0BP4371FK" },
        { title: "Oxiceutics MyReuteri Probiotic", url: "https://www.amazon.com/Oxiceutics-MyReuteri-Probiotic-Lactobacillus-Supplement/dp/B0BXFXZLZP", drDavisRecommended: true },
        { title: "Oxiceutics MyReuteri (Foundational Strength)", url: "https://www.amazon.com/Oxiceutics-MyReuteri-Foundational-Strength-Lactobacillus/dp/B0FBQQW4M1", drDavisRecommended: true }
      ],
      icon: <Pill size={24} color="#FFFFFF" />,
      color: '#EF4444'
    },
    {
      name: 'Prebiotics & Fibers',
      products: [
        { title: "It's Just! Inulin Prebiotic Fiber (Chicory Root)", url: "https://www.amazon.com/Its-Just-Inulin-Prebiotic-Fiber/dp/B085LV5ZSZ" }
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

      {productCategories.map((category, index) => {
        const isExpanded = expandedCategories.has(index);
        
        return (
          <View key={index} style={[styles.categoryContainer, index === 0 && styles.firstCategoryContainer]}>
            <TouchableOpacity 
              style={[styles.categoryHeader, { backgroundColor: category.color }]}
              onPress={() => toggleCategory(index)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryHeaderContent}>
                <View style={styles.iconContainer}>
                  {category.icon}
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              {isExpanded ? (
                <ChevronUp size={20} color="#FFFFFF" />
              ) : (
                <ChevronDown size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            {isExpanded && (
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
                      {product.drDavisRecommended && (
                        <View style={styles.drDavisRecommendation}>
                          <Star size={16} color="#F59E0B" fill="#F59E0B" />
                          <Text style={styles.drDavisText}>Dr. Davis</Text>
                        </View>
                      )}
                    </View>
                    <ExternalLink size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity 
        style={styles.innerCircleCard}
        onPress={() => handleProductPress('https://innercircle.drdavisinfinitehealth.com/landing/', 'Join Dr. Davis Inner Circle')}
        activeOpacity={0.8}
      >
        <Text style={styles.innerCircleTitle}>Join Dr. Davis Inner Circle</Text>
        <Text style={styles.innerCircleSubtitle}>
          Get exclusive access to advanced health strategies and community support
        </Text>
      </TouchableOpacity>

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
  firstCategoryContainer: {
    marginTop: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  drDavisRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  drDavisText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 4,
  },
  innerCircleCard: {
    backgroundColor: '#22c55e',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  innerCircleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  innerCircleSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
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






