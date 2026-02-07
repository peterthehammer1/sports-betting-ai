'use client';

import { useState, useEffect } from 'react';

interface EmailCaptureProps {
  variant?: 'modal' | 'inline' | 'exit-intent';
  onClose?: () => void;
}

export function EmailCapture({ variant = 'modal', onClose }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate API call - in production, connect to email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage that user has signed up
    localStorage.setItem('petesbets_email_signup', 'true');
    localStorage.setItem('petesbets_email', email);
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (variant === 'inline') {
    return (
      <div className="bg-gradient-to-r from-green-900/30 to-[#161b22] border border-green-500/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-bold text-white">Get Today&apos;s Best Bet Free</h3>
            </div>
            <p className="text-sm text-slate-400">
              Join 2,800+ winning bettors. Get our AI&apos;s top pick delivered daily.
            </p>
          </div>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex-1 w-full md:w-auto">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Get Picks'}
                </button>
              </div>
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </form>
          ) : (
            <div className="flex items-center gap-2 text-green-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">You&apos;re in! Check your inbox.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Modal variant
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <div>
                <h2 className="text-lg font-bold text-white">Get Today&apos;s Best Bet</h2>
                <p className="text-green-100 text-sm">67% win rate • Free daily picks</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-green-100 hover:text-white p-1 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isSubmitted ? (
          <div className="p-6">
            {/* Value Props */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                <span className="text-sm text-slate-300">Daily AI-powered picks sent to your inbox</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                <span className="text-sm text-slate-300">High-confidence alerts (70%+ only)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div>
                <span className="text-sm text-slate-300">Unsubscribe anytime • No spam</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-green-500 focus:outline-none mb-3"
              />
              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Signing up...' : 'Get Free Picks →'}
              </button>
            </form>

            {/* Social Proof */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-[#161b22]" />
                  ))}
                </div>
                <span className="text-xs text-slate-500">
                  <span className="text-white font-medium">2,847</span> bettors already subscribed
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">You&apos;re In! 🎉</h3>
            <p className="text-slate-400 mb-4">
              Check your inbox for today&apos;s best bet.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Continue to Site
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Exit Intent Hook
export function useExitIntent(delay = 3000) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Don't show if already signed up
    if (localStorage.getItem('petesbets_email_signup')) return;
    
    // Don't show if dismissed recently
    const dismissed = localStorage.getItem('petesbets_popup_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) return;

    let timeout: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        timeout = setTimeout(() => setShowModal(true), 100);
      }
    };

    // Wait before adding listener
    const initTimeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, delay);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [delay]);

  const dismiss = () => {
    setShowModal(false);
    localStorage.setItem('petesbets_popup_dismissed', Date.now().toString());
  };

  return { showModal, dismiss };
}
