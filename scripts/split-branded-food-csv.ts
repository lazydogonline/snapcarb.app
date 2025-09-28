#!/usr/bin/env tsx

/**
 * CSV File Splitter for Large USDA Branded Food Files
 * 
 * This script splits the massive branded_food.csv file into smaller chunks
 * that can be processed more easily by Windows and our import scripts.
 */

import * as fs from 'fs';
import * as path from 'path';

interface SplitOptions {
  inputFile: string;
  outputDir: string;
  linesPerChunk: number;
  includeHeaders: boolean;
}

async function splitCSVFile(options: SplitOptions) {
  console.log('🔄 Starting CSV file split...');
  console.log(`📁 Input file: ${options.inputFile}`);
  console.log(`📁 Output directory: ${options.outputDir}`);
  console.log(`📊 Lines per chunk: ${options.linesPerChunk.toLocaleString()}`);
  
  // Check if input file exists
  if (!fs.existsSync(options.inputFile)) {
    console.error(`❌ Input file not found: ${options.inputFile}`);
    return false;
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${options.outputDir}`);
  }
  
  try {
    // Read the file line by line
    const fileContent = fs.readFileSync(options.inputFile, 'utf8');
    const lines = fileContent.split('\n');
    
    console.log(`📊 Total lines in file: ${lines.length.toLocaleString()}`);
    
    // Get headers (first line)
    const headers = lines[0];
    console.log(`📋 Headers: ${headers.substring(0, 100)}...`);
    
    // Calculate number of chunks
    const totalLines = lines.length - 1; // Exclude header
    const numberOfChunks = Math.ceil(totalLines / options.linesPerChunk);
    
    console.log(`🎯 Will create ${numberOfChunks} chunks`);
    
    // Split into chunks
    for (let i = 0; i < numberOfChunks; i++) {
      const startIndex = i * options.linesPerChunk + 1; // +1 to skip header
      const endIndex = Math.min(startIndex + options.linesPerChunk, lines.length);
      
      const chunkLines = lines.slice(startIndex, endIndex);
      const chunkNumber = i + 1;
      
      // Create chunk content
      let chunkContent = '';
      if (options.includeHeaders) {
        chunkContent = headers + '\n';
      }
      chunkContent += chunkLines.join('\n');
      
      // Write chunk to file
      const outputFileName = `branded_food_chunk_${chunkNumber.toString().padStart(3, '0')}.csv`;
      const outputPath = path.join(options.outputDir, outputFileName);
      
      fs.writeFileSync(outputPath, chunkContent);
      
      console.log(`✅ Chunk ${chunkNumber}/${numberOfChunks}: ${outputFileName} (${chunkLines.length.toLocaleString()} lines)`);
    }
    
    console.log(`🎉 Successfully split file into ${numberOfChunks} chunks!`);
    console.log(`📁 Check the output directory: ${options.outputDir}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error splitting file:', error);
    return false;
  }
}

// Main execution
async function main() {
  const inputFile = path.join(__dirname, '../USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/branded_food.csv');
  const outputDir = path.join(__dirname, '../USDA FOOD IMPORT/split_chunks');
  
  const options: SplitOptions = {
    inputFile,
    outputDir,
    linesPerChunk: 100000, // 100k lines per chunk (adjust as needed)
    includeHeaders: true,   // Include headers in each chunk
  };
  
  const success = await splitCSVFile(options);
  
  if (success) {
    console.log('\n🚀 Next steps:');
    console.log('1. Check the split_chunks folder');
    console.log('2. Run import script on individual chunks');
    console.log('3. Or process chunks one by one');
  } else {
    console.log('\n❌ File splitting failed. Check the error above.');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { splitCSVFile };
