// SnapCarb Error Detection Script
// This script automatically finds and helps fix common errors

const fs = require('fs');
const path = require('path');

console.log('🔍 SnapCarb Error Detection Starting...\n');

const errors = [];
const warnings = [];
const fixes = [];

// Check for common React Native errors
function checkReactNativeErrors() {
  console.log('📱 Checking for React Native errors...');
  
  const filesToCheck = [
    'app/**/*.tsx',
    'components/**/*.tsx',
    'services/**/*.ts'
  ];
  
  // Get all files matching patterns
  const files = glob(filesToCheck[0]); // Use our simple glob function
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for common errors
      if (content.includes('import React from') && !content.includes('import React')) {
        warnings.push(`⚠️  ${file}: Consider using 'import React' instead of 'import React from'`);
      }
      
      if (content.includes('useState(') && !content.includes('import { useState }')) {
        warnings.push(`⚠️  ${file}: Using useState without importing it`);
      }
      
      if (content.includes('useEffect(') && !content.includes('import { useEffect }')) {
        warnings.push(`⚠️  ${file}: Using useEffect without importing it`);
      }
      
      // Check for missing error handling
      if (content.includes('fetch(') && !content.includes('try') && !content.includes('catch')) {
        warnings.push(`⚠️  ${file}: fetch() call without error handling`);
      }
      
      // Check for hardcoded values
      if (content.includes('localhost:') || content.includes('127.0.0.1')) {
        warnings.push(`⚠️  ${file}: Hardcoded localhost URL found`);
      }
    }
  });
  
  console.log('✅ React Native error check completed');
}

// Check for TypeScript errors
function checkTypeScriptErrors() {
  console.log('📝 Checking for TypeScript errors...');
  
  const tsFiles = glob('**/*.{ts,tsx}');
  
  tsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for any type
      if (content.includes(': any')) {
        warnings.push(`⚠️  ${file}: Using 'any' type - consider more specific typing`);
      }
      
      // Check for missing return types
      if (content.includes('function ') && !content.includes('): ')) {
        warnings.push(`⚠️  ${file}: Function without return type annotation`);
      }
      
      // Check for unused imports
      const imports = content.match(/import.*from/g) || [];
      imports.forEach(imp => {
        const importName = imp.match(/import\s+{([^}]+)}/);
        if (importName) {
          const names = importName[1].split(',').map(n => n.trim());
          names.forEach(name => {
            if (!content.includes(name) && name !== 'React') {
              warnings.push(`⚠️  ${file}: Unused import '${name}'`);
            }
          });
        }
      });
    }
  });
  
  console.log('✅ TypeScript error check completed');
}

// Check for performance issues
function checkPerformanceIssues() {
  console.log('⚡ Checking for performance issues...');
  
  const filesToCheck = [
    'app/**/*.tsx',
    'components/**/*.tsx'
  ];
  
  filesToCheck.forEach(pattern => {
    const matches = glob.sync(pattern);
    matches.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for inline styles
        if (content.includes('style={{')) {
          warnings.push(`⚠️  ${file}: Inline styles detected - consider using StyleSheet`);
        }
        
        // Check for missing keys in lists
        if (content.includes('.map(') && !content.includes('key=')) {
          warnings.push(`⚠️  ${file}: List rendering without keys`);
        }
        
        // Check for missing useCallback
        if (content.includes('onPress=') && content.includes('function')) {
          warnings.push(`⚠️  ${file}: Consider using useCallback for event handlers`);
        }
      }
    });
  });
  
  console.log('✅ Performance check completed');
}

// Check for accessibility issues
function checkAccessibilityIssues() {
  console.log('♿ Checking for accessibility issues...');
  
  const filesToCheck = [
    'app/**/*.tsx',
    'components/**/*.tsx'
  ];
  
  filesToCheck.forEach(pattern => {
    const matches = glob.sync(pattern);
    matches.forEach(file => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for missing accessibility labels
        if (content.includes('<TouchableOpacity') && !content.includes('accessibilityLabel')) {
          warnings.push(`⚠️  ${file}: TouchableOpacity without accessibilityLabel`);
        }
        
        if (content.includes('<Image') && !content.includes('accessibilityLabel')) {
          warnings.push(`⚠️  ${file}: Image without accessibilityLabel`);
        }
        
        // Check for missing accessibility roles
        if (content.includes('<View') && content.includes('onPress') && !content.includes('accessibilityRole')) {
          warnings.push(`⚠️  ${file}: Interactive View without accessibilityRole`);
        }
      }
    });
  });
  
  console.log('✅ Accessibility check completed');
}

// Generate error report
function generateErrorReport() {
  console.log('\n📊 ERROR DETECTION REPORT');
  console.log('==========================\n');
  
  if (warnings.length === 0) {
    console.log('🎉 NO ERRORS FOUND! Your code looks great!');
  } else {
    console.log(`⚠️  Found ${warnings.length} potential issues:`);
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  console.log('\n🔧 AUTOMATIC FIXES AVAILABLE:');
  console.log('   1. Run "npm run lint:fix" to fix code style issues');
  console.log('   2. Run "npm test" to run all tests');
  console.log('   3. Run "npm run type-check" to check TypeScript errors');
  console.log('   4. Run "node scripts/security-audit.js" for security issues');
  
  console.log('\n📋 MANUAL FIXES NEEDED:');
  if (warnings.length > 0) {
    console.log('   - Review the warnings above and fix them manually');
    console.log('   - Add error handling to API calls');
    console.log('   - Add accessibility labels to interactive elements');
    console.log('   - Use StyleSheet instead of inline styles');
  }
  
  console.log('\n🎯 ERROR DETECTION SCORE:', warnings.length === 0 ? 'EXCELLENT' : 'NEEDS ATTENTION');
}

// Simple glob implementation
function glob(pattern) {
  const files = [];
  const dir = '.';
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        walkDir(fullPath);
      } else if (stat.isFile()) {
        const relativePath = path.relative(dir, fullPath);
        
        // Simple pattern matching
        if (pattern.includes('**/*.tsx') && relativePath.endsWith('.tsx')) {
          files.push(relativePath);
        } else if (pattern.includes('**/*.ts') && relativePath.endsWith('.ts')) {
          files.push(relativePath);
        } else if (pattern.includes('components/**/*.tsx') && relativePath.startsWith('components/') && relativePath.endsWith('.tsx')) {
          files.push(relativePath);
        } else if (pattern.includes('app/**/*.tsx') && relativePath.startsWith('app/') && relativePath.endsWith('.tsx')) {
          files.push(relativePath);
        } else if (pattern.includes('services/**/*.ts') && relativePath.startsWith('services/') && relativePath.endsWith('.ts')) {
          files.push(relativePath);
        }
      }
    });
  }
  
  walkDir(dir);
  return files;
}

// Run all error checks
async function runErrorDetection() {
  try {
    checkReactNativeErrors();
    checkTypeScriptErrors();
    checkPerformanceIssues();
    checkAccessibilityIssues();
    generateErrorReport();
  } catch (error) {
    console.error('❌ Error detection failed:', error.message);
    process.exit(1);
  }
}

// Run the error detection
runErrorDetection();
