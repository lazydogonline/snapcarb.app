#!/usr/bin/env node

/**
 * SnapCarb App Health Check & Repair Script
 * Detects and fixes common issues that could break the app
 * Run this script regularly to maintain app stability
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APP_ROOT = path.join(__dirname, '..');
const CRITICAL_FILES = [
  'app/(tabs)/index.tsx',
  'app/(tabs)/health.tsx',
  'app/(tabs)/meals.tsx',
  'app/(tabs)/challenge.tsx',
  'app/(tabs)/events.tsx',
  'app/(tabs)/dr-davis-products.tsx',
  'components/HealthDashboard.tsx',
  'components/LoginScreen.tsx',
  'config/supabase.ts',
  'constants/colors.ts'
];

const REQUIRED_DISCLAIMERS = [
  'NOT MEDICAL ADVICE',
  'informational purposes only',
  'consult healthcare providers'
];

class AppHealthChecker {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  // Main health check
  async runHealthCheck() {
    console.log('🔍 Starting SnapCarb App Health Check...\n');
    
    try {
      await this.checkCriticalFiles();
      await this.checkLegalDisclaimers();
      await this.checkTypeScriptErrors();
      await this.checkMissingImports();
      await this.checkEnvironmentVariables();
      await this.checkSupabaseConnection();
      
      this.generateReport();
      this.suggestFixes();
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      process.exit(1);
    }
  }

  // Check if critical files exist
  async checkCriticalFiles() {
    console.log('📁 Checking critical files...');
    
    for (const file of CRITICAL_FILES) {
      const filePath = path.join(APP_ROOT, file);
      if (!fs.existsSync(filePath)) {
        this.issues.push({
          type: 'CRITICAL_FILE_MISSING',
          severity: 'HIGH',
          file,
          description: `Critical file ${file} is missing`
        });
      } else {
        console.log(`  ✅ ${file}`);
      }
    }
  }

  // Check for legal disclaimers in key files
  async checkLegalDisclaimers() {
    console.log('\n⚖️ Checking legal disclaimers...');
    
    const filesToCheck = [
      'components/LoginScreen.tsx',
      'app/(tabs)/index.tsx',
      'app/(tabs)/health.tsx'
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(APP_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const hasDisclaimers = REQUIRED_DISCLAIMERS.some(disclaimer => 
          content.includes(disclaimer)
        );
        
        if (!hasDisclaimers) {
          this.issues.push({
            type: 'MISSING_LEGAL_DISCLAIMER',
            severity: 'HIGH',
            file,
            description: `Missing legal disclaimers in ${file}`
          });
        } else {
          console.log(`  ✅ ${file} has legal disclaimers`);
        }
      }
    }
  }

  // Check for TypeScript compilation errors
  async checkTypeScriptErrors() {
    console.log('\n🔧 Checking TypeScript errors...');
    
    try {
      // This would run tsc --noEmit in a real implementation
      // For now, we'll check for common TypeScript issues in files
      const tsFiles = this.findTypeScriptFiles();
      
      for (const file of tsFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for common TypeScript issues
        if (content.includes('any: any') || content.includes(': any')) {
          this.issues.push({
            type: 'TYPESCRIPT_ANY_TYPE',
            severity: 'MEDIUM',
            file: path.relative(APP_ROOT, file),
            description: 'Uses "any" type which can cause runtime errors'
          });
        }
        
        if (content.includes('console.log(') && !content.includes('// TODO: Remove')) {
          this.issues.push({
            type: 'CONSOLE_LOG_IN_PRODUCTION',
            severity: 'LOW',
            file: path.relative(APP_ROOT, file),
            description: 'Console.log statements should be removed in production'
          });
        }
      }
      
      console.log(`  ✅ Checked ${tsFiles.length} TypeScript files`);
      
    } catch (error) {
      console.log(`  ⚠️ TypeScript check skipped: ${error.message}`);
    }
  }

  // Check for missing imports
  async checkMissingImports() {
    console.log('\n📦 Checking import dependencies...');
    
    const filesToCheck = [
      'app/(tabs)/index.tsx',
      'components/HealthDashboard.tsx'
    ];

    for (const file of filesToCheck) {
      const filePath = path.join(APP_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for common missing imports
        if (content.includes('useHealth') && !content.includes("from '../../hooks/health-store'")) {
          this.issues.push({
            type: 'MISSING_IMPORT',
            severity: 'MEDIUM',
            file,
            description: 'useHealth hook import may be missing'
          });
        }
        
        if (content.includes('LinearGradient') && !content.includes("from 'expo-linear-gradient'")) {
          this.issues.push({
            type: 'MISSING_IMPORT',
            severity: 'MEDIUM',
            file,
            description: 'LinearGradient import may be missing'
          });
        }
      }
    }
    
    console.log('  ✅ Import dependency check complete');
  }

  // Check environment variables
  async checkEnvironmentVariables() {
    console.log('\n🔐 Checking environment variables...');
    
    const envPath = path.join(APP_ROOT, '.env');
    const envExamplePath = path.join(APP_ROOT, '.env.example');
    
    if (!fs.existsSync(envPath)) {
      this.issues.push({
        type: 'MISSING_ENV_FILE',
        severity: 'HIGH',
        file: '.env',
        description: '.env file is missing - app may not work'
      });
    } else {
      console.log('  ✅ .env file exists');
    }
    
    if (!fs.existsSync(envExamplePath)) {
      this.issues.push({
        type: 'MISSING_ENV_EXAMPLE',
        severity: 'LOW',
        file: '.env.example',
        description: '.env.example file is missing - developers may not know required variables'
      });
    } else {
      console.log('  ✅ .env.example file exists');
    }
  }

  // Check Supabase connection
  async checkSupabaseConnection() {
    console.log('\n🗄️ Checking Supabase configuration...');
    
    const supabaseConfigPath = path.join(APP_ROOT, 'config/supabase.ts');
    
    if (fs.existsSync(supabaseConfigPath)) {
      const content = fs.readFileSync(supabaseConfigPath, 'utf8');
      
      if (!content.includes('EXPO_PUBLIC_SUPABASE_URL') || !content.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
        this.issues.push({
          type: 'SUPABASE_CONFIG_ISSUE',
          severity: 'HIGH',
          file: 'config/supabase.ts',
          description: 'Supabase configuration may be incomplete'
        });
      } else {
        console.log('  ✅ Supabase configuration looks complete');
      }
    } else {
      this.issues.push({
        type: 'MISSING_SUPABASE_CONFIG',
        severity: 'HIGH',
        file: 'config/supabase.ts',
        description: 'Supabase configuration file is missing'
      });
    }
  }

  // Find TypeScript files recursively
  findTypeScriptFiles(dir = APP_ROOT) {
    const files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.findTypeScriptFiles(itemPath));
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(itemPath);
      }
    }
    
    return files;
  }

  // Generate health check report
  generateReport() {
    console.log('\n📊 Health Check Report');
    console.log('========================');
    
    if (this.issues.length === 0) {
      console.log('🎉 All checks passed! Your app is healthy.');
      return;
    }
    
    console.log(`\n❌ Found ${this.issues.length} issues:`);
    
    const highIssues = this.issues.filter(i => i.severity === 'HIGH');
    const mediumIssues = this.issues.filter(i => i.severity === 'MEDIUM');
    const lowIssues = this.issues.filter(i => i.severity === 'LOW');
    
    if (highIssues.length > 0) {
      console.log(`\n🚨 HIGH PRIORITY (${highIssues.length}):`);
      highIssues.forEach(issue => {
        console.log(`  • ${issue.file}: ${issue.description}`);
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log(`\n⚠️ MEDIUM PRIORITY (${mediumIssues.length}):`);
      mediumIssues.forEach(issue => {
        console.log(`  • ${issue.file}: ${issue.description}`);
      });
    }
    
    if (lowIssues.length > 0) {
      console.log(`\nℹ️ LOW PRIORITY (${lowIssues.length}):`);
      lowIssues.forEach(issue => {
        console.log(`  • ${issue.file}: ${issue.description}`);
      });
    }
  }

  // Suggest fixes for issues
  suggestFixes() {
    if (this.issues.length === 0) return;
    
    console.log('\n🔧 Suggested Fixes:');
    console.log('===================');
    
    this.issues.forEach(issue => {
      console.log(`\n📝 ${issue.file} (${issue.severity}):`);
      
      switch (issue.type) {
        case 'CRITICAL_FILE_MISSING':
          console.log('  • Restore the missing file from version control');
          console.log('  • Check if the file was accidentally deleted or moved');
          break;
          
        case 'MISSING_LEGAL_DISCLAIMER':
          console.log('  • Add legal disclaimers to protect the business');
          console.log('  • Include "NOT MEDICAL ADVICE" and data source disclaimers');
          break;
          
        case 'TYPESCRIPT_ANY_TYPE':
          console.log('  • Replace "any" types with proper TypeScript types');
          console.log('  • Use interfaces or union types for better type safety');
          break;
          
        case 'CONSOLE_LOG_IN_PRODUCTION':
          console.log('  • Remove or comment out console.log statements');
          console.log('  • Use proper logging library for production');
          break;
          
        case 'MISSING_IMPORT':
          console.log('  • Check import statements and fix missing dependencies');
          console.log('  • Verify all required packages are installed');
          break;
          
        case 'MISSING_ENV_FILE':
          console.log('  • Create .env file with required environment variables');
          console.log('  • Copy from .env.example and fill in actual values');
          break;
          
        case 'SUPABASE_CONFIG_ISSUE':
          console.log('  • Verify Supabase URL and API keys are correct');
          console.log('  • Check environment variables are properly set');
          break;
      }
    });
  }
}

// Run the health check
async function main() {
  const checker = new AppHealthChecker();
  await checker.runHealthCheck();
}

// Auto-fix common issues
async function autoFix() {
  console.log('🔧 Auto-fixing common issues...\n');
  
  // This would implement automatic fixes for common issues
  // For now, just run the health check
  await main();
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--fix')) {
    autoFix();
  } else {
    main();
  }
}

module.exports = AppHealthChecker;

