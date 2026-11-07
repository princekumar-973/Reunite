import React from 'react';
import { 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  Radio, 
  Sparkles, 
  Tag, 
  Filter, 
  MapPin, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { StatsResponse, ItemCategory } from '../types';

interface HeroStatsProps {
  stats: StatsResponse | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onRefreshData: () => void;
  onOpenReport: (type?: 'LOST' | 'FOUND') => void;
}

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All Categories', icon: '✨' },
  { key: 'ELECTRONICS', label: 'Electronics', icon: '💻' },
  { key: 'WALLETS_CARDS', label: 'Wallets & IDs', icon: '💳' },
  { key: 'KEYS', label: 'Keys', icon: '🔑' },
  { key: 'BAGS_BACKPACKS', label: 'Backpacks', icon: '🎒' },
  { key: 'CLOTHING_ACCESSORIES', label: 'Clothing', icon: '🧥' },
  { key: 'BOOKS_STATIONERY', label: 'Books & Docs', icon: '📚' },
  { key: 'OTHER', label: 'Other', icon: '📦' },
];

export const HeroStats: React.FC<HeroStatsProps> = ({
  stats,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onRefreshData,
  onOpenReport,
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-12 border-b border-slate-800/80">
      {/* Decorative gradient ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Headline & Callout */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Reunite • Lost &amp; Found Registry
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lost Something? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Let’s Bring It Home.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300">
            A secure campus community network to report misplaced belongings, verify rightful ownership with secret questions, and reunite items quickly.
          </p>

          {/* Quick CTA Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onOpenReport('LOST')}
              className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              I Lost An Item
            </button>
            <button
              onClick={() => onOpenReport('FOUND')}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              I Found An Item
            </button>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="glass-panel p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost or found items by keyword, location, brand (e.g. 'MacBook', 'Science Library', 'Blue wallet')..."
                className="w-full bg-slate-900/90 text-white placeholder-slate-400 text-sm pl-12 pr-4 py-3.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white bg-slate-800 px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={onRefreshData}
              title="Refresh Items"
              className="px-4 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar mt-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4 Metrics Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {/* Card 1: Total Items */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reported</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats ? stats.total : '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Active database records
            </p>
          </div>

          {/* Card 2: Reunited */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reunited Owners</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {stats ? stats.resolved : '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Successfully claimed & returned</p>
          </div>

          {/* Card 3: Active Lost */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Lost</span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-rose-400">
              {stats ? stats.lost : '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Still awaiting recovery</p>
          </div>

          {/* Card 4: Active Found */}
          <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Owner</span>
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-violet-400">
              {stats ? stats.found : '...'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Safely reported by finders</p>
          </div>
        </div>

      </div>
    </div>
  );
};
