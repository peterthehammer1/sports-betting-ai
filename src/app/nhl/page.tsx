/**
 * NHL Betting Predictions - SEO Landing Page
 * Targets: "NHL betting picks", "NHL predictions", "NHL player props"
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';
import { NHL_BETTING_FAQS } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'NHL Betting Predictions & Expert Picks Today | Free AI Analysis',
  description: 'Get free NHL betting predictions, daily picks, and player props analysis. AI-powered NHL predictions for puck lines, totals, and goal scorer props. Updated for every game.',
  keywords: [
    'NHL betting predictions',
    'NHL picks today',
    'NHL player props',
    'NHL first goal scorer',
    'NHL anytime goal scorer',
    'NHL puck line picks',
    'NHL over under predictions',
    'free NHL picks',
    'best NHL bets today',
    'NHL parlay picks',
  ],
  openGraph: {
    title: 'NHL Betting Predictions Today | Free Expert Picks & Goal Scorer Props',
    description: 'AI-powered NHL betting analysis with free picks, goal scorer props, and odds comparison.',
    url: 'https://petesbets.com/nhl',
  },
  alternates: { canonical: '/nhl' },
};

export default function NHLPage() {
  return (
    <>
      <FAQSchema faqs={NHL_BETTING_FAQS} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://petesbets.com' },
        { name: 'NHL Picks', url: 'https://petesbets.com/nhl' },
      ]} />

      <main className="min-h-screen bg-[#0c1017] text-white">
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-slate-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium mb-4">
              🏒 NHL Betting Analysis
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              NHL Betting Predictions Today
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Free AI-powered NHL picks, goal scorer props, and puck line analysis.
              First goal scorer, anytime scorer, and game totals analyzed daily.
            </p>
            <Link href="/?sport=NHL" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-lg">
              Get Today&apos;s NHL Picks <span>→</span>
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">NHL Betting Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '🥅', title: 'First Goal Scorer', description: 'AI-analyzed first goal scorer predictions with best odds.' },
                { icon: '⚡', title: 'Anytime Scorer', description: 'Anytime goal scorer props with value ratings.' },
                { icon: '📊', title: 'Puck Line Picks', description: 'NHL spread predictions with confidence levels.' },
                { icon: '🔢', title: 'Game Totals', description: 'Over/under predictions based on goalie matchups.' },
                { icon: '🔄', title: 'Odds Comparison', description: 'Compare NHL odds across all major sportsbooks.' },
                { icon: '🏒', title: 'Period Betting', description: '1st, 2nd, and 3rd period props and predictions.' },
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

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0e14]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">NHL Betting FAQ</h2>
            <div className="space-y-6">
              {NHL_BETTING_FAQS.map((faq, index) => (
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

        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Start Winning on NHL Tonight</h2>
            <p className="text-slate-400 mb-8">Get AI-powered picks for every NHL game.</p>
            <Link href="/?sport=NHL" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold">
              View NHL Picks
            </Link>
          </div>
        </section>

        <footer className="py-8 px-4 border-t border-slate-800">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 max-w-4xl mx-auto">
            <Link href="/nfl/super-bowl" className="hover:text-white">Super Bowl Picks</Link>
            <Link href="/nba" className="hover:text-white">NBA Picks</Link>
            <Link href="/mlb" className="hover:text-white">MLB Picks</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
