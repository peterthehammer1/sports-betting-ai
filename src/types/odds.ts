// Types matching The Odds API response structure exactly

export interface OddsOutcome {
  name: string;
  price: number; // Decimal odds (e.g., 1.66, 2.23)
  point?: number; // For spreads/totals (e.g., -1.5, 6.5)
}

export interface Market {
  key: MarketType;
  last_update: string; // ISO datetime
  outcomes: OddsOutcome[];
}

export interface Bookmaker {
  key: string; // e.g., "fanduel", "draftkings"
  title: string; // e.g., "FanDuel", "DraftKings"
  last_update: string; // ISO datetime
  markets: Market[];
}

export interface GameOdds {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string; // ISO datetime
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

// Supported sports
export type SportKey = 'icehockey_nhl' | 'basketball_nba' | 'americanfootball_nfl' | 'americanfootball_nfl_super_bowl_winner';

// Market types
export type MarketType = 
  | 'h2h'           // Moneyline (head-to-head)
  | 'spreads'       // Puck line (NHL) / Point spread (NBA)
  | 'totals'        // Over/Under
  | 'player_points' // Player props - points
  | 'player_assists'
  | 'player_rebounds'
  | 'player_threes'
  | 'player_blocks_steals'
  | 'player_goal_scorer_first'    // NHL First Goal Scorer
  | 'player_goal_scorer_anytime'  // NHL Anytime Goal Scorer
  | 'player_goal_scorer_last';    // NHL Last Goal Scorer

// Bookmaker keys we care about
export type BookmakerKey = 
  | 'fanduel'
  | 'draftkings'
  | 'betmgm'
  | 'betrivers'
  | 'bovada'
  | 'betonlineag'
  | 'mybookieag'
  | 'lowvig'
  | 'betus';

// Processed/normalized types for our app
export interface NormalizedOdds {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  moneyline: {
    home: BookOdds[];
    away: BookOdds[];
    bestHome: BookOdds | null;
    bestAway: BookOdds | null;
  };
  spread: {
    home: SpreadOdds[];
    away: SpreadOdds[];
    consensusLine: number | null;
  };
  total: {
    over: TotalOdds[];
    under: TotalOdds[];
    consensusLine: number | null;
  };
}

export interface BookOdds {
  bookmaker: string;
  bookmakerTitle: string;
  price: number; // Decimal
  americanOdds: number; // Converted to American
  impliedProbability: number; // As decimal (0-1)
  lastUpdate: Date;
}

export interface SpreadOdds extends BookOdds {
  point: number; // The spread (e.g., -1.5)
}

export interface TotalOdds extends BookOdds {
  point: number; // The total line (e.g., 6.5)
}

// API response wrapper
export interface OddsApiResponse {
  games: GameOdds[];
  requestsRemaining: number;
  requestsUsed: number;
}

// Sports list response
export interface Sport {
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  has_outrights: boolean;
}

// Player props types
export interface PlayerPropOutcome {
  name: string; // Player name or description
  description?: string; // Additional info (e.g., "First Goal Scorer")
  price: number; // Decimal odds
  point?: number; // For over/under props
}

// NHL Goal Scorer market types
export type NhlPlayerPropMarketKey = 'player_goal_scorer_first' | 'player_goal_scorer_anytime' | 'player_goal_scorer_last';

export interface PlayerPropMarket {
  key: NhlPlayerPropMarketKey;
  last_update: string;
  outcomes: PlayerPropOutcome[];
}

// Generic player props market (works for both NHL and NBA)
export interface GenericPlayerPropMarket {
  key: string;
  last_update: string;
  outcomes: PlayerPropOutcome[];
}

export interface PlayerPropsResponse {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    last_update: string;
    markets: GenericPlayerPropMarket[];
  }>;
}

// Normalized player prop for display
export interface NormalizedPlayerProp {
  playerName: string;
  team: string;
  market: 'first_goal_scorer' | 'anytime_goal_scorer';
  odds: Array<{
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }>;
  bestOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  } | null;
  averageImpliedProb: number;
}

// Game with player props
export interface GameWithPlayerProps {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  firstGoalScorers: NormalizedPlayerProp[];
  anytimeGoalScorers: NormalizedPlayerProp[];
}

// Live scores types
export interface TeamScore {
  name: string;
  score: string;
}

export interface GameScore {
  id: string;
  sport_key: SportKey;
  sport_title: string;
  commence_time: string;
  completed: boolean;
  home_team: string;
  away_team: string;
  scores: TeamScore[] | null;
  last_update: string | null;
}

// Normalized score for display
export interface NormalizedScore {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  isLive: boolean;
  isCompleted: boolean;
  commenceTime: Date;
  lastUpdate: Date | null;
}

// Extended normalized odds with scores
export interface NormalizedOddsWithScore extends NormalizedOdds {
  score?: NormalizedScore;
}

// NBA Player Props types
export type NbaPlayerPropMarket = 
  | 'player_points'
  | 'player_rebounds' 
  | 'player_assists'
  | 'player_threes'
  | 'player_points_rebounds_assists'
  | 'player_points_rebounds'
  | 'player_points_assists'
  | 'player_rebounds_assists';

// NFL/Super Bowl Player Props types
export type NflPlayerPropMarket =
  | 'player_pass_tds'
  | 'player_pass_yds'
  | 'player_pass_completions'
  | 'player_pass_attempts'
  | 'player_pass_interceptions'
  | 'player_rush_yds'
  | 'player_rush_attempts'
  | 'player_receptions'
  | 'player_reception_yds'
  | 'player_anytime_td'
  | 'player_first_td'
  | 'player_last_td'
  | 'player_kicking_points'
  | 'player_field_goals';

// NFL/Super Bowl game props
export type NflGamePropMarket =
  | 'alternate_spreads'
  | 'alternate_totals'
  | 'team_totals'
  | 'first_half_h2h'
  | 'first_half_spreads'
  | 'first_half_totals'
  | 'first_quarter_h2h'
  | 'first_quarter_spreads'
  | 'first_quarter_totals';

export interface NflPlayerProp {
  playerName: string;
  team: string;
  market: NflPlayerPropMarket;
  line?: number;
  odds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
    point?: number;
    name?: string; // Over/Under or player name for TD props
  }[];
  bestOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  } | null;
}

export interface SuperBowlOdds {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: Date;
  // Main game lines
  moneyline: {
    home: BookOdds[];
    away: BookOdds[];
    bestHome: BookOdds | null;
    bestAway: BookOdds | null;
  };
  spread: {
    home: SpreadOdds[];
    away: SpreadOdds[];
    consensusLine: number | null;
  };
  total: {
    over: TotalOdds[];
    under: TotalOdds[];
    consensusLine: number | null;
  };
}

export interface NbaPlayerPropOutcome {
  name: 'Over' | 'Under';
  description: string; // Player name
  price: number;
  point: number; // The line (e.g., 25.5 points)
}

export interface NbaPlayerPropMarketData {
  key: NbaPlayerPropMarket;
  last_update: string;
  outcomes: NbaPlayerPropOutcome[];
}

export interface NormalizedNbaPlayerProp {
  playerName: string;
  team: string;
  market: NbaPlayerPropMarket;
  line: number;
  overOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }[];
  underOdds: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }[];
  bestOver: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  } | null;
  bestUnder: {
    bookmaker: string;
    bookmakerTitle: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  } | null;
  consensusLine: number;
}
