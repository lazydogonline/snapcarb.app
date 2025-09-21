// SnapCarb Simple Error Detection Script
// This script finds common errors without complex dependencies

const fs = require('fs');
const path = require('path');

console.log('🔍 SnapCarb Simple Error Detection Starting...\n');

const warnings = [];

// Get all TypeScript/React files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      getAllFiles(filePath, fileList);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check for common React Native errors
function checkReactNativeErrors() {
  console.log('📱 Checking for React Native errors...');
  
  const files = getAllFiles('.');
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for missing error handling
    if (content.includes('fetch(') && !content.includes('try') && !content.includes('catch')) {
      warnings.push(`⚠️  ${file}: fetch() call without error handling`);
    }
    
    // Check for hardcoded localhost
    if (content.includes('localhost:') || content.includes('127.0.0.1')) {
      warnings.push(`⚠️  ${file}: Hardcoded localhost URL found`);
    }
    
    // Check for console.log in production code
    if (content.includes('console.log') && !file.includes('__tests__') && !file.includes('scripts')) {
      warnings.push(`⚠️  ${file}: console.log found - remove for production`);
    }
  });
  
  console.log('✅ React Native error check completed');
}

// Check for TypeScript issues
function checkTypeScriptIssues() {
  console.log('📝 Checking for TypeScript issues...');
  
  const files = getAllFiles('.');
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for any type
    if (content.includes(': any')) {
      warnings.push(`⚠️  ${file}: Using 'any' type - consider more specific typing`);
    }
    
    // Check for missing return types on functions
    const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{/g);
    if (functionMatches) {
      functionMatches.forEach(match => {
        if (!match.includes('): ')) {
          warnings.push(`⚠️  ${file}: Function without return type annotation`);
        }
      });
    }
  });
  
  console.log('✅ TypeScript check completed');
}

// Check for performance issues
function checkPerformanceIssues() {
  console.log('⚡ Checking for performance issues...');
  
  const files = getAllFiles('.');
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for inline styles
    if (content.includes('style={{')) {
      warnings.push(`⚠️  ${file}: Inline styles detected - consider using StyleSheet`);
    }
    
    // Check for missing keys in lists
    if (content.includes('.map(') && !content.includes('key=')) {
      warnings.push(`⚠️  ${file}: List rendering without keys`);
    }
  });
  
  console.log('✅ Performance check completed');
}

// Check for accessibility issues
function checkAccessibilityIssues() {
  console.log('♿ Checking for accessibility issues...');
  
  const files = getAllFiles('.');
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for missing accessibility labels
    if (content.includes('<TouchableOpacity') && !content.includes('accessibilityLabel')) {
      warnings.push(`⚠️  ${file}: TouchableOpacity without accessibilityLabel`);
    }
    
    if (content.includes('<Image') && !content.includes('accessibilityLabel')) {
      warnings.push(`⚠️  ${file}: Image without accessibilityLabel`);
    }
  });
  
  console.log('✅ Accessibility check completed');
}

// Generate report
function generateReport() {
  console.log('\n📊 ERROR DETECTION REPORT');
  console.log('==========================\n');
  
  if (warnings.length === 0) {
    console.log('🎉 NO ERRORS FOUND! Your code looks great!');
  } else {
    console.log(`⚠️  Found ${warnings.length} potential issues:`);
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  console.log('\n🔧 HOW TO FIX:');
  console.log('   1. Run "npm run lint:fix" to fix code style issues');
  console.log('   2. Run "npm test" to run all tests');
  console.log('   3. Add error handling to API calls');
  console.log('   4. Add accessibility labels to interactive elements');
  console.log('   5. Use StyleSheet instead of inline styles');
  
  console.log('\n🎯 ERROR DETECTION SCORE:', warnings.length === 0 ? 'EXCELLENT' : 'NEEDS ATTENTION');
  
  if (warnings.length > 0) {
    console.log('\n💡 TIP: Fix these issues to make your app more robust and accessible!');
  }
}

// Run all checks
async function runErrorDetection() {
  try {
    checkReactNativeErrors();
    checkTypeScriptIssues();
    checkPerformanceIssues();
    checkAccessibilityIssues();
    generateReport();
  } catch (error) {
    console.error('❌ Error detection failed:', error.message);
    process.exit(1);
  }
}

// Run the error detection
runErrorDetection();
