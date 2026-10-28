import type { Metadata } from "next";

// Public production URL, used for sitemap, robots.txt and canonical metadata.
export const SITE_URL = "https://victory-youth.bswd.workers.dev";

export const SITE_NAME = "Victory Youth Association";
export const SITE_LOCATION = "Gudem Gally, Banswada, Telangana";
export const SITE_IMAGE = "/hero-banner.jpg";

/** Search keywords shared by every public page (English + Telugu). */
export const SITE_KEYWORDS = [
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
