// Types for Claude analysis and predictions

export interface GameAnalysisRequest {
  sport: 'NHL' | 'NBA';
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  odds: {
    moneyline: {
      home: { best: number; average: number; impliedProb: number };
      away: { best: number; average: number; impliedProb: number };
    };
    spread: {
      line: number;
      home: { price: number; impliedProb: number };
      away: { price: number; impliedProb: number };
    };
    total: {
      line: number;
      over: { price: number; impliedProb: number };
      under: { price: number; impliedProb: number };
    };
  };
  // Optional enhanced data (for future integration)
  teamStats?: TeamStats;
  injuries?: InjuryReport[];
  headToHead?: H2HRecord[];
}

export interface TeamStats {
  team: string;
  record: { wins: number; losses: number; otl?: number };
  last10: { wins: number; losses: number };
  homeRecord?: { wins: number; losses: number };
  awayRecord?: { wins: number; losses: number };
  goalsFor?: number;
  goalsAgainst?: number;
  pointsFor?: number;
  pointsAgainst?: number;
}

export interface InjuryReport {
  player: string;
  team: string;
  status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE' | 'PROBABLE';
  injury: string;
}

export interface H2HRecord {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

// Claude's analysis response
export interface GamePrediction {
  gameId: string;
  sport: 'NHL' | 'NBA';
  homeTeam: string;
  awayTeam: string;
  analyzedAt: string;
  
  // Winner prediction
  winner: {
    pick: string;
    confidence: number; // 0-100
    reasoning: string;
  };
  
  // Score prediction
  score: {
    home: number;
    away: number;
    confidence: number;
    reasoning: string;
  };
  
  // Spread prediction
  spread: {
    pick: string; // Team name
    line: number;
    confidence: number;
    reasoning: string;
  };
  
  // Total prediction
  total: {
    pick: 'OVER' | 'UNDER';
    line: number;
    predictedTotal: number;
    confidence: number;
    reasoning: string;
  };
  
  // Value bets (where Claude's probability differs significantly from books)
  valueBets: ValueBet[];
  
  // Key factors in the analysis
  keyFactors: string[];
  
  // Risks and concerns
  risks: string[];
  
  // Best bets ranked
  bestBets: RankedBet[];
}

export interface ValueBet {
  betType: 'MONEYLINE' | 'SPREAD' | 'TOTAL';
  pick: string;
  bookImpliedProb: number;
  claudeEstimatedProb: number;
  edge: number; // Difference in probability
  confidence: number;
  reasoning: string;
}

export interface RankedBet {
  rank: number;
  betType: 'MONEYLINE' | 'SPREAD' | 'TOTAL';
  pick: string;
  odds: number;
  confidence: number;
  value: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}

// Player prop predictions (for future)
export interface PlayerPropPrediction {
  player: string;
  team: string;
  propType: string; // 'points', 'goals', 'assists', etc.
  line: number;
  pick: 'OVER' | 'UNDER';
  confidence: number;
  reasoning: string;
}

// NHL Goal Scorer Analysis
export interface GoalScorerPick {
  rank: number;
  playerName: string;
  team: string;
  market: 'first_goal_scorer' | 'anytime_goal_scorer';
  bestOdds: number; // American odds
  impliedProbability: number;
  estimatedProbability: number;
  edge: number; // Difference between estimated and implied
  confidence: number; // 50-100
  reasoning: string;
  valueBet: boolean; // True if edge > 5%
}

export interface GoalScorerAnalysis {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  analyzedAt: string;
  firstGoalPicks: GoalScorerPick[];
  anytimeGoalPicks: GoalScorerPick[];
  topValueBets: GoalScorerPick[];
  analysisNotes: string[];
}

export interface GoalScorerAnalysisRequest {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  firstGoalScorers: Array<{
    playerName: string;
    team: string;
    bestOdds: number;
    averageImpliedProb: number;
  }>;
  anytimeGoalScorers: Array<{
    playerName: string;
    team: string;
    bestOdds: number;
    averageImpliedProb: number;
  }>;
}

// Analysis metadata
export interface AnalysisMeta {
  model: string;
  tokensUsed: number;
  analysisTime: number; // ms
  dataQuality: 'FULL' | 'ODDS_ONLY' | 'ODDS_WITH_INJURIES' | 'LIMITED';
}

// NBA Player Props Analysis
export interface NbaPlayerPropPick {
  rank: number;
  playerName: string;
  team: string;
  propType: 'points' | 'rebounds' | 'assists';
  line: number;
  pick: 'OVER' | 'UNDER';
  bestOdds: number; // American odds
  impliedProbability: number;
  estimatedProbability: number;
  edge: number;
  confidence: number;
  reasoning: string;
  valueBet: boolean;
}

export interface NbaPlayerPropsAnalysis {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  analyzedAt: string;
  pointsPicks: NbaPlayerPropPick[];
  reboundsPicks: NbaPlayerPropPick[];
  assistsPicks: NbaPlayerPropPick[];
  topValueBets: NbaPlayerPropPick[];
  analysisNotes: string[];
}

export interface NbaPlayerPropsAnalysisRequest {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  playerProps: {
    points: Array<{
      playerName: string;
      line: number;
      overOdds: number;
      underOdds: number;
      overImpliedProb: number;
      underImpliedProb: number;
    }>;
    rebounds: Array<{
      playerName: string;
      line: number;
      overOdds: number;
      underOdds: number;
      overImpliedProb: number;
      underImpliedProb: number;
    }>;
    assists: Array<{
      playerName: string;
      line: number;
      overOdds: number;
      underOdds: number;
      overImpliedProb: number;
      underImpliedProb: number;
    }>;
  };
}
