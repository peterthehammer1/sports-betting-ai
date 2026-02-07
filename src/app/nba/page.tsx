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

      <main className="min-h-screen bg-[#0d1117] text-white">
        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-medium mb-4">
              NBA Betting Analysis
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              NBA Betting Predictions Today
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Free AI-powered NBA picks, player props, and odds analysis for every game.
              Points, rebounds, assists, and combo props analyzed daily.
            </p>
            <Link
              href="/?sport=NBA"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Get Today&apos;s NBA Picks →
            </Link>
          </div>
        </section>

        {/* Tools */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">NBA Betting Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '📊', title: 'Game Predictions', description: 'Spread, moneyline, and total picks for every NBA game.' },
                { icon: '👤', title: 'Player Props', description: 'Points, rebounds, assists, threes, and combo props.' },
                { icon: '🔄', title: 'Line Comparison', description: 'Compare odds across DraftKings, FanDuel, BetMGM & more.' },
                { icon: '📈', title: 'Odds Movement', description: 'Track line movements from open to tip-off.' },
                { icon: '🏥', title: 'Injury Impact', description: 'How injuries affect spreads and player props.' },
                { icon: '🎰', title: 'Parlay Builder', description: 'Build winning NBA parlays with AI recommendations.' },
              ].map((item) => (
                <div key={item.title} className="bg-[#161b22] rounded-lg p-5 border border-slate-800">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="text-base font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">NBA Betting FAQ</h2>
            <div className="space-y-3">
              {NBA_BETTING_FAQS.map((faq, index) => (
                <details key={index} className="group bg-[#161b22] rounded-lg border border-slate-800">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30">
                    <h3 className="text-sm font-medium pr-4">{faq.question}</h3>
                    <span className="text-slate-500 group-open:rotate-180 transition-transform text-xs">▼</span>
                  </summary>
                  <div className="px-4 pb-4 text-slate-400 text-sm">{faq.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-3">Start Winning on NBA Tonight</h2>
            <p className="text-slate-400 text-sm mb-6">Get AI-powered picks for every NBA game.</p>
            <Link 
              href="/?sport=NBA" 
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-slate-200 transition-colors inline-block"
            >
              View NBA Picks
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 max-w-4xl mx-auto">
            <Link href="/nfl/super-bowl" className="hover:text-white transition-colors">Super Bowl Picks</Link>
            <Link href="/nhl" className="hover:text-white transition-colors">NHL Picks</Link>
            <Link href="/mlb" className="hover:text-white transition-colors">MLB Picks</Link>
            <Link href="/nba/player-props" className="hover:text-white transition-colors">NBA Player Props</Link>
          </nav>
          <p className="text-center text-xs text-slate-600 mt-4">
            For entertainment purposes only. Please gamble responsibly.
          </p>
        </footer>
      </main>
    </>
  );
}
