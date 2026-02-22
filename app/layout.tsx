import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, M_PLUS_1p, Dela_Gothic_One, RocknRoll_One, Rampart_One, DotGothic16 } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

const mPlus1p = M_PLUS_1p({
  variable: "--font-m-plus",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const delaGothic = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
});

const rocknRoll = RocknRoll_One({
  weight: "400",
  subsets: ["latin"],
});

const rampart = Rampart_One({
  weight: "400",
  subsets: ["latin"],
});

const dotGothic = DotGothic16({
  weight: "400",
  subsets: ["latin"],
});

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
    <html lang="ja" className={`${notoSansJP.variable} ${mPlus1p.variable} ${delaGothic.className} ${rocknRoll.className} ${rampart.className} ${dotGothic.className} `}>
      <body>
        {children}
      </body>
    </html>
  );
}
