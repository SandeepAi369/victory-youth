import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0,   // No cache for dynamic routes — admin changes reflect immediately
      static: 30,   // Next.js 16 minimum (static routes rarely change)
    },
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.lhr.life', '*.pinggy.net', '*.pinggy.link', '*.loca.lt', '*.pages.dev', '*.workers.dev']
    }
  },
  // Turso: file tracing only copies isomorphic-ws's Node entry; Workers need the web one
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/@libsql/isomorphic-ws/web.mjs",
      "./node_modules/@libsql/isomorphic-ws/web.cjs",
    ],
  },
  
};
export default nextConfig;

// Gives `next dev` the Cloudflare bindings (a local copy of the MEDIA_DB D1 database)
initOpenNextCloudflareForDev();
