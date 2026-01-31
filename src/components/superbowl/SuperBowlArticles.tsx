/**
 * Super Bowl Articles & Guides
 * SEO-optimized betting content for user value
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

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
    title: 'Complete Super Bowl Betting Guide 2026',
    description: 'Everything you need to know about betting on Super Bowl LX - from spreads and totals to exotic props.',
    category: 'guide',
    readTime: '12 min read',
    icon: '📚',
    featured: true,
  },
  {
    id: 'player-props',
    title: 'Best Super Bowl Player Props to Bet',
    description: 'Analysis of the top player prop bets for Seahawks vs Patriots including passing, rushing, and touchdown props.',
    category: 'props',
    readTime: '8 min read',
    icon: '👤',
    featured: true,
  },
  {
    id: 'geno-smith-analysis',
    title: 'Geno Smith Super Bowl Props Breakdown',
    description: 'Deep dive into Geno Smith passing yards, touchdowns, and rushing props for Seattle.',
    category: 'analysis',
    readTime: '6 min read',
    icon: '🏈',
  },
  {
    id: 'dk-metcalf-analysis',
    title: 'DK Metcalf Prop Bets Guide',
    description: 'Analyzing Metcalf\'s receiving yards, receptions, and touchdown props against the Patriots defense.',
    category: 'analysis',
    readTime: '5 min read',
    icon: '🏃',
  },
  {
    id: 'super-bowl-history',
    title: 'Super Bowl Betting Trends & History',
    description: 'Historical data on Super Bowl spreads, totals, and prop performance to inform your 2026 bets.',
    category: 'history',
    readTime: '10 min read',
    icon: '📊',
  },
  {
    id: 'first-td-scorer',
    title: 'First Touchdown Scorer Predictions',
    description: 'Who will score the first TD? Analysis of historical first scorers and best value picks.',
    category: 'props',
    readTime: '7 min read',
    icon: '🎯',
  },
];

const CATEGORY_STYLES = {
  guide: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  analysis: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  props: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  history: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
};

// Full article content
interface ArticleContent {
  sections: {
    title: string;
    content: string[];
    tip?: string;
  }[];
}

const ARTICLE_CONTENT: Record<string, ArticleContent> = {
  'betting-guide': {
    sections: [
      {
        title: 'Understanding Super Bowl Betting Lines',
        content: [
          'The Super Bowl offers more betting markets than any other single sporting event. Understanding each type is crucial for making informed wagers.',
          'The point spread (or "line") is the most popular bet type. For Super Bowl LX, the Seahawks opened as slight favorites. A bet on SEA -2.5 means they must win by 3 or more points to cover.',
          'Moneyline bets are straight-up winner picks. As slight favorites, Seahawks moneyline offers less value but more probability. Patriots moneyline pays better as underdogs.',
        ],
        tip: 'Shop lines across multiple sportsbooks. A half-point difference can significantly impact your expected value over time.',
      },
      {
        title: 'Totals (Over/Under) Betting',
        content: [
          'The total for Super Bowl LX is projected around 47.5 points. This represents oddsmakers\' projection for combined team scoring.',
          'Historically, Super Bowl unders have hit about 55% of the time. The increased preparation time often leads to tighter defensive games.',
          'Consider factors like weather (Levi\'s Stadium is outdoor), offensive tempo, and red zone efficiency when betting totals.',
        ],
      },
      {
        title: 'Live Betting Strategy',
        content: [
          'Super Bowl live betting offers dynamic odds that change with every play. This creates opportunities to capitalize on momentum shifts.',
          'Key live betting moments: after a team falls behind early (buy low), following a big turnover (market overreaction), and at halftime.',
          'Set a budget specifically for live bets and avoid chasing losses. The game\'s emotional swings can lead to poor decisions.',
        ],
        tip: 'Have multiple sportsbook apps open during the game to quickly compare live odds and find the best value.',
      },
      {
        title: 'Bankroll Management',
        content: [
          'Never bet more than 5% of your total bankroll on a single Super Bowl wager, no matter how confident you feel.',
          'Consider spreading your bets across multiple markets (spread, total, props) to diversify risk.',
          'Set a total budget for Super Bowl betting and stick to it. The game should be entertainment, not a financial burden.',
        ],
      },
    ],
  },
  'player-props': {
    sections: [
      {
        title: 'Top Value Prop Bets',
        content: [
          'Player props offer the best value in Super Bowl betting because oddsmakers have less historical data to work with for specific player performances.',
          'Focus on players with consistent volume: Geno Smith, DK Metcalf, Tyler Lockett, and Kenneth Walker III for Seattle.',
          'Avoid "square" props (heavily bet by public) and look for lines where sharp money has created value.',
        ],
        tip: 'Props posted earlier in the week often have softer lines. Bet early if you see value before the market adjusts.',
      },
      {
        title: 'Passing Yards Props',
        content: [
          'Geno Smith O/U 255.5 passing yards: Smith has consistently hit this mark with his elite receiving corps.',
          'Watch for Patriots QB props based on game script - if trailing, passing volume increases significantly.',
          'Consider the game script: If Seahawks build a lead, they may run more. If Patriots lead, Smith will need to air it out.',
        ],
      },
      {
        title: 'Rushing & Receiving Props',
        content: [
          'Kenneth Walker III O/U 75.5 rushing yards: Seattle\'s workhorse back should see 18-22 carries.',
          'DK Metcalf O/U 80.5 receiving yards: Metcalf is a big-game player who thrives against single coverage.',
          'Tyler Lockett O/U 55.5 receiving yards: The veteran slot receiver is Geno Smith\'s safety valve.',
        ],
        tip: 'Cross-reference reception props with yards props. High target volume + favorable matchup = good value.',
      },
      {
        title: 'Touchdown Scorer Props',
        content: [
          'First TD Scorer: Historically, skill position players (not QBs) score the first TD about 75% of the time.',
          'Best value first TD: DK Metcalf (+750), Kenneth Walker III (+800), Tyler Lockett (+1000).',
          'Anytime TD scorers: Build a same-game parlay with 2-3 likely scorers to boost your payout.',
        ],
      },
    ],
  },
  'geno-smith-analysis': {
    sections: [
      {
        title: 'Geno Smith\'s Resurgence',
        content: [
          'Geno Smith has transformed from journeyman to Pro Bowl quarterback since taking over in Seattle.',
          'His connection with DK Metcalf and Tyler Lockett creates one of the NFL\'s most dangerous passing attacks.',
          'Smith\'s ability to extend plays and make accurate deep throws has been crucial to Seattle\'s success.',
        ],
      },
      {
        title: 'Props to Target',
        content: [
          'Passing Yards Over 250.5 (-115): Smith averages 265 yards per game this season with elite weapons.',
          'Passing TDs Over 1.5 (+100): Seattle\'s red zone efficiency makes this plus-money value appealing.',
          'Completions Over 22.5 (-110): High completion percentage (68%) supports the over here.',
        ],
        tip: 'Geno Smith props can offer value because he\'s not a household name - oddsmakers may undervalue him.',
      },
      {
        title: 'Matchup Analysis',
        content: [
          'Patriots secondary has been opportunistic but can be exploited by elite route runners.',
          'Watch for Smith to attack the intermediate zones where Seattle\'s offense thrives.',
          'Play-action should be effective as Patriots respect Seattle\'s running game.',
        ],
      },
    ],
  },
  'dk-metcalf-analysis': {
    sections: [
      {
        title: 'DK Metcalf\'s Big-Game Ability',
        content: [
          'DK Metcalf is one of the NFL\'s most physically dominant receivers at 6\'4" 235 lbs.',
          'His combination of size, speed, and contested-catch ability makes him nearly impossible to cover one-on-one.',
          'Metcalf has consistently performed well in primetime and playoff games throughout his career.',
        ],
      },
      {
        title: 'Props to Target',
        content: [
          'Receiving Yards Over 80.5 (-115): Metcalf averages 85+ yards in big games.',
          'Receptions Over 5.5 (-110): High target share makes this a solid play.',
          'Anytime TD (-140): Metcalf is Seattle\'s primary red zone target.',
        ],
        tip: 'Same-game parlay: Metcalf 70+ yards + Metcalf TD at plus-odds offers great value.',
      },
      {
        title: 'Patriots Coverage Analysis',
        content: [
          'Patriots will likely bracket Metcalf with safety help over the top.',
          'This could open up opportunities for Tyler Lockett and the tight ends.',
          'Watch for designed plays to get Metcalf the ball in space on screens and quick slants.',
        ],
      },
    ],
  },
  'super-bowl-history': {
    sections: [
      {
        title: 'Spread Trends',
        content: [
          'Since 2000, underdogs are 14-10 ATS in the Super Bowl. The extra preparation time often benefits the less-favored team.',
          'The last 5 Super Bowls: Favorites are 3-2 ATS but just 2-3 SU when favored by less than 3 points.',
          'Rematches (like Chiefs-Eagles in 2023) tend to favor the team that lost the first meeting (seeking revenge).',
        ],
      },
      {
        title: 'Totals Trends',
        content: [
          'Since 2015, the under is 6-4 in Super Bowls. Increased defensive preparation contributes to lower scoring.',
          'Games between top-10 offenses have averaged 52.3 points over the last decade.',
          'Indoor Super Bowls (like 2025 in New Orleans) average 2.3 more points than outdoor games.',
        ],
        tip: 'When sharp money and public money disagree on the total, follow the sharps.',
      },
      {
        title: 'MVP Betting Insights',
        content: [
          'QBs have won 31 of 57 Super Bowl MVPs (54%). When the winning team\'s QB plays well, they almost always win it.',
          'Non-QB MVPs are rare: only 2 in the last 15 years (Von Miller 2015, Cooper Kupp 2021).',
          'Best MVP value: back the QB you think will win at better odds than their team\'s moneyline.',
        ],
      },
      {
        title: 'Prop Bet History',
        content: [
          'First TD scorer: Wide receivers win about 35% of the time, RBs 30%, TEs 15%, QBs 10%.',
          'National anthem over/under: Has been set around 1:55-2:00 recently. Over has hit 7 of last 10 years.',
          'Coin flip: Tails has won 30 of 57 coin flips (52.6%). The opener is truly random but fun to track.',
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
          'DK Metcalf (+750): Seattle\'s primary red zone target. Physical presence makes him a constant threat.',
          'Kenneth Walker III (+800): Seattle\'s workhorse back who gets goal-line carries consistently.',
          'Tyler Lockett (+1000): Veteran slot receiver who finds soft spots in the defense.',
        ],
      },
      {
        title: 'Top Candidates Patriots',
        content: [
          'Patriots RB (+850): New England\'s backfield rotation means value on the featured runner.',
          'Patriots WR1 (+1000): Primary receiving target should see red zone opportunities.',
          'Patriots TE (+1200): Tight ends often find space in the red zone.',
          'Look for game script - if Patriots trail, more passing means WR/TE value.',
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

export function SuperBowlArticles() {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const article = selectedArticle ? ARTICLES.find(a => a.id === selectedArticle) : null;
  const content = selectedArticle ? ARTICLE_CONTENT[selectedArticle] : null;
  
  if (selectedArticle && article && content) {
    const style = CATEGORY_STYLES[article.category];
    
    return (
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button 
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
          >
            ← Back to All Articles
          </button>
          
          <article className="bg-[#151c28] rounded-xl border border-slate-800 overflow-hidden">
            {/* Article Header */}
            <div className="p-8 border-b border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </span>
                <span className="text-sm text-slate-500">{article.readTime}</span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
              <p className="text-lg text-slate-400">{article.description}</p>
            </div>
            
            {/* Article Content */}
            <div className="p-8">
              {content.sections.map((section, idx) => (
                <div key={idx} className={idx > 0 ? 'mt-10' : ''}>
                  <h2 className="text-xl font-semibold mb-4 text-emerald-400">{section.title}</h2>
                  {section.content.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-slate-300 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}
                  {section.tip && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-4">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">💡</span>
                        <div>
                          <span className="font-semibold text-emerald-400">Pro Tip:</span>
                          <p className="text-slate-300 mt-1">{section.tip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Article Footer */}
            <div className="p-8 border-t border-slate-800 bg-[#0c1017]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Last updated: February 2025 • Part of Pete&apos;s Super Bowl Coverage
                </p>
                <Link
                  href="/?sport=NFL&view=superbowl"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
                >
                  Get AI Predictions →
                </Link>
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
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Super Bowl Betting Guides</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Expert-written guides and analysis to help you make smarter Super Bowl bets.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {featuredArticles.map((article) => {
            const style = CATEGORY_STYLES[article.category];
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article.id)}
                className="bg-[#151c28] rounded-xl border border-slate-800 p-6 text-left hover:border-emerald-500/50 hover:bg-[#1a2332] transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{article.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${style.bg} ${style.text}`}>
                        Featured
                      </span>
                      <span className="text-xs text-slate-500">{article.readTime}</span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition-colors mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-400">{article.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Other Articles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {otherArticles.map((article) => {
            const style = CATEGORY_STYLES[article.category];
            return (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article.id)}
                className="bg-[#151c28] rounded-xl border border-slate-800 p-4 text-left hover:border-slate-700 transition-colors group"
              >
                <span className="text-2xl block mb-3">{article.icon}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${style.bg} ${style.text}`}>
                  {article.category}
                </span>
                <h3 className="text-sm font-semibold mt-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <span className="text-xs text-slate-500 mt-2 block">{article.readTime}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
