import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, M_PLUS_1p } from "next/font/google";
import "./globals.css";

// Essential UI font — preloaded
const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
});

// Manga text font — preloaded
const mPlus1p = M_PLUS_1p({
  variable: "--font-m-plus",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// SFX fonts (Dela Gothic One, RocknRoll One, Rampart One, DotGothic16)
// are loaded on-demand via Google Fonts CDN <link> tag below.
// This avoids preloading 100+ Japanese font subset files that block mobile rendering.

export const metadata: Metadata = {
  title: "EVARIS CHORD Editor",
  description: "Webtoon Editor for EVARIS CHORD",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EC Editor"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0c"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${mPlus1p.variable}`}>
      <head>
        {/* SFX fonts loaded from Google Fonts CDN (not preloaded, display=swap prevents blocking) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Dela+Gothic+One&family=DotGothic16&family=Rampart+One&family=RocknRoll+One&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
