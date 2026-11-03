import React from 'react';
import { 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Tag, 
  User as UserIcon,
  HelpCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  onClaim: (item: Item) => void;
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  ELECTRONICS: { label: 'Electronics', icon: '💻' },
  WALLETS_CARDS: { label: 'Wallets & IDs', icon: '💳' },
  KEYS: { label: 'Keys', icon: '🔑' },
  BAGS_BACKPACKS: { label: 'Backpack', icon: '🎒' },
  CLOTHING_ACCESSORIES: { label: 'Clothing', icon: '🧥' },
  BOOKS_STATIONERY: { label: 'Books & Docs', icon: '📚' },
  JEWELRY_WATCHES: { label: 'Jewelry', icon: '⌚' },
  OTHER: { label: 'Other', icon: '📦' },
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect, onClaim }) => {
  const isLost = item.item_type === 'LOST';
  const isResolved = item.status === 'RESOLVED';
  const isClaimed = item.status === 'CLAIMED';
  const categoryInfo = CATEGORY_MAP[item.category] || { label: item.category, icon: '🏷️' };

  const displayImage = item.image_display_url || item.image_url;

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group border border-slate-800/80">
      
      {/* Top Media / Thumbnail */}
      <div 
        onClick={() => onSelect(item)}
        className="relative h-48 w-full bg-slate-900 overflow-hidden cursor-pointer"
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if external image URL is blocked
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Fallback gradient banner when image is absent or broken */}
        <div className={`w-full h-full absolute inset-0 -z-10 flex flex-col items-center justify-center p-4 ${
          isLost 
            ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950' 
            : 'bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950'
        }`}>
          <span className="text-4xl mb-2">{categoryInfo.icon}</span>
          <span className="text-xs text-slate-400 font-medium">{categoryInfo.label}</span>
        </div>

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Type & Status Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1.5 ${
            isLost
              ? 'bg-rose-500/90 text-white shadow-rose-500/30'
              : 'bg-emerald-500/90 text-white shadow-emerald-500/30'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            {item.item_type}
          </span>

          {isResolved && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-violet-600/90 text-white shadow-md shadow-violet-600/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Reunited
            </span>
          )}

          {isClaimed && !isResolved && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-500/90 text-slate-950 shadow-md shadow-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" /> In Review
            </span>
          )}
        </div>

        {/* Category Pill Top Right */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 backdrop-blur text-slate-200 border border-slate-700/60 flex items-center gap-1">
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </span>
        </div>

        {/* Date Bottom Left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{item.date_lost_or_found}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center justify-between gap-1.5 text-xs text-indigo-300 font-medium mb-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
              <span className="truncate">{item.location}</span>
            </div>
            {item.latitude && item.longitude && (
              <span
                title={`Exact GPS: ${item.latitude.toFixed(4)}°, ${item.longitude.toFixed(4)}°`}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                GPS
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect(item)}
            className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1"
          >
            {item.title}
          </h3>

          {/* Description Excerpt */}
          <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer Info & Action */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400 truncate">
            Posted by <span className="text-slate-300 font-medium">@{item.posted_by_username || 'anonymous'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!isResolved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClaim(item);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                Claim
              </button>
            )}
            <button
              onClick={() => onSelect(item)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="View full item details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
