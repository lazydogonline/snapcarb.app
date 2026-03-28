// SnapCarb Security Audit Script
// This script checks your app for common security issues

const fs = require('fs');
const path = require('path');

console.log('🔒 SnapCarb Security Audit Starting...\n');

const issues = [];
const warnings = [];

// Check for exposed API keys
function checkExposedSecrets() {
  console.log('🔍 Checking for exposed API keys...');
  
  const filesToCheck = [
    '.env',
    'app.json',
    'package.json',
    'config/environment.ts'
  ];
  
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{20,}/g,
    /AIza[a-zA-Z0-9_-]{35}/g,
    /ya29\.[a-zA-Z0-9_-]+/g,
    /1\/\/[a-zA-Z0-9_-]+/g,
    /password["\s]*[:=]["\s]*[^"\s]+/gi,
    /secret["\s]*[:=]["\s]*[^"\s]+/gi,
  ];
  
  // Patterns that are OK (environment variable references)
  const safePatterns = [
    /process\.env\./g,
    /EXPO_PUBLIC_/g,
  ];
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      secretPatterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push(`🚨 EXPOSED SECRET in ${file}: ${matches[0].substring(0, 20)}...`);
        }
      });
    }
  });
  
  if (issues.length === 0) {
    console.log('✅ No exposed API keys found');
  }
}

// Check for security vulnerabilities in dependencies
function checkDependencies() {
  console.log('\n📦 Checking dependencies for vulnerabilities...');
  
  if (fs.existsSync('package-lock.json')) {
    console.log('✅ package-lock.json exists (good for reproducible builds)');
  } else {
    warnings.push('⚠️  No package-lock.json found - consider adding for reproducible builds');
  }
  
  // Check for known vulnerable packages
  const vulnerablePackages = [
    'lodash@4.17.0',
    'minimatch@3.0.0',
    'debug@2.6.0'
  ];
  
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    vulnerablePackages.forEach(vuln => {
      if (allDeps[vuln]) {
        issues.push(`🚨 VULNERABLE PACKAGE: ${vuln} - please update`);
      }
    });
    
    console.log('✅ Basic dependency check completed');
  }
}

// Check for input validation
function checkInputValidation() {
  console.log('\n🛡️  Checking input validation...');
  
  const componentsToCheck = [
    'components/RecipeSearch.tsx',
    'components/LoginScreen.tsx',
    'app/(tabs)/meals.tsx'
  ];
  
  componentsToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for basic input validation
      if (content.includes('sanitize') || content.includes('validate')) {
        console.log(`✅ Input validation found in ${file}`);
      } else {
        warnings.push(`⚠️  Consider adding input validation to ${file}`);
      }
    }
  });
}

// Check for HTTPS usage
function checkHTTPS() {
  console.log('\n🔐 Checking HTTPS usage...');
  
  const configFiles = [
    'config/environment.ts',
    'app.json',
    '.env.example'
  ];
  
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('http://') && !content.includes('localhost')) {
        issues.push(`🚨 HTTP (not HTTPS) found in ${file} - use HTTPS for production`);
      }
    }
  });
  
  console.log('✅ HTTPS check completed');
}

// Check for error handling
function checkErrorHandling() {
  console.log('\n⚠️  Checking error handling...');
  
  const criticalFiles = [
    'services/gemini-ai-service.ts',
    'services/auth-service.ts',
    'services/recipe-service.ts'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      if (content.includes('try') && content.includes('catch')) {
        console.log(`✅ Error handling found in ${file}`);
      } else {
        warnings.push(`⚠️  Consider adding error handling to ${file}`);
      }
    }
  });
}

// Check environment configuration
function checkEnvironmentConfig() {
  console.log('\n🌍 Checking environment configuration...');
  
  const requiredEnvVars = [
    'EXPO_PUBLIC_GEMINI_API_KEY',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  if (fs.existsSync('.env.example')) {
    const envExample = fs.readFileSync('.env.example', 'utf8');
    
    requiredEnvVars.forEach(envVar => {
      if (envExample.includes(envVar)) {
        console.log(`✅ ${envVar} documented in .env.example`);
      } else {
        warnings.push(`⚠️  ${envVar} should be documented in .env.example`);
      }
    });
  } else {
    warnings.push('⚠️  No .env.example file found - create one for security documentation');
  }
  
  console.log('✅ Environment configuration check completed');
}

// Generate security report
function generateReport() {
  console.log('\n📊 SECURITY AUDIT REPORT');
  console.log('========================\n');
  
  if (issues.length === 0) {
    console.log('🎉 NO CRITICAL SECURITY ISSUES FOUND!');
  } else {
    console.log('🚨 CRITICAL ISSUES FOUND:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  console.log('\n📋 RECOMMENDATIONS:');
  console.log('   1. Run "npm audit" to check for package vulnerabilities');
  console.log('   2. Use HTTPS for all API calls in production');
  console.log('   3. Implement rate limiting for API endpoints');
  console.log('   4. Add input validation to all user inputs');
  console.log('   5. Use environment variables for all secrets');
  console.log('   6. Enable CORS properly for your domain');
  console.log('   7. Implement proper error handling and logging');
  
  console.log('\n🔒 Security Score:', issues.length === 0 ? 'EXCELLENT' : 'NEEDS ATTENTION');
  
  if (issues.length > 0) {
    console.log('\n❌ Fix critical issues before releasing to production!');
    process.exit(1);
  } else {
    console.log('\n✅ Your app passed the security audit!');
  }
}

// Run all security checks
async function runSecurityAudit() {
  try {
    checkExposedSecrets();
    checkDependencies();
    checkInputValidation();
    checkHTTPS();
    checkErrorHandling();
    checkEnvironmentConfig();
    generateReport();
  } catch (error) {
    console.error('❌ Security audit failed:', error.message);
    process.exit(1);
  }
}

// Run the audit
runSecurityAudit();
