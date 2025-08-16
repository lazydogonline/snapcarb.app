# 🚀 SNAPCARB - AI QUICK START GUIDE

## ⚡ 2-MINUTE OVERVIEW

**SnapCarb** is a React Native nutrition app that eliminates USDA API limits by storing food data locally in Supabase. Users can scan barcodes, build recipes, and buy Dr. Davis approved products through affiliate links.

## 🎯 CORE FEATURES

1. **Local USDA Database** - No API limits, instant food lookup
2. **Barcode Scanning** - Scan any food package for nutrition
3. **Recipe Builder** - Create recipes with automatic macro calculation
4. **Affiliate System** - Dr. Davis products with Amazon Associates (lazydogonline-20 tag)
5. **Net Carb Tracking** - Accurate keto-friendly calculations

## 🗄️ DATABASE STRUCTURE

```
nutrients → foods → food_nutrients → v_food_macros_100g
                ↓
        branded_foods → v_food_macros_serving
                ↓
        recipes + recipe_ingredients → v_recipe_totals
```

## 🔑 KEY FILES

- **`supabase/MASTER_DOCUMENTATION.sql`** - Complete system documentation
- **`supabase/schema.sql`** - Database schema with tables, views, functions
- **`components/DrDavisAffiliates.tsx`** - Affiliate products component
- **`scripts/import-csv-data.ts`** - USDA data import script
- **`scripts/test-database.ts`** - Database testing script

## 🚀 IMMEDIATE ACTIONS NEEDED

1. **Import USDA Data**: Run `npx tsx scripts/import-csv-data.ts`
2. **Test Database**: Run `npx tsx scripts/test-database.ts`
3. **Verify App**: Check that Products tab shows affiliate links

## 💰 AFFILIATE PRODUCTS

**5 Categories, 19 Products:**
- **Books**: Wheat Belly, Super Gut, Undoctored, etc.
- **Fermentation Gear**: Yogurt maker, sous vide equipment
- **BiotiQuest Probiotics**: 4 specific probiotic products
- **Probiotics & Supplements**: 6 products from various brands
- **Prebiotics & Fibers**: Inulin fiber

## 🔍 KEY FUNCTIONS

- `search_foods()` - Food search
- `get_food_macros_100g()` - Nutrition per 100g
- `lookup_food_by_barcode()` - Barcode lookup
- `v_recipe_totals` - Recipe nutrition calculation

## 📱 APP STRUCTURE

- **7 Tabs**: Home, Meals, Health, Supplements, Challenge, Events, **Products**
- **Products Tab**: Shows all Dr. Davis affiliate products
- **Barcode Scanner**: Manual entry + camera (future)

## 🚨 COMMON ISSUES

- **App crashes**: Usually BarcodeScanner component issues
- **Import fails**: Check CSV file paths and Supabase credentials
- **Functions missing**: Run schema.sql first

## 💡 BUSINESS MODEL

- **Primary Revenue**: Amazon Associates commissions (4-8%)
- **Value Prop**: Eliminate API costs, provide instant nutrition data
- **Target**: Health-conscious users, keto dieters, recipe builders

## 🔧 TECHNICAL STACK

- **Frontend**: React Native + Expo
- **Database**: Supabase (PostgreSQL)
- **Data**: USDA Food Data Central (local CSV files)
- **Affiliate**: Amazon Associates API

## 📊 DATA VOLUME

- **nutrients**: ~479 rows
- **foods**: ~1.1-1.3M rows
- **branded_foods**: ~400k-600k rows
- **food_nutrients**: Tens of millions rows

## 🎯 NEXT DEVELOPMENT PRIORITIES

1. **Camera Barcode Scanning** - Replace manual entry
2. **Ingredient Classification** - Red/green system for ingredients
3. **Meal Tracking** - Daily nutrition logging
4. **User Authentication** - Personal data and preferences

---

**Need more details?** Check `supabase/MASTER_DOCUMENTATION.sql` for complete system documentation.

**Ready to code?** Start with the import script and test the database functionality.


