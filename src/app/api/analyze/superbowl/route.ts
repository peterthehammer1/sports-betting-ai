/**
 * API Route: POST /api/analyze/superbowl
 * AI analysis for Super Bowl prop bets
 */

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getCachedAnalysis, cacheAnalysis, isRedisConfigured } from '@/lib/cache/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const anthropic = new Anthropic();

interface PropData {
  playerName: string;
  line?: number;
  name?: string;
  odds: Array<{
    bookmaker: string;
    americanOdds: number;
  }>;
}

interface AnalysisRequest {
  homeTeam: string;
  awayTeam: string;
  propsByMarket: Record<string, PropData[]>;
  gameLines?: {
    spread?: number;
    total?: number;
    homeML?: number;
    awayML?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json();
    const { homeTeam, awayTeam, propsByMarket, gameLines } = body;

    // Create cache key
    const cacheKey = `superbowl-analysis-${homeTeam}-${awayTeam}`;
    
    // Check cache
    const cached = await getCachedAnalysis(cacheKey) as { analysis: unknown } | null;
    if (cached) {
      return NextResponse.json({
        analysis: cached.analysis,
        fromCache: true,
      });
    }

    // Build prompt with prop data
    const propsDescription = Object.entries(propsByMarket)
      .map(([market, props]) => {
        const topProps = props.slice(0, 10).map(p => {
          const bestOdds = p.odds.reduce((best, curr) => 
            curr.americanOdds > best.americanOdds ? curr : best
          , p.odds[0]);
          return `  - ${p.playerName}${p.line ? ` (${p.line})` : ''}: ${bestOdds.americanOdds > 0 ? '+' : ''}${bestOdds.americanOdds}`;
        }).join('\n');
        return `${market}:\n${topProps}`;
      })
      .join('\n\n');

    const prompt = `You are an expert NFL analyst specializing in Super Bowl betting. Analyze these Super Bowl props and provide betting recommendations.

MATCHUP: ${awayTeam} vs ${homeTeam} (Super Bowl)

GAME LINES:
${gameLines ? `- Spread: ${homeTeam} ${gameLines.spread && gameLines.spread > 0 ? '+' : ''}${gameLines.spread || 'N/A'}
- Total: ${gameLines.total || 'N/A'}
- Moneyline: ${homeTeam} ${gameLines.homeML && gameLines.homeML > 0 ? '+' : ''}${gameLines.homeML || 'N/A'} / ${awayTeam} ${gameLines.awayML && gameLines.awayML > 0 ? '+' : ''}${gameLines.awayML || 'N/A'}` : 'Not available'}

AVAILABLE PROPS:
${propsDescription || 'No props available yet'}

Provide analysis in this exact JSON format:
{
  "gamePreview": {
    "summary": "2-3 sentence matchup overview",
    "keyFactors": ["factor1", "factor2", "factor3"],
    "weatherImpact": "brief note on weather if relevant"
  },
  "topPicks": [
    {
      "type": "prop type (e.g., Anytime TD, Passing Yards, etc.)",
      "player": "player name",
      "pick": "specific pick (e.g., Over 250.5 yards)",
      "odds": "best odds",
      "confidence": 85,
      "reasoning": "1-2 sentence explanation"
    }
  ],
  "valueProps": [
    {
      "player": "player name",
      "market": "market type",
      "pick": "specific pick",
      "odds": "odds",
      "reasoning": "why this is value"
    }
  ],
  "avoidProps": [
    {
      "player": "player name",
      "market": "market type",
      "reasoning": "why to avoid"
    }
  ],
  "parlayIdeas": [
    {
      "legs": ["leg1", "leg2", "leg3"],
      "reasoning": "why these work together"
    }
  ],
  "mvpPrediction": {
    "player": "predicted MVP",
    "reasoning": "brief explanation"
  }
}

Focus on:
1. Players likely to have big games based on matchups
2. Props with favorable odds compared to probability
3. Historical Super Bowl trends
4. Team tendencies and game script expectations

Return ONLY valid JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON response
    let analysis;
    try {
      // Find JSON in the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Return a structured error response
      analysis = {
        gamePreview: {
          summary: `Analysis for ${awayTeam} vs ${homeTeam} Super Bowl matchup.`,
          keyFactors: ['Matchup data being processed'],
          weatherImpact: 'Indoor stadium - no weather impact'
        },
        topPicks: [],
        valueProps: [],
        avoidProps: [],
        parlayIdeas: [],
        mvpPrediction: { player: 'TBD', reasoning: 'Analysis in progress' }
      };
    }

    // Cache the result
    await cacheAnalysis(cacheKey, { analysis });

    return NextResponse.json({
      analysis,
      fromCache: false,
      cacheEnabled: isRedisConfigured(),
    });
  } catch (error) {
    console.error('Super Bowl analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
