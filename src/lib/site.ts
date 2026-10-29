import type { Metadata } from "next";

// Public production URL, used for sitemap, robots.txt and canonical metadata.
export const SITE_URL = "https://victory-youth.bswd.workers.dev";

export const SITE_NAME = "Victory Youth Association";
export const SITE_LOCATION = "Gudem Gally, Banswada, Telangana";
export const SITE_IMAGE = "/hero-banner.jpg";

/** Primary brand phrase that search results should associate with this site. */
export const BRAND_NAME = "Victory Youth";
export const HOME_TITLE = "Victory Youth | Victory Youth Association, Banswada Ganesh Utsav";
export const HOME_DESCRIPTION =
  "Victory Youth (Victory Youth Association), Gudem Gally, Banswada, Telangana: celebrating Ganesh Chaturthi since 1974. Events, pooja schedule, donations, chanda, committee and photo gallery.";

/** Public profiles and map listing already linked from the site; used as schema.org sameAs / hasMap. */
export const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/victory_youth_bswd",
  github: "https://github.com/SandeepAi369",
  maps: "https://maps.app.goo.gl/8SgCjUJhztJs32f4A",
} as const;
export const CONTACT_EMAIL = "victoryyouthbswd@gmail.com";
/** Decoded from the Google Maps plus code 9VQC+835 (Gudem Gally, Banswada). */
export const SITE_GEO = { latitude: 18.388263, longitude: 77.870234 } as const;

/** Search keywords shared by every public page (English + Telugu). */
export const SITE_KEYWORDS = [
  "Victory Youth",
  "Victory Youth Association",
  "Victory Youth Banswada",
  "Gudem Gally",
  "Banswada",
  "Banswada Ganesh",
  "Ganesh Utsav Banswada",
  "Ganesh Chaturthi Banswada",
  "Vinayaka Chavithi",
  "Ganesh Navaratri",
  "Ganpati Bappa Morya",
  "Golden Jubilee Ganesh Utsav",
  "youth association Telangana",
  "Ganesh festival donations",
  "chanda collection",
  "Nizamabad",
  "Telangana festivals",
  "బాన్సువాడ వినాయక చవితి",
  "గణేష్ ఉత్సవాలు",
];

/** Title, description, canonical URL and share card for one public page. */
export function pageMetadata(path: string, title: string, description: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [{ url: SITE_IMAGE, alt: `${SITE_NAME}, ${SITE_LOCATION}` }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${SITE_NAME}`, description, images: [SITE_IMAGE] },
  };
}
