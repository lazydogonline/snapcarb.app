import * as fs from 'fs';
import * as path from 'path';

async function convertCSVToJSON() {
  try {
    console.log('🔄 Converting CSV to JSON...');
    
    // Read the CSV file
    const csvPath = path.join(__dirname, '../valid_food_nutrients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV and group by fdc_id
    const lines = csvContent.split('\n');
    const nutritionMap: { [key: string]: any } = {};
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const [id, fdc_id, nutrient_id, amount] = line.split(',');
      
      if (id && fdc_id && nutrient_id && amount) {
        if (!nutritionMap[fdc_id]) {
          nutritionMap[fdc_id] = {
            fdc_id: parseInt(fdc_id),
            nutrients: {}
          };
        }
        
        nutritionMap[fdc_id].nutrients[nutrient_id] = parseFloat(amount);
      }
    }
    
    // Convert to array format
    const nutritionArray = Object.values(nutritionMap);
    
    // Write JSON file
    const jsonPath = path.join(__dirname, '../assets/nutrition-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(nutritionArray, null, 2));
    
    console.log(`✅ Converted ${nutritionArray.length} foods to JSON`);
    console.log(`📁 Saved to: ${jsonPath}`);
    console.log(`📊 Sample food:`, nutritionArray[0]);
    
  } catch (error) {
    console.error('❌ Error converting CSV:', error);
  }
}

convertCSVToJSON();
