/**
 * Claude Analysis Prompt Templates
 * 
 * These prompts are designed to get structured, actionable predictions
 * from Claude for sports betting analysis.
 */

import type { GameAnalysisRequest, GoalScorerAnalysisRequest, NbaPlayerPropsAnalysisRequest } from '@/types/prediction';

/**
 * System prompt that sets up Claude as a sports betting analyst
 */
export const ANALYST_SYSTEM_PROMPT = `You are an expert sports betting analyst with deep knowledge of NHL hockey and NBA basketball. Your role is to analyze games and provide well-reasoned predictions for betting purposes.

Your analysis should be:
- Data-driven and objective
- Clear about confidence levels
- Honest about limitations and risks
- Focused on finding value (where true probability differs from implied odds)

You will receive game information including current betting odds from multiple sportsbooks. Use the implied probabilities from these odds as a baseline market consensus, then apply your analysis to determine if there's value.

IMPORTANT: Always respond with valid JSON matching the exact structure requested. Do not include any text outside the JSON object.`;

/**
 * System prompt for goal scorer analysis
 */
export const GOAL_SCORER_SYSTEM_PROMPT = `You are an expert NHL betting analyst specializing in goal scorer props.

Your role is to analyze goal scorer betting markets and identify value opportunities based on the odds data provided.

CRITICAL RULES:
1. You must ONLY analyze and recommend players that appear in the provided odds data
2. Do NOT make up or hallucinate player names - only use names from the input data
3. Do NOT assume you know current rosters - players get traded frequently
4. Base your analysis primarily on the odds and implied probabilities provided
5. Your "reasoning" should focus on the odds value, not claims about player stats you cannot verify
6. Be honest that you are analyzing odds patterns, not real-time player performance data

For reasoning, focus on:
- Comparing odds across bookmakers (if a player has better odds at one book)
- Implied probability analysis (which players the market thinks are most likely)
- Value identification (odds that seem mispriced based on market patterns)
- General hockey knowledge (forwards vs defensemen scoring rates, etc.)

IMPORTANT: Always respond with valid JSON matching the exact structure requested. Do not include any text outside the JSON object.`;

/**
 * Build the analysis prompt for a specific game
 */
