/**
 * The Odds API Client
 * Documentation: https://the-odds-api.com/liveapi/guides/v4/
 */

import type {
  GameOdds,
  Sport,
  SportKey,
  MarketType,
  NormalizedOdds,
  BookOdds,
  SpreadOdds,
  TotalOdds,
  PlayerPropsResponse,
  GameWithPlayerProps,
  NormalizedPlayerProp,
  GameScore,
  NormalizedScore,
  NbaPlayerPropMarket,
  NormalizedNbaPlayerProp,
} from '@/types/odds';
import {
  decimalToAmerican,
  decimalToImpliedProbability,
} from '@/lib/utils/odds';

const BASE_URL = 'https://api.the-odds-api.com/v4';

// Supported regions for odds
type Region = 'us' | 'us2' | 'uk' | 'eu' | 'au';

interface OddsApiConfig {
  apiKey: string;
  defaultRegion?: Region;
}

interface FetchOddsOptions {
  sport: SportKey;
  regions?: Region[];
  markets?: MarketType[];
  oddsFormat?: 'decimal' | 'american';
  eventIds?: string[]; // Filter to specific games
}

interface ApiQuota {
  requestsRemaining: number;
  requestsUsed: number;
}

let lastQuota: ApiQuota = { requestsRemaining: 500, requestsUsed: 0 };

/**
 * Create an instance of the Odds API client
 */
