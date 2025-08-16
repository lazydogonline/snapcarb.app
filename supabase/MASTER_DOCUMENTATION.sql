-- ============================================================================
-- 🥕 SNAPCARB MASTER DOCUMENTATION
-- ============================================================================
-- 
-- This file contains the complete documentation of the SnapCarb system
-- including database schema, business logic, and affiliate system.
-- 
-- Created: 2025-01-15
-- Purpose: Complete system documentation for AI assistants and developers
-- 
-- ============================================================================

-- ============================================================================
-- 📋 SYSTEM OVERVIEW
-- ============================================================================
/*
SnapCarb is a React Native/Expo mobile application for tracking nutrition,
recipes, and health metrics. The system includes:

1. USDA Food Database Integration (local, no API limits)
2. Recipe Builder with automatic nutrition calculation
3. Barcode scanning for branded foods
4. Dr. Davis approved affiliate products
5. Health tracking and meal logging
6. Net carb calculations (carbs - fiber - sugar alcohols)

Key Technologies:
- Frontend: React Native with Expo
- Database: Supabase (PostgreSQL)
- Data Source: USDA Food Data Central (downloaded CSV files)
- Affiliate System: Amazon Associates (lazydogonline-20 tag)
*/

-- ============================================================================
-- 🗄️ DATABASE SCHEMA OVERVIEW
-- ============================================================================

-- Core USDA Tables (for food lookup and nutrition)
-- nutrients: Nutrient definitions (energy, protein, fat, carbs, fiber, etc.)
-- foods: Basic food descriptions (carrots, potatoes, etc.)
-- branded_foods: Packaged products with barcodes (UPC/GTIN)
-- food_nutrients: Nutrition data linking foods to nutrients

-- Recipe System Tables
-- recipes: User-created recipes with names and serving counts
-- recipe_ingredients: Ingredients in recipes with weights (grams)

-- Views for Nutrition Calculations
-- v_food_macros_100g: Macros per 100g for all foods
-- v_food_macros_serving: Macros per actual serving for branded foods
-- v_recipe_totals: Total and per-serving nutrition for recipes

-- ============================================================================
-- 🔍 KEY FUNCTIONS AND THEIR PURPOSE
-- ============================================================================

/*
search_foods(search_term TEXT)
- Purpose: Search foods by description (e.g., 'almond milk')
- Returns: Matching foods with fdc_id and description
- Usage: Food search in recipe builder

get_food_macros_100g(food_fdc_id BIGINT)
- Purpose: Get nutrition per 100g for any food
- Returns: Calories, protein, fat, carbs, fiber, net carbs
- Usage: Recipe nutrition calculation

get_branded_food_macros(food_fdc_id BIGINT)
- Purpose: Get nutrition per actual serving for branded foods
- Returns: Nutrition adjusted for package serving size
- Usage: Barcode scanner results

lookup_food_by_barcode(barcode TEXT)
- Purpose: Find branded food by UPC/GTIN barcode
- Returns: Product info, nutrition, and ingredients
- Usage: Barcode scanner functionality
*/

-- ============================================================================
-- 🏷️ BARCODE SYSTEM EXPLANATION
-- ============================================================================
/*
The barcode system handles both 12-digit UPC-A and 13-digit EAN-13 formats:

1. User scans barcode with camera (or enters manually)
2. System tries multiple formats:
   - Original barcode as-is
   - With leading zero added (for 12→13 digit conversion)
   - With leading zero removed (for 13→12 digit conversion)
3. Queries branded_foods table using gtin_upc field
4. Returns product description, nutrition, and ingredients
5. Calculates net carbs automatically

Net Carb Formula: total_carbs - fiber - sugar_alcohols
*/

-- ============================================================================
-- 📚 RECIPE SYSTEM EXPLANATION
-- ============================================================================
/*
Recipe creation and nutrition calculation:

1. User creates recipe with name and serving count
2. Adds ingredients by selecting foods and specifying grams
3. System calculates total nutrition using v_food_macros_100g
4. Nutrition is scaled by actual grams used (not just 100g)
5. Per-serving nutrition is calculated automatically
6. Net carbs are calculated for each ingredient and total

Example:
- Recipe: "Chicken Salad" (2 servings)
- Ingredients: 100g chicken breast, 50g mixed greens
- System calculates: 100g chicken nutrition + 50g greens nutrition
- Total nutrition ÷ 2 servings = per-serving nutrition
*/

-- ============================================================================
-- 🛒 AFFILIATE SYSTEM DOCUMENTATION
-- ============================================================================
/*
Dr. Davis Approved Products - Amazon Associates Integration

Affiliate Tag: lazydogonline-20
Categories:
1. Books (5 products)
   - Wheat Belly (Revised and Expanded Edition)
   - Super Gut
   - Undoctored
   - Wheat Belly 10-Day Grain Detox
   - Wheat Belly Total Health

2. Fermentation Gear (3 products)
   - Luvelle Yogurt Maker
   - Sous Vide Precision Cooker
   - Sous Vide Water Bath Container

3. BiotiQuest Probiotics (4 products)
   - Sugar Shift Probiotics
   - Simple Slumber Probiotics
   - Ideal Immunity Probiotics
   - Antibiotic Antidote Probiotics

4. Probiotics & Supplements (6 products)
   - Florastor Daily Probiotic (100 ct)
   - Jarrow Formulas Jarro-Dophilus
   - Jarrow Ideal Bowel Support
   - Jarrow Fem-Dophilus Advanced
   - Oxiceutics MyReuteri Probiotic
   - Oxiceutics MyReuteri (Foundational Strength)

5. Prebiotics & Fibers (1 product)
   - It's Just! Inulin Prebiotic Fiber (Chicory Root)

Implementation:
- Component: DrDavisAffiliates.tsx
- Tab: "Products" in main navigation
- Direct Amazon linking with affiliate tags
- Professional UI with category organization
*/

