/**
 * Claude API Client for Sports Betting Analysis
 * 
 * Uses Anthropic's Claude API to analyze games and generate predictions.
 */

import type { 
  GameAnalysisRequest, 
  GamePrediction, 
  AnalysisMeta,
  GoalScorerAnalysis,
  GoalScorerPick,
  NbaPlayerPropsAnalysis,
  NbaPlayerPropPick,
  NbaPlayerPropsAnalysisRequest,
} from '@/types/prediction';
import type { NormalizedOdds, GameWithPlayerProps, NormalizedNbaPlayerProp } from '@/types/odds';
import { 
  ANALYST_SYSTEM_PROMPT, 
  GOAL_SCORER_SYSTEM_PROMPT,
  NBA_PROPS_SYSTEM_PROMPT,
  buildGameAnalysisPrompt,
  buildBatchAnalysisPrompt,
  buildGoalScorerAnalysisPrompt,
  buildNbaPlayerPropsAnalysisPrompt,
} from './prompts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface ClaudeApiConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Create Claude analysis client
 */
export function createAnalysisClient(config: ClaudeApiConfig) {
  const { 
    apiKey, 
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4096 
  } = config;

  /**
   * Make a request to Claude API
   */
  async function callClaude(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ text: string; usage: { input: number; output: number } }> {
    const startTime = Date.now();

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API request failed');
    }

    const data: ClaudeResponse = await response.json();
    const text = data.content[0]?.text || '';

    return {
      text,
      usage: {
        input: data.usage.input_tokens,
        output: data.usage.output_tokens,
      },
    };
  }

  /**
   * Parse JSON from Claude's response
   * Handles markdown code blocks, extra text, and malformed JSON
   */
  function parseJsonResponse<T>(text: string): T {
    let cleaned = text.trim();
    
    // Try to extract JSON from markdown code blocks
    const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      cleaned = jsonBlockMatch[1].trim();
    }
    
    // If no code block, try to find JSON object directly
    if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
      const jsonStart = Math.min(
        cleaned.indexOf('{') === -1 ? Infinity : cleaned.indexOf('{'),
        cleaned.indexOf('[') === -1 ? Infinity : cleaned.indexOf('[')
      );
      const jsonEndBrace = cleaned.lastIndexOf('}');
      const jsonEndBracket = cleaned.lastIndexOf(']');
      const jsonEnd = Math.max(jsonEndBrace, jsonEndBracket);
      
      if (jsonStart !== Infinity && jsonEnd !== -1) {
        cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
      }
    }
    
    // Try to fix common JSON issues
    // Remove trailing commas before } or ]
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
    // Fix unescaped quotes in strings (basic attempt)
    cleaned = cleaned.replace(/:\s*"([^"]*?)"/g, (match, content) => {
      // Escape any unescaped quotes within the string
      const escaped = content.replace(/(?<!\\)"/g, '\\"');
      return `: "${escaped}"`;
    });
    
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error('Failed to parse Claude response:', text.substring(0, 500));
      console.error('Cleaned text:', cleaned.substring(0, 500));
      
      // Try one more time with aggressive cleaning
      try {
        // Remove any control characters
        const ultraCleaned = cleaned
          .replace(/[\x00-\x1F\x7F]/g, ' ')
          .replace(/\n/g, ' ')
          .replace(/\r/g, ' ')
          .replace(/\t/g, ' ');
        return JSON.parse(ultraCleaned);
      } catch (e2) {
        console.error('Still failed after aggressive cleaning');
        throw new Error('Invalid JSON response from Claude - please try again');
      }
    }
  }

  /**
   * Convert normalized odds to analysis request format
   */
  function prepareAnalysisRequest(
    game: NormalizedOdds,
    sport: 'NHL' | 'NBA' | 'NFL' | 'MLB' | 'EPL'
  ): GameAnalysisRequest {
    // Calculate averages from all bookmakers
    const homeMLPrices = game.moneyline.home.map(o => o.price);
    const awayMLPrices = game.moneyline.away.map(o => o.price);
    
    const avgHomeML = homeMLPrices.length > 0 
      ? homeMLPrices.reduce((a, b) => a + b, 0) / homeMLPrices.length 
      : 2.0;
    const avgAwayML = awayMLPrices.length > 0 
      ? awayMLPrices.reduce((a, b) => a + b, 0) / awayMLPrices.length 
      : 2.0;
    
    // Get consensus spread line - different defaults per sport
    const defaultSpread = sport === 'NHL' ? -1.5 : sport === 'MLB' ? -1.5 : sport === 'EPL' ? -0.5 : sport === 'NFL' ? -3 : -5;
    const spreadLine = game.spread.consensusLine || defaultSpread;
    const homeSpreadOdds = game.spread.home.find(s => s.point === spreadLine);
    const awaySpreadOdds = game.spread.away.find(s => Math.abs(s.point) === Math.abs(spreadLine));
    
    // Get consensus total line - different defaults per sport
    const defaultTotal = sport === 'NHL' ? 6.0 : sport === 'MLB' ? 8.5 : sport === 'EPL' ? 2.5 : sport === 'NFL' ? 45 : 220;
    const totalLine = game.total.consensusLine || defaultTotal;
    const overOdds = game.total.over.find(t => t.point === totalLine);
    const underOdds = game.total.under.find(t => t.point === totalLine);

    return {
      sport,
      gameId: game.gameId,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      commenceTime: game.commenceTime.toISOString(),
      odds: {
        moneyline: {
          home: {
            best: game.moneyline.bestHome?.price || avgHomeML,
            average: avgHomeML,
            impliedProb: 1 / avgHomeML,
          },
          away: {
            best: game.moneyline.bestAway?.price || avgAwayML,
            average: avgAwayML,
            impliedProb: 1 / avgAwayML,
          },
        },
        spread: {
          line: spreadLine,
          home: {
            price: homeSpreadOdds?.price || 1.91,
            impliedProb: homeSpreadOdds ? 1 / homeSpreadOdds.price : 0.5,
          },
          away: {
            price: awaySpreadOdds?.price || 1.91,
            impliedProb: awaySpreadOdds ? 1 / awaySpreadOdds.price : 0.5,
          },
        },
        total: {
          line: totalLine,
          over: {
            price: overOdds?.price || 1.91,
            impliedProb: overOdds ? 1 / overOdds.price : 0.5,
          },
          under: {
            price: underOdds?.price || 1.91,
            impliedProb: underOdds ? 1 / underOdds.price : 0.5,
          },
        },
      },
    };
  }

  /**
   * Analyze a single game
   * @param game - Normalized game odds data
   * @param sport - Sport type (NHL, NBA, NFL, MLB, EPL)
   * @param injuryReport - Optional injury report string for context
   */
  async function analyzeGame(
    game: NormalizedOdds,
    sport: 'NHL' | 'NBA' | 'NFL' | 'MLB' | 'EPL',
    injuryReport?: string
  ): Promise<{ prediction: GamePrediction; meta: AnalysisMeta }> {
    const startTime = Date.now();
    
    const request = prepareAnalysisRequest(game, sport);
    const prompt = buildGameAnalysisPrompt(request, injuryReport);
    
    const { text, usage } = await callClaude(ANALYST_SYSTEM_PROMPT, prompt);
    const analysisResult = parseJsonResponse<Omit<GamePrediction, 'gameId' | 'sport' | 'homeTeam' | 'awayTeam' | 'analyzedAt'>>(text);
    
    const prediction: GamePrediction = {
      gameId: game.gameId,
      sport,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      analyzedAt: new Date().toISOString(),
      ...analysisResult,
    };

    const meta: AnalysisMeta = {
      model,
      tokensUsed: usage.input + usage.output,
      analysisTime: Date.now() - startTime,
      dataQuality: injuryReport ? 'ODDS_WITH_INJURIES' : 'ODDS_ONLY',
    };

    return { prediction, meta };
  }

  /**
   * Quick analysis of multiple games (batch mode)
   */
  async function analyzeGames(
    games: NormalizedOdds[],
    sport: 'NHL' | 'NBA' | 'NFL' | 'MLB' | 'EPL'
  ): Promise<{
    predictions: Array<{
      gameIndex: number;
      homeTeam: string;
      awayTeam: string;
      winnerPick: string;
      winnerConfidence: number;
      bestBet: {
        type: string;
        pick: string;
        confidence: number;
      };
      quickTake: string;
    }>;
    meta: AnalysisMeta;
  }> {
    const startTime = Date.now();
    
    const requests = games.map(g => prepareAnalysisRequest(g, sport));
    const prompt = buildBatchAnalysisPrompt(requests);
    
    const { text, usage } = await callClaude(ANALYST_SYSTEM_PROMPT, prompt);
    const predictions = parseJsonResponse<Array<{
      gameIndex: number;
      homeTeam: string;
      awayTeam: string;
      winnerPick: string;
      winnerConfidence: number;
      bestBet: {
        type: string;
        pick: string;
        confidence: number;
      };
      quickTake: string;
    }>>(text);

    const meta: AnalysisMeta = {
      model,
      tokensUsed: usage.input + usage.output,
      analysisTime: Date.now() - startTime,
      dataQuality: 'ODDS_ONLY',
    };

    return { predictions, meta };
  }

  /**
   * Analyze NHL goal scorer props
   */
  async function analyzeGoalScorers(
    game: GameWithPlayerProps
  ): Promise<{ analysis: GoalScorerAnalysis; meta: AnalysisMeta }> {
    const startTime = Date.now();

    // Prepare data for prompt
    const firstGoalScorers = game.firstGoalScorers.map((p) => ({
      playerName: p.playerName,
      team: p.team,
      bestOdds: p.bestOdds?.americanOdds || 0,
      averageImpliedProb: p.averageImpliedProb,
    }));

    const anytimeGoalScorers = game.anytimeGoalScorers.map((p) => ({
      playerName: p.playerName,
      team: p.team,
      bestOdds: p.bestOdds?.americanOdds || 0,
      averageImpliedProb: p.averageImpliedProb,
    }));

    const prompt = buildGoalScorerAnalysisPrompt(
      game.homeTeam,
      game.awayTeam,
      game.commenceTime.toISOString(),
      firstGoalScorers,
      anytimeGoalScorers
    );

    const { text, usage } = await callClaude(GOAL_SCORER_SYSTEM_PROMPT, prompt);
    
    const analysisResult = parseJsonResponse<{
      firstGoalPicks: GoalScorerPick[];
      anytimeGoalPicks: GoalScorerPick[];
      topValueBets: GoalScorerPick[];
      analysisNotes: string[];
    }>(text);

    const analysis: GoalScorerAnalysis = {
      gameId: game.gameId,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      analyzedAt: new Date().toISOString(),
      ...analysisResult,
    };

    const meta: AnalysisMeta = {
      model,
      tokensUsed: usage.input + usage.output,
      analysisTime: Date.now() - startTime,
      dataQuality: 'ODDS_ONLY',
    };

    return { analysis, meta };
  }

  /**
   * Analyze NBA player props (points, rebounds, assists)
   */
  async function analyzeNbaPlayerProps(
    gameId: string,
    homeTeam: string,
    awayTeam: string,
    commenceTime: string,
    playerProps: {
      points: NormalizedNbaPlayerProp[];
      rebounds: NormalizedNbaPlayerProp[];
      assists: NormalizedNbaPlayerProp[];
    }
  ): Promise<{ analysis: NbaPlayerPropsAnalysis; meta: AnalysisMeta }> {
    const startTime = Date.now();

    // Prepare data for prompt - convert to simpler format
    const prepareProps = (props: NormalizedNbaPlayerProp[]) =>
      props.slice(0, 15).map((p) => ({
        playerName: p.playerName,
        line: p.line,
        overOdds: p.bestOver?.americanOdds || -110,
        underOdds: p.bestUnder?.americanOdds || -110,
        overImpliedProb: p.bestOver?.impliedProbability || 0.5,
        underImpliedProb: p.bestUnder?.impliedProbability || 0.5,
      }));

    const request: NbaPlayerPropsAnalysisRequest = {
      gameId,
      homeTeam,
      awayTeam,
      commenceTime,
      playerProps: {
        points: prepareProps(playerProps.points),
        rebounds: prepareProps(playerProps.rebounds),
        assists: prepareProps(playerProps.assists),
      },
    };

    const prompt = buildNbaPlayerPropsAnalysisPrompt(request);
    const { text, usage } = await callClaude(NBA_PROPS_SYSTEM_PROMPT, prompt);

    const analysisResult = parseJsonResponse<{
      pointsPicks: NbaPlayerPropPick[];
      reboundsPicks: NbaPlayerPropPick[];
      assistsPicks: NbaPlayerPropPick[];
      topValueBets: NbaPlayerPropPick[];
      analysisNotes: string[];
    }>(text);

    const analysis: NbaPlayerPropsAnalysis = {
      gameId,
      homeTeam,
      awayTeam,
      analyzedAt: new Date().toISOString(),
      ...analysisResult,
    };

    const meta: AnalysisMeta = {
      model,
      tokensUsed: usage.input + usage.output,
      analysisTime: Date.now() - startTime,
      dataQuality: 'ODDS_ONLY',
    };

    return { analysis, meta };
  }

  return {
    analyzeGame,
    analyzeGames,
    analyzeGoalScorers,
    analyzeNbaPlayerProps,
    prepareAnalysisRequest,
  };
}

/**
 * Default client using environment variable
 */
export const analysisClient = createAnalysisClient({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});
