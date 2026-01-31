/**
 * Utility functions for saving AI picks to the tracker
 */

import { savePick } from '@/lib/cache/redis';
import type { TrackedPick, BetType, Sport } from '@/types/tracker';

interface GameInfo {
  gameId: string;
  sport: Sport;
  homeTeam: string;
  awayTeam: string;
  gameTime: string;
}

interface PickData {
  betType: BetType;
  pick: string;
  odds: number;
  line?: number;
  confidence: number;
  reasoning: string;
  edge?: number;
  isValueBet?: boolean;
}

/**
 * Generate a unique pick ID
 */
function generatePickId(): string {
  return `pick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save a single pick from AI analysis
 */
export async function saveAIPick(game: GameInfo, pickData: PickData): Promise<TrackedPick | null> {
  try {
    const pick: TrackedPick = {
      id: generatePickId(),
      createdAt: new Date().toISOString(),
      gameId: game.gameId,
      sport: game.sport,
      homeTeam: game.homeTeam,
      awayTeam: game.awayTeam,
      gameTime: game.gameTime,
      betType: pickData.betType,
      pick: pickData.pick,
      odds: pickData.odds,
      line: pickData.line,
      confidence: pickData.confidence,
      reasoning: pickData.reasoning,
      edge: pickData.edge,
      isValueBet: pickData.isValueBet ?? (pickData.edge ? pickData.edge > 5 : false),
      status: 'pending',
      units: 1,
    };

    const success = await savePick(pick);
    if (success) {
      console.log(`Saved pick: ${pick.pick} (${pick.confidence}% conf)`);
      return pick;
    }
    return null;
  } catch (error) {
    console.error('Error saving AI pick:', error);
    return null;
  }
}

/**
 * Save multiple picks from game analysis
 */
export async function saveGameAnalysisPicks(
  game: GameInfo,
  analysis: {
    winner?: { pick: string; confidence: number; reasoning: string; odds?: number };
    spread?: { pick: string; line: number; confidence: number; reasoning: string; odds?: number };
    total?: { pick: string; line: number; confidence: number; reasoning: string; odds?: number };
  }
): Promise<TrackedPick[]> {
  const savedPicks: TrackedPick[] = [];

  // Save moneyline pick
  if (analysis.winner && analysis.winner.confidence >= 60) {
    const pick = await saveAIPick(game, {
      betType: 'moneyline',
      pick: `${analysis.winner.pick} ML`,
      odds: analysis.winner.odds || -150,
      confidence: analysis.winner.confidence,
      reasoning: analysis.winner.reasoning,
    });
    if (pick) savedPicks.push(pick);
  }

  // Save spread pick
  if (analysis.spread && analysis.spread.confidence >= 60) {
    const pick = await saveAIPick(game, {
      betType: 'spread',
      pick: analysis.spread.pick,
      odds: -110,
      line: analysis.spread.line,
      confidence: analysis.spread.confidence,
      reasoning: analysis.spread.reasoning,
    });
    if (pick) savedPicks.push(pick);
  }

  // Save total pick
  if (analysis.total && analysis.total.confidence >= 60) {
    const pick = await saveAIPick(game, {
      betType: 'total',
      pick: analysis.total.pick,
      odds: -110,
      line: analysis.total.line,
      confidence: analysis.total.confidence,
      reasoning: analysis.total.reasoning,
    });
    if (pick) savedPicks.push(pick);
  }

  return savedPicks;
}

/**
 * Save player prop picks
 */
export async function savePlayerPropPicks(
  game: GameInfo,
  props: Array<{
    player: string;
    market: string;
    pick: string;
    line?: number;
    odds: number;
    confidence: number;
    reasoning: string;
  }>
): Promise<TrackedPick[]> {
  const savedPicks: TrackedPick[] = [];

  for (const prop of props) {
    // Only save high-confidence props
    if (prop.confidence >= 65) {
      const pick = await saveAIPick(game, {
        betType: 'player_prop',
        pick: `${prop.player} ${prop.pick} ${prop.market}`,
        odds: prop.odds,
        line: prop.line,
        confidence: prop.confidence,
        reasoning: prop.reasoning,
      });
      if (pick) savedPicks.push(pick);
    }
  }

  return savedPicks;
}

/**
 * Save Super Bowl comprehensive analysis picks
 */
export async function saveSuperBowlPicks(analysis: {
  gameWinner: { pick: string; confidence: number; spread: string; spreadConfidence: number; analysis: string };
  total: { pick: string; line: number; confidence: number; analysis: string };
  playerProps: Array<{
    player: string;
    team: string;
    market: string;
    pick: string;
    line: string;
    odds: string;
    confidence: number;
    reasoning: string;
  }>;
}): Promise<TrackedPick[]> {
  const savedPicks: TrackedPick[] = [];
  
  const gameInfo: GameInfo = {
    gameId: 'superbowl_lx_2026',
    sport: 'NFL',
    homeTeam: 'Seattle Seahawks',
    awayTeam: 'New England Patriots',
    gameTime: '2026-02-08T23:30:00Z',
  };

  // Save game winner
  if (analysis.gameWinner.confidence >= 60) {
    const pick = await saveAIPick(gameInfo, {
      betType: 'moneyline',
      pick: analysis.gameWinner.pick,
      odds: analysis.gameWinner.pick.includes('Seahawks') ? -230 : 190,
      confidence: analysis.gameWinner.confidence,
      reasoning: analysis.gameWinner.analysis,
    });
    if (pick) savedPicks.push(pick);
  }

  // Save spread
  if (analysis.gameWinner.spreadConfidence >= 60) {
    const pick = await saveAIPick(gameInfo, {
      betType: 'spread',
      pick: analysis.gameWinner.spread,
      odds: -115,
      line: analysis.gameWinner.spread.includes('-') ? -4.5 : 4.5,
      confidence: analysis.gameWinner.spreadConfidence,
      reasoning: analysis.gameWinner.analysis,
    });
    if (pick) savedPicks.push(pick);
  }

  // Save total
  if (analysis.total.confidence >= 60) {
    const pick = await saveAIPick(gameInfo, {
      betType: 'total',
      pick: `${analysis.total.pick} ${analysis.total.line}`,
      odds: -110,
      line: analysis.total.line,
      confidence: analysis.total.confidence,
      reasoning: analysis.total.analysis,
    });
    if (pick) savedPicks.push(pick);
  }

  // Save player props (only high confidence ones)
  for (const prop of analysis.playerProps) {
    if (prop.confidence >= 70) {
      const oddsNum = parseInt(prop.odds.replace('+', ''));
      const pick = await saveAIPick(gameInfo, {
        betType: 'player_prop',
        pick: `${prop.player} ${prop.pick} ${prop.market}`,
        odds: isNaN(oddsNum) ? -110 : oddsNum,
        confidence: prop.confidence,
        reasoning: prop.reasoning,
      });
      if (pick) savedPicks.push(pick);
    }
  }

  return savedPicks;
}
