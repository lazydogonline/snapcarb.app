const fs = require('fs');
const csv = require('csv-parser');

async function splitCSV() {
  const csvPath = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found:', csvPath);
    return;
  }
  
  console.log('📁 CSV file found:', csvPath);
  console.log('📊 File size:', (fs.statSync(csvPath).size / (1024 * 1024)).toFixed(2), 'MB');
  
  // Create output directory
  const outputDir = './csv-chunks';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  let currentChunk = [];
  let chunkNumber = 1;
  let totalRows = 0;
  
  // Target chunk size: 50MB (well under the 100MB limit)
  const targetChunkSize = 50 * 1024 * 1024; // 50MB in bytes
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        currentChunk.push(row);
        totalRows++;
        
        // Estimate chunk size (rough calculation)
        const estimatedSize = JSON.stringify(currentChunk).length;
        
        // When chunk approaches 50MB, save it
        if (estimatedSize > targetChunkSize) {
          saveChunk(currentChunk, chunkNumber);
          currentChunk = [];
          chunkNumber++;
        }
      })
      .on('end', () => {
        // Save remaining chunk
        if (currentChunk.length > 0) {
          saveChunk(currentChunk, chunkNumber);
        }
        
        console.log(`\n🎉 CSV split completed!`);
        console.log(`📊 Total rows processed: ${totalRows}`);
        console.log(`📊 Total chunks created: ${chunkNumber}`);
        console.log(`📁 Chunks saved in: ${outputDir}/`);
        resolve();
      })
      .on('error', reject);
  });
  
  function saveChunk(chunk, chunkNum) {
    const outputPath = `${outputDir}/food_nutrient_chunk_${chunkNum}.csv`;
    
    // Write header
    const header = Object.keys(chunk[0]).join(',') + '\n';
    fs.writeFileSync(outputPath, header);
    
    // Write data rows
    chunk.forEach(row => {
      const values = Object.values(row).map(value => {
        // Handle commas and quotes in CSV values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      fs.appendFileSync(outputPath, values.join(',') + '\n');
    });
    
    const chunkSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Chunk ${chunkNum} saved: ${outputPath} (${chunkSize} MB, ${chunk.length} rows)`);
  }
}

async function main() {
  try {
    await splitCSV();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { splitCSV };




