import { Supplement, ChallengeDay, HealthEvent } from '@/types/health';

export const defaultSupplements: Supplement[] = [
  {
    id: '1',
    name: 'Magnesium Malate',
    dosage: '1200mg',
    frequency: '2-3x Daily',
    taken: false,
    recommendedForm: 'Magnesium malate for daytime, magnesium glycinate for evening',
    timing: 'Take with meals, last dose before bed',
  },
  {
    id: '2',
    name: 'Vitamin D3',
    dosage: '4000-8000 IU',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Oil-based gelcaps or liquid drops',
    timing: 'Take with breakfast for better absorption',
  },
  {
    id: '3',
    name: 'Fish Oil (EPA/DHA)',
    dosage: '3000-3600mg',
    frequency: '2x Daily',
    taken: false,
    recommendedForm: 'Nordic Naturals, Ascenta Nutra-Sea, or Carlson',
    timing: 'Take with meals, divided into two doses',
  },
  {
    id: '4',
    name: 'Astaxanthin',
    dosage: '12mg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Natural astaxanthin from Haematococcus pluvialis',
    timing: 'Take with meals containing healthy fats',
  },
  {
    id: '5',
    name: 'Collagen Peptides',
    dosage: '20g',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Hydrolyzed collagen peptides',
    timing: 'Take on empty stomach or with meals',
  },
  {
    id: '6',
    name: 'Iodine',
    dosage: '500-1000mcg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Potassium iodide drops or kelp tablets',
    timing: 'Take with meals',
  },
  {
    id: '7',
    name: 'Zinc',
    dosage: '15-30mg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Zinc picolinate or zinc citrate',
    timing: 'Take on empty stomach',
  },
  {
    id: '8',
    name: 'B Complex',
    dosage: 'As directed',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Methylated B vitamins',
    timing: 'Take in the morning',
  },
  {
    id: '9',
    name: 'Curcumin',
    dosage: '500mg',
    frequency: '2x Daily',
    taken: false,
    recommendedForm: 'Curcumin with piperine for absorption',
    timing: 'Take with meals',
  },
  {
    id: '10',
    name: 'Vitamin C',
    dosage: '1000mg',
    frequency: '2x Daily',
    taken: false,
    recommendedForm: 'Ascorbic acid or liposomal vitamin C',
    timing: 'Take with meals',
  },
];

// Updated challenge dates to be dynamic (next 10 days from today)
export const getChallengeDays = (): ChallengeDay[] => {
  const today = new Date();
  return Array.from({ length: 10 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      date: date.toDateString(),
      day: i + 1,
      completed: false,
      mealsLogged: 0,
      symptomsNoted: false,
      symptoms: [],
      notes: '',
    };
  });
};

export const challengeDays: ChallengeDay[] = getChallengeDays();

export const healthEvents: HealthEvent[] = [
  {
    id: '1',
    title: 'Microbiome Reset Webinar',
    description: 'Learn how to restore your gut health with Dr. William Davis',
    date: new Date(2025, 7, 20, 1, 0), // August 20, 2025, 1:00 AM BST
    time: '1:00 AM BST',
    type: 'webinar',
  },
  {
    id: '2',
    title: 'Wheat-Free Living Workshop',
    description: 'Practical strategies for eliminating wheat from your diet',
    date: new Date(2025, 7, 25, 14, 0), // August 25, 2025, 2:00 PM BST
    time: '2:00 PM BST',
    type: 'workshop',
  },
  {
    id: '3',
    title: 'Infinite Health Q&A Session',
    description: 'Ask Dr. Davis your questions about the program',
    date: new Date(2025, 7, 30, 19, 0), // August 30, 2025, 7:00 PM BST
    time: '7:00 PM BST',
    type: 'consultation',
  },
];

