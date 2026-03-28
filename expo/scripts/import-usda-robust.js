const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createStagingTable() {
  console.log('🔄 Creating staging table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS staging_food_nutrient (
        id text,
        fdc_id text,
        nutrient_id text,
        amount text,
        data_points text,
        derivation_id text,
        min text,
        max text,
        median text,
        loq text,
        footnote text,
        min_year_acquired text,
        percent_daily_value text
      );
      
      -- Drop existing final table if it exists
      DROP TABLE IF EXISTS public.food_nutrient CASCADE;
      
      -- Create the final table with proper schema
      CREATE TABLE public.food_nutrient (
        id bigserial primary key,
        fdc_id int not null,
        nutrient_id int not null,
        amount numeric,
        data_points int,
        derivation_id int,
        min numeric,
        max numeric,
        median numeric,
        loq numeric,
        footnote text,
        min_year_acquired int,
        percent_daily_value numeric
      );
      
      -- Create unique index on the combination that matters
      CREATE UNIQUE INDEX IF NOT EXISTS ux_food_nutrient 
      ON public.food_nutrient (fdc_id, nutrient_id);
    `
  });
  
  if (error) {
    console.error('❌ Error creating tables:', error);
    return false;
  }
  
  console.log('✅ Tables created successfully');
  return true;
}

async function importToStaging(csvPath, batchSize = 1000) {
  console.log(`🔄 Importing CSV to staging table: ${csvPath}`);
  
  const results = [];
  let batch = [];
  let totalProcessed = 0;
  let totalImported = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        batch.push({
          id: row.id || '',
          fdc_id: row.fdc_id || '',
          nutrient_id: row.nutrient_id || '',
          amount: row.amount || '',
          data_points: row.data_points || '',
          derivation_id: row.derivation_id || '',
          min: row.min || '',
          max: row.max || '',
          median: row.median || '',
          loq: row.loq || '',
          footnote: row.footnote || '',
          min_year_acquired: row.min_year_acquired || '',
          percent_daily_value: row.percent_daily_value || ''
        });
        
        if (batch.length >= batchSize) {
          processBatch(batch);
          batch = [];
        }
      })
      .on('end', async () => {
        // Process remaining batch
        if (batch.length > 0) {
          await processBatch(batch);
        }
        
        console.log(`\n📊 Import Summary:`);
        console.log(`Total processed: ${totalProcessed}`);
        console.log(`Total imported: ${totalImported}`);
        resolve({ totalProcessed, totalImported });
      })
      .on('error', reject);
  });
  
  async function processBatch(batch) {
    try {
      const { error } = await supabase
        .from('staging_food_nutrient')
        .insert(batch);
      
      if (error) {
        console.error('❌ Batch insert error:', error);
        return;
      }
      
      totalProcessed += batch.length;
      totalImported += batch.length;
      
      if (totalProcessed % 5000 === 0) {
        console.log(`✅ Processed ${totalProcessed} records...`);
      }
    } catch (err) {
      console.error('❌ Error processing batch:', err);
    }
  }
}

async function migrateToFinalTable() {
  console.log('🔄 Migrating from staging to final table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      INSERT INTO public.food_nutrient (
        fdc_id, nutrient_id, amount, data_points, derivation_id, 
        min, max, median, loq, footnote, min_year_acquired, percent_daily_value
      )
      SELECT DISTINCT ON (fdc_id, nutrient_id)
        NULLIF(fdc_id, '')::int as fdc_id,
        NULLIF(nutrient_id, '')::int as nutrient_id,
        NULLIF(amount, '')::numeric as amount,
        NULLIF(data_points, '')::int as data_points,
        NULLIF(derivation_id, '')::int as derivation_id,
        NULLIF(min, '')::numeric as min,
        NULLIF(max, '')::numeric as max,
        NULLIF(median, '')::numeric as median,
        NULLIF(loq, '')::numeric as loq,
        NULLIF(footnote, '') as footnote,
        NULLIF(min_year_acquired, '')::int as min_year_acquired,
        NULLIF(percent_daily_value, '')::numeric as percent_daily_value
      FROM staging_food_nutrient
      WHERE fdc_id != '' AND nutrient_id != ''
      ORDER BY fdc_id, nutrient_id, data_points DESC NULLS LAST;
    `
  });
  
  if (error) {
    console.error('❌ Error migrating to final table:', error);
    return false;
  }
  
  console.log('✅ Migration completed successfully');
  return true;
}

async function cleanup() {
  console.log('🧹 Cleaning up staging table...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'DROP TABLE IF EXISTS staging_food_nutrient;'
  });
  
  if (error) {
    console.error('❌ Error cleaning up:', error);
    return false;
  }
  
  console.log('✅ Cleanup completed');
  return true;
}

async function main() {
  try {
    console.log('🚀 Starting robust USDA import...');
    
    // Check if CSV file exists
    const csvPath = './USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/food_nutrient.csv';
    if (!fs.existsSync(csvPath)) {
      console.error('❌ CSV file not found:', csvPath);
      return;
    }
    
    // Step 1: Create tables
    if (!(await createStagingTable())) {
      return;
    }
    
    // Step 2: Import to staging
    const importResult = await importToStaging(csvPath);
    if (!importResult) {
      return;
    }
    
    // Step 3: Migrate to final table
    if (!(await migrateToFinalTable())) {
      return;
    }
    
    // Step 4: Cleanup
    await cleanup();
    
    console.log('🎉 USDA import completed successfully!');
    console.log(`📊 Final result: ${importResult.totalImported} records imported`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
