# USDA FoodData Central Database Schema Guide
*Based on Gemini's clear explanation for SnapCarb.app*

## Database Structure Overview

The USDA database uses **4 main tables** connected by unique identifiers to avoid data redundancy:

### 1. `food` Table (Primary Table)
- **Purpose**: Contains ALL food items
- **Key Column**: `dataType` - categorizes each food (e.g., 'branded food', 'Foundation', 'SR Legacy')
- **Primary Key**: `fdc_id` - unique identifier for each food
- **Contains**: Basic food info like description, data type

### 2. `branded_food` Table (Specialized Table)
- **Purpose**: Contains detailed info ONLY for branded/processed foods
- **Linked by**: `fdc_id` to the `food` table
- **Contains**: Brand owner, ingredients list, processing details
- **Only accessed when**: `food.dataType = 'branded food'`

### 3. `food_nutrient` Table (Junction Table)
- **Purpose**: Links foods to their nutritional values
- **Linked by**: `fdc_id` to the `food` table
- **Contains**: Nutrient amounts for each food
- **One food can have**: Many nutrients (one-to-many relationship)

### 4. `nutrient` Table (Lookup Table)
- **Purpose**: Defines what each nutrient is
- **Linked by**: `id` to `food_nutrient.nutrient_id`
- **Contains**: Nutrient names (e.g., 'Protein', 'Total lipid (fat)') and units (e.g., 'g', 'mg')

## Table Relationships

```
food.fdc_id ←→ branded_food.fdc_id
     ↓
food.fdc_id ←→ food_nutrient.fdc_id
     ↓
food_nutrient.nutrient_id ←→ nutrient.id
```

## Essential SQL Queries

### Query 1: Search for Branded Food Items
**Purpose**: To get detailed information for a branded food item.  
**Use when**: User wants to find a specific brand (e.g., "Kellogg's Corn Flakes")

```sql
SELECT
  f.fdc_id,
  f.description,
  f.data_type,
  b.brand_owner,
  b.ingredients
FROM
  food AS f
INNER JOIN
  branded_food AS b
ON
  f.fdc_id = b.fdc_id
WHERE
  f.description ILIKE '%[search_term]%'
  AND f.data_type = 'branded food';

-- Example: Replace [search_term] with 'Kellogg''s Corn Flakes'
```

### Query 2: Search for Whole/Unbranded Food Items
**Purpose**: To search for unbranded or whole food items (e.g., "pork chop", "apple").  
**Use when**: User wants generic foods (not brand-specific)

```sql
SELECT
  fdc_id,
  description,
  data_type
FROM
  food
WHERE
  description ILIKE '%[search_term]%'
  AND data_type != 'branded food';

-- Example: Replace [search_term] with 'pork chop'
```

### Query 3: Get All Nutritional Information for a Food Item
**Purpose**: To retrieve the full nutritional breakdown for a specific food item.  
**Use when**: Displaying nutrition facts for any selected food after user selects from search results

```sql
SELECT
  f.description AS food_name,
  n.name AS nutrient_name,
  fn.amount,
  n.unit_name AS nutrient_unit
FROM
  food AS f
INNER JOIN
  food_nutrient AS fn ON f.fdc_id = fn.fdc_id
INNER JOIN
  nutrient AS n ON fn.nutrient_id = n.id
WHERE
  f.fdc_id = [fdc_id];

-- Example: Replace [fdc_id] with the unique ID of the selected food item.
-- Kursor should be able to get this ID from the previous search query's result.
```

### Query 4: Get Specific Macronutrients for a Food Item
**Purpose**: To get specific macronutrient data for a selected food item.  
**Use when**: Quick nutrition summary of P/C/F (Protein, Fat, Carbs)

```sql
SELECT
  f.description AS food_name,
  n.name AS nutrient_name,
  fn.amount,
  n.unit_name AS nutrient_unit
FROM
  food AS f
INNER JOIN
  food_nutrient AS fn ON f.fdc_id = fn.fdc_id
INNER JOIN
  nutrient AS n ON fn.nutrient_id = n.id
WHERE
  f.fdc_id = [fdc_id]
  AND n.name IN ('Protein', 'Total lipid (fat)', 'Carbohydrate, by difference');

-- Example: Replace [fdc_id] with the unique ID of the selected food item.
```

## Implementation Strategy for SnapCarb.app

### 1. Food Search Flow
1. **Search `food` table** for matching descriptions
2. **Get nutrition data** using Query 3 for ALL foods
3. **For branded foods only**: Use Query 1 to get ingredients
4. **Score foods** based on nutrition + ingredients (if branded)

### 2. Key Points
- **All foods** can have nutrition data in `food_nutrient`
- **Only branded foods** have additional info in `branded_food`
- **Use JOINs** to connect the tables properly
- **Start with `food` table** as the primary source

### 3. Common Mistakes to Avoid
- ❌ Don't assume branded foods have no nutrition data
- ❌ Don't forget to JOIN `nutrient` table for nutrient names
- ❌ Don't hardcode nutrient IDs - use names for clarity
- ❌ Don't search `branded_food` table directly - always go through `food` table

## Example: Finding "Steak" Foods

1. **Search food table**: `WHERE description ILIKE '%steak%'`
2. **Get nutrition**: JOIN with `food_nutrient` + `nutrient` for each result
3. **For branded foods**: Also JOIN with `branded_food` to get ingredients
4. **Score each food**: Based on nutrition data and ingredients quality
5. **Return results**: Sorted by SnapCarb score (green → yellow → red)

This approach ensures you get complete information for all food types while respecting the database structure.
