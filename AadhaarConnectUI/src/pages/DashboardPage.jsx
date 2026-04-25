import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const userHash = localStorage.getItem('ac_userHash');
  const userName = localStorage.getItem('ac_userName') || 'User';

  useEffect(() => {
    if (userHash) {
      api.get(`/api/user/stats?userHash=${userHash}`)
        .then(res => setStats(res.data.data))
        .catch(console.error);
    }
  }, [userHash]);

  const totalEvents = stats?.totalEvents || 0;
  const activeConsents = stats?.activeConsents || 0;
  const lastEventTime = stats?.lastEventTime;

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'N/A';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
      <p className="text-gray-400 text-sm mb-8">Welcome back, {userName}. Here's your identity overview.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Total Events */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Events</p>
            <div className="w-8 h-8 rounded-lg bg-aadhaar-surface/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalEvents.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
            Cryptographic operations
          </p>
        </div>

        {/* Health Status */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Health Status</p>
            <div className="w-8 h-8 rounded-lg bg-aadhaar-surface/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-bold text-white">0</p>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 border border-green-500/30">ALERTS</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">All cryptographic nodes online</p>
        </div>

        {/* Last Event Recency */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Last Event Recency</p>
            <div className="w-8 h-8 rounded-lg bg-aadhaar-surface/50 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{getTimeAgo(lastEventTime)}</p>
          <p className="text-xs text-gray-400 mt-1">Syncing in real-time</p>
        </div>
      </div>

      {/* Active Connections */}
      <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          Identity Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400"></span>
              <p className="text-sm font-medium text-green-400">Verified</p>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Connected Apps</p>
            <p className="text-sm font-medium text-white">{activeConsents} Active</p>
          </div>
          <div className="p-4 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Data Exposure</p>
            <p className="text-sm font-medium text-white">Consent-Gated Only</p>
          </div>
        </div>
      </div>

      {/* Event Counts */}
      {stats?.eventCounts && (
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">Event Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.eventCounts).map(([type, count]) => (
              <div key={type} className="p-3 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
                <p className="text-xs text-gray-500 font-mono">{type}</p>
                <p className="text-xl font-bold text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
