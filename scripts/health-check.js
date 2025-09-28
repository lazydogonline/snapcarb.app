#!/usr/bin/env node

/**
 * SnapCarb Health Check & Automated Error Detection
 * Inspired by Cursor AI development workflows
 * 
 * This script automatically detects and reports common issues
 * that could break the app in production.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏥 SnapCarb Health Check Starting...\n');

const issues = [];
const warnings = [];
const passed = [];

// ============================================
// 1. ENVIRONMENT VARIABLES CHECK
// ============================================
console.log('🔍 Checking Environment Variables...');

const requiredEnvVars = [
  'EXPO_PUBLIC_GEMINI_API_KEY',
  'EXPO_PUBLIC_SUPABASE_URL', 
  'EXPO_PUBLIC_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'EXPO_PUBLIC_USDA_API_KEY',
  'EXPO_PUBLIC_RESEND_API_KEY',
  'EXPO_PUBLIC_GOOGLE_CLIENT_ID'
];

// Check for .env file
if (!fs.existsSync('.env')) {
  issues.push('❌ Missing .env file - copy from .env.example');
} else {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      issues.push(`❌ Missing or placeholder: ${varName}`);
    } else {
      passed.push(`✅ ${varName} configured`);
    }
  });

  optionalEnvVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      warnings.push(`⚠️ Optional not set: ${varName}`);
    } else {
      passed.push(`✅ ${varName} configured`);
    }
  });
}

// ============================================
// 2. CODE QUALITY CHECK
// ============================================
console.log('🔍 Checking Code Quality...');

const criticalFiles = [
  'services/gemini-ai-service.ts',
  'services/auth-service.ts',
  'services/recipe-service.ts',
  'app/(tabs)/meals.tsx'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    issues.push(`❌ Missing critical file: ${file}`);
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  
  // Check for common issues
  if (content.includes('console.log') && !file.includes('debug')) {
    warnings.push(`⚠️ Console.log found in ${file} (remove for production)`);
  }
  
  if (content.includes('TODO') || content.includes('FIXME')) {
    warnings.push(`⚠️ TODO/FIXME found in ${file}`);
  }
  
  if (content.includes('your-secret-key') || content.includes('placeholder')) {
    issues.push(`❌ Placeholder values in ${file}`);
  }

  passed.push(`✅ ${file} exists`);
});

// ============================================
// 3. DEPENDENCY CHECK
// ============================================
console.log('🔍 Checking Dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@supabase/supabase-js',
    'expo-router',
    'expo-image-picker',
    '@react-native-async-storage/async-storage'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      passed.push(`✅ ${dep} installed`);
    } else {
      issues.push(`❌ Missing dependency: ${dep}`);
    }
  });

  // Check for node_modules
  if (!fs.existsSync('node_modules')) {
    issues.push('❌ node_modules missing - run: npm install');
  } else {
    passed.push('✅ node_modules exists');
  }

} catch (error) {
  issues.push('❌ Cannot read package.json');
}

// ============================================
// 4. BACKEND STATUS CHECK
// ============================================
console.log('🔍 Checking Backend Status...');

if (fs.existsSync('backend/server.js')) {
  passed.push('✅ Backend server file exists');
  
  const backendContent = fs.readFileSync('backend/server.js', 'utf8');
  if (backendContent.includes('your-secret-key')) {
    issues.push('❌ Backend using default JWT secret');
  }
  
  // Try to check if MongoDB is configured
  if (!backendContent.includes('mongodb://') && !process.env.MONGODB_URI) {
    warnings.push('⚠️ MongoDB connection string not found');
  }
} else {
  warnings.push('⚠️ Backend server not found (using Supabase only)');
}

// ============================================
// 5. APP CONFIGURATION CHECK
// ============================================
console.log('🔍 Checking App Configuration...');

try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  if (appJson.expo.name && appJson.expo.slug) {
    passed.push('✅ App metadata configured');
  } else {
    issues.push('❌ App metadata incomplete');
  }

  if (appJson.expo.ios?.bundleIdentifier && appJson.expo.android?.package) {
    passed.push('✅ App identifiers configured');
  } else {
    issues.push('❌ Missing bundle identifiers for stores');
  }

} catch (error) {
  issues.push('❌ Cannot read app.json');
}

// ============================================
// 6. SECURITY CHECK
// ============================================
console.log('🔍 Checking Security...');

// Check for exposed secrets
const filesToCheck = ['services/', 'components/', 'app/'];
filesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = getAllFiles(dir);
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        if (content.match(/sk-[a-zA-Z0-9]{20,}/)) {
          issues.push(`❌ Possible API key exposed in ${file}`);
        }
      }
    });
  }
});

// Check .gitignore
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env')) {
    passed.push('✅ .env files ignored by git');
  } else {
    issues.push('❌ .env files not in .gitignore');
  }
} else {
  issues.push('❌ Missing .gitignore file');
}

// ============================================
// REPORT RESULTS
// ============================================
console.log('\n' + '='.repeat(50));
console.log('🏥 SNAPCARB HEALTH CHECK RESULTS');
console.log('='.repeat(50));

if (issues.length > 0) {
  console.log('\n🚨 CRITICAL ISSUES (Must Fix Before Launch):');
  issues.forEach(issue => console.log(issue));
}

if (warnings.length > 0) {
  console.log('\n⚠️ WARNINGS (Recommended to Fix):');
  warnings.forEach(warning => console.log(warning));
}

if (passed.length > 0) {
  console.log('\n✅ PASSED CHECKS:');
  passed.forEach(pass => console.log(pass));
}

console.log('\n' + '='.repeat(50));
console.log(`📊 SUMMARY: ${passed.length} passed, ${warnings.length} warnings, ${issues.length} critical`);

if (issues.length === 0) {
  console.log('🎉 All critical checks passed! Ready for testing.');
  process.exit(0);
} else {
  console.log('💥 Fix critical issues before proceeding.');
  process.exit(1);
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getAllFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getAllFiles(name, files);
    } else {
      files.push(name);
    }
  }
  return files;
}