export function buildGameAnalysisPrompt(request: GameAnalysisRequest): string {
  const { sport, homeTeam, awayTeam, commenceTime, odds, teamStats, injuries, headToHead } = request;
  
  let prompt = `Analyze this ${sport} game and provide betting predictions:

## Game Information
- **Matchup**: ${awayTeam} @ ${homeTeam}
- **Start Time**: ${new Date(commenceTime).toLocaleString()}
- **Sport**: ${sport}

## Current Betting Odds (Consensus from multiple sportsbooks)

### Moneyline
- ${homeTeam}: ${formatOddsDisplay(odds.moneyline.home.best)} (implied: ${(odds.moneyline.home.impliedProb * 100).toFixed(1)}%)
- ${awayTeam}: ${formatOddsDisplay(odds.moneyline.away.best)} (implied: ${(odds.moneyline.away.impliedProb * 100).toFixed(1)}%)

### Spread
- Line: ${homeTeam} ${odds.spread.line > 0 ? '+' : ''}${odds.spread.line}
- ${homeTeam}: ${formatOddsDisplay(odds.spread.home.price)}
- ${awayTeam}: ${formatOddsDisplay(odds.spread.away.price)}

### Total (Over/Under)
- Line: ${odds.total.line}
- Over: ${formatOddsDisplay(odds.total.over.price)}
- Under: ${formatOddsDisplay(odds.total.under.price)}
`;

  // Add team stats if available
  if (teamStats) {
    prompt += `\n## Team Statistics\n${JSON.stringify(teamStats, null, 2)}\n`;
  }

  // Add injuries if available
  if (injuries && injuries.length > 0) {
    prompt += `\n## Injury Report\n`;
    for (const injury of injuries) {
      prompt += `- ${injury.player} (${injury.team}): ${injury.status} - ${injury.injury}\n`;
    }
  }

  // Add head-to-head if available
  if (headToHead && headToHead.length > 0) {
    prompt += `\n## Recent Head-to-Head\n`;
    for (const game of headToHead.slice(0, 5)) {
      prompt += `- ${game.date}: ${game.awayTeam} ${game.awayScore} @ ${game.homeTeam} ${game.homeScore}\n`;
    }
  }

  prompt += `
## Analysis Request

Provide a comprehensive betting analysis for this game. Consider:
1. Which team is more likely to win and why
2. Whether the spread accurately reflects the expected margin
3. Whether the total is set appropriately
4. Any value bets where the true probability differs from market odds

Respond with a JSON object matching this exact structure:

{
  "winner": {
    "pick": "Team Name",
    "confidence": 65,
    "reasoning": "Brief explanation of why this team wins"
  },
  "score": {
    "home": 3,
    "away": 2,
    "confidence": 45,
    "reasoning": "Brief explanation of score prediction"
  },
  "spread": {
    "pick": "Team Name",
    "line": -1.5,
    "confidence": 55,
    "reasoning": "Brief explanation of spread pick"
  },
  "total": {
    "pick": "OVER",
    "line": 6.5,
    "predictedTotal": 7,
    "confidence": 60,
    "reasoning": "Brief explanation of total pick"
  },
  "valueBets": [
    {
      "betType": "MONEYLINE",
      "pick": "Team Name",
      "bookImpliedProb": 0.45,
      "claudeEstimatedProb": 0.52,
      "edge": 0.07,
      "confidence": 65,
      "reasoning": "Why this is a value bet"
    }
  ],
  "keyFactors": [
    "Key factor 1",
    "Key factor 2",
    "Key factor 3"
  ],
  "risks": [
    "Risk or concern 1",
    "Risk or concern 2"
  ],
  "bestBets": [
    {
      "rank": 1,
      "betType": "SPREAD",
      "pick": "Team +1.5",
      "odds": -110,
      "confidence": 68,
      "value": "HIGH",
      "reasoning": "Why this is the best bet"
    }
  ]
}

IMPORTANT RULES:
- Confidence scores should be 50-100 (50 = coin flip, 100 = certain)
- Only include value bets if edge is > 3%
- Rank best bets by combination of confidence and value
- Be conservative with confidence - rarely exceed 75
- If data is limited, acknowledge this in reasoning
- Always provide at least 3 key factors and 2 risks`;

  return prompt;
}

/**
 * Format odds for display in prompt (American format)
 */
function formatOddsDisplay(decimalOdds: number): string {
  if (decimalOdds >= 2) {
    return `+${Math.round((decimalOdds - 1) * 100)}`;
  } else {
    return `${Math.round(-100 / (decimalOdds - 1))}`;
  }
}

/**
 * Build a quick analysis prompt for multiple games (batch mode)
 */
export function buildBatchAnalysisPrompt(games: GameAnalysisRequest[]): string {
  let prompt = `Analyze these ${games.length} games and provide quick predictions for each:

`;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    prompt += `## Game ${i + 1}: ${game.awayTeam} @ ${game.homeTeam}
- Moneyline: ${game.homeTeam} ${formatOddsDisplay(game.odds.moneyline.home.best)} / ${game.awayTeam} ${formatOddsDisplay(game.odds.moneyline.away.best)}
- Spread: ${game.homeTeam} ${game.odds.spread.line > 0 ? '+' : ''}${game.odds.spread.line}
- Total: ${game.odds.total.line}

`;
  }

  prompt += `For each game, provide:
1. Winner pick with confidence (50-100)
2. Best bet recommendation

Respond with a JSON array:
[
  {
    "gameIndex": 0,
    "homeTeam": "Team A",
    "awayTeam": "Team B",
    "winnerPick": "Team A",
    "winnerConfidence": 62,
    "bestBet": {
      "type": "SPREAD",
      "pick": "Team B +1.5",
      "confidence": 58
    },
    "quickTake": "One sentence summary"
  }
]`;

  return prompt;
}

/**
 * Build prompt for goal scorer analysis (NHL) - based on odds data
 */
