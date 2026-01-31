/**
 * Super Bowl TD Scorers Component
 * First TD and Anytime TD Scorer predictions with analysis
 */

'use client';

import Image from 'next/image';

const SEAHAWKS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png';
const PATRIOTS_LOGO = 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png';

const REFERRAL_URL = 'https://fndl.co/kt63uos';

interface TDPick {
  player: string;
  team: 'SEA' | 'NE';
  position: string;
  odds: string;
  confidence: number;
  analysis: string;
  keyStats: string[];
  projection: string;
}

const FIRST_TD_PICKS: TDPick[] = [
  {
    player: 'Kenneth Walker III',
    team: 'SEA',
    position: 'RB',
    odds: '+650',
    confidence: 72,
    analysis: `Walker has scored 5 first-half TDs in his last 8 games, and Seattle's opening script typically features 2-3 designed runs inside the 10. In the NFC Championship, Walker punched in the first score on a 3-yard run. The Seahawks are methodical openers - they've scored first in 11 of 18 games this season, and 6 of those were rushing TDs. With Belichick likely scheming to limit JSN early, expect Seattle to establish the run and Walker to get goal-line carries.`,
    keyStats: [
      '5 first-half TDs in last 8 games',
      'Seattle scored first in 11/18 games',
      '8 red zone TDs this season',
      'AFC Champ: First TD on 3-yard run',
    ],
    projection: 'High-value play at +650. Walker gets 60%+ of goal-line work.',
  },
  {
    player: 'Hunter Henry',
    team: 'NE',
    position: 'TE',
    odds: '+1200',
    confidence: 65,
    analysis: `Henry is Drake Maye's safety valve and has been lethal in the red zone - 6 TDs in his last 9 games. The Patriots offense under Maye loves quick-hitting routes to the TE on opening drives to get the rookie QB comfortable. In both playoff games, the Patriots' first scoring drive included at least 2 targets to Henry. Seattle's defense has allowed the 7th-most receiving TDs to tight ends this season. At +1200, this is excellent value for a player who could easily find the end zone early.`,
    keyStats: [
      '6 TDs in last 9 games',
      '2+ targets on opening drives in playoffs',
      "Seattle allows 7th-most TDs to TEs",
      "Maye's most trusted red zone target",
    ],
    projection: 'Sneaky value at +1200. Henry is NE\'s go-to red zone weapon.',
  },
];

const ANYTIME_TD_PICKS: TDPick[] = [
  {
    player: 'Jaxon Smith-Njigba',
    team: 'SEA',
    position: 'WR',
    odds: '-145',
    confidence: 88,
    analysis: `JSN is the NFL's leading receiver with 1,793 yards and has scored in 12 of 18 games this season. He's averaged 1.2 TDs per game over the last 5 weeks and is Darnold's favorite target in every situation. The Patriots secondary has been vulnerable to slot receivers, allowing the 5th-most receptions to the slot. In the NFC Championship, JSN caught 11 passes for 156 yards and 2 TDs. This is as close to a lock as you'll find - the only question is whether he scores once or twice.`,
    keyStats: [
      'NFL-leading 1,793 receiving yards',
      'Scored in 12/18 games',
      '1.2 TDs/game over last 5 weeks',
      'NFC Champ: 11 rec, 156 yds, 2 TD',
    ],
    projection: 'Near-lock at -145. Expect 8+ targets and multiple red zone looks.',
  },
  {
    player: 'Stefon Diggs',
    team: 'NE',
    position: 'WR',
    odds: '+105',
    confidence: 78,
    analysis: `Diggs has been Drake Maye's deep threat all season and has scored in 9 of 16 games played. He's been especially effective in big moments - 4 TDs in the last 4 games including the playoffs. Seattle's secondary has been suspect against speed receivers, and Diggs still has elite route-running ability. The Patriots will need to throw to compete, and Diggs will see 7-10 targets. At plus money, this is one of the best values on the board.`,
    keyStats: [
      'Scored in 9/16 games',
      '4 TDs in last 4 games',
      '970 receiving yards, 8 TDs',
      'Leads team in red zone targets',
    ],
    projection: 'Great value at +105. Expect 8+ targets in pass-heavy game script.',
  },
  {
    player: 'Kenneth Walker III',
    team: 'SEA',
    position: 'RB',
    odds: '-180',
    confidence: 85,
    analysis: `Walker is Seattle's workhorse with 8 rushing TDs and 3 receiving TDs this season. He gets 100% of the goal-line work and has scored in 10 of 17 games. Against a Patriots defense that allows 4.3 YPC, Walker should find room to operate. Even if the Patriots slow the run, Walker is a factor in the passing game with 35 receptions. The heavy juice (-180) is warranted - this is one of the safest TD props on the board.`,
    keyStats: [
      '11 total TDs (8 rush, 3 rec)',
      'Scored in 10/17 games',
      '100% goal-line touches',
      '35 receptions, versatile weapon',
    ],
    projection: 'Safe play at -180. Walker is involved in every scoring opportunity.',
  },
  {
    player: 'Rhamondre Stevenson',
    team: 'NE',
    position: 'RB',
    odds: '+175',
    confidence: 68,
    analysis: `Stevenson has been the Patriots' short-yardage back all season with 5 TDs. While he's not the featured back, he gets the goal-line carries when the Patriots are inside the 5. Seattle allows 4.5 YPC to running backs, which could give New England opportunities to pound it in. Stevenson scored in the AFC Championship on a 2-yard plunge. At +175, there's solid value if the Patriots can sustain drives.`,
    keyStats: [
      '5 rushing TDs this season',
      'Goal-line specialist role',
      'AFC Champ: 2-yard TD',
      'Seattle allows 4.5 YPC to RBs',
    ],
    projection: 'Value play at +175 if Patriots can move the ball.',
  },
];

