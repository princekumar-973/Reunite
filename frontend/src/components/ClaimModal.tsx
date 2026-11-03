import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  Lock,
  Loader2
} from 'lucide-react';
import { Item } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ClaimModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenAuth: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
}) => {
  const { user, demoLogin } = useAuth();
  const [proofDescription, setProofDescription] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/v1/claims/', {
        item: item.id,
        proof_description: proofDescription,
        proof_image_url: proofImageUrl,
        contact_phone: contactPhone,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to submit claim:', err);
      setError(
        err.response?.data?.detail || 
        err.response?.data?.proof_description?.[0] || 
        'Could not submit claim. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">File Ownership Claim</h3>
              <p className="text-[11px] text-slate-400">Prove ownership to retrieve this item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Target Item summary card */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            {(item.image_display_url || item.image_url) ? (
              <img
                src={item.image_display_url || item.image_url}
                alt={item.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0">
                📦
              </div>
            )}
            <div className="overflow-hidden">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.item_type === 'LOST' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {item.item_type}
              </span>
              <h4 className="font-bold text-sm text-white truncate mt-0.5">{item.title}</h4>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-400 shrink-0" /> {item.location}
              </p>
            </div>
          </div>

          {/* Verification Challenge if reporter provided one */}
          {item.secret_verification_question && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25">
              <h5 className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Reporter's Verification Question
              </h5>
              <p className="text-xs text-amber-200 mt-1 font-medium">
                "{item.secret_verification_question}"
              </p>
            </div>
          )}

          {/* Unauthenticated Banner */}
          {!user ? (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-3">
              <p className="text-xs text-indigo-200">
                You must be logged in to submit an ownership claim so the reporter can communicate with you.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => demoLogin()}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                >
                  ⚡ Fast 1-Click Demo Login
                </button>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                >
                  Sign In / Register
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Proof of Ownership & Details <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={proofDescription}
                  onChange={(e) => setProofDescription(e.target.value)}
                  placeholder="Provide precise details only the owner knows: answers to verification question, passcodes, internal contents, purchase receipts, or unique scratches..."
                  className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Verification Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={proofImageUrl}
                  onChange={(e) => setProofImageUrl(e.target.value)}
                  placeholder="Link to purchase receipt, previous photo with item, etc."
                  className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Contact Phone for Coordination
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900 text-white placeholder-slate-500 text-xs px-3.5 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Claim to Reporter
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