export function buildGoalScorerAnalysisPrompt(
  homeTeam: string,
  awayTeam: string,
  commenceTime: string,
  firstGoalScorers: Array<{
    playerName: string;
    team: string;
    bestOdds: number;
    averageImpliedProb: number;
  }>,
  anytimeGoalScorers: Array<{
    playerName: string;
    team: string;
    bestOdds: number;
    averageImpliedProb: number;
  }>
): string {
  // Format odds for display
  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  return `Analyze goal scorer betting markets for this NHL game:

## Game Information
- **Matchup**: ${awayTeam} @ ${homeTeam}
- **Start Time**: ${new Date(commenceTime).toLocaleString()}

## First Goal Scorer Market
These players have odds to score the FIRST goal of the game:

${firstGoalScorers.slice(0, 20).map((p, i) => 
  `${i + 1}. ${p.playerName} - ${formatOdds(p.bestOdds)} (implied: ${(p.averageImpliedProb * 100).toFixed(1)}%)`
).join('\n')}

## Anytime Goal Scorer Market  
These players have odds to score ANY goal during the game:

${anytimeGoalScorers.slice(0, 20).map((p, i) => 
  `${i + 1}. ${p.playerName} - ${formatOdds(p.bestOdds)} (implied: ${(p.averageImpliedProb * 100).toFixed(1)}%)`
).join('\n')}

## Analysis Request

Analyze these goal scorer markets and identify the best betting opportunities.

CRITICAL: You must ONLY select players from the lists above. Do NOT invent or assume any players not listed.

Consider:
1. Which players have the best odds value (lower implied probability = higher potential payout)
2. Market consensus - players with consistent odds across books are "known" factors
3. Odds discrepancies - players with varying odds across books may offer value
4. Position-based analysis - forwards typically score more than defensemen

Base your reasoning on the odds data provided, not assumptions about current player performance.

Respond with a JSON object matching this structure:

{
  "firstGoalPicks": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "market": "first_goal_scorer",
      "bestOdds": 800,
      "impliedProbability": 0.111,
      "estimatedProbability": 0.14,
      "edge": 0.029,
      "confidence": 62,
      "reasoning": "Why this player is a good first goal scorer bet",
      "valueBet": true
    }
  ],
  "anytimeGoalPicks": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name", 
      "market": "anytime_goal_scorer",
      "bestOdds": 150,
      "impliedProbability": 0.40,
      "estimatedProbability": 0.48,
      "edge": 0.08,
      "confidence": 65,
      "reasoning": "Why this player is a good anytime goal scorer bet",
      "valueBet": true
    }
  ],
  "topValueBets": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "market": "first_goal_scorer",
      "bestOdds": 1200,
      "impliedProbability": 0.077,
      "estimatedProbability": 0.11,
      "edge": 0.033,
      "confidence": 58,
      "reasoning": "Why this is the best value bet overall",
      "valueBet": true
    }
  ],
  "analysisNotes": [
    "Key insight about this game's goal scoring outlook",
    "Notable matchup or trend to consider"
  ]
}

IMPORTANT RULES:
- ONLY use player names that appear in the data above - do NOT invent players
- Provide exactly 5 picks for firstGoalPicks (ranked best to worst) - must be from the First Goal Scorer list
- Provide exactly 5 picks for anytimeGoalPicks (ranked best to worst) - must be from the Anytime Goal Scorer list
- topValueBets should contain 3 picks with the highest edge regardless of market
- Only mark valueBet: true if edge > 5%
- Confidence scores should be 50-100 (50 = coin flip, 100 = certain)
- Be conservative - first goal scorer is inherently volatile
- Base reasoning on odds analysis, not claims about player stats you cannot verify`;
}

/**
 * System prompt for NBA player props analysis
 */
export const NBA_PROPS_SYSTEM_PROMPT = `You are an expert NBA betting analyst specializing in player props (points, rebounds, assists).

Your role is to analyze player prop betting markets and identify value opportunities based on the odds data provided.

CRITICAL RULES:
1. You must ONLY analyze and recommend players that appear in the provided odds data
2. Do NOT make up or hallucinate player names - only use names from the input data
3. Base your analysis primarily on the odds and implied probabilities provided
4. Focus on identifying value - where the line or odds seem mispriced
5. Your "reasoning" should focus on the odds value and line analysis
6. Be honest that you are analyzing odds patterns, not real-time player stats

For reasoning, focus on:
- Line value - does the line seem high or low based on the odds?
- Odds discrepancies between Over and Under (juiced lines tell a story)
- Comparing similar players' lines
- General NBA knowledge (role players vs stars, pace of play implications)

IMPORTANT: Always respond with valid JSON matching the exact structure requested.`;

/**
 * Build prompt for NBA player props analysis
 */
