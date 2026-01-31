/**
 * Super Bowl Betting Predictions - SEO Landing Page
 * Targets: "Super Bowl betting", "Super Bowl picks", "Super Bowl predictions"
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SuperBowlSchema, FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

// Super Bowl specific SEO metadata
export const metadata: Metadata = {
  title: 'Super Bowl 2025 Betting Predictions & Expert Picks | Free AI Analysis',
  description: 'Get free Super Bowl 2025 betting predictions, expert picks, player props, and odds analysis. AI-powered Super Bowl predictions for spreads, totals, MVP, and prop bets. Updated daily.',
  keywords: [
    'Super Bowl 2025 betting predictions',
    'Super Bowl picks',
    'Super Bowl betting odds',
    'Super Bowl player props',
    'Super Bowl MVP odds',
    'Super Bowl spread picks',
    'Super Bowl over under',
    'Super Bowl betting tips',
    'free Super Bowl picks',
    'Super Bowl LIX predictions',
    'Chiefs vs Eagles Super Bowl',
  ],
  openGraph: {
    title: 'Super Bowl 2025 Betting Predictions | Free Expert Picks & Props',
    description: 'AI-powered Super Bowl betting analysis with free picks, player props, and odds comparison. Get expert predictions for the big game.',
    url: 'https://petesbets.com/nfl/super-bowl',
    type: 'article',
  },
  alternates: {
    canonical: '/nfl/super-bowl',
  },
};

// Super Bowl FAQs for AEO
const SUPER_BOWL_FAQS = [
  {
    question: 'What is the best bet for Super Bowl 2025?',
    answer: 'The best Super Bowl bets focus on player props and alternate lines where oddsmakers have less data. Top value picks include passing yards props, first touchdown scorer, and team-specific totals. Our AI analyzes historical Super Bowl data to identify the highest-value opportunities.',
  },
  {
    question: 'Who is favored to win Super Bowl 2025?',
    answer: 'Super Bowl 2025 odds are constantly updating based on playoff results. Check our live odds comparison to see current favorites with the best available lines across all major sportsbooks including FanDuel, DraftKings, and BetMGM.',
  },
  {
    question: 'What are the best Super Bowl player props?',
    answer: 'The best Super Bowl player props target high-volume players in favorable matchups. Quarterback passing yards, star receiver yardage, and anytime touchdown scorers offer consistent value. Our AI identifies players likely to exceed their lines based on defensive weaknesses.',
  },
  {
    question: 'Should I bet the Super Bowl over or under?',
    answer: 'Super Bowl totals depend on the matchup, but historically the under hits about 55% of the time due to increased defensive intensity and game planning. Analyze scoring trends, red zone efficiency, and weather conditions for the best prediction.',
  },
  {
    question: 'When is the best time to bet on the Super Bowl?',
    answer: 'The best time to bet Super Bowl depends on your strategy. Sharp bettors often find value in early lines before the market adjusts. Live betting during the game offers opportunities to capitalize on momentum shifts and in-game developments.',
  },
];

export default function SuperBowlPage() {
  return (
    <>
      {/* Structured Data */}
      <SuperBowlSchema
        homeTeam="TBD"
        awayTeam="TBD"
        date="2025-02-09T18:30:00-05:00"
        venue="Caesars Superdome"
      />
      <FAQSchema faqs={SUPER_BOWL_FAQS} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://petesbets.com' },
          { name: 'NFL', url: 'https://petesbets.com/nfl' },
          { name: 'Super Bowl', url: 'https://petesbets.com/nfl/super-bowl' },
        ]}
      />

      <main className="min-h-screen bg-[#0c1017] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-blue-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
              🏈 Super Bowl LIX • February 9, 2025
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Super Bowl 2025 Betting Predictions
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Free AI-powered Super Bowl picks, player props, and odds analysis. 
              Get expert predictions for spreads, totals, MVP, and prop bets.
            </p>
            <Link
              href="/?sport=NFL&view=superbowl"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Get Free Super Bowl Picks
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* What We Offer */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Super Bowl Betting Analysis</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Expert Picks',
                  description: 'AI-analyzed spread, moneyline, and total predictions with confidence ratings.',
                },
                {
                  icon: '👤',
                  title: 'Player Props',
                  description: 'Passing yards, rushing, receiving, touchdowns, and defensive props.',
                },
                {
                  icon: '📊',
                  title: 'Odds Comparison',
                  description: 'Compare Super Bowl odds across FanDuel, DraftKings, BetMGM & more.',
                },
                {
                  icon: '🏆',
                  title: 'MVP Predictions',
                  description: 'Super Bowl MVP odds and analysis with historical trends.',
                },
                {
                  icon: '📈',
                  title: 'Line Movement',
                  description: 'Track how Super Bowl lines move from open to kickoff.',
                },
                {
                  icon: '🎰',
                  title: 'Alternate Lines',
                  description: 'Find value with alternate spreads and totals.',
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#151c28] rounded-xl p-6 border border-slate-800">
                  <span className="text-3xl mb-4 block">{item.icon}</span>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section for AEO */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0e14]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Super Bowl Betting FAQ</h2>
            <div className="space-y-6">
              {SUPER_BOWL_FAQS.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#151c28] rounded-xl border border-slate-800 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-800/30 transition-colors">
                    <h3 className="text-lg font-medium pr-4">{faq.question}</h3>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Win on Super Bowl Sunday?</h2>
            <p className="text-slate-400 mb-8">
              Get instant access to AI-powered Super Bowl picks, player props, and odds comparison.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
            >
              Start Analyzing Now
            </Link>
          </div>
        </section>

        {/* Footer navigation for internal linking */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link href="/nba" className="hover:text-white">NBA Picks</Link>
              <Link href="/nhl" className="hover:text-white">NHL Picks</Link>
              <Link href="/mlb" className="hover:text-white">MLB Picks</Link>
              <Link href="/tools/odds-comparison" className="hover:text-white">Odds Comparison</Link>
              <Link href="/tools/parlay-builder" className="hover:text-white">Parlay Builder</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