// Comprehensive list of disallowed foods based on Dr. Davis's program
export const disallowedFoods = [
  // Grains and starches
  'wheat', 'barley', 'rye', 'spelt', 'oats', 'rice', 'quinoa', 'corn', 'millet', 'amaranth',
  'bread', 'pasta', 'cereal', 'crackers', 'flour', 'starch', 'cornstarch', 'rice starch', 
  'potato starch', 'tapioca starch', 'arrowroot', 'sorghum', 'teff', 'buckwheat',
  
  // Processed grain products
  'gluten-free bread', 'gluten-free pasta', 'gluten-free cereal', 'gluten-free crackers',
  'gluten-free flour', 'gluten-free baking mix', 'gluten-free cookies', 'gluten-free cake',
  
  // Sugars and sweeteners
  'sugar', 'high fructose corn syrup', 'hfcs', 'sucrose', 'fructose', 'glucose', 'dextrose',
  'maltose', 'lactose', 'agave', 'honey', 'maple syrup', 'coconut sugar', 'date sugar',
  'fruit juice', 'dried fruit', 'candy', 'chocolate', 'soda', 'energy drinks',
  
  // Seed oils and unhealthy fats
  'canola oil', 'soybean oil', 'vegetable oil', 'sunflower oil', 'safflower oil', 
  'cottonseed oil', 'corn oil', 'grapeseed oil', 'peanut oil', 'sesame oil',
  'margarine', 'shortening', 'trans fat', 'hydrogenated oil', 'partially hydrogenated oil',
  
  // Processed foods and additives
  'processed food', 'preservatives', 'potassium sorbate', 'sodium benzoate', 'bha', 'bht',
  'artificial colors', 'artificial flavors', 'msg', 'monosodium glutamate', 'nitrates',
  'nitrites', 'sulfites', 'carrageenan', 'xanthan gum', 'guar gum', 'locust bean gum',
  
  // Legumes (during initial phase)
  'beans', 'lentils', 'chickpeas', 'peas', 'soy', 'soybeans', 'tofu', 'tempeh',
  
  // High-starch vegetables
  'potatoes', 'sweet potatoes', 'yams', 'taro', 'cassava', 'plantains',
  
  // Other problematic foods
  'cured meats', 'deli meats', 'hot dogs', 'sausages', 'bacon', 'jerky',
  'fried foods', 'fast food', 'frozen meals', 'canned soups', 'salad dressings',
  'condiments', 'ketchup', 'mustard', 'mayonnaise', 'bbq sauce', 'teriyaki sauce'
];

// Allowed foods for reference
export const allowedFoods = [
  // Vegetables (low-starch)
  'broccoli', 'brussels sprouts', 'cauliflower', 'green beans', 'asparagus', 'kale', 
  'spinach', 'swiss chard', 'lettuce', 'arugula', 'watercress', 'cabbage', 'bok choy',
  'celery', 'cucumber', 'zucchini', 'yellow squash', 'eggplant', 'bell peppers',
  'mushrooms', 'onions', 'garlic', 'leeks', 'scallions', 'herbs', 'spices',
  
  // Fruits (low-sugar)
  'berries', 'strawberries', 'blueberries', 'raspberries', 'blackberries', 'cranberries',
  'apples', 'oranges', 'lemons', 'limes', 'grapefruit', 'avocado', 'olives',
  
  // Nuts and seeds
  'almonds', 'walnuts', 'pecans', 'macadamia nuts', 'brazil nuts', 'hazelnuts',
  'pistachios', 'pumpkin seeds', 'sunflower seeds', 'chia seeds', 'flax seeds',
  'hemp seeds', 'sesame seeds',
  
  // Healthy fats and oils
  'olive oil', 'avocado oil', 'coconut oil', 'cocoa butter', 'butter', 'ghee',
  'lard', 'tallow', 'duck fat', 'goose fat',
  
  // Animal products
  'beef', 'lamb', 'pork', 'chicken', 'turkey', 'duck', 'eggs', 'fish', 'seafood',
  'salmon', 'tuna', 'sardines', 'mackerel', 'trout', 'shrimp', 'crab', 'lobster',
  
  // Dairy (full-fat)
  'cheese', 'cottage cheese', 'yogurt', 'milk', 'cream', 'sour cream', 'buttermilk',
  
  // Fermented foods
  'kefir', 'kombucha', 'sauerkraut', 'kimchi', 'pickles', 'miso', 'natto',
  'sourdough levain', 'apple cider vinegar', 'cultured butter',
  
  // Other
  'cocoa', 'dark chocolate', 'red wine', 'tea', 'coffee', 'bone broth'
];

// Dr. Davis's specific recommendations
export const drDavisRecommendations = {
  netCarbsPerMeal: 15, // Maximum net carbs per meal
  netCarbsDaily: 50,   // Maximum net carbs per day
  fastingWindow: 16,   // Hours of fasting
  eatingWindow: 8,     // Hours of eating
  fatPercentage: 65,   // Percentage of calories from fat
  proteinPercentage: 25, // Percentage of calories from protein
  carbPercentage: 10,  // Percentage of calories from carbs
};