export function buildNbaPlayerPropsAnalysisPrompt(request: NbaPlayerPropsAnalysisRequest): string {
  const { homeTeam, awayTeam, commenceTime, playerProps } = request;

  const formatOdds = (american: number) => 
    american > 0 ? `+${american}` : `${american}`;

  return `Analyze player prop betting markets for this NBA game:

## Game Information
- **Matchup**: ${awayTeam} @ ${homeTeam}
- **Start Time**: ${new Date(commenceTime).toLocaleString()}

## Points Props
Players with points over/under lines:

${playerProps.points.slice(0, 15).map((p, i) => 
  `${i + 1}. ${p.playerName} - Line: ${p.line} | Over ${formatOdds(p.overOdds)} (${(p.overImpliedProb * 100).toFixed(1)}%) | Under ${formatOdds(p.underOdds)} (${(p.underImpliedProb * 100).toFixed(1)}%)`
).join('\n')}

## Rebounds Props
Players with rebounds over/under lines:

${playerProps.rebounds.slice(0, 15).map((p, i) => 
  `${i + 1}. ${p.playerName} - Line: ${p.line} | Over ${formatOdds(p.overOdds)} (${(p.overImpliedProb * 100).toFixed(1)}%) | Under ${formatOdds(p.underOdds)} (${(p.underImpliedProb * 100).toFixed(1)}%)`
).join('\n')}

## Assists Props
Players with assists over/under lines:

${playerProps.assists.slice(0, 15).map((p, i) => 
  `${i + 1}. ${p.playerName} - Line: ${p.line} | Over ${formatOdds(p.overOdds)} (${(p.overImpliedProb * 100).toFixed(1)}%) | Under ${formatOdds(p.underOdds)} (${(p.underImpliedProb * 100).toFixed(1)}%)`
).join('\n')}

## Analysis Request

Analyze these player prop markets and identify the best betting opportunities.

CRITICAL: You must ONLY select players from the lists above. Do NOT invent players.

Consider:
1. Lines that seem off compared to similar players
2. Juiced odds indicating sharp action (heavy Over or Under juice)
3. Value opportunities where the implied probabilities seem mispriced
4. General NBA context (home/away, pace expectations)

Respond with a JSON object matching this structure:

{
  "pointsPicks": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "propType": "points",
      "line": 24.5,
      "pick": "OVER",
      "bestOdds": -110,
      "impliedProbability": 0.524,
      "estimatedProbability": 0.58,
      "edge": 0.056,
      "confidence": 62,
      "reasoning": "Why this is a good pick based on the odds",
      "valueBet": true
    }
  ],
  "reboundsPicks": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "propType": "rebounds",
      "line": 10.5,
      "pick": "UNDER",
      "bestOdds": -105,
      "impliedProbability": 0.512,
      "estimatedProbability": 0.57,
      "edge": 0.058,
      "confidence": 60,
      "reasoning": "Why this is a good pick based on the odds",
      "valueBet": true
    }
  ],
  "assistsPicks": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "propType": "assists",
      "line": 8.5,
      "pick": "OVER",
      "bestOdds": -108,
      "impliedProbability": 0.519,
      "estimatedProbability": 0.56,
      "edge": 0.041,
      "confidence": 58,
      "reasoning": "Why this is a good pick based on the odds",
      "valueBet": false
    }
  ],
  "topValueBets": [
    {
      "rank": 1,
      "playerName": "Player Name",
      "team": "Team Name",
      "propType": "points",
      "line": 24.5,
      "pick": "OVER",
      "bestOdds": -110,
      "impliedProbability": 0.524,
      "estimatedProbability": 0.60,
      "edge": 0.076,
      "confidence": 65,
      "reasoning": "Why this is the best value bet overall",
      "valueBet": true
    }
  ],
  "analysisNotes": [
    "Key insight about this game's player prop outlook",
    "Notable trend or factor to consider"
  ]
}

IMPORTANT RULES:
- ONLY use player names that appear in the data above
- Provide exactly 3 picks for pointsPicks (ranked best to worst)
- Provide exactly 3 picks for reboundsPicks (ranked best to worst)  
- Provide exactly 3 picks for assistsPicks (ranked best to worst)
- topValueBets should contain 3 picks with the highest edge across all markets
- Only mark valueBet: true if edge > 4%
- Confidence scores should be 50-100
- Be conservative with confidence`;
}
