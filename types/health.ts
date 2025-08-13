export interface Meal {
  id: string;
  name: string;
  description: string;
  timestamp: Date;
  netCarbs: number;
  isAnalyzing: boolean;
  hasDisallowedFoods: boolean;
  disallowedFoods: string[];
  aiAnalysis?: string;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken: boolean;
  takenAt?: Date;
}

export interface ChallengeDay {
  date: string;
  day: number;
  completed: boolean;
  mealsLogged: number;
  symptomsNoted: boolean;
  symptoms: string[];
  notes: string;
}

export interface HealthEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'webinar' | 'workshop' | 'consultation';
}

export interface DailyProgress {
  date: string;
  mealsLogged: number;
  totalNetCarbs: number;
  supplementsTaken: number;
  totalSupplements: number;
  challengeCompleted: boolean;
}