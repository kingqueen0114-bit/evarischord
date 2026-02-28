import type { Metadata, Viewport } from "next";
import "./globals.css";

// All fonts loaded from Google Fonts CDN via <link> tag.
// This prevents Next.js from preloading 120+ Japanese font subset files,
// which blocks rendering on mobile devices.

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
    <html lang="ja">
      <head>
        {/* All fonts loaded from Google Fonts CDN (display=swap prevents blocking) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=M+PLUS+1p:wght@400;700&family=Dela+Gothic+One&family=DotGothic16&family=Rampart+One&family=RocknRoll+One&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
