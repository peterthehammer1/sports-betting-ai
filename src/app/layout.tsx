import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pete's AI Sports Picks",
  description: "AI-powered sports betting analysis for NHL and NBA. Get smart picks, value bets, and player prop predictions.",
  keywords: ["sports betting", "AI picks", "NHL betting", "NBA betting", "sports analysis", "betting predictions"],
  authors: [{ name: "Pete's AI Sports Picks" }],
  icons: {
    icon: "/Pete/PeterCartoon1.png",
    apple: "/Pete/PeterCartoon1.png",
  },
  openGraph: {
    title: "Pete's AI Sports Picks",
    description: "AI-powered sports betting analysis for NHL and NBA. Smart picks, value bets, and player prop predictions.",
    type: "website",
    locale: "en_US",
    siteName: "Pete's AI Sports Picks",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pete's AI Sports Picks - AI-Powered Sports Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pete's AI Sports Picks",
    description: "AI-powered sports betting analysis for NHL and NBA. Smart picks, value bets, and player prop predictions.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    title: "Pete's AI Sports Picks",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
