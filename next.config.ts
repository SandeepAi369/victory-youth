import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }
    ],
  },
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
    },
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.lhr.life', '*.pinggy.net', '*.pinggy.link', '*.loca.lt', '*.pages.dev', '*.workers.dev']
    }
  },
  serverExternalPackages: ['pg', 'pg-cloudflare', 'pg-connection-string', 'pgpass', 'drizzle-orm', 'postgres'],
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/pg-cloudflare/dist/**",
      "./node_modules/pg-cloudflare/esm/**",
    ],
  },
  
};
export default nextConfig;
