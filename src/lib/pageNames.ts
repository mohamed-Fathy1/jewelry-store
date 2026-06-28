/**
 * Maps raw GA page paths (e.g. "/product/3") to friendly Arabic names so the
 * store owner reads "صفحة منتج" instead of a URL, plus a category for colouring
 * and a full clickable link to the live site.
 */

export const SITE_URL = "https://www.atozaccessory.com";

export type PageCategory = "store" | "account" | "admin" | "auth" | "info" | "other";

export interface PageMeta {
  label: string; // friendly Arabic name
  category: PageCategory;
  href: string; // full live URL
}

/** Arabic label for each category (used for chips). */
export const CATEGORY_LABEL: Record<PageCategory, string> = {
  store: "المتجر",
  account: "الحساب",
  admin: "لوحة التحكم",
  auth: "الدخول",
  info: "معلومات",
  other: "أخرى",
};

const STATIC: Record<string, { label: string; category: PageCategory }> = {
  "/": { label: "الصفحة الرئيسية", category: "store" },
  "/shop": { label: "كل المنتجات", category: "store" },
  "/cart": { label: "سلة التسوق", category: "store" },
  "/checkout": { label: "إتمام الطلب", category: "store" },
  "/about": { label: "من نحن", category: "info" },
  "/exchange-policy": { label: "سياسة الاستبدال", category: "info" },
  "/account": { label: "حسابي", category: "account" },
  "/activate-account": { label: "تفعيل الحساب", category: "account" },
  "/auth": { label: "تسجيل الدخول", category: "auth" },
  "/auth/login": { label: "تسجيل الدخول", category: "auth" },
  "/auth/register": { label: "إنشاء حساب", category: "auth" },
  "/admin": { label: "لوحة التحكم", category: "admin" },
  "/admin/products": { label: "إدارة المنتجات", category: "admin" },
  "/admin/orders": { label: "إدارة الطلبات", category: "admin" },
  "/admin/categories": { label: "إدارة التصنيفات", category: "admin" },
  "/admin/colors": { label: "إدارة الألوان", category: "admin" },
  "/admin/sizes": { label: "إدارة المقاسات", category: "admin" },
  "/admin/icons": { label: "إدارة الأيقونات", category: "admin" },
  "/admin/offers": { label: "إدارة العروض", category: "admin" },
  "/admin/shipping": { label: "إدارة الشحن", category: "admin" },
  "/admin/hero": { label: "إدارة البانر الرئيسي", category: "admin" },
  "/admin/wishlists": { label: "قوائم الأمنيات", category: "admin" },
  "/admin/backups": { label: "النسخ الاحتياطية", category: "admin" },
  "/admin/analytics": { label: "تحليلات الزوّار", category: "admin" },
  "/admin/login": { label: "دخول لوحة التحكم", category: "admin" },
};

/** Normalize: drop query/hash, lowercase, strip trailing slash (keep root "/"). */
function normalize(path: string): string {
  let p = (path || "/").split("?")[0].split("#")[0].trim().toLowerCase();
  if (p.length > 1 && p.endsWith("/")) p = p.replace(/\/+$/, "");
  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

export function resolvePageName(rawPath: string): PageMeta {
  const path = normalize(rawPath);
  const href = `${SITE_URL}${path === "/" ? "" : path}`;

  const exact = STATIC[path];
  if (exact) return { ...exact, href };

  // Dynamic / nested routes.
  if (path.startsWith("/product/"))
    return { label: "صفحة منتج", category: "store", href };
  if (path.startsWith("/shop/"))
    return { label: "تصنيف في المتجر", category: "store", href };
  if (path.startsWith("/account/"))
    return { label: "صفحة في الحساب", category: "account", href };
  if (path.startsWith("/admin/"))
    return { label: "صفحة في لوحة التحكم", category: "admin", href };

  // Fallback: prettify the last segment.
  const last = path.split("/").filter(Boolean).pop() ?? "";
  const pretty = last.replace(/[-_]/g, " ").trim();
  return { label: pretty || path, category: "other", href };
}

/** GA traffic-source tokens → friendly Arabic labels. */
const SOURCE_LABELS: Record<string, string> = {
  "(direct)": "دخول مباشر",
  "(not set)": "غير محدد",
  "(none)": "غير محدد",
  google: "بحث Google",
  bing: "بحث Bing",
  "facebook.com": "فيسبوك",
  "m.facebook.com": "فيسبوك",
  "l.facebook.com": "فيسبوك",
  facebook: "فيسبوك",
  fb: "فيسبوك",
  "instagram.com": "إنستجرام",
  "l.instagram.com": "إنستجرام",
  ig: "إنستجرام",
  instagram: "إنستجرام",
  tiktok: "تيك توك",
  "tiktok.com": "تيك توك",
  youtube: "يوتيوب",
  "t.co": "تويتر / X",
  twitter: "تويتر / X",
  whatsapp: "واتساب",
  "com.whatsapp": "واتساب",
};

export function resolveSourceName(raw: string): string {
  const key = (raw || "").trim().toLowerCase();
  return SOURCE_LABELS[key] ?? raw ?? "غير محدد";
}
