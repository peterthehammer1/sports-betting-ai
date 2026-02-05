/**
 * Super Bowl Articles & Guides
 * SEO-optimized betting content for user value
 */

'use client';

import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'analysis' | 'props' | 'history';
  readTime: string;
  icon: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 'betting-guide',
    title: 'Complete Super Bowl LX Betting Guide 2026',
    description: 'Everything you need to know about betting on Super Bowl LX - Seahawks vs Patriots, spreads, totals, and exotic props.',
    category: 'guide',
    readTime: '12 min read',
    icon: '📚',
    featured: true,
  },
  {
    id: 'player-props',
    title: 'Best Super Bowl LX Player Props to Bet',
    description: 'Analysis of the top player prop bets: JSN, Sam Darnold, Drake Maye, Kenneth Walker III, Stefon Diggs.',
    category: 'props',
    readTime: '8 min read',
    icon: '👤',
    featured: true,
  },
  {
    id: 'sam-darnold-analysis',
    title: 'Sam Darnold Super Bowl Props Breakdown',
    description: 'Deep dive into Darnold\'s passing props after his incredible NFC Championship performance (346 yards, 3 TDs).',
    category: 'analysis',
    readTime: '6 min read',
    icon: '🏈',
  },
  {
    id: 'jsn-analysis',
    title: 'Jaxon Smith-Njigba Prop Bets Guide',
    description: 'The NFL\'s leading receiver (1,793 yards) is set for a huge Super Bowl. Analysis of JSN\'s prop value.',
    category: 'analysis',
    readTime: '5 min read',
    icon: '🏃',
  },
  {
    id: 'super-bowl-history',
    title: 'Super Bowl XLIX Rematch: Betting History',
    description: 'This is a rematch of the Malcolm Butler interception game. Historical trends and revenge narrative analysis.',
    category: 'history',
    readTime: '10 min read',
    icon: '📊',
  },
  {
    id: 'first-td-scorer',
    title: 'First Touchdown Scorer Predictions',
    description: 'Who will score the first TD? JSN, Kenneth Walker III, Stefon Diggs, Hunter Henry analysis.',
    category: 'props',
    readTime: '7 min read',
    icon: '🎯',
  },
];

const CATEGORY_STYLES = {
  guide: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  analysis: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  props: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  history: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
};

// Full article content
interface ArticleContent {
  sections: {
    title: string;
    content: string[];
    tip?: string;
  }[];
}

