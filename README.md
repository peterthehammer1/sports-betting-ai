# 🎯 Sports Betting Prediction Platform

NHL & NBA betting analysis and prediction platform powered by Claude AI, with real-time odds from multiple sportsbooks.

## Features

- **Real-time Odds**: Live odds from 9+ sportsbooks (FanDuel, DraftKings, BetMGM, etc.)
- **AI Analysis**: Claude-powered game analysis with winner predictions, score predictions, and value bet identification
- **Quick Picks**: Batch analysis of all games ranked by confidence
- **Deep Analysis**: Detailed breakdown of any single game
- **Value Detection**: Identifies bets where Claude's probability differs from book odds

## Quick Start

### 1. Create Next.js Project

```bash
npx create-next-app@latest sports-betting --typescript --tailwind --eslint --app --src-dir
cd sports-betting
```

### 2. Copy Starter Files

Copy all the files from this starter pack into your project:
```bash
# Unzip and copy
unzip sports-betting-starter.zip
cp -r sports-betting-starter/* .
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
```
THE_ODDS_API_KEY=your_odds_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Main dashboard with tabs
│   └── api/
│       ├── odds/
│       │   ├── nhl/route.ts        # NHL odds endpoint
│       │   └── nba/route.ts        # NBA odds endpoint
│       └── analyze/
│           ├── route.ts            # Single game analysis
│           └── batch/route.ts      # All games analysis
├── components/
│   ├── games/
│   │   └── GameCard.tsx            # Game display with odds
│   └── predictions/
│       ├── PredictionCard.tsx      # Detailed analysis display
│       └── QuickPicks.tsx          # Batch picks display
├── lib/
│   ├── api/
│   │   └── odds.ts                 # The Odds API client
│   ├── analysis/
│   │   ├── claude.ts               # Claude API client
│   │   └── prompts.ts              # Analysis prompt templates
│   └── utils/
│       └── odds.ts                 # Odds conversion utilities
└── types/
    ├── odds.ts                     # Odds types
    └── prediction.ts               # Prediction types
```

## API Endpoints

### GET /api/odds/nhl
Returns normalized NHL odds for all today's games.

### GET /api/odds/nba  
Returns normalized NBA odds for all today's games.

### POST /api/analyze
Deep analysis of a single game.
```json
{ "gameId": "abc123", "sport": "NHL" }
```

### POST /api/analyze/batch
Quick analysis of all games for a sport.
```json
{ "sport": "NHL" }
```

## How It Works

### 1. Odds Fetching
- Pulls real-time odds from The Odds API
- Normalizes data from all sportsbooks
- Calculates best available odds and implied probabilities

### 2. Claude Analysis
For each game, Claude receives:
- Current moneyline, spread, and total odds
- Implied probabilities from multiple books
- Team matchup information

Claude returns:
- Winner prediction with confidence (50-100%)
- Predicted final score
- Spread and total picks
- Value bets (where Claude's probability > book probability)
- Key factors and risks

### 3. Value Bet Detection
A value bet is identified when:
```
Claude's estimated probability - Book's implied probability > 3%
```

## Features Breakdown

### Implemented ✅
- [x] Real-time odds from 9+ sportsbooks
- [x] NHL and NBA support
- [x] Moneyline, spread, and totals
- [x] Best odds highlighting
- [x] Odds format conversion (decimal ↔ American)
- [x] Implied probability calculation
- [x] Claude AI game analysis
- [x] Winner predictions with confidence scores
- [x] Score predictions
- [x] Value bet identification
- [x] Batch analysis (all games)
- [x] Deep analysis (single game)
- [x] Ranked best bets

### Coming Soon 🚧
- [ ] Player props analysis (first goal scorer, points, etc.)
- [ ] Prediction accuracy tracking
- [ ] Historical database
- [ ] Line movement alerts
- [ ] Same-game parlay suggestions

## Key Utilities

### Odds Conversion
```typescript
import { 
  decimalToAmerican,
  americanToDecimal,
  decimalToImpliedProbability,
  calculateEV,
  calculateKelly 
} from '@/lib/utils/odds';

// Convert decimal 1.66 to American
decimalToAmerican(1.66); // -152

// Get implied probability
decimalToImpliedProbability(1.66); // 0.602 (60.2%)

// Calculate expected value
calculateEV(0.55, 1.91); // EV for your prob vs book odds
```

### API Client
```typescript
import { createOddsApiClient } from '@/lib/api/odds';

const client = createOddsApiClient({ 
  apiKey: process.env.THE_ODDS_API_KEY! 
});

// Get NHL odds
const nhlGames = await client.getNhlOdds();

// Normalize for easy consumption
const normalized = client.normalizeGameOdds(nhlGames[0]);
```

## API Quota

The Odds API free tier includes 500 requests/month.

Each call to `/sports/{sport}/odds` counts as 1 request regardless of how many games are returned.

Current usage is returned in response headers and tracked by the client.

## License

MIT - For personal/educational use.

## Disclaimer

This application is for entertainment and educational purposes only. Sports betting involves risk. Please gamble responsibly and within your means.
