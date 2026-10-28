import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopLoader } from "@/components/TopLoader";
import { SITE_URL } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0C0A09" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ganesh BNS - Victory Youth Association (Gudem Gally)",
  description: "50+ Years Golden Jubilee (1974-2026) - Victory Youth Association - Golden Jubilee Ganesh Utsav",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: "2R9DtUX6a_boIAFQBxR6HWtCc9kjWjG0_nt2p8b7Iys",
    other: { "msvalidate.01": "ECA8BF589C8F8491C8A4F359BC23F0B6" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${playfair.variable} bg-background text-foreground antialiased min-h-screen selection:bg-primary/20 selection:text-primary font-sans`}
      >
        <TopLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}