export function createOddsApiClient(config: OddsApiConfig) {
  const { apiKey, defaultRegion = 'us' } = config;

  /**
   * Get list of available sports
   */
  async function getSports(): Promise<Sport[]> {
    const url = `${BASE_URL}/sports?apiKey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch sports');
    }

    updateQuota(response.headers);
    return response.json();
  }

  /**
   * Get odds for a specific sport
   */
  async function getOdds(options: FetchOddsOptions): Promise<GameOdds[]> {
    const {
      sport,
      regions = [defaultRegion],
      markets = ['h2h', 'spreads', 'totals'],
      oddsFormat = 'decimal',
      eventIds,
    } = options;

    const params = new URLSearchParams({
      apiKey,
      regions: regions.join(','),
      markets: markets.join(','),
      oddsFormat,
    });

    if (eventIds && eventIds.length > 0) {
      params.append('eventIds', eventIds.join(','));
    }

    const url = `${BASE_URL}/sports/${sport}/odds?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch odds');
    }

    updateQuota(response.headers);
    return response.json();
  }

  /**
   * Get NHL odds
   */
  async function getNhlOdds(
    markets: MarketType[] = ['h2h', 'spreads', 'totals']
  ): Promise<GameOdds[]> {
    return getOdds({ sport: 'icehockey_nhl', markets });
  }

  /**
   * Get NBA odds
   */
  async function getNbaOdds(
    markets: MarketType[] = ['h2h', 'spreads', 'totals']
  ): Promise<GameOdds[]> {
    return getOdds({ sport: 'basketball_nba', markets });
  }

  /**
   * Get odds for a specific game
   */
  async function getGameOdds(
    sport: SportKey,
    eventId: string,
    markets: MarketType[] = ['h2h', 'spreads', 'totals']
  ): Promise<GameOdds | null> {
    const games = await getOdds({ sport, markets, eventIds: [eventId] });
    return games[0] || null;
  }

  /**
   * Get player props for a specific NHL game (goal scorers)
   * Player props require the event-specific endpoint
   */
  async function getNhlPlayerProps(
    eventId: string,
    markets: ('player_goal_scorer_first' | 'player_goal_scorer_anytime')[] = [
      'player_goal_scorer_first',
      'player_goal_scorer_anytime',
    ]
  ): Promise<PlayerPropsResponse | null> {
    const params = new URLSearchParams({
      apiKey,
      regions: defaultRegion,
      markets: markets.join(','),
      oddsFormat: 'decimal',
    });

    // Player props use the event-specific endpoint
    const url = `${BASE_URL}/sports/icehockey_nhl/events/${eventId}/odds?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch player props');
    }

    updateQuota(response.headers);
    return response.json();
  }

  /**
   * Normalize player props data for easier consumption
   */
  function normalizePlayerProps(game: PlayerPropsResponse): GameWithPlayerProps {
    const firstGoalScorers: Map<string, NormalizedPlayerProp> = new Map();
    const anytimeGoalScorers: Map<string, NormalizedPlayerProp> = new Map();

    for (const bookmaker of game.bookmakers) {
      for (const market of bookmaker.markets) {
        const targetMap =
          market.key === 'player_goal_scorer_first'
            ? firstGoalScorers
            : anytimeGoalScorers;
        const marketType =
          market.key === 'player_goal_scorer_first'
            ? 'first_goal_scorer'
            : 'anytime_goal_scorer';

        for (const outcome of market.outcomes) {
          // The API returns name="Yes" and description="Player Name"
          // So we need to use description for the player name
          const playerName = outcome.description || outcome.name;
          
          // We don't have team info from the API, so we'll leave it as Unknown
          // The team can be inferred from context (home vs away team in the game)
          const team = 'Unknown';

          const oddsEntry = {
            bookmaker: bookmaker.key,
            bookmakerTitle: bookmaker.title,
            price: outcome.price,
            americanOdds: decimalToAmerican(outcome.price),
            impliedProbability: decimalToImpliedProbability(outcome.price),
          };

          if (targetMap.has(playerName)) {
            const existing = targetMap.get(playerName)!;
            existing.odds.push(oddsEntry);
            // Update best odds if this is better
            if (!existing.bestOdds || oddsEntry.price > existing.bestOdds.price) {
              existing.bestOdds = oddsEntry;
            }
          } else {
            targetMap.set(playerName, {
              playerName,
              team,
              market: marketType,
              odds: [oddsEntry],
              bestOdds: oddsEntry,
              averageImpliedProb: 0, // Will calculate after
            });
          }
        }
      }
    }

    // Calculate average implied probabilities
    const calculateAvgProb = (prop: NormalizedPlayerProp) => {
      prop.averageImpliedProb =
        prop.odds.reduce((sum, o) => sum + o.impliedProbability, 0) /
        prop.odds.length;
    };

    firstGoalScorers.forEach(calculateAvgProb);
    anytimeGoalScorers.forEach(calculateAvgProb);

    // Sort by implied probability (most likely scorers first)
    const sortByProbability = (a: NormalizedPlayerProp, b: NormalizedPlayerProp) =>
      b.averageImpliedProb - a.averageImpliedProb;

    return {
      gameId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      commenceTime: new Date(game.commence_time),
      firstGoalScorers: Array.from(firstGoalScorers.values()).sort(sortByProbability),
      anytimeGoalScorers: Array.from(anytimeGoalScorers.values()).sort(sortByProbability),
    };
  }

  /**
   * Get live scores for a sport
   * @param sport - The sport key
   * @param daysFrom - Optional: include completed games from past X days (1-3)
   */
  async function getScores(
    sport: SportKey,
    daysFrom?: 1 | 2 | 3
  ): Promise<GameScore[]> {
    const params = new URLSearchParams({ apiKey });
    
    if (daysFrom) {
      params.append('daysFrom', daysFrom.toString());
    }

    const url = `${BASE_URL}/sports/${sport}/scores?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch scores');
    }

    updateQuota(response.headers);
    return response.json();
  }

  /**
   * Normalize score data
   */
  function normalizeScore(score: GameScore): NormalizedScore {
    const now = new Date();
    const commenceTime = new Date(score.commence_time);
    const isLive = !score.completed && commenceTime <= now;
    
    let homeScore: number | null = null;
    let awayScore: number | null = null;

    if (score.scores) {
      for (const teamScore of score.scores) {
        if (teamScore.name === score.home_team) {
          homeScore = parseInt(teamScore.score, 10);
        } else if (teamScore.name === score.away_team) {
          awayScore = parseInt(teamScore.score, 10);
        }
      }
    }

    return {
      gameId: score.id,
      homeTeam: score.home_team,
      awayTeam: score.away_team,
      homeScore,
      awayScore,
      isLive,
      isCompleted: score.completed,
      commenceTime,
      lastUpdate: score.last_update ? new Date(score.last_update) : null,
    };
  }

  /**
   * Get NBA player props (points, rebounds, assists)
   */
  async function getNbaPlayerProps(
    eventId: string,
    markets: NbaPlayerPropMarket[] = ['player_points', 'player_rebounds', 'player_assists']
  ): Promise<PlayerPropsResponse | null> {
    const params = new URLSearchParams({
      apiKey,
      regions: defaultRegion,
      markets: markets.join(','),
      oddsFormat: 'decimal',
    });

    const url = `${BASE_URL}/sports/basketball_nba/events/${eventId}/odds?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch NBA player props');
    }

    updateQuota(response.headers);
    return response.json();
  }

  /**
   * Normalize NBA player props
   */
  function normalizeNbaPlayerProps(
    game: PlayerPropsResponse,
    marketKey: NbaPlayerPropMarket
  ): NormalizedNbaPlayerProp[] {
    const playerPropsMap: Map<string, NormalizedNbaPlayerProp> = new Map();

    for (const bookmaker of game.bookmakers) {
      for (const market of bookmaker.markets) {
        if (market.key !== marketKey) continue;

        for (const outcome of market.outcomes) {
          const playerName = outcome.description || outcome.name;
          const line = outcome.point || 0;
          const key = `${playerName}-${line}`;

          const oddsEntry = {
            bookmaker: bookmaker.key,
            bookmakerTitle: bookmaker.title,
            price: outcome.price,
            americanOdds: decimalToAmerican(outcome.price),
            impliedProbability: decimalToImpliedProbability(outcome.price),
          };

          if (!playerPropsMap.has(key)) {
            playerPropsMap.set(key, {
              playerName,
              team: 'Unknown',
              market: marketKey,
              line,
              overOdds: [],
              underOdds: [],
              bestOver: null,
              bestUnder: null,
              consensusLine: line,
            });
          }

          const prop = playerPropsMap.get(key)!;
          
          if (outcome.name === 'Over') {
            prop.overOdds.push(oddsEntry);
            if (!prop.bestOver || oddsEntry.price > prop.bestOver.price) {
              prop.bestOver = oddsEntry;
            }
          } else {
            prop.underOdds.push(oddsEntry);
            if (!prop.bestUnder || oddsEntry.price > prop.bestUnder.price) {
              prop.bestUnder = oddsEntry;
            }
          }
        }
      }
    }

    // Sort by line (highest first for more prominent players)
    return Array.from(playerPropsMap.values())
      .sort((a, b) => b.line - a.line);
  }

  /**
   * Get current API quota
   */
  function getQuota(): ApiQuota {
    return { ...lastQuota };
  }

  /**
   * Normalize raw odds data for easier consumption
   */
  function normalizeGameOdds(game: GameOdds): NormalizedOdds {
    const homeOdds: BookOdds[] = [];
    const awayOdds: BookOdds[] = [];
    const homeSpread: SpreadOdds[] = [];
    const awaySpread: SpreadOdds[] = [];
    const overOdds: TotalOdds[] = [];
    const underOdds: TotalOdds[] = [];

    let spreadLines: number[] = [];
    let totalLines: number[] = [];

    for (const bookmaker of game.bookmakers) {
      for (const market of bookmaker.markets) {
        if (market.key === 'h2h') {
          for (const outcome of market.outcomes) {
            const bookOdds: BookOdds = {
              bookmaker: bookmaker.key,
              bookmakerTitle: bookmaker.title,
              price: outcome.price,
              americanOdds: decimalToAmerican(outcome.price),
              impliedProbability: decimalToImpliedProbability(outcome.price),
              lastUpdate: new Date(market.last_update),
            };

            if (outcome.name === game.home_team) {
              homeOdds.push(bookOdds);
            } else {
              awayOdds.push(bookOdds);
            }
          }
        }

        if (market.key === 'spreads') {
          for (const outcome of market.outcomes) {
            const spreadOdds: SpreadOdds = {
              bookmaker: bookmaker.key,
              bookmakerTitle: bookmaker.title,
              price: outcome.price,
              americanOdds: decimalToAmerican(outcome.price),
              impliedProbability: decimalToImpliedProbability(outcome.price),
              lastUpdate: new Date(market.last_update),
              point: outcome.point!,
            };

            if (outcome.name === game.home_team) {
              homeSpread.push(spreadOdds);
              spreadLines.push(outcome.point!);
            } else {
              awaySpread.push(spreadOdds);
            }
          }
        }

        if (market.key === 'totals') {
          for (const outcome of market.outcomes) {
            const totalOdds: TotalOdds = {
              bookmaker: bookmaker.key,
              bookmakerTitle: bookmaker.title,
              price: outcome.price,
              americanOdds: decimalToAmerican(outcome.price),
              impliedProbability: decimalToImpliedProbability(outcome.price),
              lastUpdate: new Date(market.last_update),
              point: outcome.point!,
            };

            if (outcome.name === 'Over') {
              overOdds.push(totalOdds);
              totalLines.push(outcome.point!);
            } else {
              underOdds.push(totalOdds);
            }
          }
        }
      }
    }

    // Find best odds (highest decimal = best payout)
    const bestHome = homeOdds.length
      ? homeOdds.reduce((best, curr) =>
          curr.price > best.price ? curr : best
        )
      : null;
    const bestAway = awayOdds.length
      ? awayOdds.reduce((best, curr) =>
          curr.price > best.price ? curr : best
        )
      : null;

    // Calculate consensus lines (most common)
    const consensusSpread = findMostCommon(spreadLines);
    const consensusTotal = findMostCommon(totalLines);

    return {
      gameId: game.id,
      homeTeam: game.home_team,
      awayTeam: game.away_team,
      commenceTime: new Date(game.commence_time),
      moneyline: {
        home: homeOdds,
        away: awayOdds,
        bestHome,
        bestAway,
      },
      spread: {
        home: homeSpread,
        away: awaySpread,
        consensusLine: consensusSpread,
      },
      total: {
        over: overOdds,
        under: underOdds,
        consensusLine: consensusTotal,
      },
    };
  }

  /**
   * Get NFL odds (including Super Bowl)
   */
  async function getNflOdds(
    markets: MarketType[] = ['h2h', 'spreads', 'totals']
  ): Promise<GameOdds[]> {
    return getOdds({ sport: 'americanfootball_nfl', markets });
  }

  /**
   * Get NFL player props for a specific game (Super Bowl)
   */
  async function getNflPlayerProps(
    eventId: string,
    markets: string[] = [
      'player_pass_tds',
      'player_pass_yds',
      'player_rush_yds',
      'player_reception_yds',
      'player_receptions',
      'player_anytime_td',
    ]
  ): Promise<PlayerPropsResponse | null> {
    const params = new URLSearchParams({
      apiKey,
      regions: defaultRegion,
      markets: markets.join(','),
      oddsFormat: 'decimal',
    });

    const url = `${BASE_URL}/sports/americanfootball_nfl/events/${eventId}/odds?${params}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Player props might not be available yet
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch NFL player props');
    }

    updateQuota(response.headers);
    return response.json();
  }

  return {
    getSports,
    getOdds,
    getNhlOdds,
    getNbaOdds,
    getNflOdds,
    getGameOdds,
    getNhlPlayerProps,
    normalizePlayerProps,
    getScores,
    normalizeScore,
    getNbaPlayerProps,
    normalizeNbaPlayerProps,
    getNflPlayerProps,
    getQuota,
    normalizeGameOdds,
  };
}

// Helper to update quota from response headers
function updateQuota(headers: Headers): void {
  const remaining = headers.get('x-requests-remaining');
  const used = headers.get('x-requests-used');

  if (remaining) lastQuota.requestsRemaining = parseInt(remaining, 10);
  if (used) lastQuota.requestsUsed = parseInt(used, 10);
}

// Helper to find most common value in array
function findMostCommon<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;

  const counts = new Map<T, number>();
  for (const val of arr) {
    counts.set(val, (counts.get(val) || 0) + 1);
  }

  let maxCount = 0;
  let mostCommon: T | null = null;
  for (const [val, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = val;
    }
  }

  return mostCommon;
}

// Export a default client that reads from env
export const oddsApi = createOddsApiClient({
  apiKey: process.env.THE_ODDS_API_KEY || '',
});
