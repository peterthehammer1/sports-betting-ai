/**
 * Super Bowl LX Content Hub - SEO Landing Page
 * Clean, professional design matching other sport pages
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { SuperBowlSchema, FAQSchema, BreadcrumbSchema, ArticleSchema } from '@/components/seo/StructuredData';
import { ExpertPredictions } from '@/components/superbowl/ExpertPredictions';
import { SuperBowlArticles } from '@/components/superbowl/SuperBowlArticles';
import { PredictionModels } from '@/components/superbowl/PredictionModels';

export const metadata: Metadata = {
  title: 'Super Bowl 2026 Betting Predictions & Expert Picks | Seahawks vs Patriots',
  description: 'Free Super Bowl LX betting predictions. Expert picks from ESPN, CBS, FiveThirtyEight & AI analysis. Seahawks vs Patriots odds, props, and betting guides.',
  keywords: [
    'Super Bowl 2026 betting predictions',
    'Super Bowl LX picks',
    'Seahawks vs Patriots predictions',
    'Super Bowl player props',
    'Super Bowl MVP odds',
    'Super Bowl expert picks',
  ],
  openGraph: {
    title: 'Super Bowl 2026 Betting Predictions | Expert Picks & Analysis',
    description: 'Complete Super Bowl LX betting resource. Expert predictions, AI analysis, player props, and betting guides.',
    url: 'https://petesbets.com/nfl/super-bowl',
  },
  alternates: { canonical: '/nfl/super-bowl' },
};

const SUPER_BOWL_FAQS = [
  {
    question: 'Who do experts predict to win Super Bowl LX 2026?',
    answer: 'The Seattle Seahawks are 4.5-point favorites over the New England Patriots for Super Bowl LX on February 8, 2026. About 62% of expert picks favor Seattle, driven by Jaxon Smith-Njigba\'s NFL-leading 1,793 receiving yards.',
  },
  {
    question: 'What are the Super Bowl LX odds?',
    answer: 'Spread: Seahawks -4.5. Moneyline: Seahawks -230, Patriots +190. Total: 46.5 points. Both teams were massive preseason underdogs (SEA +6000, NE +8000).',
  },
  {
    question: 'Who are the best first touchdown scorer bets?',
    answer: 'Best value first TD picks: Jaxon Smith-Njigba (+700), Kenneth Walker III (+800), Stefon Diggs (+850), and Hunter Henry (+950).',
  },
  {
    question: 'Who are the Super Bowl LX MVP favorites?',
    answer: 'MVP odds: Sam Darnold +175 (Seahawks QB), Drake Maye +280 (Patriots QB), Jaxon Smith-Njigba +1400. QBs have won 34 of 59 Super Bowl MVPs.',
  },
  {
    question: 'Is this a Super Bowl rematch?',
    answer: 'Yes! This is a rematch of Super Bowl XLIX (2015), which the Patriots won 28-24 on Malcolm Butler\'s goal-line interception. Seattle returns for the first time since 2014.',
  },
];

export default function SuperBowlHubPage() {
  return (
    <>
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

      <main className="min-h-screen bg-[#0d1117] text-white">
        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm font-medium mb-4">
              Super Bowl LX • February 8, 2026
            </span>
            
            {/* Matchup */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 my-8">
              <div className="text-center">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/sea.png" 
                  alt="Seattle Seahawks"
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                />
                <span className="text-base sm:text-lg font-bold">Seahawks</span>
                <span className="block text-xs text-slate-500">NFC Champions</span>
              </div>
              
              <div className="text-center px-4">
                <div className="text-2xl sm:text-3xl font-bold text-slate-500">VS</div>
                <div className="text-xs text-slate-500 mt-1">SEA -4.5</div>
              </div>
              
              <div className="text-center">
                <img 
                  src="https://a.espncdn.com/i/teamlogos/nfl/500/ne.png" 
                  alt="New England Patriots"
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                />
                <span className="text-base sm:text-lg font-bold">Patriots</span>
                <span className="block text-xs text-slate-500">AFC Champions</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Super Bowl 2026 Betting Predictions
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Expert picks from ESPN, CBS, PFF, FiveThirtyEight, and AI-powered analysis. 
              Player props, betting guides, and odds comparison.
            </p>
            
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              Get AI Analysis →
            </Link>
          </div>
        </section>

        {/* Tools */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Super Bowl Betting Tools</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🤖', title: 'AI Analysis', description: 'Claude-powered game predictions with confidence scores.' },
                { icon: '📊', title: 'Expert Picks', description: 'Aggregated picks from ESPN, CBS, PFF, and more.' },
                { icon: '🎯', title: 'TD Scorer Props', description: 'First and anytime touchdown scorer analysis.' },
                { icon: '🏆', title: 'MVP Odds', description: 'Super Bowl MVP predictions and value plays.' },
                { icon: '📈', title: 'Prediction Models', description: 'FiveThirtyEight, PFF, and statistical models.' },
                { icon: '🔄', title: 'Odds Comparison', description: 'Compare lines across all major sportsbooks.' },
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

        {/* Expert Predictions */}
        <div id="expert-picks">
          <ExpertPredictions />
        </div>

        {/* Prediction Models */}
        <PredictionModels />

        {/* Articles */}
        <SuperBowlArticles />

        {/* FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Super Bowl Betting FAQ</h2>
            <div className="space-y-3">
              {SUPER_BOWL_FAQS.map((faq, index) => (
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
            <h2 className="text-xl font-bold mb-3">Ready for Super Bowl Sunday?</h2>
            <p className="text-slate-400 text-sm mb-6">Get AI-powered analysis and real-time odds comparison.</p>
            <Link 
              href="/" 
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-slate-200 transition-colors inline-block"
            >
              View Super Bowl Picks
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-8 px-4 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/nba" className="bg-[#161b22] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-xl block mb-1">🏀</span>
                <span className="text-sm font-medium">NBA Picks</span>
              </Link>
              <Link href="/nhl" className="bg-[#161b22] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-xl block mb-1">🏒</span>
                <span className="text-sm font-medium">NHL Picks</span>
              </Link>
              <Link href="/mlb" className="bg-[#161b22] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-xl block mb-1">⚾</span>
                <span className="text-sm font-medium">MLB Picks</span>
              </Link>
              <Link href="/?view=tools" className="bg-[#161b22] rounded-lg p-4 border border-slate-800 hover:border-slate-700 transition-colors text-center">
                <span className="text-xl block mb-1">🧮</span>
                <span className="text-sm font-medium">Calculator</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-800">
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 max-w-4xl mx-auto">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/nba" className="hover:text-white transition-colors">NBA Picks</Link>
            <Link href="/nhl" className="hover:text-white transition-colors">NHL Picks</Link>
            <Link href="/mlb" className="hover:text-white transition-colors">MLB Picks</Link>
          </nav>
          <p className="text-center text-xs text-slate-600 mt-4">
            For entertainment purposes only. Please gamble responsibly.
          </p>
        </footer>
      </main>
    </>
  );
}
