import { Supplement, ChallengeDay, HealthEvent } from '@/types/health';

export const defaultSupplements: Supplement[] = [
  {
    id: '1',
    name: 'Vitamin D3',
    dosage: '4000-6000 IU',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Gelcaps (dose adjusted to blood level)',
    timing: 'Take with breakfast for better absorption',
  },
  {
    id: '2',
    name: 'Fish Oil (EPA/DHA)',
    dosage: '3000-3600mg',
    frequency: '2x Daily',
    taken: false,
    recommendedForm: 'EPA+DHA not capsule weight, check label',
    timing: 'Take with meals, divided into two doses',
  },
  {
    id: '3',
    name: 'Magnesium Malate',
    dosage: '1200mg',
    frequency: '2x Daily',
    taken: false,
    recommendedForm: '180mg elemental magnesium twice daily',
    timing: 'Take with meals or substitute Magnesium Water',
  },
  {
    id: '4',
    name: 'Iodine',
    dosage: '500mcg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Drops or kelp tablets (unless you have thyroiditis)',
    timing: 'Take with meals',
  },
  {
    id: '5',
    name: 'High-Potency Probiotic',
    dosage: '50+ billion CFU',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'At least a dozen bacterial species',
    timing: 'Take with meals or on empty stomach',
  },
  {
    id: '6',
    name: 'Astaxanthin',
    dosage: '12mg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Natural astaxanthin from Haematococcus pluvialis',
    timing: 'Take with meals containing healthy fats',
  },
  {
    id: '7',
    name: 'Marine Collagen',
    dosage: '20g',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'Hydrolyzed marine collagen peptides',
    timing: 'Take on empty stomach or with meals',
  },
  {
    id: '8',
    name: 'Hyaluronic Acid',
    dosage: '200mg',
    frequency: 'Daily',
    taken: false,
    recommendedForm: 'High molecular weight hyaluronic acid',
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
  // Upcoming Events
  {
    id: '1',
    title: 'Microbiome Reset Webinar',
    description: 'Learn how to restore your gut health with Dr. William Davis',
    date: new Date(2025, 9, 20, 19, 0), // October 20, 2025, 7:00 PM
    time: '7:00 PM EST',
    type: 'webinar',
    featured: true,
  },
  {
    id: '2',
    title: 'Wheat-Free Living Workshop',
    description: 'Practical strategies for eliminating wheat from your diet',
    date: new Date(2025, 9, 25, 14, 0), // October 25, 2025, 2:00 PM
    time: '2:00 PM EST',
    type: 'workshop',
  },
  {
    id: '3',
    title: 'Infinite Health Q&A Session',
    description: 'Ask Dr. Davis your questions about the program',
    date: new Date(2025, 9, 30, 19, 0), // October 30, 2025, 7:00 PM
    time: '7:00 PM EST',
    type: 'consultation',
  },
  {
    id: '4',
    title: 'Super Gut Protocol Deep Dive',
    description: 'Advanced strategies for microbiome restoration',
    date: new Date(2025, 10, 5, 18, 0), // November 5, 2025, 6:00 PM
    time: '6:00 PM EST',
    type: 'webinar',
    featured: true,
  },
  {
    id: '5',
    title: 'Fermentation Masterclass',
    description: 'Learn to make yogurt, kefir, and fermented vegetables',
    date: new Date(2025, 10, 12, 15, 0), // November 12, 2025, 3:00 PM
    time: '3:00 PM EST',
    type: 'workshop',
  },
  
  // Dr. Davis YouTube Videos - DIETARY FIBER Category
  {
    id: '101',
    title: 'Hyaluronic acid: Most important dietary fiber of all?',
    description: 'Dr. Davis explores hyaluronic acid as a crucial dietary fiber',
    date: new Date(2024, 8, 15, 19, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'DIETARY FIBER',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=iEzarovzD2c&t=31s',
  },
  {
    id: '102',
    title: 'Do statins reduce heart scan scores?',
    description: 'Dr. Davis examines the effectiveness of statins on heart scan scores',
    date: new Date(2024, 7, 20, 18, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'STATINS',
    videoUrl: 'https://www.youtube.com/watch?v=MHSNjpAPo7Q&t=23s',
  },
  // HEART Category Videos
  {
    id: '103',
    title: 'Can you manage atrial fibrillation?',
    description: 'Dr. Davis discusses management strategies for atrial fibrillation',
    date: new Date(2024, 6, 25, 20, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'HEART',
    videoUrl: 'https://www.youtube.com/watch?v=s0iTWiFIhCU&t=23s',
  },
  {
    id: '104',
    title: 'The REAL way to stop or reverse heart disease',
    description: 'Dr. Davis reveals the real methods to stop and reverse heart disease',
    date: new Date(2024, 6, 24, 19, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'HEART',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=HH96ubjuMXc&t=95s',
  },
  {
    id: '105',
    title: 'How to get your HbA1c to 5% or less',
    description: 'Achieving optimal HbA1c levels for heart health',
    date: new Date(2024, 6, 23, 18, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'HEART',
    videoUrl: 'https://www.youtube.com/watch?v=f0g-n9Bn-KI&t=913s',
  },
  {
    id: '106',
    title: 'Do grains cause heart disease?',
    description: 'The connection between grains and cardiovascular disease',
    date: new Date(2024, 6, 22, 17, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'HEART',
    videoUrl: 'https://www.youtube.com/watch?v=YAUMs57P3Uk&t=43s',
  },
  {
    id: '107',
    title: 'The REAL way to stop or reverse heart disease',
    description: 'Alternative approach to stopping and reversing heart disease',
    date: new Date(2024, 6, 21, 16, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'HEART',
    videoUrl: 'https://www.youtube.com/watch?v=HH96ubjuMXc&t=124s',
  },
  // MICROBES Category Videos
  {
    id: '108',
    title: 'Ten Unexpected Signs of SIBO',
    description: 'Dr. Davis reveals ten surprising signs of small intestinal bacterial overgrowth',
    date: new Date(2024, 5, 30, 16, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=Xwo9p0ynWbQ&t=23s',
  },
  {
    id: '109',
    title: 'The Battle for Your Small Intestine',
    description: 'Understanding the critical battle happening in your small intestine',
    date: new Date(2024, 5, 29, 15, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    videoUrl: 'https://www.youtube.com/watch?v=feaEB81-zb8&t=42s',
  },
  {
    id: '110',
    title: 'B subtilis: A microbe you should become acquainted with',
    description: 'The important benefits of Bacillus subtilis for your microbiome',
    date: new Date(2024, 5, 28, 14, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    videoUrl: 'https://www.youtube.com/watch?v=4jJG1BZokc0&t=2s',
  },
  {
    id: '111',
    title: 'There\'s a 50:50 chance you are affected by this epidemic',
    description: 'A widespread health epidemic affecting half the population',
    date: new Date(2024, 5, 27, 13, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    videoUrl: 'https://www.youtube.com/watch?v=xK7lS8KA6BM',
  },
  {
    id: '112',
    title: 'Microbiome Madness',
    description: 'Understanding the chaos and complexity of the microbiome',
    date: new Date(2024, 5, 26, 12, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    videoUrl: 'https://www.youtube.com/watch?v=JP9g8VdPmgk&t=12s',
  },
  {
    id: '113',
    title: 'L. reuteri and the magic of prolonged fermentation',
    description: 'The benefits of extended fermentation with Lactobacillus reuteri',
    date: new Date(2024, 5, 25, 11, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=0G7O8u3MLb8',
  },
  {
    id: '114',
    title: 'Have you had adverse effects from L reuteri or SIBO Yogurt?',
    description: 'Addressing potential side effects and how to manage them',
    date: new Date(2024, 5, 24, 10, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'MICROBES',
    videoUrl: 'https://www.youtube.com/watch?v=Z0r4I5gkvvg',
  },
  // GRAINS Category Videos
  {
    id: '115',
    title: 'What\'s the story with oats and oatmeal?',
    description: 'Dr. Davis examines the truth about oats and their health effects',
    date: new Date(2024, 4, 18, 19, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'GRAINS',
    videoUrl: 'https://www.youtube.com/watch?v=FDMYCdE-f2w&t=64s',
  },
  {
    id: '116',
    title: 'Ten reasons to never eat wheat',
    description: 'The definitive list of why wheat should be eliminated from your diet',
    date: new Date(2024, 4, 17, 18, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'GRAINS',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=E8X6v6Dc8Vw&t=311s',
  },
  {
    id: '117',
    title: 'It\'s not just about gluten',
    description: 'Why gluten-free isn\'t enough - the other problems with grains',
    date: new Date(2024, 4, 16, 17, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'GRAINS',
    videoUrl: 'https://www.youtube.com/watch?v=VszkEQNJ5IY',
  },
  {
    id: '118',
    title: 'The 3 reasons you\'re always hungry',
    description: 'How grains create constant hunger and food cravings',
    date: new Date(2024, 4, 15, 16, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'GRAINS',
    videoUrl: 'https://www.youtube.com/watch?v=YIF8cQmgA9g&t=222s',
  },
  {
    id: '119',
    title: 'William Davis - Wheat: The UNhealthy Whole Grain',
    description: 'Complete presentation on why wheat is destroying your health',
    date: new Date(2024, 4, 14, 15, 0),
    time: 'Watch Now',
    type: 'webinar',
    category: 'GRAINS',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=UbBURnqYVzw&t=62s',
  },
  {
    id: '106',
    title: 'Heart Disease: The Real Causes',
    description: 'What really causes heart disease and how to prevent it',
    date: new Date(2024, 3, 22, 18, 30),
    time: 'Watch Now',
    type: 'webinar',
    videoUrl: 'https://www.youtube.com/watch?v=example-heart',
  },
  {
    id: '107',
    title: 'Fermentation: Your Path to Health',
    description: 'Making yogurt, kefir, and fermented vegetables',
    date: new Date(2024, 2, 15, 19, 0),
    time: 'Watch Now',
    type: 'workshop',
    videoUrl: 'https://www.youtube.com/watch?v=example-fermentation',
  },
  {
    id: '108',
    title: 'The Cholesterol Myth Exposed',
    description: 'Why everything you know about cholesterol is wrong',
    date: new Date(2024, 1, 28, 17, 0),
    time: 'Watch Now',
    type: 'webinar',
    videoUrl: 'https://www.youtube.com/watch?v=example-cholesterol',
  },
  {
    id: '109',
    title: 'Autoimmune Diseases: Natural Solutions',
    description: 'Healing autoimmune conditions through diet and lifestyle',
    date: new Date(2024, 0, 20, 19, 0),
    time: 'Watch Now',
    type: 'webinar',
    videoUrl: 'https://www.youtube.com/watch?v=example-autoimmune',
  },
  {
    id: '110',
    title: 'The Infinite Health Program',
    description: 'Complete overview of Dr. Davis\'s health transformation program',
    date: new Date(2023, 11, 15, 18, 0),
    time: 'Watch Now',
    type: 'webinar',
    featured: true,
    videoUrl: 'https://www.youtube.com/watch?v=example-infinite',
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
  
  // Legumes (during initial phase) - but NOT green beans (which are allowed)
  'black beans', 'kidney beans', 'navy beans', 'pinto beans', 'lima beans', 'lentils', 'chickpeas', 'peas', 'soy', 'soybeans', 'tofu', 'tempeh',
  
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