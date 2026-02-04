/**
 * SEO-Optimized Footer Component
 * Provides comprehensive internal linking for SEO
 */

import Link from 'next/link';

export function SEOFooter() {
  return (
    <footer className="bg-[#0a0e14] border-t border-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Sports Picks */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Sports Picks</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=NFL" className="text-slate-400 hover:text-white text-sm transition-colors">NFL Picks</Link></li>
              <li><Link href="/nfl/super-bowl" className="text-slate-400 hover:text-white text-sm transition-colors">Super Bowl 2026</Link></li>
              <li><Link href="/?sport=NBA" className="text-slate-400 hover:text-white text-sm transition-colors">NBA Picks</Link></li>
              <li><Link href="/?sport=NHL" className="text-slate-400 hover:text-white text-sm transition-colors">NHL Picks</Link></li>
              <li><Link href="/?sport=MLB" className="text-slate-400 hover:text-white text-sm transition-colors">MLB Picks</Link></li>
              <li><Link href="/?sport=Soccer" className="text-slate-400 hover:text-white text-sm transition-colors">Soccer Picks</Link></li>
            </ul>
          </div>

          {/* Player Props */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Player Props</h3>
            <ul className="space-y-2">
              <li><Link href="/?sport=NFL&view=props" className="text-slate-400 hover:text-white text-sm transition-colors">NFL Player Props</Link></li>
              <li><Link href="/?sport=NBA&view=props" className="text-slate-400 hover:text-white text-sm transition-colors">NBA Player Props</Link></li>
              <li><Link href="/?sport=NHL&view=props" className="text-slate-400 hover:text-white text-sm transition-colors">NHL Goal Scorers</Link></li>
              <li><Link href="/nfl/super-bowl" className="text-slate-400 hover:text-white text-sm transition-colors">Super Bowl Props</Link></li>
            </ul>
          </div>

          {/* Betting Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Betting Tools</h3>
            <ul className="space-y-2">
              <li><Link href="/?view=tools" className="text-slate-400 hover:text-white text-sm transition-colors">Betting Calculator</Link></li>
              <li><Link href="/?view=tracker" className="text-slate-400 hover:text-white text-sm transition-colors">Pick Tracker</Link></li>
              <li><Link href="/?view=odds" className="text-slate-400 hover:text-white text-sm transition-colors">Odds Comparison</Link></li>
              <li><Link href="/?view=analysis" className="text-slate-400 hover:text-white text-sm transition-colors">AI Analysis</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li><Link href="/nba" className="text-slate-400 hover:text-white text-sm transition-colors">NBA Betting Guide</Link></li>
              <li><Link href="/nhl" className="text-slate-400 hover:text-white text-sm transition-colors">NHL Betting Guide</Link></li>
              <li><Link href="/mlb" className="text-slate-400 hover:text-white text-sm transition-colors">MLB Betting Guide</Link></li>
              <li><Link href="/nfl/super-bowl" className="text-slate-400 hover:text-white text-sm transition-colors">Super Bowl Guide</Link></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Pete&apos;s Picks</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link href="/?view=tracker" className="text-slate-400 hover:text-white text-sm transition-colors">Track Record</Link></li>
              <li><span className="text-slate-400 text-sm">Free AI Sports Picks</span></li>
            </ul>
          </div>
        </div>

        {/* Popular Searches - Long-tail keywords for SEO */}
        <div className="border-t border-slate-800 pt-8 mb-8">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Popular Searches</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Super Bowl predictions 2026',
              'NFL picks today',
              'NBA best bets tonight',
              'NHL first goal scorer',
              'Free sports picks',
              'AI betting predictions',
              'Super Bowl prop bets',
              'NFL player props',
              'NBA points props',
              'Parlay picks today',
              'Expert sports picks',
              'Line shopping',
            ].map((term) => (
              <Link
                key={term}
                href={`/?search=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white text-xs rounded-full transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/Pete/PeterCartoon1.png" 
              alt="Pete's AI Sports Picks Logo"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span className="text-white font-semibold">Pete&apos;s AI Sports Picks</span>
              <span className="block text-xs text-slate-500">Free AI-Powered Betting Analysis</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center md:text-right max-w-md">
            For entertainment purposes only. Please gamble responsibly. 
            Must be 21+ and located in a legal sports betting state.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 text-xs text-slate-600">
          © {new Date().getFullYear()} Pete&apos;s AI Sports Picks. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// Compact version for inner pages
export function CompactSEOFooter() {
  return (
    <footer className="bg-[#0a0e14] border-t border-slate-800 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400 mb-4">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/nfl/super-bowl" className="hover:text-white">Super Bowl</Link>
          <Link href="/nba" className="hover:text-white">NBA</Link>
          <Link href="/nhl" className="hover:text-white">NHL</Link>
          <Link href="/mlb" className="hover:text-white">MLB</Link>
          <Link href="/?view=tracker" className="hover:text-white">Tracker</Link>
          <Link href="/?view=tools" className="hover:text-white">Tools</Link>
        </nav>
        <p className="text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} Pete&apos;s AI Sports Picks • For entertainment only • Gamble responsibly
        </p>
      </div>
    </footer>
  );
}
