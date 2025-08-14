export interface Meal {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  netCarbs: number;
  totalCarbs: number;
  fiber: number;
  isAnalyzing: boolean;
  hasDisallowedFoods: boolean;
  disallowedFoods: string[];
  aiAnalysis?: string;
  photoUrl?: string;
  ingredients?: string[];
  complianceScore: number; // 1-10 rating
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken: boolean;
  takenAt?: Date;
  recommendedForm: string;
  timing: string;
  targetBloodLevel?: string; // For supplements like Vitamin D3
}

export interface ChallengeDay {
  date: string;
  day: number;
  completed: boolean;
  mealsLogged: number;
  symptomsNoted: boolean;
  symptoms: string[];
  notes: string;
  netCarbsTotal: number;
  adherenceScore: number; // 1-10 rating
}

export interface HealthEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'webinar' | 'workshop' | 'consultation';
  registrationUrl?: string;
  isLive?: boolean;
}

export interface DailyProgress {
  date: string;
  mealsLogged: number;
  totalNetCarbs: number;
  supplementsTaken: number;
  totalSupplements: number;
  challengeCompleted: boolean;
  fastingHours: number;
  adherenceScore: number;
}

export interface FastingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in hours
  isActive: boolean;
  notes?: string;
}

export interface MealAnalysis {
  estimatedNetCarbs: number;
  disallowedIngredients: string[];
  complianceScore: number;
  recommendations: string[];
  fiberEstimate: number;
  totalCarbsEstimate: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  netCarbs: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  complianceScore: number;
  photoUrl?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt: Date;
  completed: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  isCompleted: boolean;
  estimatedPrice?: number;
}