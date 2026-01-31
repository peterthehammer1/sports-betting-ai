/**
 * MLB Betting Predictions - SEO Landing Page
 * Targets: "MLB betting picks", "MLB predictions", "MLB player props"
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQSchema, BreadcrumbSchema } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'MLB Betting Predictions & Expert Picks Today | Free AI Analysis',
  description: 'Get free MLB betting predictions, daily picks, and player props analysis. AI-powered MLB predictions for run lines, totals, and batter/pitcher props.',
  keywords: [
    'MLB betting predictions',
    'MLB picks today',
    'MLB player props',
    'MLB strikeout props',
    'MLB home run props',
    'MLB run line picks',
    'MLB over under predictions',
    'free MLB picks',
    'best MLB bets today',
  ],
  openGraph: {
    title: 'MLB Betting Predictions Today | Free Expert Picks & Player Props',
    description: 'AI-powered MLB betting analysis with free picks, player props, and odds comparison.',
    url: 'https://petesaisportspicks.com/mlb',
  },
  alternates: { canonical: '/mlb' },
};

const MLB_FAQS = [
  {
    question: 'What are the best MLB player props to bet?',
    answer: 'The best MLB props include pitcher strikeouts against high-strikeout teams, batter total bases against weak pitching, and first 5 innings unders. Look for favorable matchups using our AI analysis.',
  },
  {
    question: 'How do MLB run lines work?',
    answer: 'MLB run lines are spreads of 1.5 runs. Favorites must win by 2+ runs (-1.5), underdogs can lose by 1 or win (+1.5). Run line favorites often offer plus money since baseball games are frequently decided by 1 run.',
  },
  {
    question: 'When should I bet MLB totals?',
    answer: 'Bet MLB overs in hitter-friendly ballparks, against bullpen games, or when wind is blowing out. Bet unders with elite starting pitchers, in pitcher parks, or cold/wet weather. Our AI factors in all conditions.',
  },
];

export default function MLBPage() {
  return (
    <>
      <FAQSchema faqs={MLB_FAQS} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://petesaisportspicks.com' },
        { name: 'MLB Picks', url: 'https://petesaisportspicks.com/mlb' },
      ]} />

      <main className="min-h-screen bg-[#0c1017] text-white">
        <section className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium mb-4">
              ⚾ MLB Betting Analysis
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              MLB Betting Predictions Today
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Free AI-powered MLB picks, batter props, pitcher strikeouts, and run line analysis.
            </p>
            <Link href="/?sport=MLB" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-lg">
              Get Today&apos;s MLB Picks <span>→</span>
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">MLB Betting Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '⚾', title: 'Batter Props', description: 'Hits, home runs, total bases, RBIs, and runs scored.' },
                { icon: '🔥', title: 'Pitcher Props', description: 'Strikeouts, hits allowed, and earned runs analysis.' },
                { icon: '📊', title: 'Run Line Picks', description: 'MLB spread predictions with confidence ratings.' },
                { icon: '🔢', title: 'Game Totals', description: 'Over/under predictions with ballpark factors.' },
                { icon: '5️⃣', title: 'First 5 Innings', description: 'F5 picks based on starting pitcher matchups.' },
                { icon: '🔄', title: 'Odds Comparison', description: 'Compare MLB odds across all sportsbooks.' },
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
            <h2 className="text-3xl font-bold text-center mb-12">MLB Betting FAQ</h2>
            <div className="space-y-6">
              {MLB_FAQS.map((faq, index) => (
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
            <h2 className="text-2xl font-bold mb-4">Start Winning on MLB Today</h2>
            <p className="text-slate-400 mb-8">Get AI-powered picks for every MLB game.</p>
            <Link href="/?sport=MLB" className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold">
              View MLB Picks
            </Link>
          </div>
        </section>

        <footer className="py-8 px-4 border-t border-slate-800">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400 max-w-4xl mx-auto">
            <Link href="/nfl/super-bowl" className="hover:text-white">Super Bowl Picks</Link>
            <Link href="/nba" className="hover:text-white">NBA Picks</Link>
            <Link href="/nhl" className="hover:text-white">NHL Picks</Link>
          </nav>
        </footer>
      </main>
    </>
  );
}