export function SuperBowlTDScorers() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏈</span>
          <div>
            <h2 className="text-lg font-bold text-slate-800">TD Scorer Predictions</h2>
            <p className="text-xs text-slate-500">First TD & Anytime TD analysis for Super Bowl LX</p>
          </div>
        </div>
        <a
          href={REFERRAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[#1493FF] text-white text-sm font-semibold rounded-lg hover:bg-[#0D7FE8] transition-colors"
        >
          Bet on FanDuel
        </a>
      </div>

      {/* First TD Scorer Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
            🎯 FIRST TD SCORER
          </span>
          <span className="text-xs text-slate-500">Higher risk, higher reward</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {FIRST_TD_PICKS.map((pick) => (
            <TDPickCard key={pick.player + 'first'} pick={pick} type="first" />
          ))}
        </div>
      </section>

      {/* Anytime TD Scorer Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            ✅ ANYTIME TD SCORER
          </span>
          <span className="text-xs text-slate-500">More consistent, better hit rate</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {ANYTIME_TD_PICKS.map((pick) => (
            <TDPickCard key={pick.player + 'anytime'} pick={pick} type="anytime" />
          ))}
        </div>
      </section>

      {/* Betting Tips */}
      <section className="p-5 bg-slate-50 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-3">💡 TD Scorer Betting Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <p className="font-medium text-slate-700 mb-1">First TD Strategy</p>
            <p>Target players who get early red zone looks. RBs and TEs often score first as teams ease into the game. Look for +500 or better odds for value.</p>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Anytime TD Strategy</p>
            <p>Focus on volume and red zone usage. Star WRs and primary RBs are safest. Don't chase long odds unless there's a clear path to the end zone.</p>
          </div>
        </div>
      </section>

      {/* FanDuel CTA */}
      <a
        href={REFERRAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-5 bg-gradient-to-r from-[#1493FF] to-[#0D7FE8] rounded-xl hover:from-[#0D7FE8] hover:to-[#0A6BC4] transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-lg font-bold">Bet TD Props on FanDuel</p>
            <p className="text-white/80 text-sm">New users: Bet $5, Get $150 in Bonus Bets!</p>
          </div>
          <span className="px-5 py-2.5 bg-white text-[#1493FF] font-bold rounded-lg shadow-md">
            Claim Bonus →
          </span>
        </div>
      </a>

      <p className="text-xs text-slate-500 text-center">
        All odds subject to change. Please gamble responsibly. 21+ where legal.
      </p>
    </div>
  );
}

function TDPickCard({ pick, type }: { pick: TDPick; type: 'first' | 'anytime' }) {
  const confidenceColor = pick.confidence >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                          pick.confidence >= 70 ? 'text-amber-600 bg-amber-50 border-amber-200' :
                          'text-slate-600 bg-slate-50 border-slate-200';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image 
            src={pick.team === 'SEA' ? SEAHAWKS_LOGO : PATRIOTS_LOGO} 
            alt={pick.team} 
            width={40} 
            height={40} 
            unoptimized 
          />
          <div>
            <p className="font-bold text-slate-800">{pick.player}</p>
            <p className="text-xs text-slate-500">{pick.position} • {pick.team === 'SEA' ? 'Seahawks' : 'Patriots'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-[#1493FF]">{pick.odds}</p>
          <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${confidenceColor}`}>
            {pick.confidence}% conf
          </span>
        </div>
      </div>

      {/* Analysis */}
      <div className="p-4">
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{pick.analysis}</p>
        
        {/* Key Stats */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Stats</p>
          <div className="flex flex-wrap gap-2">
            {pick.keyStats.map((stat, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">
                {stat}
              </span>
            ))}
          </div>
        </div>

        {/* Projection */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs font-semibold text-slate-700">
            📊 {pick.projection}
          </p>
        </div>
      </div>

      {/* Bet Button */}
      <a
        href={REFERRAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-3 bg-slate-800 text-center hover:bg-slate-700 transition-colors"
      >
        <span className="text-white text-sm font-semibold">
          Bet {pick.player} {type === 'first' ? 'First TD' : 'Anytime TD'} {pick.odds}
        </span>
      </a>
    </div>
  );
}
