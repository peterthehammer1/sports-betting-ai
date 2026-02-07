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

// Supported sports - EXPANDED with premium features
export type SportKey = 
  // US Sports
  | 'icehockey_nhl'
  | 'icehockey_ahl'  // American Hockey League (active during NHL breaks)
  | 'basketball_nba' 
  | 'basketball_wnba'
  | 'basketball_ncaab'
  | 'americanfootball_nfl' 
  | 'americanfootball_nfl_super_bowl_winner'
  | 'americanfootball_ncaaf'
  | 'baseball_mlb'
  // Soccer
  | 'soccer_epl'           // English Premier League
  | 'soccer_usa_mls'       // MLS
  | 'soccer_spain_la_liga' // La Liga
  | 'soccer_germany_bundesliga'
  | 'soccer_italy_serie_a'
  | 'soccer_france_ligue_one'
  | 'soccer_uefa_champs_league'
  // Combat Sports
  | 'mma_mixed_martial_arts'
  // Golf
  | 'golf_pga_championship'
  | 'golf_masters_tournament'
  // Tennis
  | 'tennis_atp_australian_open'
  | 'tennis_atp_us_open';

// All available market types from The Odds API
export type MarketType = 
  // Featured Markets
  | 'h2h'           // Moneyline (head-to-head)
  | 'spreads'       // Point spread / Handicap
  | 'totals'        // Over/Under
  | 'outrights'     // Futures/Championship winner
  // Additional Game Markets
  | 'alternate_spreads'
  | 'alternate_totals'
  | 'team_totals'
  | 'alternate_team_totals'
  | 'btts'          // Both Teams to Score (Soccer)
  | 'draw_no_bet'   // Soccer
  | 'double_chance' // Soccer
  // Period Markets - Quarters
  | 'h2h_q1' | 'h2h_q2' | 'h2h_q3' | 'h2h_q4'
  | 'spreads_q1' | 'spreads_q2' | 'spreads_q3' | 'spreads_q4'
  | 'totals_q1' | 'totals_q2' | 'totals_q3' | 'totals_q4'
  // Period Markets - Halves
  | 'h2h_h1' | 'h2h_h2'
  | 'spreads_h1' | 'spreads_h2'
  | 'totals_h1' | 'totals_h2'
  // Period Markets - Hockey Periods
  | 'h2h_p1' | 'h2h_p2' | 'h2h_p3'
  | 'spreads_p1' | 'spreads_p2' | 'spreads_p3'
  | 'totals_p1' | 'totals_p2' | 'totals_p3'
  // Period Markets - Baseball Innings
  | 'h2h_1st_5_innings'
  | 'spreads_1st_5_innings'
  | 'totals_1st_5_innings'
  // NBA Player Props
  | 'player_points' | 'player_points_q1' | 'player_points_alternate'
  | 'player_rebounds' | 'player_rebounds_q1' | 'player_rebounds_alternate'
  | 'player_assists' | 'player_assists_q1' | 'player_assists_alternate'
  | 'player_threes' | 'player_threes_alternate'
  | 'player_blocks' | 'player_blocks_alternate'
  | 'player_steals' | 'player_steals_alternate'
  | 'player_blocks_steals'
  | 'player_turnovers' | 'player_turnovers_alternate'
  | 'player_points_rebounds_assists' | 'player_points_rebounds_assists_alternate'
  | 'player_points_rebounds' | 'player_points_rebounds_alternate'
  | 'player_points_assists' | 'player_points_assists_alternate'
  | 'player_rebounds_assists' | 'player_rebounds_assists_alternate'
  | 'player_double_double' | 'player_triple_double'
  | 'player_first_basket'
  // NHL Player Props
  | 'player_goal_scorer_first'
  | 'player_goal_scorer_anytime'
  | 'player_goal_scorer_last'
  | 'player_goals' | 'player_goals_alternate'
  | 'player_shots_on_goal' | 'player_shots_on_goal_alternate'
  | 'player_blocked_shots' | 'player_blocked_shots_alternate'
  | 'player_total_saves' | 'player_total_saves_alternate'
  | 'player_power_play_points' | 'player_power_play_points_alternate'
  // NFL Player Props
  | 'player_pass_yds' | 'player_pass_yds_alternate'
  | 'player_pass_tds' | 'player_pass_tds_alternate'
  | 'player_pass_completions' | 'player_pass_completions_alternate'
  | 'player_pass_attempts' | 'player_pass_attempts_alternate'
  | 'player_pass_interceptions' | 'player_pass_interceptions_alternate'
  | 'player_rush_yds' | 'player_rush_yds_alternate'
  | 'player_rush_attempts' | 'player_rush_attempts_alternate'
  | 'player_rush_tds' | 'player_rush_tds_alternate'
  | 'player_receptions' | 'player_receptions_alternate'
  | 'player_reception_yds' | 'player_reception_yds_alternate'
  | 'player_reception_tds' | 'player_reception_tds_alternate'
  | 'player_anytime_td' | 'player_1st_td' | 'player_last_td'
  | 'player_pass_rush_yds' | 'player_rush_reception_yds'
  | 'player_kicking_points' | 'player_field_goals'
  // MLB Player Props (Batter)
  | 'batter_home_runs' | 'batter_home_runs_alternate'
  | 'batter_hits' | 'batter_hits_alternate'
  | 'batter_total_bases' | 'batter_total_bases_alternate'
  | 'batter_rbis' | 'batter_rbis_alternate'
  | 'batter_runs_scored' | 'batter_runs_scored_alternate'
  | 'batter_strikeouts' | 'batter_strikeouts_alternate'
  | 'batter_walks' | 'batter_walks_alternate'
  | 'batter_stolen_bases'
  // MLB Player Props (Pitcher)
  | 'pitcher_strikeouts' | 'pitcher_strikeouts_alternate'
  | 'pitcher_hits_allowed' | 'pitcher_hits_allowed_alternate'
  | 'pitcher_walks' | 'pitcher_walks_alternate'
  | 'pitcher_earned_runs'
  | 'pitcher_outs'
  | 'pitcher_record_a_win'
  // Soccer Player Props
  | 'player_first_goal_scorer'
  | 'player_last_goal_scorer'
  | 'player_shots_on_target'
  | 'player_shots'
  | 'player_to_receive_card';

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

