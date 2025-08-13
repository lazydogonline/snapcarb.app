import { Supplement, ChallengeDay, HealthEvent } from '@/types/health';

export const defaultSupplements: Supplement[] = [
  {
    id: '1',
    name: 'Magnesium',
    dosage: '400mg',
    frequency: 'Daily',
    taken: false,
  },
  {
    id: '2',
    name: 'Vitamin D3',
    dosage: '4000 IU',
    frequency: 'Daily',
    taken: false,
  },
  {
    id: '3',
    name: 'Omega-3',
    dosage: '1000mg',
    frequency: 'Daily',
    taken: false,
  },
  {
    id: '4',
    name: 'Probiotics',
    dosage: '50 Billion CFU',
    frequency: 'Daily',
    taken: false,
  },
  {
    id: '5',
    name: 'Vitamin K2',
    dosage: '100mcg',
    frequency: 'Daily',
    taken: false,
  },
];

export const challengeDays: ChallengeDay[] = Array.from({ length: 10 }, (_, i) => {
  const date = new Date(2025, 7, 13 + i); // August 13-22, 2025
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

export const disallowedFoods = [
  'wheat', 'grain', 'grains', 'bread', 'pasta', 'cereal', 'oats', 'barley', 'rye',
  'rice', 'quinoa', 'corn', 'soy', 'soybean oil', 'canola oil', 'vegetable oil',
  'sunflower oil', 'safflower oil', 'cottonseed oil', 'corn oil', 'margarine',
  'shortening', 'processed food', 'sugar', 'high fructose corn syrup',
];