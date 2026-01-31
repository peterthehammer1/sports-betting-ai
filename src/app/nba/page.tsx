/**
 * NBA Betting Predictions - SEO Landing Page
 * Targets: "NBA betting picks", "NBA predictions", "NBA player props"
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { NBA_BETTING_FAQS } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'NBA Betting Predictions & Expert Picks Today | Free AI Analysis',
  description: 'Get free NBA betting predictions, daily picks, and player props analysis. AI-powered NBA predictions for spreads, totals, and player performance. Updated for every game.',
  keywords: [
    'NBA betting predictions',
    'NBA picks today',
    'NBA player props',
    'NBA betting tips',
    'free NBA picks',
    'NBA spread picks',
    'NBA over under predictions',
    'NBA parlay picks',
    'best NBA bets today',
    'NBA points props',
    'NBA rebounds assists props',
  ],
  openGraph: {
    title: 'NBA Betting Predictions Today | Free Expert Picks & Player Props',
    description: 'AI-powered NBA betting analysis with free picks, player props, and odds comparison for every game.',
    url: 'https://petesbets.com/nba',
    type: 'website',
  },
  alternates: {
    canonical: '/nba',
  },
};

export default function NBAPage() {
  return (
    <>
      <FAQSchema faqs={NBA_BETTING_FAQS} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://petesbets.com' },
          { name: 'NBA Picks', url: 'https://petesbets.com/nba' },
        ]}
      />

      <main className="min-h-screen bg-[#0c1017] text-white">
        {/* Hero */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-transparent to-blue-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-4">
              🏀 NBA Betting Analysis
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NBA Betting Predictions Today
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Free AI-powered NBA picks, player props, and odds analysis for every game.
              Points, rebounds, assists, and combo props analyzed daily.
            </p>
            <Link
              href="/?sport=NBA"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Get Today&apos;s NBA Picks
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">NBA Betting Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '📊', title: 'Game Predictions', description: 'Spread, moneyline, and total picks for every NBA game.' },
                { icon: '👤', title: 'Player Props', description: 'Points, rebounds, assists, threes, and combo props.' },
                { icon: '🔄', title: 'Line Comparison', description: 'Compare odds across DraftKings, FanDuel, BetMGM & more.' },
                { icon: '📈', title: 'Odds Movement', description: 'Track line movements from open to tip-off.' },
                { icon: '🏥', title: 'Injury Impact', description: 'How injuries affect spreads and player props.' },
                { icon: '🎰', title: 'Parlay Builder', description: 'Build winning NBA parlays with AI recommendations.' },
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

        {/* FAQ */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0e14]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">NBA Betting FAQ</h2>
            <div className="space-y-6">
              {NBA_BETTING_FAQS.map((faq, index) => (
                <details key={index} className="group bg-[#151c28] rounded-xl border border-slate-800">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-800/30">
                    <h3 className="text-lg font-medium pr-4">{faq.question}</h3>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="px-6 pb-6 text-slate-400">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Start Winning on NBA Tonight</h2>
            <p className="text-slate-400 mb-8">Get AI-powered picks for every NBA game.</p>
            <Link href="/?sport=NBA" className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg font-semibold">
              View NBA Picks
            </Link>
          </div>
        </section>

        <footer className="py-8 px-4 border-t border-slate-800">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 max-w-4xl mx-auto">
            <Link href="/nfl/super-bowl" className="hover:text-white">Super Bowl Picks</Link>
            <Link href="/nhl" className="hover:text-white">NHL Picks</Link>
            <Link href="/mlb" className="hover:text-white">MLB Picks</Link>
            <Link href="/nba/player-props" className="hover:text-white">NBA Player Props</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
