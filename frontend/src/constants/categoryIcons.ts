// Emoji shown next to top-level categories (keyed by category slug).
export const CATEGORY_ICONS: Record<string, string> = {
  vehicles: "🚗",
  "real-estate": "🏠",
  "mobile-phones-tablets": "📱",
  electronics: "💻",
  "home-garden": "🛋️",
  "fashion-and-beauty": "👗",
  "health-and-beauty": "💄",
  services: "🛠️",
  "repair-and-construction": "🧱",
  "office-and-commercial-equipment-tools": "🏭",
  "hobbies-art-sport": "⚽",
  "babies-and-kids": "🧸",
  "agriculture-and-foodstuff": "🌾",
  "animals-and-pets": "🐾",
  jobs: "💼",
  "seeking-work-cvs": "📄",
  "business-and-industry": "🏢",
};

export const DEFAULT_CATEGORY_ICON = "📦";

export function categoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] ?? DEFAULT_CATEGORY_ICON;
}