// ============================================
// MLB TYPES (NEW - Premium Feature)
// ============================================

export type MlbBatterPropMarket = 
  | 'batter_home_runs' | 'batter_home_runs_alternate'
  | 'batter_hits' | 'batter_hits_alternate'
  | 'batter_total_bases' | 'batter_total_bases_alternate'
  | 'batter_rbis' | 'batter_rbis_alternate'
  | 'batter_runs_scored' | 'batter_runs_scored_alternate'
  | 'batter_strikeouts' | 'batter_strikeouts_alternate'
  | 'batter_walks' | 'batter_walks_alternate'
  | 'batter_stolen_bases';

export type MlbPitcherPropMarket = 
  | 'pitcher_strikeouts' | 'pitcher_strikeouts_alternate'
  | 'pitcher_hits_allowed' | 'pitcher_hits_allowed_alternate'
  | 'pitcher_walks' | 'pitcher_walks_alternate'
  | 'pitcher_earned_runs'
  | 'pitcher_outs'
  | 'pitcher_record_a_win';

export type MlbPlayerPropMarket = MlbBatterPropMarket | MlbPitcherPropMarket;

export interface MlbPlayerProp {
  playerName: string;
  team: string;
  market: MlbPlayerPropMarket;
  line?: number;
  overOdds: {
    bookmaker: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }[];
  underOdds: {
    bookmaker: string;
    price: number;
    americanOdds: number;
    impliedProbability: number;
  }[];
  bestOver: { bookmaker: string; americanOdds: number; } | null;
  bestUnder: { bookmaker: string; americanOdds: number; } | null;
}

// ============================================
// SOCCER TYPES (NEW - Premium Feature)
// ============================================

export type SoccerMarket = 
  | 'h2h' | 'spreads' | 'totals'
  | 'btts' | 'draw_no_bet' | 'double_chance'
  | 'h2h_h1' | 'h2h_h2'
  | 'totals_h1' | 'totals_h2'
  | 'alternate_totals_corners'
  | 'alternate_totals_cards';

export type SoccerPlayerPropMarket = 
  | 'player_goal_scorer_anytime'
  | 'player_first_goal_scorer'
  | 'player_last_goal_scorer'
  | 'player_shots_on_target'
  | 'player_shots'
  | 'player_assists'
  | 'player_to_receive_card';

export interface SoccerOdds extends NormalizedOdds {
  btts?: {
    yes: BookOdds[];
    no: BookOdds[];
  };
  drawNoBet?: {
    home: BookOdds[];
    away: BookOdds[];
  };
  doubleChance?: {
    homeOrDraw: BookOdds[];
    awayOrDraw: BookOdds[];
    homeOrAway: BookOdds[];
  };
}

// ============================================
// PERIOD/HALF MARKETS (NEW - Premium Feature)
// ============================================

export interface PeriodOdds {
  period: string; // '1H', '2H', 'Q1', 'Q2', 'Q3', 'Q4', 'P1', 'P2', 'P3'
  moneyline?: {
    home: BookOdds[];
    away: BookOdds[];
    draw?: BookOdds[]; // For 3-way markets
  };
  spread?: {
    home: SpreadOdds[];
    away: SpreadOdds[];
  };
  total?: {
    over: TotalOdds[];
    under: TotalOdds[];
  };
}

