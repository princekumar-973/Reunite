import React from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Tag, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';

interface ItemDetailModalProps {
  item: Item | null;
  onClose: () => void;
  onOpenClaim: (item: Item) => void;
  onStatusChange?: (item: Item, newStatus: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  onClose,
  onOpenClaim,
  onStatusChange,
}) => {
  const { user } = useAuth();
  if (!item) return null;

  const isLost = item.item_type === 'LOST';
  const isResolved = item.status === 'RESOLVED';
  const isReporter = user && item.posted_by && String(item.posted_by) === String(user.id);
  const displayImage = item.image_display_url || item.image_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLost ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {item.item_type} ITEM
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isResolved ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {item.status}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          
          {/* Main Photo Banner */}
          {displayImage && (
            <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
              <img
                src={displayImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
            </div>
          )}

          {/* Title & Core Meta */}
          <div>
            <h2 className="text-2xl font-extrabold text-white">{item.title}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-indigo-300 font-medium">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {item.location} {item.campus_area && `(${item.campus_area})`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="w-4 h-4 text-indigo-400" />
                {item.date_lost_or_found}
              </span>
              {item.brand && (
                <>
                  <span>•</span>
                  <span>Brand: <strong className="text-slate-200">{item.brand}</strong></span>
                </>
              )}
              {item.primary_color && (
                <>
                  <span>•</span>
                  <span>Color: <strong className="text-slate-200">{item.primary_color}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description & Identifying Characteristics</h4>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{item.description}</p>
          </div>

          {/* Verification Challenge */}
          {item.secret_verification_question && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Ownership Challenge Hint</h4>
                <p className="text-xs text-amber-200/90 mt-1">
                  "{item.secret_verification_question}"
                </p>
                <p className="text-[11px] text-amber-300/70 mt-1">
                  When you submit a claim, answer this question or provide exact details to prove ownership.
                </p>
              </div>
            </div>
          )}

          {/* Live GPS Map & Discovery Location */}
          {item.latitude && item.longitude && (
            <div className="rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/80 space-y-0">
              <div className="p-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {item.item_type === 'FOUND' ? 'Verified Discovery Spot' : 'Verified Incident Location'}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {item.latitude.toFixed(5)}°, {item.longitude.toFixed(5)}°
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe
                title="Exact Item Location Map"
                width="100%"
                height="190"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.longitude - 0.005}%2C${item.latitude - 0.003}%2C${item.longitude + 0.005}%2C${item.latitude + 0.003}&layer=mapnik&marker=${item.latitude}%2C${item.longitude}`}
                className="w-full h-48 filter saturate-[0.8] contrast-[1.1]"
              />
            </div>
          )}

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-medium">Contact Email</p>
                <p className="text-xs font-bold text-slate-200 truncate">{item.contact_email}</p>
              </div>
            </div>

            {item.contact_phone && (
              <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Contact Phone</p>
                  <p className="text-xs font-bold text-slate-200">{item.contact_phone}</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isReporter ? (
              <span className="text-indigo-400 font-medium">You posted this listing</span>
            ) : (
              <span>Listed by @{item.posted_by_username || 'anonymous'}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isReporter && onStatusChange && !isResolved && (
              <button
                onClick={() => onStatusChange(item, 'RESOLVED')}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer"
              >
                Mark as Resolved
              </button>
            )}

            {!isResolved && (
              <button
                onClick={() => {
                  onClose();
                  onOpenClaim(item);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-md shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Claim / Prove Ownership
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
