'use client';

import { useState, useEffect, useRef } from 'react';

interface Activity {
  id: string;
  type: 'win' | 'follow' | 'bet' | 'streak';
  user: string;
  pick?: string;
  odds?: string;
  streak?: number;
  timestamp: Date;
}

// Generate realistic activity
function generateActivity(): Activity {
  // Weight towards wins and follows more than streaks
  const typeWeights = [
    { type: 'win' as const, weight: 40 },
    { type: 'follow' as const, weight: 35 },
    { type: 'bet' as const, weight: 20 },
    { type: 'streak' as const, weight: 5 },
  ];
  
  const random = Math.random() * 100;
  let cumulative = 0;
  let type: Activity['type'] = 'follow';
  for (const tw of typeWeights) {
    cumulative += tw.weight;
    if (random < cumulative) {
      type = tw.type;
      break;
    }
  }
  
  const names = [
    'Mike T.', 'Sarah K.', 'Jake from TX', 'Chris D.', 'Emma R.', 
    'David L.', 'Alex M.', 'John P.', 'Lisa B.', 'Ryan H.',
    'Matt W.', 'Jessica S.', 'Nick C.', 'Amanda F.', 'Kevin G.',
    'Brian M.', 'Steph C.', 'Tyler R.', 'Jordan B.', 'Casey L.'
  ];
  
  const picks = [
    'Seahawks -4.5', 'Patriots +4.5', 'Celtics ML', 'Lakers -6', 
    'Bruins ML', 'Rangers -1.5', 'Warriors -4', 'Nuggets ML',
    'Penguins ML', 'Kings -2.5', 'Super Bowl Over 47.5', 'Super Bowl Under 47.5'
  ];

  return {
    id: Math.random().toString(36).substring(7),
    type,
    user: names[Math.floor(Math.random() * names.length)],
    pick: picks[Math.floor(Math.random() * picks.length)],
    odds: type === 'bet' ? `+${Math.floor(Math.random() * 300) + 100}` : undefined,
    streak: type === 'streak' ? Math.floor(Math.random() * 5) + 3 : undefined,
    timestamp: new Date(),
  };
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with some activities
  useEffect(() => {
    const initial = Array(5).fill(null).map(() => generateActivity());
    setActivities(initial);
  }, []);

  // Add new activity periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity();
        return [newActivity, ...prev].slice(0, 10);
      });
    }, 5000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'win': return '✅';
      case 'follow': return '👀';
      case 'bet': return '🎯';
      case 'streak': return '🔥';
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'win':
        return <><span className="font-medium text-white">{activity.user}</span> won on <span className="text-green-400">{activity.pick}</span></>;
      case 'follow':
        return <><span className="font-medium text-white">{activity.user}</span> started following <span className="text-blue-400">{activity.pick}</span></>;
      case 'bet':
        return <><span className="font-medium text-white">{activity.user}</span> placed a bet on <span className="text-yellow-400">{activity.pick}</span> <span className="text-slate-500">({activity.odds})</span></>;
      case 'streak':
        return <><span className="font-medium text-white">{activity.user}</span> is on a <span className="text-orange-400">{activity.streak}-game win streak!</span></>;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed bottom-20 left-4 z-40 transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}
    >
      {/* Activity Feed Panel */}
      {isExpanded && (
        <div className="bg-[#161b22] border border-slate-700 rounded-lg shadow-2xl mb-2 overflow-hidden animate-scale-up">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm font-semibold text-white">Live Activity</span>
            </div>
            <span className="text-xs text-slate-500">{activities.length} recent</span>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {activities.map((activity, index) => (
              <div 
                key={activity.id}
                className={`px-4 py-3 border-b border-slate-800/50 transition-all duration-500 ${
                  index === 0 ? 'bg-slate-800/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {getActivityText(activity)}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {getTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-all ${
          isExpanded 
            ? 'bg-slate-700 text-white' 
            : 'bg-[#161b22] border border-slate-700 text-slate-300 hover:border-green-500/50'
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-sm font-medium">
          {isExpanded ? 'Hide' : 'Live Activity'}
        </span>
        {!isExpanded && activities.length > 0 && (
          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
            {activities.length}
          </span>
        )}
      </button>
    </div>
  );
}

// Compact inline variant for embedding
export function InlineActivityTicker() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const initial = Array(5).fill(null).map(() => generateActivity());
    setActivities(initial);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, activities.length));
    }, 3000);

    return () => clearInterval(interval);
  }, [activities.length]);

  useEffect(() => {
    const addInterval = setInterval(() => {
      setActivities(prev => [generateActivity(), ...prev].slice(0, 8));
    }, 8000);

    return () => clearInterval(addInterval);
  }, []);

  if (activities.length === 0) return null;

  const current = activities[currentIndex];
  if (!current) return null;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'win': return '✅';
      case 'follow': return '👀';
      case 'bet': return '🎯';
      case 'streak': return '🔥';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm overflow-hidden">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <div 
        key={current.id}
        className="flex items-center gap-2 animate-fade-in"
      >
        <span>{getActivityIcon(current.type)}</span>
        <span className="text-slate-300 truncate">
          <span className="font-medium text-white">{current.user}</span>
          {current.type === 'win' && ' won on '}
          {current.type === 'follow' && ' followed '}
          {current.type === 'bet' && ' bet on '}
          {current.type === 'streak' && ' is on a '}
          <span className="text-green-400">
            {current.type === 'streak' ? `${current.streak}-game streak!` : current.pick}
          </span>
        </span>
      </div>
    </div>
  );
}
