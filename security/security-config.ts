// SnapCarb Security Configuration
// This file contains security settings and validation functions

export interface SecurityConfig {
  maxInputLength: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  rateLimitPerMinute: number;
  sanitizationRules: SanitizationRule[];
}

export interface SanitizationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Security configuration for SnapCarb app
export const securityConfig: SecurityConfig = {
  // Input validation limits
  maxInputLength: 1000,
  
  // File upload security
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  // Rate limiting
  rateLimitPerMinute: 60,
  
  // Input sanitization rules
  sanitizationRules: [
    {
      pattern: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      replacement: '',
      description: 'Remove script tags to prevent XSS'
    },
    {
      pattern: /javascript:/gi,
      replacement: '',
      description: 'Remove javascript: protocol'
    },
    {
      pattern: /on\w+\s*=/gi,
      replacement: '',
      description: 'Remove event handlers'
    },
    {
      pattern: /['"]\s*\+\s*['"]/g,
      replacement: '',
      description: 'Remove string concatenation attempts'
    },
    {
      pattern: /\.\.\//g,
      replacement: '',
      description: 'Remove directory traversal attempts'
    }
  ]
};

// Input sanitization function
export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Apply all sanitization rules
  let sanitized = input;
  securityConfig.sanitizationRules.forEach(rule => {
    sanitized = sanitized.replace(rule.pattern, rule.replacement);
  });

  // Additional length check
  if (sanitized.length > securityConfig.maxInputLength) {
    sanitized = sanitized.substring(0, securityConfig.maxInputLength);
  }

  return sanitized.trim();
};

// Validate file upload
export const validateFileUpload = (file: {
  type: string;
  size: number;
  name: string;
}): { valid: boolean; error?: string } => {
  // Check file type
  if (!securityConfig.allowedFileTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${securityConfig.allowedFileTypes.join(', ')}`
    };
  }

  // Check file size
  if (file.size > securityConfig.maxFileSize) {
    return {
      valid: false,
      error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum allowed size of ${Math.round(securityConfig.maxFileSize / 1024 / 1024)}MB`
    };
  }

  // Check filename for suspicious patterns
  const suspiciousPatterns = [
    /\.\./g,           // Directory traversal
    /[<>:"|?*]/g,      // Invalid filename characters
    /script/gi,        // Script references
    /\.exe$/gi,        // Executable files
    /\.bat$/gi,        // Batch files
    /\.cmd$/gi,        // Command files
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        valid: false,
        error: `Filename contains suspicious pattern: ${file.name}`
      };
    }
  }

  return { valid: true };
};

// Validate health data ranges
export const validateHealthData = (data: {
  glucose?: number;
  waist?: number;
  weight?: number;
  bloodPressure?: { systolic: number; diastolic: number };
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Glucose validation
  if (data.glucose !== undefined) {
    if (data.glucose < 50 || data.glucose > 500) {
      errors.push('Glucose level must be between 50 and 500 mg/dL');
    }
  }

  // Waist validation
  if (data.waist !== undefined) {
    if (data.waist < 50 || data.waist > 200) {
      errors.push('Waist measurement must be between 50 and 200 cm');
    }
  }

  // Weight validation
  if (data.weight !== undefined) {
    if (data.weight < 30 || data.weight > 300) {
      errors.push('Weight must be between 30 and 300 kg');
    }
  }

  // Blood pressure validation
  if (data.bloodPressure) {
    const { systolic, diastolic } = data.bloodPressure;
    if (systolic < 70 || systolic > 250) {
      errors.push('Systolic blood pressure must be between 70 and 250 mmHg');
    }
    if (diastolic < 40 || diastolic > 150) {
      errors.push('Diastolic blood pressure must be between 40 and 150 mmHg');
    }
    if (systolic <= diastolic) {
      errors.push('Systolic pressure must be higher than diastolic pressure');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Rate limiting helper (simple in-memory version)
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < 60000
    );

    // Check if under limit
    if (recentRequests.length >= securityConfig.rateLimitPerMinute) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }

  reset(userId: string): void {
    this.requests.delete(userId);
  }
}

export const rateLimiter = new RateLimiter();

// API key validation (for backend use)
export const validateApiKey = (apiKey: string, expectedPattern?: RegExp): boolean => {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Basic length check
  if (apiKey.length < 20 || apiKey.length > 100) {
    return false;
  }

  // Pattern check if provided
  if (expectedPattern && !expectedPattern.test(apiKey)) {
    return false;
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^test/i,
    /^demo/i,
    /^sample/i,
    /123456/,
    /password/i,
    /secret/i,
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(apiKey)) {
      return false;
    }
  }

  return true;
};

// Environment security check
export const checkEnvironmentSecurity = (): { secure: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for development settings in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DEBUG === 'true') {
      warnings.push('Debug mode is enabled in production');
    }
    if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      warnings.push('Gemini API key is missing');
    }
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
      warnings.push('Supabase URL is missing');
    }
  }

  // Check for weak JWT secret
  if (process.env.JWT_SECRET === 'your_jwt_secret_here' || 
      !process.env.JWT_SECRET || 
      process.env.JWT_SECRET.length < 32) {
    warnings.push('JWT secret is weak or missing');
  }

  return {
    secure: warnings.length === 0,
    warnings
  };
};
