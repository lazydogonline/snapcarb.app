# USDA API Setup Guide

## 🍎 **Get Real Nutrition Data (No More Mock Data!)**

The SnapCarb app now uses the **USDA Food Data Central API** to provide accurate, government-verified nutrition information for all recipes and ingredients.

### **What This Gives You:**
- ✅ **Real nutrition data** instead of estimates
- ✅ **Accurate net carbs** for SnapCarb compliance
- ✅ **Government-verified** food database
- ✅ **300,000+ foods** with detailed nutrition
- ✅ **Free to use** (with API key)

---

## 🚀 **Setup Steps (Takes 2 Minutes):**

### **Step 1: Get USDA API Key**
1. Go to: https://fdc.nal.usda.gov/api-key-signup.html
2. Fill out the simple form (name, email, organization)
3. Click "Submit"
4. Check your email for the API key
5. Copy the key (it looks like: `DEMO_KEY` or a long string)

### **Step 2: Add to Environment**
1. Open your `.env` file in the project root
2. Add this line:
   ```
   EXPO_PUBLIC_USDA_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual key

### **Step 3: Restart App**
1. Stop your Expo development server
2. Run `npm start` again
3. The app will now use real USDA data!

---

## 🔧 **How It Works:**

### **Recipe Generation:**
1. **AI creates recipe** with ingredients and amounts
2. **USDA API looks up** each ingredient
3. **Calculates real nutrition** based on amounts
4. **Shows accurate net carbs** per serving

### **Example:**
- **Ingredient:** "100g grass-fed beef"
- **USDA Lookup:** Searches for "beef" in database
- **Real Data:** 0g net carbs, 26g protein, 15g fat
- **Recipe Total:** Accurate nutrition for entire dish

---

## 📊 **Data Quality:**

### **What You Get:**
- **Net Carbs:** Total carbs minus fiber
- **Protein:** Grams per serving
- **Fat:** Grams per serving
- **Calories:** Accurate energy content
- **Fiber:** Dietary fiber content

### **Accuracy:**
- **Government verified** data
- **Updated regularly** with research
- **Scientific measurements** (not estimates)
- **Professional grade** for health apps

---

## 🚨 **Troubleshooting:**

### **If API Key Doesn't Work:**
1. **Check format:** No spaces around the `=`
2. **Restart app:** Stop and start Expo server
3. **Verify key:** Copy-paste from email exactly
4. **Check .env location:** Must be in project root

### **Fallback Behavior:**
- If USDA API fails, app uses estimated values
- App continues to work normally
- Error logged to console for debugging

---

## 🎯 **Benefits for SnapCarb:**

### **For Users:**
- **Trust the numbers** - government-verified data
- **Accurate carb tracking** for diet compliance
- **Professional quality** nutrition information
- **No more guessing** about food values

### **For App:**
- **Differentiates from competitors** using estimates
- **Professional credibility** with real data
- **Better user experience** with accurate info
- **Foundation for advanced features**

---

## 🔮 **Future Enhancements:**

### **Planned Features:**
- **Barcode scanning** with USDA lookup
- **Ingredient search** in USDA database
- **Nutrition comparison** between brands
- **Allergen information** from USDA
- **Sustainability data** for food choices

---

**🎉 That's it! Your SnapCarb app will now show real, accurate nutrition data instead of mock values.**




