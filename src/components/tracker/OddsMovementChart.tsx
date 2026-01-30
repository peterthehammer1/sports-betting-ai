'use client';

import { useState, useEffect, useRef } from 'react';
import type { NormalizedOdds } from '@/types/odds';

interface OddsSnapshot {
  timestamp: string;
  moneyline: { home: number; away: number };
  spread: { line: number; homePrice: number; awayPrice: number };
  total: { line: number; overPrice: number; underPrice: number };
}

interface OddsMovementChartProps {
  game: NormalizedOdds;
  sport: 'NBA' | 'NHL' | 'NFL';
}

export function OddsMovementChart({ game, sport }: OddsMovementChartProps) {
  const [history, setHistory] = useState<OddsSnapshot[]>([]);
  const [activeMarket, setActiveMarket] = useState<'spread' | 'total' | 'moneyline'>('spread');
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchOddsHistory();
  }, [game.gameId]);

  useEffect(() => {
    if (history.length > 0 && canvasRef.current) {
      drawChart();
    }
  }, [history, activeMarket]);

  const fetchOddsHistory = async () => {
    try {
      // For now, generate demo data since we don't have historical odds API
      // In production, this would fetch from /api/odds/history?gameId=xxx
      const demoHistory = generateDemoHistory(game);
      setHistory(demoHistory);
    } catch (error) {
      console.error('Failed to fetch odds history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoHistory = (game: NormalizedOdds): OddsSnapshot[] => {
    const snapshots: OddsSnapshot[] = [];
    const now = new Date();
    const hoursBack = 24;
    
    // Get current values
    const currentSpreadLine = game.spread.consensusLine || 0;
    const currentTotalLine = game.total.consensusLine || 0;
    const currentHomeML = game.moneyline.bestHome?.americanOdds || -110;
    const currentAwayML = game.moneyline.bestAway?.americanOdds || -110;
    
    // Generate historical data with realistic movement
    for (let i = hoursBack; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Add some variance that trends toward current value
      const progress = (hoursBack - i) / hoursBack;
      const variance = (1 - progress) * 2; // More variance early, less later
      
      // Spread movement (typically within 1-2 points)
      const spreadOffset = (Math.random() - 0.5) * variance * 1.5;
      const spreadLine = currentSpreadLine + spreadOffset * (1 - progress);
      
      // Total movement (typically within 2-4 points)
      const totalOffset = (Math.random() - 0.5) * variance * 3;
      const totalLine = currentTotalLine + totalOffset * (1 - progress);
      
      // Moneyline movement
      const mlOffset = (Math.random() - 0.5) * variance * 20;
      
      snapshots.push({
        timestamp: timestamp.toISOString(),
        moneyline: {
          home: Math.round(currentHomeML + mlOffset * (1 - progress)),
          away: Math.round(currentAwayML - mlOffset * (1 - progress)),
        },
        spread: {
          line: Math.round(spreadLine * 2) / 2, // Round to 0.5
          homePrice: -110,
          awayPrice: -110,
        },
        total: {
          line: Math.round(totalLine * 2) / 2, // Round to 0.5
          overPrice: -110,
          underPrice: -110,
        },
      });
    }
    
    return snapshots;
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get data based on active market
    let data: number[];
    let label: string;
    
    if (activeMarket === 'spread') {
      data = history.map(h => h.spread.line);
      label = 'Spread';
    } else if (activeMarket === 'total') {
      data = history.map(h => h.total.line);
      label = 'Total';
    } else {
      data = history.map(h => h.moneyline.home);
      label = 'Home ML';
    }

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    const paddedMin = minVal - range * 0.1;
    const paddedMax = maxVal + range * 0.1;
    const paddedRange = paddedMax - paddedMin;

    // Draw grid lines
    ctx.strokeStyle = '#2a3444';
    ctx.lineWidth = 1;
    
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (i / gridLines) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = paddedMax - (i / gridLines) * paddedRange;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        activeMarket === 'moneyline' 
          ? (value > 0 ? `+${Math.round(value)}` : Math.round(value).toString())
          : value.toFixed(1),
        padding.left - 8,
        y + 4
      );
    }

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = '#4a6fa5';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const y = padding.top + ((paddedMax - val) / paddedRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(74, 111, 165, 0.3)');
    gradient.addColorStop(1, 'rgba(74, 111, 165, 0)');
    
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartWidth;
      const y = padding.top + ((paddedMax - val) / paddedRange) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw current value dot
    const lastX = width - padding.right;
    const lastY = padding.top + ((paddedMax - data[data.length - 1]) / paddedRange) * chartHeight;
    
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#4a6fa5';
    ctx.fill();
    ctx.strokeStyle = '#161d29';
    ctx.lineWidth = 2;
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    
    const timeLabels = [0, Math.floor(history.length / 2), history.length - 1];
    timeLabels.forEach(i => {
      if (history[i]) {
        const x = padding.left + (i / (history.length - 1)) * chartWidth;
        const time = new Date(history[i].timestamp);
        const label = i === history.length - 1 ? 'Now' : 
                      `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
        ctx.fillText(label, x, height - 8);
      }
    });
  };

  // Calculate movement
  const getMovement = () => {
    if (history.length < 2) return { value: 0, direction: 'none' as const };
    
    const first = history[0];
    const last = history[history.length - 1];
    
    let diff: number;
    if (activeMarket === 'spread') {
      diff = last.spread.line - first.spread.line;
    } else if (activeMarket === 'total') {
      diff = last.total.line - first.total.line;
    } else {
      diff = last.moneyline.home - first.moneyline.home;
    }
    
    return {
      value: Math.abs(diff),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'none',
    };
  };

  const movement = getMovement();
  const currentValue = history.length > 0 ? (
    activeMarket === 'spread' ? history[history.length - 1].spread.line :
    activeMarket === 'total' ? history[history.length - 1].total.line :
    history[history.length - 1].moneyline.home
  ) : 0;

  const openingValue = history.length > 0 ? (
    activeMarket === 'spread' ? history[0].spread.line :
    activeMarket === 'total' ? history[0].total.line :
    history[0].moneyline.home
  ) : 0;

  if (loading) {
    return (
      <div className="bg-[#161d29] border border-slate-700/40 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-300 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#161d29] border border-slate-700/40 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700/40">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Line Movement</h3>
            <p className="text-xs text-slate-500 mt-0.5">Last 24 hours</p>
          </div>
          <div className="flex gap-1">
            {(['spread', 'total', 'moneyline'] as const).map(market => (
              <button
                key={market}
                onClick={() => setActiveMarket(market)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors capitalize ${
                  activeMarket === market
                    ? 'bg-[#2a3444] text-slate-200'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {market === 'moneyline' ? 'ML' : market}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-5 py-3 border-b border-slate-700/40 flex items-center gap-6">
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Opening</p>
          <p className="text-sm font-mono text-slate-400">
            {activeMarket === 'moneyline' 
              ? (openingValue > 0 ? `+${openingValue}` : openingValue)
              : openingValue.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Current</p>
          <p className="text-sm font-mono text-slate-200 font-medium">
            {activeMarket === 'moneyline' 
              ? (currentValue > 0 ? `+${currentValue}` : currentValue)
              : currentValue.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase">Movement</p>
          <p className={`text-sm font-mono font-medium flex items-center gap-1 ${
            movement.direction === 'up' ? 'text-[#5a9a7e]' :
            movement.direction === 'down' ? 'text-[#9e7a7a]' :
            'text-slate-400'
          }`}>
            {movement.direction === 'up' && '↑'}
            {movement.direction === 'down' && '↓'}
            {activeMarket === 'moneyline' 
              ? Math.round(movement.value)
              : movement.value.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <canvas 
          ref={canvasRef} 
          className="w-full h-48"
          style={{ width: '100%', height: '192px' }}
        />
      </div>

      {/* Legend */}
      <div className="px-5 pb-4">
        <p className="text-[10px] text-slate-600 text-center">
          {activeMarket === 'spread' && `${game.homeTeam} spread line`}
          {activeMarket === 'total' && 'Game total line'}
          {activeMarket === 'moneyline' && `${game.homeTeam} moneyline`}
        </p>
      </div>
    </div>
  );
}
