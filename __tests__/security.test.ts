// SnapCarb Security Tests
// Simple tests that don't require complex React Native mocking

import { 
  sanitizeInput, 
  validateFileUpload, 
  validateHealthData, 
  validateApiKey,
  checkEnvironmentSecurity 
} from '../security/security-config';

describe('SnapCarb Security Tests', () => {
  
  describe('Input Sanitization', () => {
    test('should remove script tags', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<script>');
    });

    test('should remove javascript: protocol', () => {
      const maliciousInput = 'javascript:alert(1)';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe('alert(1)');
      expect(sanitized).not.toContain('javascript:');
    });

    test('should remove directory traversal attempts', () => {
      const maliciousInput = '../../../etc/passwd';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).toBe('etc/passwd');
      expect(sanitized).not.toContain('../');
    });

    test('should handle empty or null input', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });

    test('should truncate very long input', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = sanitizeInput(longInput);
      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('File Upload Validation', () => {
    test('should accept valid image files', () => {
      const validFile = {
        type: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        name: 'test.jpg'
      };
      const result = validateFileUpload(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject invalid file types', () => {
      const invalidFile = {
        type: 'application/exe',
        size: 1024,
        name: 'malware.exe'
      };
      const result = validateFileUpload(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    test('should reject oversized files', () => {
      const oversizedFile = {
        type: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB
        name: 'large.jpg'
      };
      const result = validateFileUpload(oversizedFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    test('should reject suspicious filenames', () => {
      const suspiciousFile = {
        type: 'image/jpeg',
        size: 1024,
        name: '../../../etc/passwd.jpg'
      };
      const result = validateFileUpload(suspiciousFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('suspicious pattern');
    });
  });

  describe('Health Data Validation', () => {
    test('should accept valid health data', () => {
      const validData = {
        glucose: 90,
        waist: 75,
        weight: 70,
        bloodPressure: { systolic: 120, diastolic: 80 }
      };
      const result = validateHealthData(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid glucose levels', () => {
      const invalidData = {
        glucose: 45 // Too low
      };
      const result = validateHealthData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Glucose level must be between 50 and 500 mg/dL');
    });

    test('should reject invalid waist measurements', () => {
      const invalidData = {
        waist: 250 // Too large
      };
      const result = validateHealthData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Waist measurement must be between 50 and 200 cm');
    });

    test('should reject invalid blood pressure', () => {
      const invalidData = {
        bloodPressure: { systolic: 120, diastolic: 130 } // Diastolic higher than systolic
      };
      const result = validateHealthData(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Systolic pressure must be higher than diastolic pressure');
    });
  });

  describe('API Key Validation', () => {
    test('should accept valid API keys', () => {
      const validKey = 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI';
      expect(validateApiKey(validKey)).toBe(true);
    });

    test('should reject weak API keys', () => {
      const weakKeys = [
        'test123',
        'password',
        '123456789',
        '',
        null,
        undefined
      ];
      
      weakKeys.forEach(key => {
        expect(validateApiKey(key as any)).toBe(false);
      });
    });

    test('should reject API keys that are too short', () => {
      const shortKey = 'abc123';
      expect(validateApiKey(shortKey)).toBe(false);
    });

    test('should reject API keys with weak patterns', () => {
      const weakPatterns = [
        'test_api_key_123',
        'demo_secret_key',
        'sample_password_123'
      ];
      
      weakPatterns.forEach(key => {
        expect(validateApiKey(key)).toBe(false);
      });
    });
  });

  describe('Environment Security', () => {
    test('should check for missing environment variables', () => {
      // Mock missing environment variables
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        JWT_SECRET: 'your_jwt_secret_here',
        EXPO_PUBLIC_GEMINI_API_KEY: undefined
      };
      
      const result = checkEnvironmentSecurity();
      expect(result.secure).toBe(false);
      expect(result.warnings).toContain('Gemini API key is missing');
      expect(result.warnings).toContain('JWT secret is weak or missing');
      
      // Restore original environment
      process.env = originalEnv;
    });

    test('should warn about debug mode in production', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        NODE_ENV: 'production',
        DEBUG: 'true'
      };
      
      const result = checkEnvironmentSecurity();
      expect(result.warnings).toContain('Debug mode is enabled in production');
      
      // Restore original environment
      process.env = originalEnv;
    });
  });
});

describe('SnapCarb Health Logic Tests', () => {
  
  test('SnapCarb compliance calculation', () => {
    const calculateCompliance = (netCarbs: number, fastingHours: number): number => {
      let score = 0;
      
      // Rule 1: Net carbs under 15g per meal
      if (netCarbs <= 15) score += 33;
      
      // Rule 2: Fasting 16+ hours
      if (fastingHours >= 16) score += 33;
      
      // Rule 3: No forbidden foods (simplified)
      score += 34;
      
      return Math.round(score);
    };

    expect(calculateCompliance(10, 18)).toBe(100); // Perfect compliance
    expect(calculateCompliance(20, 18)).toBe(67); // Only fasting rule met
    expect(calculateCompliance(10, 12)).toBe(67); // Only carb rule met
    expect(calculateCompliance(25, 12)).toBe(34); // Only no forbidden foods
  });

  test('Health metrics validation', () => {
    const validateGlucose = (glucose: number): boolean => {
      return glucose >= 50 && glucose <= 500;
    };

    const validateWaist = (waist: number): boolean => {
      return waist >= 50 && waist <= 200;
    };

    // Valid ranges
    expect(validateGlucose(90)).toBe(true);
    expect(validateWaist(75)).toBe(true);

    // Invalid ranges
    expect(validateGlucose(45)).toBe(false); // Too low
    expect(validateGlucose(600)).toBe(false); // Too high
    expect(validateWaist(30)).toBe(false); // Too small
    expect(validateWaist(250)).toBe(false); // Too large
  });
});