export interface NormalizedOddsWithPeriods extends NormalizedOdds {
  periods?: PeriodOdds[];
  firstHalf?: PeriodOdds;
  firstQuarter?: PeriodOdds;
}

// ============================================
// ALTERNATE LINES (NEW - Premium Feature)
// ============================================

export interface AlternateLine {
  point: number;
  odds: BookOdds[];
}

export interface AlternateLines {
  spreads: {
    home: AlternateLine[];
    away: AlternateLine[];
  };
  totals: {
    over: AlternateLine[];
    under: AlternateLine[];
  };
}

// ============================================
// EXPANDED NHL PROPS (NEW - Premium Feature)
// ============================================

export type NhlPlayerPropMarketExpanded = 
  | 'player_goal_scorer_first'
  | 'player_goal_scorer_anytime'
  | 'player_goal_scorer_last'
  | 'player_goals'
  | 'player_assists'
  | 'player_points'
  | 'player_shots_on_goal'
  | 'player_blocked_shots'
  | 'player_total_saves'
  | 'player_power_play_points';

export interface NhlPlayerPropExpanded {
  playerName: string;
  team: string;
  market: NhlPlayerPropMarketExpanded;
  line?: number;
  overOdds?: { bookmaker: string; americanOdds: number; }[];
  underOdds?: { bookmaker: string; americanOdds: number; }[];
  yesOdds?: { bookmaker: string; americanOdds: number; }[]; // For goal scorer props
  bestOdds: { bookmaker: string; americanOdds: number; } | null;
}

// ============================================
// EXPANDED NBA PROPS (NEW - Premium Feature)
// ============================================

export type NbaPlayerPropMarketExpanded = 
  | 'player_points' | 'player_points_q1'
  | 'player_rebounds' | 'player_rebounds_q1'
  | 'player_assists' | 'player_assists_q1'
  | 'player_threes'
  | 'player_blocks'
  | 'player_steals'
  | 'player_blocks_steals'
  | 'player_turnovers'
  | 'player_points_rebounds_assists'
  | 'player_points_rebounds'
  | 'player_points_assists'
  | 'player_rebounds_assists'
  | 'player_double_double'
  | 'player_triple_double'
  | 'player_first_basket';

// ============================================
// COMPREHENSIVE SPORT CONFIG
// ============================================

export interface SportConfig {
  key: SportKey;
  name: string;
  shortName: string;
  emoji: string;
  hasPlayerProps: boolean;
  hasLiveScores: boolean;
  hasPeriodMarkets: boolean;
  playerPropMarkets: string[];
}

export const SPORT_CONFIGS: Record<string, SportConfig> = {
  NHL: {
    key: 'icehockey_nhl',
    name: 'NHL Hockey',
    shortName: 'NHL',
    emoji: '🏒',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['player_goal_scorer_anytime', 'player_goal_scorer_first', 'player_shots_on_goal', 'player_points', 'player_total_saves'],
  },
  NBA: {
    key: 'basketball_nba',
    name: 'NBA Basketball',
    shortName: 'NBA',
    emoji: '🏀',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['player_points', 'player_rebounds', 'player_assists', 'player_threes', 'player_points_rebounds_assists', 'player_double_double'],
  },
  NFL: {
    key: 'americanfootball_nfl',
    name: 'NFL Football',
    shortName: 'NFL',
    emoji: '🏈',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['player_pass_yds', 'player_rush_yds', 'player_reception_yds', 'player_anytime_td', 'player_pass_tds'],
  },
  MLB: {
    key: 'baseball_mlb',
    name: 'MLB Baseball',
    shortName: 'MLB',
    emoji: '⚾',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['batter_hits', 'batter_home_runs', 'batter_total_bases', 'pitcher_strikeouts', 'batter_rbis'],
  },
  EPL: {
    key: 'soccer_epl',
    name: 'English Premier League',
    shortName: 'EPL',
    emoji: '⚽',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['player_goal_scorer_anytime', 'player_shots_on_target', 'player_assists'],
  },
  MLS: {
    key: 'soccer_usa_mls',
    name: 'Major League Soccer',
    shortName: 'MLS',
    emoji: '⚽',
    hasPlayerProps: true,
    hasLiveScores: true,
    hasPeriodMarkets: true,
    playerPropMarkets: ['player_goal_scorer_anytime', 'player_shots_on_target'],
  },
  UFC: {
    key: 'mma_mixed_martial_arts',
    name: 'UFC/MMA',
    shortName: 'UFC',
    emoji: '🥊',
    hasPlayerProps: false,
    hasLiveScores: false,
    hasPeriodMarkets: false,
    playerPropMarkets: [],
  },
};
