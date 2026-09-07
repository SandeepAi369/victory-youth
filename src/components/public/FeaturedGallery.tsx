"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";

interface FeaturedPhoto {
  url: string;
  alt: string;
  caption: string;
}

interface FeaturedGalleryProps {
  photos: FeaturedPhoto[];
}

export function FeaturedGallery({ photos }: FeaturedGalleryProps) {
  // If no photos, don't render the section
  if (!photos || photos.length === 0) {
    return null;
  }

  const animationVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-amber-50/30 to-white dark:from-stone-950 dark:via-stone-900 dark:to-stone-950" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent dark:via-amber-700/50" />
      
      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          variants={animationVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 mb-4">
            <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Photo Gallery
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3">
            <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
              Celebrations
            </span>
          </h2>
          
          <p className="text-stone-600 dark:text-stone-400 max-w-md mx-auto">
            Capturing the divine moments of our Golden Jubilee celebrations
          </p>
        </motion.div>

        {/* Photo Grid - Exactly 3 Photos */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          {photos.map((photo, index) => (
            <motion.div
              key={index}
              variants={animationVariants}
              className="group relative"
            >
              {/* Card Container */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100 dark:from-stone-800 dark:to-stone-700 shadow-lg hover:shadow-xl shadow-amber-500/10 transition-all duration-500">
                
                {/* Golden Border Effect */}
                <div className="absolute inset-0 border-2 border-amber-300/50 dark:border-amber-700/50 rounded-2xl pointer-events-none z-10 transition-all duration-300 group-hover:border-amber-400/70 dark:group-hover:border-amber-600/70" />
                
                {/* Image */}
                <Image
                  src={photo.url}
                  alt={photo.alt || `Featured photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium drop-shadow-lg">
                      {photo.caption}
                    </p>
                  </div>
                )}

                {/* Sparkle Icon on Hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-2 rounded-full bg-amber-400/80 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              {/* Index Badge */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-stone-900 font-bold text-sm shadow-lg">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View Gallery Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10"
        >
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
          >
            <span>View Full Gallery</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent dark:via-amber-700/50" />
    </section>
  );
}
