export type Language = "en" | "am" | "om";

export const LANGUAGES: { code: Language; label: string; short: string }[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "am", label: "አማርኛ", short: "አማ" },
  { code: "om", label: "Afaan Oromoo", short: "OM" },
];

const en = {
  browseAll: "Browse all",
  categories: "Categories",
  allCategories: "All categories",
  searchPlaceholder: "Search listings…",
  search: "Search",
  saved: "Saved",
  notifications: "Notifications",
  markAllRead: "Mark all read",
  nothingYet: "Nothing here yet.",
  postAd: "Post ad",
  signIn: "Sign in",
  register: "Register",
  myListings: "My listings",
  account: "Account",
  admin: "Admin",
  signOut: "Sign out",
  language: "Language",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  userMenu: "User menu",
  noCategories: "No categories available.",
} as const;

export type TranslationKey = keyof typeof en;
type Dictionary = Record<TranslationKey, string>;

const am: Dictionary = {
  browseAll: "ሁሉንም አስስ",
  categories: "ምድቦች",
  allCategories: "ሁሉም ምድቦች",
  searchPlaceholder: "ዕቃዎችን ይፈልጉ…",
  search: "ፈልግ",
  saved: "የተቀመጡ",
  notifications: "ማሳወቂያዎች",
  markAllRead: "ሁሉንም እንደተነበበ አድርግ",
  nothingYet: "እስካሁን ምንም የለም።",
  postAd: "ማስታወቂያ ለጥፍ",
  signIn: "ግባ",
  register: "ተመዝገብ",
  myListings: "የእኔ ማስታወቂያዎች",
  account: "መለያ",
  admin: "አስተዳዳሪ",
  signOut: "ውጣ",
  language: "ቋንቋ",
  openMenu: "ምናሌ ክፈት",
  closeMenu: "ምናሌ ዝጋ",
  userMenu: "የተጠቃሚ ምናሌ",
  noCategories: "ምንም ምድብ የለም።",
};

const om: Dictionary = {
  browseAll: "Hunda ilaali",
  categories: "Ramaddiiwwan",
  allCategories: "Ramaddii hunda",
  searchPlaceholder: "Tarreeffamoota barbaadi…",
  search: "Barbaadi",
  saved: "Kuufame",
  notifications: "Beeksisawwan",
  markAllRead: "Hunda dubbifame jedhii mallatteessi",
  nothingYet: "Ammaaf homtuu hin jiru.",
  postAd: "Beeksisa maxxansi",
  signIn: "Seeni",
  register: "Galmaa'i",
  myListings: "Beeksisawwan koo",
  account: "Akkaawuntii",
  admin: "Bulchiinsa",
  signOut: "Ba'i",
  language: "Afaan",
  openMenu: "Baafata bani",
  closeMenu: "Baafata cufi",
  userMenu: "Baafata fayyadamaa",
  noCategories: "Ramaddiin hin jiru.",
};

export const translations: Record<Language, Dictionary> = { en, am, om };