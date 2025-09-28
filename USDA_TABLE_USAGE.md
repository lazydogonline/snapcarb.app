# Snap Card App: USDA Food Data Central Database Documentation

This document provides a clear understanding of the USDA FoodData Central database schema as it relates to the Snap Card application. It includes explanations of key table relationships and provides example SQL queries for common tasks.

## 1. Database Schema and Table Relationships

The USDA database is structured into multiple interconnected tables to avoid data redundancy and provide flexibility. The core tables for our application are:

- **food**: The primary table containing a broad list of food items. It includes a dataType column that categorizes each item (e.g., 'branded food', 'survey (FNDDS)'). This table is the starting point for all food searches.

- **branded_food**: A separate, specialized table that contains additional, detailed information only for items where food.dataType is 'branded food'. This includes details like brand_owner and ingredients.

- **food_nutrient**: A "linking" or "junction" table that connects food items to their nutritional values. A single food item can have many nutrients, and this table stores each nutrient's amount.

- **nutrient**: A lookup table that defines what each nutrient is. It contains the nutrient name (e.g., 'Protein', 'Total lipid (fat)') and its unit_name (e.g., 'g').

These tables are linked using unique identifiers (fdc_id and id):
- food.fdc_id links to branded_food.fdc_id.
- food.fdc_id links to food_nutrient.fdc_id.
- food_nutrient.nutrient_id links to nutrient.id.

## 2. SQL Queries for the Application

The following queries are essential for the application. They are optimized to retrieve specific types of data based on user intent.

### Query 1: Search for Branded Food Items
This query finds a food item and retrieves all of its branded details by joining the food and branded_food tables.

```sql
-- Purpose: To get detailed information for a branded food item.
-- Use this when a user's search intent is to find a specific brand (e.g., "Kellogg's Corn Flakes").

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

-- Example: Replace [search_term] with 'Kellogg's Corn Flakes'
```

### Query 2: Search for Whole/Unbranded Food Items
This query finds a food item and specifically excludes any branded items. This is a simple and efficient search.

```sql
-- Purpose: To search for unbranded or whole food items (e.g., "pork chop", "apple").
-- Use this when a user's search intent is generic and not brand-specific.

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
This query is the most complex, as it links three tables to retrieve all nutritional data for a given food.

```sql
-- Purpose: To retrieve the full nutritional breakdown for a specific food item.
-- Use this after a user has selected a food item from a search result to display its nutritional facts.

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
-- Get this ID from the previous search query's result.
```

### Query 4: Get Specific Macronutrients for a Food Item
This query is a variation of the above, tailored to get just the core macronutrients (Protein, Fat, Carbs) for a selected item.

```sql
-- Purpose: To get specific macronutrient data for a selected food item.
-- This is useful for displaying a quick summary of P/C/F.

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

## Key Points for Implementation

1. **Text Search**: Use Query 2 to exclude branded foods
2. **Barcode Scan**: Use Query 1 to find branded products
3. **Nutrition Lookup**: Use Query 3 or 4 to get nutrition data
4. **Table Relationships**: Always join through the correct foreign keys
5. **Data Type Filtering**: Use `data_type != 'branded food'` for real foods