// VERIFIED DATA - January 2026
const ARTICLE_CONTENT: Record<string, ArticleContent> = {
  'betting-guide': {
    sections: [
      {
        title: 'Understanding Super Bowl LX Betting Lines',
        content: [
          'The Super Bowl offers more betting markets than any other single sporting event. Understanding each type is crucial for making informed wagers.',
          'For Super Bowl LX, the Seahawks opened as 4.5-point favorites (some books have -5). A bet on SEA -4.5 means they must win by 5 or more points to cover.',
          'Moneyline: Seahawks -230, Patriots +190. The Patriots\' underdog value reflects their surprising run through the AFC as +8000 preseason underdogs.',
        ],
        tip: 'Shop lines across multiple sportsbooks. BetMGM has Seahawks -5 while others are at -4.5 - that half-point matters!',
      },
      {
        title: 'Totals (Over/Under) Betting',
        content: [
          'The total for Super Bowl LX is set at 46.5 points across most sportsbooks.',
          'Historically, Super Bowl unders have hit about 55% of the time. The Patriots held Denver to just 7 points in the AFC Championship.',
          'Consider factors like weather (Levi\'s Stadium is outdoor but Bay Area February weather is mild), and both teams\' defensive performances in the playoffs.',
        ],
      },
      {
        title: 'The Rematch Narrative',
        content: [
          'This is a rematch of Super Bowl XLIX from the 2014 season, which the Patriots won on Malcolm Butler\'s iconic goal-line interception.',
          'Seattle hasn\'t been to the Super Bowl since back-to-back appearances in 2013-14. This "revenge game" narrative could impact motivation.',
          'New England returns to the Super Bowl for the first time since 2018. Mike Vrabel\'s coaching has transformed this young roster.',
        ],
        tip: 'Historical rematches in Super Bowls have been unpredictable - don\'t over-index on the revenge narrative.',
      },
      {
        title: 'Bankroll Management',
        content: [
          'Never bet more than 5% of your total bankroll on a single Super Bowl wager, no matter how confident you feel.',
          'Consider spreading your bets across multiple markets (spread, total, props) to diversify risk.',
          'Both teams were massive preseason underdogs (SEA +6000, NE +8000) - anything can happen!',
        ],
      },
    ],
  },
  'player-props': {
    sections: [
      {
        title: 'Top Value Prop Bets',
        content: [
          'Player props offer the best value in Super Bowl betting because oddsmakers have less historical data for specific player performances.',
          'Seahawks key players: Sam Darnold (4,048 yards, 25 TD), Jaxon Smith-Njigba (NFL-leading 1,793 yards, 119 rec, 10 TD), Kenneth Walker III (1,027 rush yards).',
          'Patriots key players: Drake Maye (4,203 yards, 30 TD, 112.87 rating + 409 rush yards), Stefon Diggs (970 yards), Hunter Henry (712 yards).',
        ],
        tip: 'JSN has +1400 MVP odds - the best non-QB odds. His historic season makes him a sneaky MVP candidate if Seattle wins big.',
      },
      {
        title: 'Passing Yards Props',
        content: [
          'Sam Darnold: Threw for 346 yards and 3 TDs in the NFC Championship. His connection with JSN is the best in football right now.',
          'Drake Maye: Led the league in passer rating (112.87) with 4,203 yards. His dual-threat ability (409 rush yards, 4 rush TDs) creates extra dimensions.',
          'Game script matters: If Patriots fall behind early, Maye will need to throw 40+ times. If it\'s close, expect more balance.',
        ],
      },
      {
        title: 'Rushing & Receiving Props',
        content: [
          'Kenneth Walker III: 1,027 rush yards this season (4.5 YPC). Seattle will try to establish the run to set up play-action for JSN.',
          'Jaxon Smith-Njigba: On pace to break Calvin Johnson\'s single-season receiving record (1,964 yards). First player ever with 75+ yards in first 10 games.',
          'Stefon Diggs (970 yards) and Hunter Henry (712 yards) are Maye\'s top targets. Rhamondre Stevenson adds receiving threat out of the backfield.',
        ],
        tip: 'Cooper Kupp (593 yards) is Seattle\'s WR2 and could be undervalued if JSN draws extra coverage.',
      },
      {
        title: 'Touchdown Scorer Props',
        content: [
          'First TD Scorer: Historically, skill position players (not QBs) score the first TD about 75% of the time.',
          'Seahawks options: Jaxon Smith-Njigba (+700), Kenneth Walker III (+800), Cooper Kupp (+1100).',
          'Patriots options: Stefon Diggs (+850), Hunter Henry (+950), Rhamondre Stevenson (+1000).',
        ],
      },
    ],
  },
  'sam-darnold-analysis': {
    sections: [
      {
        title: 'Sam Darnold\'s Career Renaissance',
        content: [
          'Sam Darnold, the former #3 overall pick (2018), has finally reached his potential in Seattle after stops with the Jets, Panthers, and Vikings.',
          '2025 Season Stats: 4,048 passing yards, 25 touchdowns, 14 interceptions, 99.11 passer rating.',
          'His NFC Championship performance (346 yards, 3 TDs vs the Rams) showed he can deliver on the biggest stage.',
        ],
      },
      {
        title: 'Props to Target',
        content: [
          'Passing Yards Over 265.5: Darnold averaged 253 yards/game this season but elevated in playoffs. JSN creates easy completions.',
          'Passing TDs Over 1.5 (+100): Seattle\'s red zone efficiency and JSN\'s 10 TD season support this.',
          'Completions Over 24.5: His 68% completion rate and short-to-intermediate passing game favor the over.',
        ],
        tip: 'Darnold is the MVP favorite at +135 to +250. If Seattle wins comfortably, he likely takes home the award.',
      },
      {
        title: 'Matchup Analysis',
        content: [
          'Patriots defense was stout in the AFC Championship (allowed just 7 points to Denver in the snow).',
          'Watch for Darnold to target JSN on intermediate routes where he\'s been unstoppable all season.',
          'Play-action should be effective as Patriots will need to respect Kenneth Walker III.',
        ],
      },
    ],
  },
  'jsn-analysis': {
    sections: [
      {
        title: 'Jaxon Smith-Njigba\'s Historic Season',
        content: [
          'Jaxon Smith-Njigba is having one of the greatest receiver seasons in NFL history.',
          '2025 Stats: 1,793 receiving yards (NFL-leading), 119 receptions, 10 touchdowns.',
          'He\'s on pace to break Calvin Johnson\'s single-season record of 1,964 yards (2012). He already broke DK Metcalf\'s Seahawks record (1,303 yards).',
        ],
      },
      {
        title: 'Props to Target',
        content: [
          'Receiving Yards Over 95.5: JSN averages 112 yards/game. Even with extra attention, he finds ways to get open.',
          'Receptions Over 8.5: He averages 7.4 catches/game and is Darnold\'s clear #1 target.',
          'Anytime TD (-130): 10 TDs this season and Seattle\'s primary red zone target.',
        ],
        tip: 'JSN has +1400 MVP odds - the best non-QB value. If he has a monster game (150+ yards, 2 TDs), he could steal the award.',
      },
      {
        title: 'Patriots Coverage Analysis',
        content: [
          'Expect the Patriots to bracket JSN with a corner and safety help, similar to what teams tried all season.',
          'This should open opportunities for Cooper Kupp and the tight ends.',
          'JSN\'s route-running precision and contested-catch ability make him nearly impossible to shut down completely.',
        ],
      },
    ],
  },
  'super-bowl-history': {
    sections: [
      {
        title: 'Super Bowl XLIX Rematch',
        content: [
          'This is a rematch of Super Bowl XLIX from February 1, 2015, won by the Patriots 28-24 on Malcolm Butler\'s iconic goal-line interception.',
          'That play - with Seattle on the 1-yard line with 26 seconds left - is one of the most famous moments in Super Bowl history.',
          'Seattle hasn\'t returned to the Super Bowl since back-to-back appearances in 2013 (win vs Denver) and 2014 (loss to New England).',
        ],
      },
      {
        title: 'Underdog Trends',
        content: [
          'Since 2000, underdogs are 14-10 ATS in the Super Bowl. The extra preparation time often benefits the less-favored team.',
          'The Patriots were +8000 preseason underdogs - one of the longest shots to ever reach the Super Bowl.',
          'New England\'s 13-3 record and perfect 8-0 road record this season suggests they thrive as underdogs.',
        ],
        tip: 'Patriots +4.5 offers value given their road success and underdog mentality all season.',
      },
      {
        title: 'MVP Betting Insights',
        content: [
          'QBs have won 34 of 59 Super Bowl MVPs (58%). Sam Darnold (+135 to +250) and Drake Maye (+280) are heavy favorites.',
          'Jaxon Smith-Njigba (+1400) has the best non-QB odds. A 150+ yard, 2 TD performance could steal the award.',
          'Cooper Kupp won MVP in Super Bowl LVI (2021) - another receiver having a dominant season could do the same.',
        ],
      },
      {
        title: 'Totals & Scoring',
        content: [
          'The 46.5 total reflects both teams\' defensive playoff performances. Patriots held Denver to 7 points in AFC Championship.',
          'Outdoor Super Bowls at Levi\'s Stadium (like Super Bowl 50) typically see slightly lower scoring.',
          'Bad Bunny\'s halftime performance is set - the longest halftime shows tend to correlate with lower second-half scoring.',
        ],
      },
    ],
  },
  'first-td-scorer': {
    sections: [
      {
        title: 'Understanding First TD Value',
        content: [
          'First TD scorer props offer some of the highest potential payouts in Super Bowl betting.',
          'Historical data shows that skilled position players (not QBs) score the first TD about 75% of the time.',
          'Opening drives rarely result in TDs—only 15% of Super Bowl first TDs come on the game\'s first possession.',
        ],
        tip: 'Consider players who see red zone targets/carries consistently, not just overall yardage leaders.',
      },
      {
        title: 'Top Candidates Seahawks',
        content: [
          'Jaxon Smith-Njigba (+700): NFL\'s leading receiver with 1,793 yards. Seattle\'s primary red zone target with 10 TDs this season.',
          'Kenneth Walker III (+800): Seattle\'s workhorse back (1,027 yards) who gets goal-line carries consistently.',
          'Cooper Kupp (+1100): The veteran adds a second elite option if JSN draws extra coverage.',
        ],
      },
      {
        title: 'Top Candidates Patriots',
        content: [
          'Stefon Diggs (+850): New England\'s leading receiver (970 yards). Maye\'s top target in the red zone.',
          'Hunter Henry (+950): Elite tight end with 712 receiving yards. TEs often find soft spots in zone coverage.',
          'Rhamondre Stevenson (+1000): Gets goal-line work and can catch out of the backfield.',
          'Drake Maye (+1400): Don\'t sleep on Maye rushing TD - he has 4 this season and 409 rush yards.',
        ],
      },
      {
        title: 'First TD Strategy',
        content: [
          'Spread small bets across 3-4 players at +800 or better for maximum expected value.',
          'Avoid favorites shorter than +700—the juice isn\'t worth the squeeze.',
          'Consider "any other scorer" if available—it\'s a catch-all for defensive/special teams TDs.',
        ],
      },
    ],
  },
};

