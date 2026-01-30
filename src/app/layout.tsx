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
  title: "Sports Picks",
  description: "AI-powered sports betting analysis for NHL and NBA. Get smart picks, value bets, and goal scorer predictions.",
  keywords: ["sports betting", "AI picks", "NHL betting", "NBA betting", "sports analysis", "betting predictions"],
  authors: [{ name: "Sports Picks" }],
  openGraph: {
    title: "Sports Picks",
    description: "AI-powered sports betting analysis for NHL and NBA. Get smart picks, value bets, and goal scorer predictions.",
    type: "website",
    locale: "en_US",
    siteName: "Sports Picks",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports Picks",
    description: "AI-powered sports betting analysis for NHL and NBA. Get smart picks, value bets, and goal scorer predictions.",
  },
  appleWebApp: {
    capable: true,
    title: "Sports Picks",
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
