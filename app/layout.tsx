import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site"
import "./globals.css"

const inter = localFont({ src: "../public/fonts/Inter.ttf", variable: "--font-inter", display: "swap" })
const oxanium = localFont({ src: "../public/fonts/Oxanium.ttf", variable: "--font-oxanium", weight: "200 800", display: "swap" })
const fineNoise = `data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["software complaints", "SaaS alternatives", "switch software", "product alternatives", "problem marketplace"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/icon1.png", type: "image/png", sizes: "96x96" },
      { url: "/icon0.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
}

export const viewport: Viewport = {
  themeColor: "#fafafa",
  colorScheme: "light",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${oxanium.variable} antialiased`}><body className="font-sans antialiased" style={{ backgroundImage: `url("${fineNoise}")`, backgroundRepeat: "repeat" }}>{children}</body></html>
}
