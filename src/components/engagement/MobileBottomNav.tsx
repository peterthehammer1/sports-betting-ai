'use client';

import { useState, useEffect } from 'react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'picks' | 'tracker' | 'profile';
  onTabChange: (tab: 'home' | 'picks' | 'tracker' | 'profile') => void;
  picksCount?: number;
  hasNewPicks?: boolean;
}

export function MobileBottomNav({ 
  activeTab, 
  onTabChange,
  picksCount = 0,
  hasNewPicks = false
}: MobileBottomNavProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: HomeIcon },
    { id: 'picks' as const, label: 'Picks', icon: PicksIcon, badge: picksCount > 0 ? picksCount : undefined },
    { id: 'tracker' as const, label: 'Tracker', icon: TrackerIcon },
    { id: 'profile' as const, label: 'Profile', icon: ProfileIcon },
  ];

  return (
    <nav 
      className={`
        fixed bottom-0 left-0 right-0 z-50 md:hidden
        bg-[#0d1117]/95 backdrop-blur-lg border-t border-slate-800
        safe-area-bottom transition-transform duration-300
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
    >
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[60px] py-2 px-3 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'text-white' 
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-green-500 rounded-full" />
              )}
              
              {/* Icon with badge */}
              <div className="relative">
                <Icon active={isActive} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
                {tab.id === 'picks' && hasNewPicks && !tab.badge && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                )}
              </div>
              
              {/* Label */}
              <span className={`
                text-[10px] font-medium mt-1
                ${isActive ? 'text-white' : 'text-slate-500'}
              `}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Icons
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-green-400' : ''}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
      />
    </svg>
  );
}

function PicksIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-green-400' : ''}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  );
}

function TrackerIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-green-400' : ''}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg 
      className={`w-6 h-6 transition-colors ${active ? 'text-green-400' : ''}`} 
      fill={active ? 'currentColor' : 'none'} 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={active ? 0 : 2} 
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
      />
    </svg>
  );
}

// Quick action FAB (Floating Action Button)
export function QuickActionFAB({ 
  onAction 
}: { 
  onAction: () => void;
}) {
  return (
    <button
      onClick={onAction}
      className="
        fixed bottom-24 right-4 z-40 md:hidden
        w-14 h-14 rounded-full
        bg-green-600 hover:bg-green-500
        shadow-lg shadow-green-500/30
        flex items-center justify-center
        transition-all duration-200
        active:scale-95
      "
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );
}
