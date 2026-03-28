const fs = require('fs');
const path = require('path');

// Files to clean up (production components only)
const filesToClean = [
  'app/PhotoMeal.tsx',
  'components/BarcodeScanner.tsx',
  'components/LoginScreen.tsx',
  'components/RecipeDatabase.tsx',
  'components/SleepTracker.tsx',
  'services/auth-service.ts',
  'services/food-search-service.ts',
  'services/gemini-ai-service.ts',
  'services/recipe-service.ts'
];

function removeConsoleLogs(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Remove console.log statements
    content = content.replace(/console\.log\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.error\([^)]*\);?\s*/g, '');
    content = content.replace(/console\.warn\([^)]*\);?\s*/g, '');

    // Remove empty lines that might be left
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
    } else {
      console.log(`ℹ️ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🧹 Cleaning console.log statements from production components...\n');

filesToClean.forEach(removeConsoleLogs);

console.log('\n✨ Console.log cleanup complete!');
