// SnapCarb Health Companion - Environment Configuration
// Set these values in your environment variables or .env file

export const config = {
  // Gemini AI API Configuration (for AI meal analysis and recipe generation)
  gemini: {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-flash',
  },

  // USDA Nutrition Database API Configuration
  usda: {
    apiKey: process.env.EXPO_PUBLIC_USDA_API_KEY || '',
    baseUrl: 'https://api.nal.usda.gov/fdc/v1',
    maxRequestsPerDay: 10000, // Standard USDA API limit
  },

  // Backend API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    version: process.env.EXPO_PUBLIC_API_VERSION || 'v1',
    timeout: 30000,
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/snapcarb',
    name: process.env.MONGODB_DB_NAME || 'snapcarb',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshTokenExpiresIn: '30d',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Email Configuration (for notifications)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: false,
  },

  // Push Notifications
  notifications: {
    pushEndpoint: process.env.EXPO_PUBLIC_PUSH_ENDPOINT || 'https://exp.host/--/api/v2/push/send',
    vapidPublicKey: process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || '',
  },

  // Analytics and Monitoring
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN || '',
    analyticsApiKey: process.env.ANALYTICS_API_KEY || '',
  },

  // Social Features
  social: {
    communityApiUrl: process.env.EXPO_PUBLIC_COMMUNITY_API_URL || 'https://api.snapcarb.com/community',
    maxPostLength: 1000,
    maxImagePerPost: 5,
  },

  // Health Data Integration
  health: {
    healthKitEnabled: process.env.EXPO_PUBLIC_HEALTH_KIT_ENABLED === 'true',
    googleFitEnabled: process.env.EXPO_PUBLIC_GOOGLE_FIT_ENABLED === 'true',
    syncInterval: 300000, // 5 minutes
  },

  // Feature Flags
  features: {
    ai: process.env.EXPO_PUBLIC_AI_FEATURES_ENABLED !== 'false',
    social: process.env.EXPO_PUBLIC_SOCIAL_FEATURES_ENABLED !== 'false',
    analytics: process.env.EXPO_PUBLIC_ADVANCED_ANALYTICS_ENABLED !== 'false',
    camera: true,
    notifications: true,
    location: true,
  },

  // Development
  development: {
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG || 'snapcarb:*',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    bcryptRounds: 12,
  },

  // App Configuration
  app: {
    name: 'SnapCarb Health Companion',
    version: '2.0.0',
    buildNumber: '1',
    bundleIdentifier: 'app.rork.snapcarb-health-companion',
    supportEmail: 'support@snapcarb.com',
    privacyPolicyUrl: 'https://snapcarb.com/privacy',
    termsOfServiceUrl: 'https://snapcarb.com/terms',
  },

  // Health Program Settings
  healthProgram: {
    maxNetCarbsPerMeal: 15,
    maxNetCarbsPerDay: 45,
    disallowedFoods: [
      'wheat', 'grain', 'seed oil', 'soybean oil', 'canola oil', 'corn oil',
      'refined sugar', 'high fructose corn syrup', 'artificial sweeteners'
    ],
    recommendedSupplements: [
      { name: 'Magnesium', dosage: '400mg', timing: 'Evening' },
      { name: 'Vitamin D3', dosage: '4000 IU', timing: 'Morning' },
      { name: 'Omega-3', dosage: '2000mg', timing: 'With meals' },
      { name: 'Probiotics', dosage: '50 billion CFU', timing: 'Morning' }
    ],
    fastingRecommendations: {
      minimumFastingHours: 16,
      optimalFastingHours: 18,
      maximumFastingHours: 24,
    },
  },
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}/api/${config.api.version}${endpoint}`;
};

// Helper function to validate configuration
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (!config.gemini.apiKey) {
    errors.push('Gemini API key is required for AI features');
  }

  if (!config.database.uri) {
    errors.push('Database URI is required');
  }

  if (!config.auth.jwtSecret || config.auth.jwtSecret === 'your_jwt_secret_here') {
    errors.push('JWT secret must be configured');
  }

  return errors;
};

export default config;




