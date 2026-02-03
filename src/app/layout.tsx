import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { 
  OrganizationSchema, 
  WebSiteSchema, 
  RatingSchema,
  FAQSchema,
  SPORTS_BETTING_FAQS 
} from "@/components/seo/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// SEO-optimized metadata targeting high-value keywords
export const metadata: Metadata = {
  // Primary title with main keywords
  title: {
    default: "Pete's AI Sports Picks | Free NFL, NBA, NHL & MLB Betting Predictions 2025",
    template: "%s | Pete's AI Sports Picks",
  },
  // Comprehensive description with keywords
  description: "Get free AI-powered sports betting predictions for Super Bowl 2025, NFL, NBA, NHL, and MLB. Expert picks, player props, odds comparison, and betting analysis. Beat the sportsbooks with data-driven insights.",
  // Extended keyword list for search engines
  keywords: [
    // Super Bowl keywords (high search volume during season)
    "Super Bowl betting predictions",
    "Super Bowl 2025 picks",
    "Super Bowl player props",
    "Super Bowl odds",
    "Super Bowl betting advice",
    // NFL keywords
    "NFL betting predictions",
    "NFL picks today",
    "NFL player props",
    "free NFL picks",
    // NBA keywords
    "NBA betting predictions",
    "NBA picks today",
    "NBA player props",
    "NBA betting advice",
    "free NBA picks",
    // NHL keywords
    "NHL betting predictions",
    "NHL picks today",
    "NHL first goal scorer",
    "NHL player props",
    "free NHL picks",
    // MLB keywords
    "MLB betting predictions",
    "MLB picks today",
    "MLB player props",
    // General sports betting
    "sports betting tips",
    "AI sports predictions",
    "free sports picks",
    "best sports betting advice",
    "odds comparison",
    "line shopping",
    "parlay builder",
    "betting calculator",
  ],
  authors: [{ name: "Pete's AI Sports Picks", url: "https://petesaisportspicks.com" }],
  creator: "Pete's AI Sports Picks",
  publisher: "Pete's AI Sports Picks",
  
  // Canonical URL
  metadataBase: new URL("https://petesbets.com"),
  alternates: {
    canonical: "/",
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/Pete/PeterCartoon1.png", sizes: "32x32", type: "image/png" },
      { url: "/Pete/PeterCartoon1.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/Pete/PeterCartoon1.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/Pete/PeterCartoon1.png",
  },
  
  // Web manifest
  manifest: "/manifest.json",
  
  // Open Graph for social sharing
  openGraph: {
    title: "Pete's AI Sports Picks | Free Super Bowl, NFL, NBA & NHL Betting Predictions",
    description: "AI-powered sports betting analysis with free picks for Super Bowl 2025, NFL, NBA, NHL, and MLB. Get expert player props, odds comparison, and win more bets.",
    type: "website",
    locale: "en_US",
    url: "https://petesaisportspicks.com",
    siteName: "Pete's AI Sports Picks",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pete's AI Sports Picks - Free AI-Powered Sports Betting Predictions",
        type: "image/png",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Pete's AI Sports Picks | Free Sports Betting Predictions",
    description: "Get free AI picks for Super Bowl, NFL, NBA, NHL & MLB. Expert player props and odds comparison.",
    images: ["/og-image.png"],
    creator: "@petesaipicks",
    site: "@petesaipicks",
  },
  
  // Apple Web App
  appleWebApp: {
    capable: true,
    title: "Pete's Picks",
    statusBarStyle: "black-translucent",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification codes
  verification: {
    google: "nBkxTa7I1tGKFqOCJyrPf9fd-v4aQNC_Eib23ZNmqZs",
    // bing: "your-bing-code",
  },
  
  // Category
  category: "Sports",
  
  // Other
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  
  // Additional meta
  other: {
    "msapplication-TileColor": "#0c1017",
    "theme-color": "#10b981",
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1017" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for SEO */}
        <OrganizationSchema />
        <WebSiteSchema />
        <RatingSchema />
        <FAQSchema faqs={SPORTS_BETTING_FAQS} />
        
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://a.espncdn.com" />
        <link rel="dns-prefetch" href="https://a.espncdn.com" />
        
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
          as="style"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
