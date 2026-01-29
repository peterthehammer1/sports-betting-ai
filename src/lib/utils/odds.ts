/**
 * Odds conversion and calculation utilities
 */

/**
 * Convert decimal odds to American odds
 * @param decimal - Decimal odds (e.g., 1.66, 2.23)
 * @returns American odds (e.g., -152, +123)
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    // Underdog: (decimal - 1) * 100
    return Math.round((decimal - 1) * 100);
  } else {
    // Favorite: -100 / (decimal - 1)
    return Math.round(-100 / (decimal - 1));
  }
}

/**
 * Convert American odds to decimal odds
 * @param american - American odds (e.g., -152, +123)
 * @returns Decimal odds
 */
export function americanToDecimal(american: number): number {
  if (american > 0) {
    return (american / 100) + 1;
  } else {
    return (100 / Math.abs(american)) + 1;
  }
}

/**
 * Calculate implied probability from decimal odds
 * @param decimal - Decimal odds
 * @returns Implied probability as decimal (0-1)
 */
export function decimalToImpliedProbability(decimal: number): number {
  return 1 / decimal;
}

/**
 * Calculate implied probability from American odds
 * @param american - American odds
 * @returns Implied probability as decimal (0-1)
 */
export function americanToImpliedProbability(american: number): number {
  if (american > 0) {
    return 100 / (american + 100);
  } else {
    return Math.abs(american) / (Math.abs(american) + 100);
  }
}

/**
 * Calculate probability to decimal odds
 * @param probability - Probability as decimal (0-1)
 * @returns Decimal odds
 */
export function probabilityToDecimal(probability: number): number {
  return 1 / probability;
}

/**
 * Format American odds for display
 * @param american - American odds
 * @returns Formatted string (e.g., "-152", "+123")
 */
export function formatAmericanOdds(american: number): string {
  return american > 0 ? `+${american}` : `${american}`;
}

/**
 * Format decimal odds for display
 * @param decimal - Decimal odds
 * @returns Formatted string (e.g., "1.66")
 */
export function formatDecimalOdds(decimal: number): string {
  return decimal.toFixed(2);
}

/**
 * Format probability as percentage
 * @param probability - Probability as decimal (0-1)
 * @returns Formatted string (e.g., "60.2%")
 */
export function formatProbability(probability: number): string {
  return `${(probability * 100).toFixed(1)}%`;
}

/**
 * Calculate the vig/juice from two-way odds
 * @param odds1 - First outcome decimal odds
 * @param odds2 - Second outcome decimal odds
 * @returns Vig as decimal (e.g., 0.045 for 4.5% vig)
 */
export function calculateVig(odds1: number, odds2: number): number {
  const prob1 = decimalToImpliedProbability(odds1);
  const prob2 = decimalToImpliedProbability(odds2);
  return prob1 + prob2 - 1;
}

/**
 * Calculate the no-vig (fair) probability
 * @param decimalOdds - Decimal odds for one side
 * @param opposingOdds - Decimal odds for the other side
 * @returns Fair probability for the first side
 */
export function calculateFairProbability(
  decimalOdds: number,
  opposingOdds: number
): number {
  const rawProb = decimalToImpliedProbability(decimalOdds);
  const vig = calculateVig(decimalOdds, opposingOdds);
  // Remove vig proportionally
  return rawProb / (1 + vig);
}

/**
 * Find the best odds from an array of book odds
 * @param odds - Array of decimal odds
 * @returns Best (highest) odds
 */
export function findBestOdds(odds: number[]): number {
  return Math.max(...odds);
}

/**
 * Determine if a bet has positive expected value
 * @param fairProbability - Our estimated true probability
 * @param decimalOdds - Odds being offered
 * @returns True if +EV
 */
export function isPositiveEV(
  fairProbability: number,
  decimalOdds: number
): boolean {
  const impliedProb = decimalToImpliedProbability(decimalOdds);
  return fairProbability > impliedProb;
}

/**
 * Calculate expected value of a bet
 * @param fairProbability - Our estimated true probability (0-1)
 * @param decimalOdds - Odds being offered
 * @param stake - Amount wagered (default 100)
 * @returns Expected value (positive = profitable)
 */
export function calculateEV(
  fairProbability: number,
  decimalOdds: number,
  stake: number = 100
): number {
  const winAmount = stake * (decimalOdds - 1);
  const expectedWin = fairProbability * winAmount;
  const expectedLoss = (1 - fairProbability) * stake;
  return expectedWin - expectedLoss;
}

/**
 * Calculate Kelly Criterion bet size
 * @param fairProbability - Our estimated true probability
 * @param decimalOdds - Odds being offered
 * @param bankroll - Total bankroll
 * @param fraction - Kelly fraction (default 0.25 for quarter Kelly)
 * @returns Recommended bet size
 */
export function calculateKelly(
  fairProbability: number,
  decimalOdds: number,
  bankroll: number,
  fraction: number = 0.25
): number {
  const b = decimalOdds - 1; // Net odds
  const p = fairProbability;
  const q = 1 - p;
  
  // Kelly formula: (bp - q) / b
  const kellyFraction = (b * p - q) / b;
  
  // Don't bet if negative EV
  if (kellyFraction <= 0) return 0;
  
  // Apply fractional Kelly and return bet size
  return Math.max(0, bankroll * kellyFraction * fraction);
}

/**
 * Convert odds from The Odds API format to our normalized format
 */
export interface OddsConversion {
  decimal: number;
  american: number;
  impliedProbability: number;
  formatted: {
    decimal: string;
    american: string;
    probability: string;
  };
}

export function convertOdds(decimalOdds: number): OddsConversion {
  const american = decimalToAmerican(decimalOdds);
  const impliedProbability = decimalToImpliedProbability(decimalOdds);
  
  return {
    decimal: decimalOdds,
    american,
    impliedProbability,
    formatted: {
      decimal: formatDecimalOdds(decimalOdds),
      american: formatAmericanOdds(american),
      probability: formatProbability(impliedProbability),
    },
  };
}
