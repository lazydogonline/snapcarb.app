// Dr. Davis Products - Easy to edit and add new products
// Just add new lines with product names and your Amazon affiliate links

export interface DrDavisProduct {
  name: string;
  amazonLink: string;
  isDrDavisProduct?: boolean; // Only true for Dr. Davis books and Oxiceutics
}

export interface DrDavisCategory {
  name: string;
  products: DrDavisProduct[];
}

export const drDavisProducts: DrDavisCategory[] = [
  {
    name: 'Books',
    products: [
      { name: "Wheat Belly (Revised and Expanded Edition)", amazonLink: "https://www.amazon.com/dp/1984824945?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Super Gut", amazonLink: "https://www.amazon.com/dp/0316333496?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Undoctored", amazonLink: "https://www.amazon.com/dp/0451493984?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Wheat Belly 10-Day Grain Detox", amazonLink: "https://www.amazon.com/dp/1623366360?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Wheat Belly Total Health", amazonLink: "https://www.amazon.com/dp/1623364082?tag=lazydogonline-20", isDrDavisProduct: true },
      // ADD NEW BOOKS HERE - just copy/paste the format above
    ]
  },
  {
    name: 'Fermentation Gear',
    products: [
      { name: "Luvelle Yogurt Maker", amazonLink: "https://www.amazon.com/dp/B009S77NLA?tag=lazydogonline-20" },
      { name: "Sous Vide Precision Cooker", amazonLink: "https://www.amazon.com/dp/B00UKPBXM4?tag=lazydogonline-20" },
      { name: "Sous Vide Water Bath Container", amazonLink: "https://www.amazon.com/dp/B01M8MMLBI?tag=lazydogonline-20" },
      { name: "Masontops Complete Mason Jar Fermentation Kit", amazonLink: "https://www.amazon.com/Masontops-Complete-Mason-Jar-Fermentation/dp/B01H7GI7V8?tag=lazydogonline-20" },
      // ADD NEW FERMENTATION GEAR HERE
    ]
  },
  {
    name: 'BiotiQuest Probiotics',
    products: [
      { name: "Sugar Shift Probiotics", amazonLink: "https://www.amazon.com/dp/B0B1NTMS9R?tag=lazydogonline-20" },
      { name: "Simple Slumber Probiotics", amazonLink: "https://www.amazon.com/dp/B0BHTKR2PF?tag=lazydogonline-20" },
      { name: "Ideal Immunity Probiotics", amazonLink: "https://www.amazon.com/dp/B0B1NYJPDM?tag=lazydogonline-20" },
      { name: "Antibiotic Antidote Probiotics", amazonLink: "https://www.amazon.com/dp/B0B1NYZJX2?tag=lazydogonline-20" },
      // ADD NEW BIOTIQUEST PRODUCTS HERE
    ]
  },
  {
    name: 'Gut Health & Supplements',
    products: [
      { name: "Florastor Daily Probiotic (100 ct)", amazonLink: "https://www.amazon.com/dp/B01NB0G1V8?tag=lazydogonline-20" },
      { name: "Jarrow Formulas Jarro-Dophilus", amazonLink: "https://www.amazon.com/dp/B0013OUKTS?tag=lazydogonline-20" },
      { name: "Jarrow Ideal Bowel Support", amazonLink: "https://www.amazon.com/dp/B00O4BPX9O?tag=lazydogonline-20" },
      { name: "Jarrow Fem-Dophilus Advanced", amazonLink: "https://www.amazon.com/dp/B0BP4371FK?tag=lazydogonline-20" },
      { name: "Oxiceutics MyReuteri Probiotic", amazonLink: "https://www.amazon.com/dp/B0BXFXZLZP?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Oxiceutics MyReuteri (Foundational Strength)", amazonLink: "https://www.amazon.com/dp/B0FBQQW4M1?tag=lazydogonline-20", isDrDavisProduct: true },
      { name: "Oxiceutics MyCrispatus™", amazonLink: "https://www.amazon.com/dp/B0FMQZMV3V?tag=lazydogonline-20", isDrDavisProduct: true },
      // ADD NEW PROBIOTICS & SUPPLEMENTS HERE
    ]
  },
  {
    name: 'Prebiotics & Fibers',
    products: [
      { name: "It's Just! Inulin Prebiotic Fiber (Chicory Root)", amazonLink: "https://www.amazon.com/dp/B085LV5ZSZ?tag=lazydogonline-20" },
      // ADD NEW PREBIOTICS & FIBERS HERE
    ]
  },
  // ADD NEW CATEGORIES HERE - just copy/paste the format above
];

// HOW TO ADD NEW PRODUCTS:
// 1. Find the category you want to add to
// 2. Add a new line like this:
//    { name: "Product Name", amazonLink: "https://amzn.to/yourcode" }
// 3. Save the file
// 4. Your app automatically shows the new product!

// HOW TO ADD NEW CATEGORIES:
// 1. Copy this format:
//    {
//      name: 'New Category Name',
//      products: [
//        { name: "First Product", amazonLink: "https://amzn.to/yourcode" },
//        // Add more products...
//      ]
//    }
// 2. Paste it at the end of the array
// 3. Save the file
// 4. Your app automatically shows the new category!
