/**
 * API Route: POST /api/analyze/superbowl/comprehensive
 * Comprehensive AI analysis for Super Bowl LX - THE CROWN JEWEL
 * Generates detailed predictions for all bet types
 */

import { NextResponse } from 'next/server';
import { getCachedGameAnalysis, cacheGameAnalysis, isRedisConfigured } from '@/lib/cache/redis';
import { saveSuperBowlPicks } from '@/lib/tracking/savePicks';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// VERIFIED Super Bowl LX data
const SUPER_BOWL_DATA = {
  teams: {
    seahawks: {
      name: 'Seattle Seahawks',
      abbrev: 'SEA',
      record: '14-4',
      offense: { rank: 3, ppg: 28.5 },
      defense: { rank: 12, ppg: 22.1 },
      keyPlayers: [
        { name: 'Sam Darnold', pos: 'QB', stats: '4,048 yds, 25 TD, 15 INT, 94.2 rating' },
        { name: 'Jaxon Smith-Njigba', pos: 'WR', stats: '1,793 yds, 10 TD, 107 rec - NFL LEADING' },
        { name: 'Kenneth Walker III', pos: 'RB', stats: '1,027 rush yds, 8 TD' },
        { name: 'Cooper Kupp', pos: 'WR', stats: '593 yds, 5 TD' },
        { name: 'DK Metcalf', pos: 'WR', stats: 'Deep threat, 14.2 YPC' },
      ],
    },
    patriots: {
      name: 'New England Patriots',
      abbrev: 'NE',
      record: '13-3, 8-0 road',
      offense: { rank: 5, ppg: 27.2 },
      defense: { rank: 4, ppg: 18.8 },
      keyPlayers: [
        { name: 'Drake Maye', pos: 'QB', stats: '4,203 yds, 30 TD, 12 INT, 112.87 rating - HIGHEST ROOKIE EVER' },
        { name: 'Stefon Diggs', pos: 'WR', stats: '970 yds, 8 TD' },
        { name: 'Hunter Henry', pos: 'TE', stats: '712 yds, 6 TD' },
        { name: 'Rhamondre Stevenson', pos: 'RB', stats: '620 total yds, 5 TD' },
        { name: "Ja'Lynn Polk", pos: 'WR', stats: 'Emerging deep threat' },
      ],
    },
  },
  lines: {
    spread: -4.5,
    total: 46.5,
    seahawksML: -230,
    patriotsML: 190,
  },
  context: 'Super Bowl XLIX rematch. Patriots won 28-24 in 2015 on Malcolm Butler goal-line interception. Seattle seeking redemption.',
  venue: "Levi's Stadium, Santa Clara, CA - neutral site, indoor-like conditions",
  weather: 'Partly cloudy, 58°F at kickoff - minimal impact',
};

