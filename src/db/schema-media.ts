import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { boolean, timestamp, json, now, emptyJsonArray } from "./columns";

/**
 * MEDIA database schema (Turso / SQLite).
 * Cloudinary media references and their metadata: gallery, gallery categories, banners, hero images, documents.
 */

// ============================================
// 11. DOCUMENTS TABLE
// ============================================

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  
  fileUrl: text("file_url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  
  relatedEventId: text("related_event_id"),
  
  // Expiry
  expiryDate: text("expiry_date"),
  isExpiringSoon: boolean("is_expiring_soon").default(false),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0),
  
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").default(now),
  updatedAt: timestamp("updated_at").default(now),
});

// ============================================
// 14. GALLERY TABLE (NEW)
// ============================================

export const gallery = sqliteTable("gallery", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleTe: text("title_te"),
  description: text("description"),
  descriptionTe: text("description_te"),
  
  // Image
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  cloudinaryPublicId: text("cloudinary_public_id"),
  
  // Categorization
  category: text("category").default("General"),
  categoryId: text("category_id"),
  year: integer("year").default(2026),
  
  // Tags for search
  tags: json("tags").default(emptyJsonArray),
  
  // Visibility
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  sortOrder: integer("sort_order").default(0),
  
  uploadedBy: text("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").default(now),
  updatedAt: timestamp("updated_at").default(now),
});

export const banners = sqliteTable("banners", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  label: text("label").default(""),
  sortOrder: integer("sort_order").default(0),
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").default(now),
  updatedAt: timestamp("updated_at").default(now),
});

export const galleryCategories = sqliteTable("gallery_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  color: text("color").default("#9F1239"),
  icon: text("icon").default("Image"),
  
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").default(now),
  updatedAt: timestamp("updated_at").default(now),
});

export const heroImages = sqliteTable("hero_images", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  cloudinaryPublicId: text("cloudinary_public_id"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").default(now),
  updatedAt: timestamp("updated_at").default(now),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type BannerRow = InferSelectModel<typeof banners>;
export type NewBannerRow = InferInsertModel<typeof banners>;
export type DocumentRow = InferSelectModel<typeof documents>;
export type NewDocumentRow = InferInsertModel<typeof documents>;
export type GalleryRow = InferSelectModel<typeof gallery>;
export type NewGalleryRow = InferInsertModel<typeof gallery>;
export type GalleryCategoryRow = InferSelectModel<typeof galleryCategories>;
export type HeroImageRow = InferSelectModel<typeof heroImages>;
export type NewHeroImageRow = InferInsertModel<typeof heroImages>;