-- ============================================================================
-- 🔧 TECHNICAL IMPLEMENTATION NOTES
-- ============================================================================

/*
File Structure:
/components/DrDavisAffiliates.tsx - Main affiliate component
/app/(tabs)/dr-davis-products.tsx - Products tab screen
/app/(tabs)/_layout.tsx - Tab navigation (includes Products tab)
/scripts/import-csv-data.ts - USDA data import script
/scripts/test-database.ts - Database testing script
/supabase/schema.sql - Complete database schema

Environment Variables Required:
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

USDA Data Files Location:
/USDA FOOD IMPORT/FoodData_Central_csv_2025-04-24/
- nutrient.csv (~479 rows)
- food.csv (~206MB, ~1.1-1.3M rows)
- branded_food.csv (~896MB, ~400k-600k rows)
- food_nutrient.csv (~1.6GB, tens of millions rows)

Import Process:
1. Run supabase/schema.sql to create tables
2. Place CSV files in data folder
3. Run: npx tsx scripts/import-csv-data.ts
4. Test with: npx tsx scripts/test-database.ts
*/

-- ============================================================================
-- 🚀 NEXT STEPS FOR DEVELOPMENT
-- ============================================================================
/*
Immediate Tasks:
1. Import USDA CSV data using the import script
2. Test database functionality with test script
3. Verify barcode scanning works with real data
4. Test recipe creation and nutrition calculation

Future Enhancements:
1. Implement camera-based barcode scanning
2. Add ingredient classification (red/green system)
3. Build meal tracking and daily nutrition goals
4. Add user authentication and personal data
5. Implement offline data caching
6. Add food favorites and recent searches

Performance Considerations:
- Large tables (food_nutrient.csv is 1.6GB)
- Indexes are created automatically for common queries
- Views pre-calculate nutrition for faster lookups
- Batch processing for data import (1000 rows at a time)
*/

-- ============================================================================
-- 🆘 TROUBLESHOOTING GUIDE
-- ============================================================================
/*
Common Issues and Solutions:

1. "Table doesn't exist"
   - Solution: Run supabase/schema.sql first

2. "Function doesn't exist"
   - Solution: Check that all functions were created in schema

3. "Permission denied"
   - Solution: Verify RLS policies are set correctly

4. "View doesn't exist"
   - Solution: Ensure views were created after importing data

5. Import failures
   - Check CSV file paths and format
   - Verify Supabase environment variables
   - Check for memory issues with large files

6. Barcode lookup not working
   - Verify branded_foods table has data
   - Check gtin_upc field format
   - Test with known valid barcodes
*/

-- ============================================================================
-- 📞 SUPPORT AND MAINTENANCE
-- ============================================================================
/*
Database Maintenance:
- USDA data is updated twice yearly
- Branded foods table should be refreshed regularly
- Monitor table sizes and performance
- Regular backup of user data (recipes, etc.)

Monitoring:
- Check import script logs for errors
- Monitor Supabase dashboard for performance
- Test barcode lookup functionality regularly
- Verify affiliate links are working

Updates:
- Keep USDA data current
- Monitor for new Dr. Davis products
- Update affiliate links as needed
- Maintain compatibility with app updates
*/

-- ============================================================================
-- 🎯 BUSINESS LOGIC SUMMARY
-- ============================================================================
/*
Core Value Proposition:
1. Eliminate USDA API limits (1000 queries/month)
2. Provide instant nutrition lookup for any food
3. Enable barcode scanning for packaged products
4. Build recipes with automatic nutrition calculation
5. Track net carbs accurately (keto-friendly)
6. Monetize through Dr. Davis affiliate products

User Journey:
1. Search for foods or scan barcodes
2. Get instant nutrition information
3. Build recipes with accurate macros
4. Track daily nutrition goals
5. Discover Dr. Davis approved products
6. Purchase through affiliate links

Revenue Streams:
1. Amazon Associates commissions (4-8% typically)
2. Premium features (future)
3. Sponsored content (future)
4. Health coaching (future)
*/

-- ============================================================================
-- 🔐 SECURITY AND PRIVACY
-- ============================================================================
/*
Data Protection:
- User recipes are private (RLS enabled)
- Food database is public (USDA data)
- No personal health data stored without consent
- Affiliate links are transparent and disclosed

Compliance:
- Follow Amazon Associates program guidelines
- Disclose affiliate relationships clearly
- Respect user privacy preferences
- Secure API keys and credentials
*/

-- ============================================================================
-- 📊 PERFORMANCE METRICS
-- ============================================================================
/*
Key Performance Indicators:
1. Database query response time (<100ms for food lookup)
2. Barcode scan success rate (>95%)
3. Recipe calculation accuracy (100% for valid data)
4. Affiliate link click-through rate
5. User engagement with nutrition features

Optimization Targets:
- Food search: <50ms response time
- Barcode lookup: <100ms response time
- Recipe calculation: <200ms response time
- Import process: <30 minutes for full dataset
*/

-- ============================================================================
-- 🎉 CONCLUSION
-- ============================================================================
/*
SnapCarb represents a comprehensive solution for:
- Eliminating API dependency and costs
- Providing instant nutrition information
- Building accurate recipe nutrition tracking
- Monetizing through trusted affiliate products
- Creating a foundation for health and wellness features

The system is designed to be:
- Scalable (handles millions of food records)
- Fast (optimized queries and views)
- Reliable (local data, no external API failures)
- Profitable (affiliate revenue model)
- User-friendly (intuitive interface and workflow)

This documentation should provide any AI assistant or developer
with complete understanding of the system architecture, business
logic, and implementation details.
*/

-- End of Master Documentation


