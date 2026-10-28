import type { PoolClient } from "pg";

interface SubCategory {
  name: string;
  slug: string;
}

interface CategoryNode {
  name: string;
  slug: string;
  description: string;
  children?: SubCategory[];
}

/**
 * Top-level categories follow the order, names and slugs used on jiji.com.et.
 * The subcategories are a practical starting set - edit freely.
 */
export const CATEGORY_TREE: CategoryNode[] = [
  {
    name: "Vehicles",
    slug: "vehicles",
    description: "Cars, motorcycles, trucks and vehicle parts",
    children: [
      { name: "Cars", slug: "cars" },
      { name: "Motorcycles & Scooters", slug: "motorcycles-scooters" },
      { name: "Buses & Microbuses", slug: "buses-microbuses" },
      { name: "Trucks & Trailers", slug: "trucks-trailers" },
      { name: "Vehicle Parts & Accessories", slug: "vehicle-parts-accessories" },
      { name: "Heavy Equipment", slug: "heavy-equipment" },
    ],
  },
  {
    name: "Property",
    slug: "real-estate",
    description: "Houses, apartments, land and commercial property",
    children: [
      { name: "Houses & Apartments for Rent", slug: "houses-apartments-for-rent" },
      { name: "Houses & Apartments for Sale", slug: "houses-apartments-for-sale" },
      { name: "Land & Plots for Sale", slug: "land-plots-for-sale" },
      { name: "Commercial Property for Rent", slug: "commercial-property-for-rent" },
      { name: "Commercial Property for Sale", slug: "commercial-property-for-sale" },
      { name: "Short Let Property", slug: "short-let-property" },
    ],
  },
  {
    name: "Phones & Tablets",
    slug: "mobile-phones-tablets",
    description: "Mobile phones, tablets and accessories",
    children: [
      { name: "Mobile Phones", slug: "mobile-phones" },
      { name: "Tablets", slug: "tablets" },
      { name: "Phone & Tablet Accessories", slug: "phone-tablet-accessories" },
      { name: "Smart Watches & Trackers", slug: "smart-watches-trackers" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    description: "Computers, TVs, audio, cameras and more",
    children: [
      { name: "Computers & Laptops", slug: "computers-and-laptops" },
      { name: "TV & DVD Equipment", slug: "tv-dvd-equipment" },
      { name: "Audio & Music Equipment", slug: "audio-music-equipment" },
      { name: "Cameras & Camcorders", slug: "cameras-camcorders" },
      { name: "Video Game Consoles & Accessories", slug: "video-game-consoles" },
      { name: "Computer Accessories", slug: "computer-accessories" },
      { name: "Networking Products", slug: "networking-products" },
      { name: "Printers & Scanners", slug: "printers-scanners" },
      { name: "Security & Surveillance", slug: "security-surveillance" },
    ],
  },
  {
    name: "Home, Furniture & Appliances",
    slug: "home-garden",
    description: "Furniture, appliances and home goods",
    children: [
      { name: "Furniture", slug: "furniture" },
      { name: "Home Appliances", slug: "home-appliances" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances" },
      { name: "Kitchenware & Cookware", slug: "kitchenware-cookware" },
      { name: "Home Accessories", slug: "home-accessories" },
      { name: "Garden Supplies", slug: "garden-supplies" },
      { name: "Lighting", slug: "lighting" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion-and-beauty",
    description: "Clothing, shoes, bags and accessories",
    children: [
      { name: "Clothing", slug: "clothing" },
      { name: "Shoes", slug: "shoes" },
      { name: "Bags", slug: "bags" },
      { name: "Jewelry", slug: "jewelry" },
      { name: "Watches", slug: "watches" },
      { name: "Traditional Clothing", slug: "traditional-clothing" },
      { name: "Wedding Wear", slug: "wedding-wear" },
      { name: "Fashion Accessories", slug: "fashion-accessories" },
    ],
  },
  {
    name: "Beauty & Personal Care",
    slug: "health-and-beauty",
    description: "Makeup, skin care, hair and wellness",
    children: [
      { name: "Makeup", slug: "makeup" },
      { name: "Skin Care", slug: "skin-care" },
      { name: "Hair Beauty", slug: "hair-beauty" },
      { name: "Perfumes & Fragrances", slug: "perfumes-fragrances" },
      { name: "Health & Wellness", slug: "health-wellness" },
      { name: "Bath & Body", slug: "bath-body" },
    ],
  },
  {
    name: "Services",
    slug: "services",
    description: "Professional and personal services",
    children: [
      { name: "Building & Trade Services", slug: "building-trade-services" },
      { name: "Cleaning Services", slug: "cleaning-services" },
      { name: "Computer & IT Services", slug: "it-services" },
      { name: "Driver & Taxi Services", slug: "driver-taxi-services" },
      { name: "Event Planning & Catering", slug: "event-planning-catering" },
      { name: "Moving & Relocation", slug: "moving-relocation" },
      { name: "Tutoring & Lessons", slug: "tutoring-lessons" },
      { name: "Printing & Design", slug: "printing-design" },
    ],
  },
  {
    name: "Repair & Construction",
    slug: "repair-and-construction",
    description: "Building materials, tools and repair supplies",
    children: [
      { name: "Building Materials & Supplies", slug: "building-materials" },
      { name: "Doors, Windows & Flooring", slug: "doors-windows-flooring" },
      { name: "Electrical Equipment", slug: "electrical-equipment" },
      { name: "Plumbing & Water Systems", slug: "plumbing-water-systems" },
      { name: "Tools & Hardware", slug: "tools-hardware" },
      { name: "Paint & Finishing", slug: "paint-finishing" },
    ],
  },
  {
    name: "Commercial Equipment & Tools",
    slug: "office-and-commercial-equipment-tools",
    description: "Equipment for offices, shops and workshops",
    children: [
      { name: "Office Equipment", slug: "office-equipment" },
      { name: "Restaurant & Catering Equipment", slug: "restaurant-catering-equipment" },
      { name: "Salon & Beauty Equipment", slug: "salon-beauty-equipment" },
      { name: "Medical Equipment", slug: "medical-equipment" },
      { name: "Safety Equipment", slug: "safety-equipment" },
      { name: "Stationery & Supplies", slug: "stationery-supplies" },
    ],
  },
  {
    name: "Leisure & Activities",
    slug: "hobbies-art-sport",
    description: "Sports, music, books, art and hobbies",
    children: [
      { name: "Sports Equipment", slug: "sports-equipment" },
      { name: "Fitness Equipment", slug: "fitness-equipment" },
      { name: "Musical Instruments", slug: "musical-instruments" },
      { name: "Books & Games", slug: "books-games" },
      { name: "Arts & Crafts", slug: "arts-crafts" },
      { name: "Camping Gear", slug: "camping-gear" },
    ],
  },
  {
    name: "Babies & Kids",
    slug: "babies-and-kids",
    description: "Children's clothing, toys and baby gear",
    children: [
      { name: "Children's Clothing", slug: "childrens-clothing" },
      { name: "Toys", slug: "toys" },
      { name: "Baby Gear & Equipment", slug: "baby-gear" },
      { name: "Maternity & Pregnancy", slug: "maternity-pregnancy" },
      { name: "Kids' Furniture", slug: "kids-furniture" },
    ],
  },
  {
    name: "Food, Agriculture & Farming",
    slug: "agriculture-and-foodstuff",
    description: "Farm produce, food items and farming equipment",
    children: [
      { name: "Farm Machinery & Equipment", slug: "farm-machinery" },
      { name: "Feeds, Supplements & Seeds", slug: "feeds-seeds" },
      { name: "Fruits & Vegetables", slug: "fruits-vegetables" },
      { name: "Grains & Cereals", slug: "grains-cereals" },
      { name: "Coffee & Spices", slug: "coffee-spices" },
      { name: "Meat & Dairy", slug: "meat-dairy" },
      { name: "Processed Foods", slug: "processed-foods" },
    ],
  },
  {
    name: "Animals & Pets",
    slug: "animals-and-pets",
    description: "Pets, livestock and pet supplies",
    children: [
      { name: "Dogs & Puppies", slug: "dogs-puppies" },
      { name: "Cats & Kittens", slug: "cats-kittens" },
      { name: "Birds", slug: "birds" },
      { name: "Fish", slug: "fish" },
      { name: "Livestock & Poultry", slug: "livestock-poultry" },
      { name: "Pet Accessories", slug: "pet-accessories" },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    description: "Job vacancies",
    children: [
      { name: "Accounting & Finance Jobs", slug: "jobs-accounting-finance" },
      { name: "Admin & Office Jobs", slug: "jobs-admin-office" },
      { name: "Construction & Skilled Trade Jobs", slug: "jobs-construction-trades" },
      { name: "Customer Service Jobs", slug: "jobs-customer-service" },
      { name: "Driver & Logistics Jobs", slug: "jobs-driver-logistics" },
      { name: "Education & Training Jobs", slug: "jobs-education-training" },
      { name: "Engineering & Architecture Jobs", slug: "jobs-engineering-architecture" },
      { name: "Healthcare & Pharma Jobs", slug: "jobs-healthcare-pharma" },
      { name: "Hospitality & Tourism Jobs", slug: "jobs-hospitality-tourism" },
      { name: "IT & Software Jobs", slug: "jobs-it-software" },
      { name: "Sales & Marketing Jobs", slug: "jobs-sales-marketing" },
      { name: "Other Jobs", slug: "jobs-other" },
    ],
  },
  {
    name: "Seeking Work - CVs",
    slug: "seeking-work-cvs",
    description: "CVs from people looking for work",
  },
  {
    name: "Business & Industry",
    slug: "business-and-industry",
    description: "Industrial machinery, wholesale and business sales",
    children: [
      { name: "Industrial Machinery", slug: "industrial-machinery" },
      { name: "Business for Sale", slug: "business-for-sale" },
      { name: "Wholesale & Bulk Goods", slug: "wholesale-bulk" },
      { name: "Raw Materials", slug: "raw-materials" },
    ],
  },
];

// Categories created by the earlier seed that are renamed (not duplicated) so existing listings keep working.
const SLUG_RENAMES: [from: string, to: string][] = [
  ["property", "real-estate"],
  ["home-furniture", "home-garden"],
  ["fashion", "fashion-and-beauty"],
];

const UPSERT_SQL = `
  INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active)
  VALUES ($1, $2, $3, $4, $5, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    parent_id = EXCLUDED.parent_id,
    sort_order = EXCLUDED.sort_order,
    is_active = true
  RETURNING id, slug`;

/** Inserts/updates the whole tree. Safe to run repeatedly; never deletes categories. Returns slug -> id. */
export async function upsertCategories(client: PoolClient): Promise<Record<string, string>> {
  const slugs = CATEGORY_TREE.flatMap((c) => [c.slug, ...(c.children ?? []).map((s) => s.slug)]);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Duplicate category slug in CATEGORY_TREE");
  }

  for (const [from, to] of SLUG_RENAMES) {
    await client.query(
      `UPDATE categories SET slug = $2
       WHERE slug = $1 AND NOT EXISTS (SELECT 1 FROM categories WHERE slug = $2)`,
      [from, to]
    );
  }

  const ids: Record<string, string> = {};

  for (let i = 0; i < CATEGORY_TREE.length; i += 1) {
    const top = CATEGORY_TREE[i];
    const topResult = await client.query<{ id: string; slug: string }>(UPSERT_SQL, [
      top.name,
      top.slug,
      top.description,
      null,
      i + 1,
    ]);
    ids[top.slug] = topResult.rows[0].id;

    const children = top.children ?? [];
    for (let j = 0; j < children.length; j += 1) {
      const child = children[j];
      const childResult = await client.query<{ id: string; slug: string }>(UPSERT_SQL, [
        child.name,
        child.slug,
        null,
        ids[top.slug],
        j + 1,
      ]);
      ids[child.slug] = childResult.rows[0].id;
    }
  }

  return ids;
}