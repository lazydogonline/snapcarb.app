const fs = require('fs');
const csv = require('csv-parser');

async function checkCSVStructure() {
  console.log('🔍 Checking CSV structure...');
  
  const csvPath = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    return;
  }
  
  let rowCount = 0;
  let columns = [];
  let sampleRows = [];
  
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;
        
        // Get column names from first row
        if (rowCount === 1) {
          columns = Object.keys(row);
          console.log('\n📋 CSV Columns found:');
          columns.forEach((col, index) => {
            console.log(`  ${index + 1}. ${col}`);
          });
        }
        
        // Collect sample rows (first 3)
        if (rowCount <= 3) {
          sampleRows.push(row);
        }
        
        // Stop after 10 rows to avoid memory issues
        if (rowCount >= 10) {
          stream.destroy();
        }
      })
      .on('end', () => {
        console.log(`\n📊 Total rows in CSV: ${rowCount}`);
        
        console.log('\n📝 Sample data (first 3 rows):');
        sampleRows.forEach((row, index) => {
          console.log(`\nRow ${index + 1}:`);
          columns.forEach(col => {
            const value = row[col];
            const displayValue = value === '' ? '(empty)' : value;
            console.log(`  ${col}: ${displayValue}`);
          });
        });
        
        console.log('\n🔍 Analysis:');
        console.log(`- CSV has ${columns.length} columns`);
        console.log(`- First few rows show the data structure`);
        console.log(`- Empty cells are represented as empty strings`);
        
        resolve({ columns, sampleRows, totalRows: rowCount });
      })
      .on('error', reject);
  });
}

async function main() {
  try {
    await checkCSVStructure();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkCSVStructure };
