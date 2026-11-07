import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroStats } from './components/HeroStats';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ReportItemModal } from './components/ReportItemModal';
import { ClaimModal } from './components/ClaimModal';
import { ClaimsDashboard } from './components/ClaimsDashboard';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { Item, StatsResponse, ItemType } from './types';
import api from './services/api';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Filter, 
  RefreshCw, 
  PlusCircle, 
  ArrowRight,
  ShieldAlert,
  Compass,
  AlertTriangle,
  Loader2
} from 'lucide-react';

function MainAppContent() {
  const { user, loading: authLoading } = useAuth();

  // Navigation and Filtering State
  const [activeTab, setActiveTab] = useState<'feed' | 'lost' | 'found' | 'claims'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Data State
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportInitialType, setReportInitialType] = useState<ItemType>('LOST');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Fetch Items from Backend API
  const fetchItems = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};

      if (activeTab === 'lost') params.item_type = 'LOST';
      if (activeTab === 'found') params.item_type = 'FOUND';
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await api.get<{ results: Item[] } | Item[]>('/v1/items/', { params });
      const data = Array.isArray(res.data) ? res.data : (res.data as any).results || [];
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab, selectedCategory, statusFilter, searchQuery]);

  // Fetch Live Statistics
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get<StatsResponse>('/v1/items/stats/');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user, fetchItems]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  // Seed sample database items
  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await api.post('/v1/items/seed-demo/');
      await Promise.all([fetchItems(), fetchStats()]);
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleOpenReport = (type: ItemType = 'LOST') => {
    setReportInitialType(type);
    setReportModalOpen(true);
  };

  const handleStatusChange = async (item: Item, newStatus: string) => {
    try {
      await api.patch(`/v1/items/${item.id}/`, { status: newStatus });
      setSelectedItem(null);
      await Promise.all([fetchItems(), fetchStats()]);
    } catch (err) {
      console.error('Error changing item status:', err);
    }
  };

  // Loading Session State
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold tracking-wide text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting to Reunite...</span>
        </div>
      </div>
    );
  }

  // Authentication Gate: User MUST login to proceed
  if (!user) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Fixed / Sticky Navigation */}
      <Navbar
        onOpenReport={() => handleOpenReport('LOST')}
        onOpenAuth={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {activeTab === 'claims' ? (
          <ClaimsDashboard onSelectItem={(item) => setSelectedItem(item)} />
        ) : (
          <div>
            {/* Hero & Metrics Header */}
            <HeroStats
              stats={stats}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onRefreshData={() => { fetchItems(); fetchStats(); }}
              onOpenReport={handleOpenReport}
            />

            {/* Catalog Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              
              {/* Header with Results Count & Filter Pills */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                      {activeTab === 'lost' && 'Active Lost Item Reports'}
                      {activeTab === 'found' && 'Found Items In Custody'}
                      {activeTab === 'feed' && 'Complete Lost & Found Registry'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Showing <strong className="text-indigo-400">{items.length}</strong> items in database
                    {selectedCategory !== 'ALL' && ` • Filtered by category`}
                    {searchQuery && ` • Matching "${searchQuery}"`}
                  </p>
                </div>

                {/* Status Filter Buttons & Seed helper */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        statusFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      All Status
                    </button>
                    <button
                      onClick={() => setStatusFilter('OPEN')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        statusFilter === 'OPEN' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Active Only
                    </button>
                    <button
                      onClick={() => setStatusFilter('RESOLVED')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                        statusFilter === 'RESOLVED' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Reunited
                    </button>
                  </div>

                  {items.length === 0 && (
                    <button
                      onClick={handleSeedData}
                      disabled={seeding}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      {seeding ? 'Populating...' : 'Seed Sample Items'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items Grid */}
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-xs font-medium">Querying MongoDB cluster...</p>
                </div>
              ) : items.length === 0 ? (
                /* Empty State */
                <div className="glass-panel p-16 rounded-3xl text-center space-y-4 max-w-lg mx-auto my-6 border border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="font-extrabold text-white text-lg">No Matching Items Found</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No items matched your current filters. Try resetting your search query or report this item if you recently misplaced or found it.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setStatusFilter('ALL'); }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      Reset All Filters
                    </button>
                    <button
                      onClick={() => handleOpenReport('LOST')}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
                    >
                      Post New Item Report
                    </button>
                  </div>
                </div>
              ) : (
                /* Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onSelect={(i) => setSelectedItem(i)}
                      onClaim={(i) => setClaimTargetItem(i)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                RU
              </div>
              <span className="font-bold text-white text-sm">Reunite Platform</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decentralized, verification-backed lost and found system for university campuses, public hubs, and student centers.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('feed')} className="hover:text-indigo-400 transition-colors">All Listings</button></li>
              <li><button onClick={() => setActiveTab('lost')} className="hover:text-indigo-400 transition-colors">Lost Belongings</button></li>
              <li><button onClick={() => setActiveTab('found')} className="hover:text-indigo-400 transition-colors">Found Items</button></li>
              <li><button onClick={() => setActiveTab('claims')} className="hover:text-indigo-400 transition-colors">My Claim Workspace</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Safety & Verification</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• Always meet in public campus zones</li>
              <li>• Answer secret challenge questions</li>
              <li>• Verify serial numbers or receipts</li>
              <li>• Campus security liaison: Ext. 4400</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] mb-3">System Architecture</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Database:</span>
                <span className="text-emerald-400 font-medium">MongoDB (Direct Driver)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">API Engine:</span>
                <span className="text-indigo-400 font-medium">Django 6.1 + DRF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Frontend:</span>
                <span className="text-violet-400 font-medium">React + Vite + Tailwind</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Reunite Lost &amp; Found Platform. All rights reserved.</p>
          <p>Built with enterprise security standards &amp; MongoDB backend.</p>
        </div>
      </footer>

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenClaim={(item) => setClaimTargetItem(item)}
        onStatusChange={handleStatusChange}
      />

      {/* Claim Modal */}
      <ClaimModal
        item={claimTargetItem}
        isOpen={Boolean(claimTargetItem)}
        onClose={() => setClaimTargetItem(null)}
        onSuccess={() => {
          fetchItems();
          fetchStats();
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Report Item Modal */}
      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialType={reportInitialType}
        onSuccess={() => {
          fetchItems();
          fetchStats();
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
