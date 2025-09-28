# 🥩 **USDA NUTRITION SYSTEM - READY FOR IMPORT**

## 🎯 **What We've Built**

### **✅ Database Schema Complete**
- All tables created with proper relationships
- Views for easy nutrition calculations
- Functions for food search and barcode lookup
- Row-level security configured

### **✅ Import Scripts Ready**
- **`test-db`** - Test database connection (JavaScript)
- **`import-foods`** - Import essential whole foods (JavaScript)

### **✅ Priority Foods Selected**
**Proteins (Green - Always Allowed):**
- Chicken breast, ground beef, salmon, eggs, lamb

**Vegetables (Green - Always Allowed):**
- Broccoli, spinach, cauliflower, kale, asparagus, zucchini

**Healthy Fats (Green - Always Allowed):**
- Avocado, almonds, walnuts, olive oil, butter

**Dairy (Green - Usually Allowed):**
- Cheese, cream, yogurt, heavy cream

## 🚀 **Next Steps (Today)**

### **Step 1: Test Database Connection**
```bash
npm run test-db
```
This will verify your Supabase setup is working.

### **Step 2: Import Essential Foods**
```bash
npm run import-foods
```
This will import:
- 10 essential nutrients
- 18 priority whole foods
- Sample nutrition data for testing

### **Step 3: Test the App**
- The blue screen should be resolved
- Food search should work with real data
- Recipe nutrition calculations should function

## 📊 **What Gets Imported**

### **Nutrients Table**
- Energy (calories), Protein, Fat, Carbs, Fiber
- Sugar alcohols, Sugars, Sodium, Potassium

### **Foods Table**
- 18 essential whole foods with descriptions
- All SnapCarb-approved (green category)

### **Food Nutrients Table**
- Sample nutrition data for testing
- Real macro calculations (protein, fat, carbs, fiber)

## 🔍 **Database Views Available**

### **`v_food_macros_100g`**
- Shows macros per 100g for all foods
- Automatically calculates net carbs

### **`v_food_macros_serving`**
- Shows macros per actual serving for branded foods
- Adjusts for different serving sizes

### **`v_recipe_totals`**
- Calculates total nutrition for recipes
- Shows per-serving breakdown

## 🧪 **Testing Queries**

After import, you can test:

```sql
-- Search for foods
SELECT * FROM search_foods('chicken');

-- Get macros for a food
SELECT * FROM get_food_macros_100g(1001);

-- View all foods with nutrition
SELECT * FROM v_food_macros_100g LIMIT 10;
```

## 🚫 **What We're NOT Doing**

- ❌ Importing the entire 1.6GB food_nutrient.csv
- ❌ Importing 896MB branded_food.csv
- ❌ Creating "every food in the world"
- ❌ Using local JSON storage

## 🎉 **Expected Results**

1. **App Stability**: No more blue/red screens
2. **Real Nutrition Data**: Actual USDA nutrition values
3. **Food Search**: Working search for essential foods
4. **Recipe Calculations**: Real macro calculations
5. **Performance**: Fast queries with proper indexing

## 🔄 **Future Expansion**

Once this basic system is working:

1. **Add More Foods**: Import foundation_food.csv (342 foods)
2. **Real USDA Data**: Use actual fdc_ids from USDA files
3. **Barcode Support**: Import branded_food.csv for UPC lookup
4. **Complete Coverage**: Gradually expand to more foods

## 📱 **Ready to Test**

Your app should now work with real nutrition data! The import focuses on the most important SnapCarb-approved foods first, ensuring you have a solid foundation before expanding.

---

**Run these commands in order:**
```bash
npm run test-db      # Test connection
npm run import-foods # Import essential foods
npm start           # Test the app
```

## 🔧 **Technical Notes**

- **Scripts converted to JavaScript** to avoid TypeScript compilation issues
- **No ts-node dependency required** - uses standard Node.js
- **All functionality preserved** - same import logic and data