interface SuperBowlArticlesProps {
  onNavigateToAnalysis?: () => void;
}

export function SuperBowlArticles({ onNavigateToAnalysis }: SuperBowlArticlesProps) {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const article = selectedArticle ? ARTICLES.find(a => a.id === selectedArticle) : null;
  const content = selectedArticle ? ARTICLE_CONTENT[selectedArticle] : null;
  
  if (selectedArticle && article && content) {
    const style = CATEGORY_STYLES[article.category];
    
    return (
      <section className="py-6">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Guides
          </button>
          
          <article className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            {/* Article Header */}
            <div className="p-5 sm:p-6 border-b border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
                <span className="text-xs text-slate-500">{article.readTime}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2 leading-tight">{article.title}</h1>
              <p className="text-sm text-slate-400 leading-relaxed">{article.description}</p>
            </div>
            
            {/* Article Content */}
            <div className="p-5 sm:p-6">
              {content.sections.map((section, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-6 pt-6 border-t border-slate-700/50' : ''}>
                  <h2 className="text-base font-semibold mb-3 text-white">{section.title}</h2>
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-slate-400 leading-relaxed mb-3 text-sm">
                      {paragraph}
                    </p>
                  ))}
                  {section.tip && (
                    <div className="bg-amber-500/10 border-l-2 border-amber-500/50 rounded-r-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-base">💡</span>
                        <div>
                          <span className="font-semibold text-amber-400 text-xs uppercase tracking-wide">Pro Tip</span>
                          <p className="text-slate-300 mt-1 text-sm">{section.tip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Article Footer */}
            <div className="p-5 sm:p-6 border-t border-slate-700 bg-slate-900/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-600">
                  Last updated: January 2026 • Pete&apos;s Super Bowl Coverage
                </p>
                <button
                  onClick={() => {
                    setSelectedArticle(null);
                    onNavigateToAnalysis?.();
                  }}
                  className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Get AI Predictions →
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>
    );
  }

  // Article List View
  const featuredArticles = ARTICLES.filter(a => a.featured);
  const otherArticles = ARTICLES.filter(a => !a.featured);

  return (
    <section className="py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-1">Super Bowl Betting Guides</h2>
          <p className="text-slate-500 text-sm">
            Expert-written guides and analysis for Super Bowl LX
          </p>
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {featuredArticles.map((article) => {
            const style = CATEGORY_STYLES[article.category];
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article.id)}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-left hover:border-slate-600 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                    {article.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${style.bg} ${style.text} border ${style.border}`}>
                        Featured
                      </span>
                      <span className="text-[10px] text-slate-500">{article.readTime}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-slate-300 transition-colors mb-1 leading-snug">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{article.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Other Articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {otherArticles.map((article) => {
            const style = CATEGORY_STYLES[article.category];
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article.id)}
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 text-left hover:border-slate-600 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-base mb-3">
                  {article.icon}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text} border ${style.border}`}>
                  {article.category}
                </span>
                <h3 className="text-xs font-semibold text-white mt-2 group-hover:text-slate-300 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <span className="text-[10px] text-slate-600 mt-2 block">{article.readTime}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
