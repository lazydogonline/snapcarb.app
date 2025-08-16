# 🥕 SnapCarb USDA Food Database Setup

This guide will help you set up a complete food tracking system using USDA data, eliminating the need for API calls and providing instant nutrition information for any food.

## 🎯 What We're Building

- **Instant Food Lookup**: Search any ingredient by name
- **Barcode Scanning**: Scan any food package for instant nutrition
- **Recipe Builder**: Create recipes with automatic nutrition calculation
- **Net Carb Tracking**: Accurate net carb calculations (carbs - fiber - sugar alcohols)

## 📋 Prerequisites

1. **Supabase Project**: You need a Supabase project with your environment variables set
2. **USDA CSV Files**: Download the following files from USDA:
   - `food.csv` (~1.1-1.3M rows) - Basic food descriptions
   - `branded_food.csv` (~400k-600k rows) - Packaged products with barcodes
   - `nutrients.csv` (~200-300 rows) - Nutrient definitions
   - `food_nutrient.csv` (~tens of millions rows) - Nutrition data for each food

## 🚀 Setup Steps

### Step 1: Run the Database Schema

1. Go to your Supabase dashboard → SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to create all tables, views, and functions

This creates:
- Core USDA tables (`nutrients`, `foods`, `branded_foods`, `food_nutrients`)
- Recipe tables (`recipes`, `recipe_ingredients`)
- Nutrition views (`v_food_macros_100g`, `v_food_macros_serving`, `v_recipe_totals`)
- Helper functions for searching, lookup, and calculations

### Step 2: Download USDA Data

1. Go to [USDA Food Data Central](https://fdc.nal.usda.gov/download-datasets.html)
2. Download the CSV files mentioned above
3. Place them in a `data` folder in your project root

### Step 3: Import the Data

```bash
# Install dependencies
npm install csv-parser

# Run the import script
npx tsx scripts/import-csv-data.ts
```

The script will:
- Import nutrients first (required for views)
- Import basic foods
- Import branded foods with barcodes
- Import food nutrition data
- Create the nutrition views automatically

### Step 4: Test Everything

```bash
# Test the database setup
npx tsx scripts/test-database.ts
```

This will verify:
- All tables have data
- Views are working correctly
- Functions are operational
- Barcode lookup works
- Recipe system functions

## 🔍 How to Use

### 1. Search for Foods

```sql
-- Search for any ingredient
SELECT * FROM search_foods('almond milk');
```

### 2. Get Nutrition for Generic Foods

```sql
-- Get macros per 100g
SELECT * FROM get_food_macros_100g(12345);
```

### 3. Get Nutrition for Branded Foods

```sql
-- Get macros per actual serving
SELECT * FROM get_branded_food_macros(12345);
```

### 4. Lookup by Barcode

```sql
-- Scan any barcode
SELECT * FROM lookup_food_by_barcode('0123456789012');
```

### 5. Build Recipes

```sql
-- Create a recipe
INSERT INTO recipes (name, servings) VALUES ('My Recipe', 4);

-- Add ingredients (in grams)
INSERT INTO recipe_ingredients (recipe_id, fdc_id, grams) VALUES 
  (1, 12345, 100),  -- 100g of food with fdc_id 12345
  (1, 67890, 50);   -- 50g of food with fdc_id 67890

-- Get total nutrition
SELECT * FROM v_recipe_totals WHERE recipe_id = 1;
```

## 🏗️ Database Architecture

```
nutrients (nutrient definitions)
    ↓
foods (basic food descriptions)
    ↓
food_nutrients (nutrition data per food)
    ↓
v_food_macros_100g (calculated macros per 100g)

branded_foods (packaged products)
    ↓
v_food_macros_serving (calculated macros per serving)

recipes + recipe_ingredients
    ↓
v_recipe_totals (calculated recipe nutrition)
```

## 🎯 Key Features

### **Accurate Net Carbs**
- Automatically calculates: `total_carbs - fiber - sugar_alcohols`
- Handles edge cases (negative values become 0)

### **Flexible Serving Sizes**
- Generic foods: per 100g (standardized)
- Branded foods: per actual serving (as listed on package)
- Recipes: per actual grams used

### **Fast Lookups**
- Full-text search with PostgreSQL
- Barcode lookup with UPC/EAN-13 support
- Optimized indexes for performance

### **Recipe Builder**
- Add ingredients by weight (grams)
- Automatic nutrition calculation
- Per-serving breakdowns

## 🚨 Troubleshooting

### Common Issues

1. **"Table doesn't exist"**: Make sure you ran the schema.sql first
2. **"Function doesn't exist"**: Check that all functions were created
3. **"Permission denied"**: Verify RLS policies are set correctly
4. **"View doesn't exist"**: Ensure the views were created after importing data

### Data Import Issues

1. **CSV parsing errors**: Check CSV format and encoding
2. **Memory issues**: The script processes in batches of 1000
3. **Timeout errors**: Large files may take time to import

### Performance Tips

1. **Indexes**: All necessary indexes are created automatically
2. **Batch processing**: Data is imported in 1000-row batches
3. **Views**: Nutrition calculations are pre-computed in views

## 🔮 Next Steps

Once this is working, you can:

1. **Integrate with your app**: Use the helper functions in your React Native code
2. **Add ingredient classification**: Implement the red/green ingredient system
3. **Build meal tracking**: Log daily food intake with automatic nutrition
4. **Create meal plans**: Build weekly meal plans with nutrition goals

## 📞 Support

If you encounter issues:

1. Check the test script output for specific error messages
2. Verify your Supabase environment variables
3. Ensure the CSV files are in the correct format
4. Check that all database objects were created successfully

---

**🎉 You're building something amazing!** This system will give your users instant access to accurate nutrition data for virtually any food, making healthy eating much easier and more accurate.


