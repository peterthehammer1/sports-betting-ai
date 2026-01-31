/**
 * Super Bowl LIX Content Hub
 * Comprehensive Super Bowl betting resource with expert picks, 
 * articles, prediction models, and AI analysis
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SuperBowlSchema, FAQSchema, BreadcrumbSchema, ArticleSchema } from '@/components/seo/StructuredData';
import { ExpertPredictions } from '@/components/superbowl/ExpertPredictions';
import { SuperBowlArticles } from '@/components/superbowl/SuperBowlArticles';
import { PredictionModels } from '@/components/superbowl/PredictionModels';

// Comprehensive Super Bowl SEO metadata
export const metadata: Metadata = {
  title: 'Super Bowl 2026 Betting Predictions & Expert Picks | Seahawks vs Patriots Analysis',
  description: 'Free Super Bowl LX betting predictions, expert picks from ESPN, CBS, FiveThirtyEight & more. AI-powered analysis, player props, odds comparison, and betting guides. Seahawks vs Patriots picks updated daily.',
  keywords: [
    'Super Bowl 2026 betting predictions',
    'Super Bowl LX picks',
    'Seahawks vs Patriots predictions',
    'Super Bowl 60 betting odds',
    'Super Bowl player props',
    'Super Bowl MVP odds',
    'Super Bowl spread picks',
    'Super Bowl over under',
    'Super Bowl expert picks',
    'free Super Bowl picks',
    'Geno Smith props',
    'Drake Maye props',
    'Super Bowl betting guide',
    'best Super Bowl bets',
    'Super Bowl prediction models',
    'FiveThirtyEight Super Bowl',
    'PFF Super Bowl predictions',
    'Super Bowl first touchdown scorer',
    'Super Bowl anytime TD',
    'Super Bowl 2026 odds comparison',
    'Seattle Seahawks Super Bowl',
    'New England Patriots Super Bowl',
    'Levis Stadium Super Bowl',
  ],
  openGraph: {
    title: 'Super Bowl 2026 Betting Predictions | Expert Picks & Analysis Hub',
    description: 'Complete Super Bowl LX betting resource. Expert predictions from ESPN, CBS, PFF, FiveThirtyEight and AI-powered analysis. Seahawks vs Patriots picks, props, and betting guides.',
    url: 'https://petesbets.com/nfl/super-bowl',
    type: 'article',
    images: [
      {
        url: '/og-superbowl.png',
        width: 1200,
        height: 630,
        alt: 'Super Bowl 2026 Betting Predictions - Seahawks vs Patriots',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Bowl 2026 Expert Picks & Betting Predictions',
    description: 'Free Super Bowl LX predictions from top experts and AI analysis. Seahawks vs Patriots picks, props, and betting guides.',
  },
  alternates: {
    canonical: '/nfl/super-bowl',
  },
};

// Super Bowl FAQs for AEO - VERIFIED DATA January 2026
const SUPER_BOWL_FAQS = [
  {
    question: 'Who do experts predict to win Super Bowl LX 2026?',
    answer: 'The Seattle Seahawks are 4.5-point favorites over the New England Patriots for Super Bowl LX on February 8, 2026. About 62% of expert picks favor Seattle, driven by Jaxon Smith-Njigba\'s NFL-leading 1,793 receiving yards and Sam Darnold\'s strong playoff performance (346 yards, 3 TDs in the NFC Championship).',
  },
  {
    question: 'What is the best bet for Super Bowl 2026?',
    answer: 'Top value bets: Jaxon Smith-Njigba receiving yards Over 95.5 (he averages 112/game), Drake Maye passing yards Over 270.5 (4,203 yards this season, 112.87 rating), and Patriots +4.5 given their perfect 8-0 road record. Sharp money is backing the Patriots as underdogs.',
  },
  {
    question: 'What are the Super Bowl LX odds?',
    answer: 'Spread: Seahawks -4.5 (BetMGM has -5). Moneyline: Seahawks -230, Patriots +190. Total: 46.5 points. Both teams were massive preseason underdogs (SEA +6000, NE +8000), making this one of the most unexpected Super Bowl matchups in recent history.',
  },
  {
    question: 'Who are the best first touchdown scorer bets?',
    answer: 'Best value first TD picks: Jaxon Smith-Njigba (+700) - NFL\'s leading receiver with 10 TDs, Kenneth Walker III (+800) - Seattle\'s workhorse RB, Stefon Diggs (+850) - New England\'s leading receiver (970 yards), and Hunter Henry (+950) - elite TE target.',
  },
  {
    question: 'Who are the Super Bowl LX MVP favorites?',
    answer: 'MVP odds: Sam Darnold +135 to +250 (Seahawks QB), Drake Maye +280 (Patriots QB), Jaxon Smith-Njigba +1400 (best non-QB odds). QBs have won 34 of 59 Super Bowl MVPs, but JSN\'s historic season makes him a sneaky pick if Seattle wins big.',
  },
  {
    question: 'Should I bet the Super Bowl over or under 46.5?',
    answer: 'The 46.5 total reflects both teams\' strong defensive playoff performances. Patriots held Denver to just 7 points in the AFC Championship. Historically, unders hit 55% in Super Bowls due to extra preparation time. Sharp money is split on this total.',
  },
  {
    question: 'Is this a Super Bowl rematch?',
    answer: 'Yes! This is a rematch of Super Bowl XLIX (February 2015), which the Patriots won 28-24 on Malcolm Butler\'s iconic goal-line interception with 26 seconds left. Seattle returns to the Super Bowl for the first time since back-to-back appearances in 2013-14.',
  },
  {
    question: 'What are the best Seahawks player props?',
    answer: 'Key Seattle props: Sam Darnold Pass Yards Over 265.5, Jaxon Smith-Njigba Rec Yards Over 95.5 (he\'s on pace to break Calvin Johnson\'s single-season record), Kenneth Walker III Rush Yards Over 75.5, and Cooper Kupp could be undervalued as the WR2 (593 yards).',
  },
];

export default function SuperBowlHubPage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <SuperBowlSchema
        homeTeam="Seattle Seahawks"
        awayTeam="New England Patriots"
        date="2026-02-08T18:30:00-05:00"
        venue="Levi's Stadium, Santa Clara, CA"
      />
      <FAQSchema faqs={SUPER_BOWL_FAQS} />
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://petesbets.com' },
          { name: 'NFL', url: 'https://petesbets.com/nfl' },
          { name: 'Super Bowl 2026', url: 'https://petesbets.com/nfl/super-bowl' },
        ]}
      />
      <ArticleSchema
        headline="Super Bowl 2026 Betting Predictions & Expert Picks"
        description="Complete Super Bowl LX betting analysis with expert predictions, AI picks, player props, and betting guides."
        datePublished="2026-01-15"
        dateModified="2026-01-29"
        author="Pete's AI Sports Picks"
      />

      <main className="min-h-screen bg-[#0c1017] text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#002244]/30 via-transparent to-[#69be28]/20" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#002244] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#69be28] rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-5xl mx-auto text-center">
            {/* Event Badge */}
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur rounded-full text-sm font-medium mb-6 border border-slate-700">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Super Bowl LX • February 8, 2026 • Levi&apos;s Stadium, San Francisco
            </span>

            {/* Matchup */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8">
              <div className="text-center">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/sea.png" 
                  alt="Seattle Seahawks"
                  className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-2"
                />
                <span className="text-lg sm:text-xl font-bold">Seahawks</span>
                <span className="block text-sm text-[#69be28]">NFC Champions</span>
              </div>
              
              <div className="text-center">
                <span className="text-3xl sm:text-5xl font-bold text-slate-400">VS</span>
                <div className="mt-2 text-xs sm:text-sm text-slate-500">
                  <div>Line: TBD</div>
                  <div>O/U: TBD</div>
                </div>
              </div>
              
              <div className="text-center">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/ne.png" 
                  alt="New England Patriots"
                  className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-2"
                />
                <span className="text-lg sm:text-xl font-bold">Patriots</span>
                <span className="block text-sm text-[#002244]">AFC Champions</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Super Bowl 2026 Betting Predictions
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8">
              Your complete Super Bowl LX betting resource. Expert picks from ESPN, CBS, PFF, 
              FiveThirtyEight, and AI-powered analysis. Player props, betting guides, and odds comparison.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/?sport=NFL&view=superbowl"
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-lg"
              >
                🤖 Get AI Analysis
              </Link>
              <Link
                href="#expert-picks"
                className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors border border-slate-700"
              >
                📊 Expert Picks
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Stats Bar */}
        <section className="border-y border-slate-800 bg-[#0a0e14]">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">10+</div>
                <div className="text-sm text-slate-400">Expert Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">7</div>
                <div className="text-sm text-slate-400">Prediction Models</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-400">50+</div>
                <div className="text-sm text-slate-400">Prop Analysis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">Daily</div>
                <div className="text-sm text-slate-400">Updates</div>
              </div>
            </div>
          </div>
        </section>

        {/* Expert Predictions Section */}
        <div id="expert-picks">
          <ExpertPredictions />
        </div>

        {/* Prediction Models Section */}
        <PredictionModels />

        {/* Articles & Guides Section */}
        <SuperBowlArticles />

        {/* Quick Betting Tips */}
        <section className="py-12 px-4 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Quick Super Bowl Betting Tips</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-900/20 to-transparent rounded-xl p-6 border border-emerald-900/30">
                <span className="text-3xl mb-4 block">💰</span>
                <h3 className="text-lg font-semibold mb-2">Shop Your Lines</h3>
                <p className="text-sm text-slate-400">
                  A half-point can mean the difference between winning and losing. 
                  Compare odds across FanDuel, DraftKings, BetMGM, and Caesars before placing any bet.
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-transparent rounded-xl p-6 border border-blue-900/30">
                <span className="text-3xl mb-4 block">📈</span>
                <h3 className="text-lg font-semibold mb-2">Follow Sharp Money</h3>
                <p className="text-sm text-slate-400">
                  Watch line movement. If the line moves against public betting percentages, 
                  sharp bettors may have identified value. Eagles moved from +2.5 to +1.5.
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-900/20 to-transparent rounded-xl p-6 border border-amber-900/30">
                <span className="text-3xl mb-4 block">🎯</span>
                <h3 className="text-lg font-semibold mb-2">Target Player Props</h3>
                <p className="text-sm text-slate-400">
                  Super Bowl player props offer the best value because oddsmakers have limited 
                  data. Focus on high-volume players with favorable matchups.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section for AEO */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#0a0e14]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Super Bowl 2025 Betting FAQ</h2>
            <div className="space-y-4">
              {SUPER_BOWL_FAQS.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-[#151c28] rounded-xl border border-slate-800 overflow-hidden"
                  open={index === 0}
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-800/30 transition-colors">
                    <h3 className="text-base font-medium pr-4">{faq.question}</h3>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                  </summary>
                  <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Win on Super Bowl Sunday?</h2>
            <p className="text-slate-400 mb-8">
              Get instant access to AI-powered Super Bowl analysis, player props breakdown, 
              and real-time odds comparison.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/?sport=NFL&view=superbowl"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
              >
                🤖 AI Analysis Dashboard
              </Link>
              <Link
                href="/?sport=NFL&view=tools"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors border border-slate-700"
              >
                🔧 Betting Tools
              </Link>
            </div>
          </div>
        </section>

        {/* Related Content & Internal Links */}
        <section className="py-12 px-4 border-t border-slate-800 bg-[#0a0e14]">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-8">More Betting Resources</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/nba" className="bg-[#151c28] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-2xl block mb-2">🏀</span>
                <span className="font-medium">NBA Picks</span>
              </Link>
              <Link href="/nhl" className="bg-[#151c28] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-2xl block mb-2">🏒</span>
                <span className="font-medium">NHL Picks</span>
              </Link>
              <Link href="/mlb" className="bg-[#151c28] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-2xl block mb-2">⚾</span>
                <span className="font-medium">MLB Picks</span>
              </Link>
              <Link href="/?view=tools" className="bg-[#151c28] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-2xl block mb-2">🧮</span>
                <span className="font-medium">Bet Calculator</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-slate-500 mb-4">
              Expert predictions are aggregated from publicly available sources. Betting involves risk. 
              Please gamble responsibly and only wager what you can afford to lose.
            </p>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <Link href="/" className="hover:text-white">Home</Link>
              <Link href="/nba" className="hover:text-white">NBA</Link>
              <Link href="/nhl" className="hover:text-white">NHL</Link>
              <Link href="/mlb" className="hover:text-white">MLB</Link>
            </nav>
          </div>
        </footer>
      </main>
    </>
  );
}
