const fs = require('fs');
const csv = require('csv-parser');
const { createWriteStream } = require('fs');

// Configuration for cleaning USDA CSV data
const CLEANING_CONFIG = {
  // Replace empty/null values with appropriate defaults
  replacements: {
    'amount': '0.0',           // Missing amounts become 0.0
    'data_points': '0',        // Missing data points become 0
    'derivation_id': '',       // Missing derivation becomes empty string
    'min': '0.0',              // Missing min becomes 0.0
    'max': '0.0',              // Missing max becomes 0.0
    'median': '0.0',           // Missing median becomes 0.0
    'footnote': '',            // Missing footnotes become empty string
    'min_year_acquired': '0'   // Missing year becomes 0
  },
  
  // Values to treat as "null" and replace
  nullValues: ['', 'NULL', 'null', 'N/A', 'NA', '-', '--', '...', 'nan', 'NaN']
};

function isNullValue(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || CLEANING_CONFIG.nullValues.includes(trimmed.toLowerCase());
  }
  return false;
}

function cleanValue(value, columnName) {
  if (isNullValue(value)) {
    return CLEANING_CONFIG.replacements[columnName] || '';
  }
  return value;
}

async function cleanUSDACSV(inputPath, outputPath, tableName) {
  console.log(`🧹 Cleaning ${tableName} CSV data...`);
  console.log(`📁 Input: ${inputPath}`);
  console.log(`📁 Output: ${outputPath}`);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    return;
  }
  
  const writeStream = createWriteStream(outputPath);
  let totalRows = 0;
  let cleanedRows = 0;
  let startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (row) => {
        totalRows++;
        
        // Clean each column based on its type
        const cleanedRow = {};
        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key] = cleanValue(value, key);
        }
        
        // Write cleaned row to output file
        if (totalRows === 1) {
          // Write header
          writeStream.write(Object.keys(cleanedRow).join(',') + '\n');
        }
        
        // Write data row
        writeStream.write(Object.values(cleanedRow).map(v => `"${v}"`).join(',') + '\n');
        
        cleanedRows++;
        
        // Show progress
        if (totalRows % 100000 === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          const rate = (totalRows / elapsed).toFixed(0);
          console.log(`📈 Processed ${totalRows.toLocaleString()} rows (${rate} rows/sec)`);
        }
      })
      .on('end', () => {
        writeStream.end();
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ CSV cleaning complete!`);
        console.log(`📊 Total rows processed: ${totalRows.toLocaleString()}`);
        console.log(`🧹 Total rows cleaned: ${cleanedRows.toLocaleString()}`);
        console.log(`⏱️  Total time: ${totalTime} seconds`);
        console.log(`💾 Cleaned data saved to: ${outputPath}`);
        resolve({ totalRows, cleanedRows, totalTime });
      })
      .on('error', (error) => {
        writeStream.end();
        console.error('💥 Error cleaning CSV:', error.message);
        reject(error);
      });
  });
}

// Main execution
async function main() {
  console.log('🚀 USDA CSV Data Cleaner');
  console.log('This script cleans USDA CSV files by replacing empty/null values with appropriate defaults\n');
  
  try {
    // Clean food_nutrient.csv (the main file causing issues)
    const foodNutrientInput = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
    const foodNutrientOutput = 'USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient_CLEANED.csv';
    
    console.log('🔧 Step 1: Cleaning food_nutrient.csv...');
    await cleanUSDACSV(foodNutrientInput, foodNutrientOutput, 'food_nutrient');
    
    console.log('\n🎉 All CSV files cleaned successfully!');
    console.log('💡 You can now run the import with the CLEANED files');
    console.log('📝 Next step: Update your import script to use the CLEANED CSV files');
    
  } catch (error) {
    console.error('💥 CSV cleaning failed:', error.message);
    process.exit(1);
  }
}

// Run the cleaner
main();
