"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Calendar, MapPin } from "lucide-react";

interface HeroSectionProps {
  title: string;
  subtitleEn: string;
  subtitleTe?: string;
  descriptionEn?: string;
  descriptionTe?: string;
  imageUrl: string | null;
  imageAlt: string;
  chaturthiDate?: string;
  visarjanDate?: string;
  address?: string;
}

export function HeroSection({
  title,
  subtitleEn,
  subtitleTe,
  imageUrl,
  imageAlt,
  chaturthiDate,
  visarjanDate,
  address,
}: HeroSectionProps) {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Premium Gradient Background - Preserves custom colors in both modes */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950" />
      
      {/* Golden Overlay Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.2)_0%,transparent_50%)]" />
      </div>

      {/* Animated Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute top-20 left-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute bottom-20 right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl"
      />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Text Content */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left space-y-6"
          >
            {/* Sparkle Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-300 dark:border-amber-700"
            >
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                50th Golden Jubilee
              </span>
            </motion.div>

            {/* Main Title - "Victory Youth" */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight"
            >
              <span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-orange-500 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                {title}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-xl md:text-2xl font-semibold text-stone-700 dark:text-stone-300"
            >
              {subtitleEn}
            </motion.p>

            {/* Telugu Subtitle */}
            {subtitleTe && (
              <motion.p
                variants={fadeInUp}
                className="text-lg text-stone-600 dark:text-stone-400"
              >
                {subtitleTe}
              </motion.p>
            )}

            {/* Festival Info Cards */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
            >
              {chaturthiDate && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-amber-200 dark:border-amber-800/50 shadow-sm">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Chaturthi: {new Date(chaturthiDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              )}
              
              {address && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-amber-200 dark:border-amber-800/50 shadow-sm">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    Banswada, Telangana
                  </span>
                </div>
              )}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4"
            >
              <a
                href="/donate"
                className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-900 font-bold text-sm shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
              >
                Donate Now
              </a>
              <a
                href="/schedule"
                className="px-8 py-3 rounded-full bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-2 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-200 font-bold text-sm hover:bg-amber-50 dark:hover:bg-stone-700 transition-all duration-300"
              >
                View Schedule
              </a>
            </motion.div>
          </motion.div>

          {/* Right Side - Hero Image */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center lg:justify-end"
          >
            {imageUrl ? (
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Golden Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/30 via-yellow-400/30 to-orange-400/30 rounded-3xl blur-2xl" />
                
                {/* Image Container */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-4 border-amber-300/50 dark:border-amber-700/50 shadow-2xl shadow-amber-500/20">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 via-transparent to-transparent" />
                </div>

                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute -right-4 top-1/4 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-900 font-bold text-sm shadow-lg"
                >
                  Est. 1974
                </motion.div>
              </div>
            ) : (
              /* Fallback when no image */
              <div className="relative w-full max-w-md lg:max-w-lg aspect-[4/5] rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 border-4 border-amber-300/50 dark:border-amber-700/50 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="text-8xl mb-4">🙏</div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                    Victory Youth
                  </p>
                  <p className="text-stone-600 dark:text-stone-400 mt-2">
                    Association
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-white dark:fill-stone-950"
          />
        </svg>
      </div>
    </section>
  );
}