export async function POST() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const cacheKey = 'superbowl-lx-comprehensive-v5';
    
    // Check cache (24 hour TTL for comprehensive analysis)
    const cached = await getCachedGameAnalysis(cacheKey, 'NFL') as { analysis: unknown } | null;
    if (cached) {
      return NextResponse.json({
        analysis: cached.analysis,
        fromCache: true,
        cacheEnabled: isRedisConfigured(),
      });
    }

    const prompt = `You are an elite NFL betting analyst. Generate comprehensive Super Bowl LX betting analysis.

MATCHUP: Seattle Seahawks vs New England Patriots
SUPER BOWL LX - February 8, 2026 - Levi's Stadium

=== SEATTLE SEAHAWKS (14-4, NFC Champions) ===
Offense: #3 (28.5 PPG) | Defense: #12 (22.1 PPG allowed)
Key Players:
${SUPER_BOWL_DATA.teams.seahawks.keyPlayers.map(p => `- ${p.name} (${p.pos}): ${p.stats}`).join('\n')}
Playoff Path: Beat Rams 31-27 in NFC Championship (Darnold: 346 yds, 3 TD)

=== NEW ENGLAND PATRIOTS (13-3, AFC Champions) ===
Offense: #5 (27.2 PPG) | Defense: #4 (18.8 PPG allowed)  
Key Players:
${SUPER_BOWL_DATA.teams.patriots.keyPlayers.map(p => `- ${p.name} (${p.pos}): ${p.stats}`).join('\n')}
Playoff Path: Beat Broncos 10-7 in AFC Championship (snow game, defensive battle)
Notable: 8-0 on the road this season

=== BETTING LINES ===
Spread: Seahawks -4.5 | Total: 46.5 | ML: SEA -230 / NE +190

=== CONTEXT ===
${SUPER_BOWL_DATA.context}
${SUPER_BOWL_DATA.venue}
${SUPER_BOWL_DATA.weather}

Provide comprehensive analysis in this EXACT JSON format:

{
  "gameWinner": {
    "pick": "Seattle Seahawks",
    "confidence": 68,
    "spread": "SEA -4.5",
    "spreadConfidence": 62,
    "analysis": "2-3 sentence analysis of why this team wins",
    "keyFactors": ["Factor 1", "Factor 2", "Factor 3", "Factor 4"]
  },
  "total": {
    "pick": "Over",
    "line": 46.5,
    "confidence": 58,
    "projectedScore": "27-20",
    "analysis": "2-3 sentences on total analysis",
    "keyFactors": ["Factor 1", "Factor 2", "Factor 3"]
  },
  "playerProps": [
    {
      "player": "Sam Darnold",
      "team": "SEA",
      "market": "Passing Yards",
      "pick": "Over",
      "line": "265.5",
      "odds": "-115",
      "confidence": 72,
      "reasoning": "Brief reasoning"
    },
    {
      "player": "Jaxon Smith-Njigba",
      "team": "SEA", 
      "market": "Receiving Yards",
      "pick": "Over",
      "line": "95.5",
      "odds": "-110",
      "confidence": 78,
      "reasoning": "Brief reasoning"
    },
    {
      "player": "Drake Maye",
      "team": "NE",
      "market": "Passing Yards", 
      "pick": "Over",
      "line": "270.5",
      "odds": "-115",
      "confidence": 70,
      "reasoning": "Brief reasoning"
    },
    {
      "player": "Kenneth Walker III",
      "team": "SEA",
      "market": "Rushing Yards",
      "pick": "Under",
      "line": "75.5",
      "odds": "-110",
      "confidence": 85,
      "reasoning": "A+ PICK: Patriots boast the #4 run defense allowing just 95.2 rush YPG. New England stuffed the run in the AFC Championship (Broncos had 67 rush yards). Seattle will lean on the pass with JSN dominating - expect Walker around 55-65 rushing yards."
    },
    {
      "player": "Kenneth Walker III",
      "team": "SEA",
      "market": "Receiving Yards",
      "pick": "Over",
      "line": "18.5",
      "odds": "-115",
      "confidence": 88,
      "reasoning": "A+ PICK: With Patriots stacking the box to stop the run, Walker becomes a key outlet receiver. He's averaged 3.2 receptions per game in playoffs. Seattle uses him on screens and check-downs when facing pressure - expect 4-5 catches for 25-35 yards."
    },
    {
      "player": "Hunter Henry",
      "team": "NE",
      "market": "Receiving Yards",
      "pick": "Over",
      "line": "45.5",
      "odds": "-115",
      "confidence": 68,
      "reasoning": "Henry is Maye's safety valve and red zone target. Expect 5-6 catches in a game where Patriots will need to throw."
    },
    {
      "player": "Jaxon Smith-Njigba",
      "team": "SEA",
      "market": "Anytime TD",
      "pick": "Yes",
      "line": "",
      "odds": "-130",
      "confidence": 75,
      "reasoning": "Brief reasoning"
    },
    {
      "player": "Kenneth Walker III",
      "team": "SEA",
      "market": "Anytime TD",
      "pick": "Yes",
      "line": "",
      "odds": "-115",
      "confidence": 70,
      "reasoning": "Brief reasoning"
    },
    {
      "player": "Stefon Diggs",
      "team": "NE",
      "market": "Anytime TD",
      "pick": "Yes",
      "line": "",
      "odds": "+110",
      "confidence": 62,
      "reasoning": "Brief reasoning"
    }
  ],
  "quarterProps": [
    {
      "quarter": "1Q",
      "market": "Total Points",
      "pick": "Under 10.5",
      "odds": "-115",
      "confidence": 65,
      "reasoning": "Both teams typically start slow in big games"
    },
    {
      "quarter": "1Q",
      "market": "Spread",
      "pick": "Patriots +1.5",
      "odds": "-110",
      "confidence": 60,
      "reasoning": "Brief reasoning"
    },
    {
      "quarter": "4Q",
      "market": "Highest Scoring",
      "pick": "4th Quarter",
      "odds": "+180",
      "confidence": 55,
      "reasoning": "Super Bowls often have dramatic finishes"
    }
  ],
  "halfProps": [
    {
      "half": "1H",
      "market": "Spread",
      "pick": "Patriots +2.5",
      "odds": "-110",
      "confidence": 62,
      "reasoning": "Patriots tend to keep games close early"
    },
    {
      "half": "1H",
      "market": "Total",
      "pick": "Under 23.5",
      "odds": "-110",
      "confidence": 60,
      "reasoning": "Expect cautious play early"
    },
    {
      "half": "2H",
      "market": "Spread",
      "pick": "Seahawks -2.5",
      "odds": "-115",
      "confidence": 65,
      "reasoning": "Seattle's offense opens up after halftime"
    }
  ],
  "parlays": [
    {
      "name": "High Confidence 2-Leg",
      "legs": ["Seahawks ML", "Over 46.5"],
      "totalOdds": "+165",
      "payout": "26.50",
      "confidence": 58,
      "reasoning": "Both picks align with game script expectations"
    },
    {
      "name": "JSN Special",
      "legs": ["JSN Over 95.5 Rec Yds", "JSN Anytime TD", "Seahawks -4.5"],
      "totalOdds": "+450",
      "payout": "55.00",
      "confidence": 45,
      "reasoning": "JSN is matchup-proof and due for huge game"
    },
    {
      "name": "QB Battle",
      "legs": ["Darnold Over 265.5 Pass Yds", "Maye Over 270.5 Pass Yds", "Over 46.5"],
      "totalOdds": "+380",
      "payout": "48.00",
      "confidence": 48,
      "reasoning": "Both QBs should air it out in shootout"
    },
    {
      "name": "Long Shot Value",
      "legs": ["Patriots +4.5", "Under 46.5", "Maye MVP"],
      "totalOdds": "+1200",
      "payout": "130.00",
      "confidence": 25,
      "reasoning": "If Patriots win, it's a defensive battle with Maye heroics"
    }
  ],
  "mvp": {
    "pick": "Sam Darnold",
    "odds": "+175",
    "confidence": 45,
    "reasoning": "Career redemption story. If Seahawks win, Darnold likely has 300+ yards and 3+ TDs in biggest moment.",
    "darkHorse": {
      "pick": "Jaxon Smith-Njigba",
      "odds": "+1400",
      "reasoning": "Record-breaking season deserves Super Bowl exclamation point. 150+ yards and 2 TDs in a win gives him serious case."
    }
  },
  "finalScore": {
    "seahawks": 27,
    "patriots": 20,
    "reasoning": "Seattle's offense controls the game with JSN and Walker dominating. Seahawks build a 10-point lead in the 4th, Patriots score late but can't recover the onside kick. Seattle covers -4.5 comfortably."
  }
}

Be creative with analysis while staying realistic. Provide SPECIFIC reasoning for each pick.
Return ONLY valid JSON, no other text.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API failed');
    }

    const data = await response.json();
    const textContent = data.content?.[0]?.text;
    
    if (!textContent) {
      throw new Error('No response from Claude');
    }

    // Parse JSON
    let analysis;
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Failed to parse analysis');
    }

    // Cache for 24 hours
    await cacheGameAnalysis(cacheKey, 'NFL', { analysis });

    // Save picks to tracker (only for new analysis, not cached)
    try {
      const savedPicks = await saveSuperBowlPicks(analysis);
      console.log(`Saved ${savedPicks.length} Super Bowl picks to tracker`);
    } catch (trackingError) {
      console.error('Failed to save picks to tracker:', trackingError);
      // Don't fail the request if tracking fails
    }

    return NextResponse.json({
      analysis,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Comprehensive analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
