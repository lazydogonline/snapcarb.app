#!/usr/bin/env tsx

/**
 * SnapCarb Authentication Setup Script
 * 
 * This script helps you set up the complete authentication system including:
 * - Environment variable validation
 * - Supabase schema setup
 * - Google OAuth configuration
 * - Resend email setup
 * - Testing the authentication flow
 */

import { config } from '../config/environment';
import { supabase } from '../config/supabase';

interface SetupResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  nextSteps: string[];
}

async function validateEnvironment(): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
    'EXPO_PUBLIC_RESEND_API_KEY',
  ];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      errors.push(`Missing environment variable: ${varName}`);
    } else if (value.includes('your_') || value.includes('here')) {
      errors.push(`Environment variable ${varName} contains placeholder value`);
    }
  }

  return { valid: errors.length === 0, errors };
}

async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function checkUsersTable(): Promise<{ exists: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: true };
  } catch (error: any) {
    return { exists: false, error: error.message };
  }
}

async function testResendConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = process.env.EXPO_PUBLIC_RESEND_API_KEY;
    if (!resendApiKey) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Resend API error: ${error}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function runSetup(): Promise<SetupResult> {
  console.log('🚀 Starting SnapCarb Authentication Setup...\n');

  const result: SetupResult = {
    success: false,
    errors: [],
    warnings: [],
    nextSteps: [],
  };

  // Step 1: Validate environment variables
  console.log('📋 Step 1: Validating environment variables...');
  const envValidation = await validateEnvironment();
  if (!envValidation.valid) {
    result.errors.push(...envValidation.errors);
    console.log('❌ Environment validation failed');
    envValidation.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('✅ Environment variables are properly configured');
  }

  // Step 2: Test Supabase connection
  console.log('\n🔗 Step 2: Testing Supabase connection...');
  const supabaseTest = await testSupabaseConnection();
  if (!supabaseTest.success) {
    result.errors.push(`Supabase connection failed: ${supabaseTest.error}`);
    console.log('❌ Supabase connection failed');
    console.log(`   - ${supabaseTest.error}`);
  } else {
    console.log('✅ Supabase connection successful');
  }

  // Step 3: Check if users table exists
  console.log('\n🗄️ Step 3: Checking database schema...');
  const usersTableCheck = await checkUsersTable();
  if (!usersTableCheck.exists) {
    result.warnings.push('Users table does not exist. Run the SQL schema first.');
    console.log('⚠️ Users table not found');
    console.log('   - Run the contents of supabase/users-schema.sql in your Supabase SQL Editor');
  } else {
    console.log('✅ Users table exists');
  }

  // Step 4: Test Resend connection
  console.log('\n📧 Step 4: Testing Resend email service...');
  const resendTest = await testResendConnection();
  if (!resendTest.success) {
    result.warnings.push(`Resend connection failed: ${resendTest.error}`);
    console.log('⚠️ Resend connection failed');
    console.log(`   - ${resendTest.error}`);
  } else {
    console.log('✅ Resend email service connected');
  }

  // Determine overall success
  result.success = result.errors.length === 0;

  // Generate next steps
  if (result.errors.length > 0) {
    result.nextSteps.push('Fix the errors above before proceeding');
  }

  if (result.warnings.length > 0) {
    result.nextSteps.push('Address the warnings above for full functionality');
  }

  if (usersTableCheck.exists && supabaseTest.success) {
    result.nextSteps.push('Test authentication by running the app and navigating to /login');
    result.nextSteps.push('Try signing in with Google to test the complete flow');
  } else {
    result.nextSteps.push('Set up the database schema first');
    result.nextSteps.push('Configure Google OAuth in Supabase dashboard');
  }

  if (resendTest.success) {
    result.nextSteps.push('Test welcome emails by creating a new user account');
  } else {
    result.nextSteps.push('Configure Resend email service for welcome emails');
  }

  return result;
}

function printResults(result: SetupResult) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP RESULTS');
  console.log('='.repeat(60));

  if (result.success) {
    console.log('🎉 Authentication system is ready!');
  } else {
    console.log('❌ Setup incomplete. Please fix the errors below.');
  }

  if (result.errors.length > 0) {
    console.log('\n🚨 ERRORS:');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  console.log('\n📋 NEXT STEPS:');
  result.nextSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });

  console.log('\n' + '='.repeat(60));

  if (result.success) {
    console.log('🚀 You can now test the authentication system!');
    console.log('   Start your app with: npm start');
    console.log('   Navigate to: /login');
  } else {
    console.log('🔧 Please fix the issues above and run this script again.');
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  runSetup()
    .then(printResults)
    .catch(error => {
      console.error('💥 Setup script failed:', error);
      process.exit(1);
    });
}

export { runSetup, validateEnvironment, testSupabaseConnection };
