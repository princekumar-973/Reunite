import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Send, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  Mail,
  Loader2,
  RefreshCw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Claim, Item } from '../types';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface ClaimsDashboardProps {
  onSelectItem: (item: Item) => void;
}

export const ClaimsDashboard: React.FC<ClaimsDashboardProps> = ({ onSelectItem }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'received' | 'sent' | 'my_items'>('received');
  const [receivedClaims, setReceivedClaims] = useState<Claim[]>([]);
  const [sentClaims, setSentClaims] = useState<Claim[]>([]);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [recRes, sentRes, itemsRes] = await Promise.all([
        api.get<Claim[]>('/v1/claims/?type=received'),
        api.get<Claim[]>('/v1/claims/'),
        api.get<{ results: Item[] } | Item[]>('/v1/items/?my_items=true'),
      ]);

      setReceivedClaims(recRes.data || []);
      setSentClaims(sentRes.data || []);

      const itemsData = Array.isArray(itemsRes.data)
        ? itemsRes.data
        : (itemsRes.data as any).results || [];
      setMyItems(itemsData);
    } catch (err) {
      console.error('Failed to load claims dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (claimId: string, status: 'APPROVED' | 'REJECTED') => {
    setActionLoadingId(claimId);
    try {
      await api.patch(`/v1/claims/${claimId}/status/`, {
        status,
        owner_notes: status === 'APPROVED' ? 'Proof verified. Ownership confirmed!' : 'Insufficient proof provided.',
      });
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating claim status:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleItemResolved = async (itemId: string) => {
    try {
      await api.patch(`/v1/items/${itemId}/`, { status: 'RESOLVED' });
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">User Workspace</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white mt-1">Claims & Item Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Review incoming verification claims on your reported items or monitor claims you submitted.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-slate-500 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'received'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Claims on My Items
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-950 text-indigo-200 border border-indigo-500/30">
            {receivedClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'sent'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          My Submitted Claims
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {sentClaims.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'my_items'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Items I Reported
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {myItems.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs">Loading records from MongoDB...</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: Incoming Claims */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {receivedClaims.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No Incoming Claims Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When someone identifies an item you posted as theirs, their verification proof and contact info will appear here.
                  </p>
                </div>
              ) : (
                receivedClaims.map((claim) => (
                  <div key={claim.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col lg:flex-row gap-5 justify-between">
                    <div className="space-y-3 flex-1">
                      {/* Item and Status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          claim.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {claim.status}
                        </span>
                        <h4 className="font-bold text-base text-white">Item: {claim.item_title}</h4>
                      </div>

                      {/* Claimant Proof Box */}
                      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                        <p className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px] mb-1">
                          Claimant's Proof of Ownership:
                        </p>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">{claim.proof_description}</p>
                      </div>

                      {/* Claimant Contact meta */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                          Claimant: @{claim.claimant_username} ({claim.claimant_name})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-indigo-400" />
                          {claim.claimant_email}
                        </span>
                        {claim.contact_phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            {claim.contact_phone}
                          </span>
                        )}
                        <span>• Submitted {new Date(claim.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Controls for Reporter */}
                    <div className="flex lg:flex-col items-center justify-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-800 pt-3 lg:pt-0 lg:pl-5">
                      {claim.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(claim.id, 'APPROVED')}
                            disabled={actionLoadingId === claim.id}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve & Mark Resolved
                          </button>

                          <button
                            onClick={() => handleUpdateStatus(claim.id, 'REJECTED')}
                            disabled={actionLoadingId === claim.id}
                            className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject Claim
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-3">
                          <p className="text-xs text-slate-400 font-medium">Claim has been {claim.status.toLowerCase()}</p>
                          {claim.owner_notes && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">"{claim.owner_notes}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Sent Claims */}
          {activeTab === 'sent' && (
            <div className="space-y-4">
              {sentClaims.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No Claims Submitted Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    When you find an item in the catalog that belongs to you and click "Claim", track the reporter's response here.
                  </p>
                </div>
              ) : (
                sentClaims.map((claim) => (
                  <div key={claim.id} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          claim.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          claim.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {claim.status}
                        </span>
                        <h4 className="font-bold text-white text-base">Claim for: {claim.item_title}</h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(claim.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Your Submitted Proof:</span>
                      <p className="text-slate-300 mt-1 leading-relaxed">{claim.proof_description}</p>
                    </div>

                    {claim.owner_notes && (
                      <div className={`p-3 rounded-xl text-xs ${
                        claim.status === 'APPROVED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}>
                        <span className="font-bold">Reporter Note: </span>
                        {claim.owner_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: My Reported Items */}
          {activeTab === 'my_items' && (
            <div className="space-y-4">
              {myItems.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base">No Items Reported Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    You haven't reported any lost or found items yet. Use the "Report Item" button in the navbar to get started!
                  </p>
                </div>
              ) : (
                myItems.map((item) => (
                  <div key={item.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
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
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.item_type === 'LOST' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {item.item_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            item.status === 'RESOLVED' ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm mt-1">{item.title}</h4>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-400" /> {item.location} • {item.date_lost_or_found}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      {item.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleItemResolved(item.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => onSelectItem(item)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
