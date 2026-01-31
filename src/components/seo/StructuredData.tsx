/**
 * Structured Data (JSON-LD) for SEO
 * Implements Schema.org markup for rich snippets in Google
 */

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Pete's AI Sports Picks",
    alternateName: ['Pete Sports Picks', 'Pete AI Picks', 'Pete Betting Picks'],
    url: 'https://petesbets.com',
    logo: 'https://petesbets.com/Pete/PeterCartoon1.png',
    description: 'AI-powered sports betting analysis and predictions for NFL, NBA, NHL, MLB, and Soccer.',
    foundingDate: '2024',
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema with SearchAction
export function WebSiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Pete's AI Sports Picks",
    alternateName: 'Pete Sports Picks',
    url: 'https://petesbets.com',
    description: 'Expert AI-powered sports betting predictions, odds comparison, and player prop analysis for NFL Super Bowl, NBA, NHL, and MLB.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://petesbets.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// SportsEvent Schema for games
export function SportsEventSchema({
  homeTeam,
  awayTeam,
  sport,
  startDate,
  venue,
}: {
  homeTeam: string;
  awayTeam: string;
  sport: string;
  startDate: string;
  venue?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${awayTeam} vs ${homeTeam}`,
    description: `${sport} game: ${awayTeam} at ${homeTeam}. Get AI betting predictions, odds comparison, and player props.`,
    startDate,
    homeTeam: {
      '@type': 'SportsTeam',
      name: homeTeam,
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: awayTeam,
    },
    location: venue ? {
      '@type': 'Place',
      name: venue,
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: sport,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema for AEO (Answer Engine Optimization)
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// HowTo Schema for betting guides
export function HowToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article Schema for blog/analysis content
export function ArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  author,
  image,
}: {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author || "Pete's AI Sports Picks",
    },
    publisher: {
      '@type': 'Organization',
      name: "Pete's AI Sports Picks",
      logo: {
        '@type': 'ImageObject',
        url: 'https://petesbets.com/Pete/PeterCartoon1.png',
      },
    },
    image: image || 'https://petesbets.com/og-image.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://petesbets.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema for navigation
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Super Bowl specific schema
export function SuperBowlSchema({
  homeTeam,
  awayTeam,
  date,
  venue,
}: {
  homeTeam: string;
  awayTeam: string;
  date: string;
  venue: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `Super Bowl 2025: ${awayTeam} vs ${homeTeam}`,
    description: `Super Bowl LIX betting predictions, odds, and player props for ${awayTeam} vs ${homeTeam}. Get expert AI picks for the big game.`,
    startDate: date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'New Orleans',
        addressRegion: 'LA',
        addressCountry: 'US',
      },
    },
    homeTeam: {
      '@type': 'SportsTeam',
      name: homeTeam,
      sport: 'American Football',
    },
    awayTeam: {
      '@type': 'SportsTeam',
      name: awayTeam,
      sport: 'American Football',
    },
    organizer: {
      '@type': 'Organization',
      name: 'NFL',
      url: 'https://www.nfl.com',
    },
    offers: {
      '@type': 'AggregateOffer',
      availability: 'https://schema.org/InStock',
      priceCurrency: 'USD',
      description: 'Free AI-powered Super Bowl betting predictions and analysis',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Aggregate Rating Schema
export function RatingSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: "Pete's AI Sports Picks",
    applicationCategory: 'SportsApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Export default FAQs for sports betting
export const SPORTS_BETTING_FAQS = [
  {
    question: 'What is the best Super Bowl betting strategy?',
    answer: 'The best Super Bowl betting strategy involves analyzing team matchups, injury reports, and historical performance. Focus on player props and alternate lines for better value. Our AI analyzes thousands of data points to identify the highest-value bets.',
  },
  {
    question: 'How do NFL player props work?',
    answer: 'NFL player props are bets on individual player performance, such as passing yards, rushing yards, touchdowns, and receptions. You bet on whether a player will go over or under a specified number. Props offer great value because oddsmakers can\'t account for every matchup detail.',
  },
  {
    question: 'What are the best NBA bets to make?',
    answer: 'The best NBA bets include player props (points, rebounds, assists), first-half totals, and alternate spreads. Look for players facing weak defenses or teams on back-to-back games. Our AI identifies value opportunities by comparing lines across sportsbooks.',
  },
  {
    question: 'How does AI sports betting analysis work?',
    answer: 'AI sports betting analysis uses machine learning to process vast amounts of data including team statistics, player performance, injury reports, weather conditions, and historical betting patterns. The AI identifies patterns humans might miss and calculates probability-adjusted predictions.',
  },
  {
    question: 'What is line shopping in sports betting?',
    answer: 'Line shopping means comparing odds across multiple sportsbooks to find the best price for your bet. Even small differences in odds can significantly impact long-term profits. For example, getting -110 instead of -115 saves you money over time.',
  },
  {
    question: 'How do I read NHL betting odds?',
    answer: 'NHL betting odds include moneyline (who wins), puck line (spread of 1.5 goals), and totals (over/under). Favorites have negative odds (-150), underdogs positive (+130). American odds show how much you win on $100 (positive) or need to bet to win $100 (negative).',
  },
  {
    question: 'What is a parlay bet?',
    answer: 'A parlay combines multiple bets into one wager. All selections must win for the parlay to pay out. While parlays offer higher payouts than individual bets, they\'re riskier. A 3-team parlay at -110 each pays about +595.',
  },
  {
    question: 'When should I bet on MLB player props?',
    answer: 'MLB player props are best when you have information advantages: pitcher vs. batter matchups, ballpark factors, weather conditions, and lineup changes. Strikeout props for pitchers and total bases for batters against weak opponents offer consistent value.',
  },
];

// Export NHL-specific FAQs
export const NHL_BETTING_FAQS = [
  {
    question: 'Who are the best NHL first goal scorers to bet on?',
    answer: 'The best NHL first goal scorer bets target top-line forwards with high shot volumes like Austin Matthews, Connor McDavid, and Leon Draisaitl. Also consider power play specialists when facing teams with weak penalty kills. First goal scorer props typically pay +400 to +2000.',
  },
  {
    question: 'How do NHL puck line bets work?',
    answer: 'NHL puck line bets are spreads of 1.5 goals. Favorites must win by 2+ goals (-1.5), underdogs can lose by 1 goal or win (+1.5). Puck line favorites often offer + money odds, while underdogs are heavily juiced since most NHL games are decided by 1-2 goals.',
  },
  {
    question: 'What NHL totals should I bet?',
    answer: 'NHL totals (over/under) are typically set between 5.5-6.5 goals. Bet overs when two high-scoring teams face weak goaltending or defensive-minded teams are missing key defensemen. Unders work when elite goalies face each other or in playoff-intensity matchups.',
  },
];

// Export NBA-specific FAQs
export const NBA_BETTING_FAQS = [
  {
    question: 'What are the best NBA player props?',
    answer: 'The best NBA player props target consistent performers in favorable matchups. Points props for scorers against weak perimeter defenses, rebounds for bigs against small-ball teams, and assists for playmakers against aggressive defenses that leave cutters open.',
  },
  {
    question: 'How do NBA first quarter bets work?',
    answer: 'NBA first quarter bets focus on the opening 12 minutes. Bet on teams that start fast or against slow starters. First quarter spreads are typically 1/4 of the full game spread. These bets reduce variance since you\'re betting on a smaller sample.',
  },
  {
    question: 'When should I bet NBA totals?',
    answer: 'Bet NBA overs when two fast-paced teams meet, in back-to-back games (tired defenses), or when key defenders are out. Bet unders in playoff games, between defensive teams, or when stars are resting. Track pace statistics for best results.',
  },
];
