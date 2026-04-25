import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function SecurityPage() {
  const [consents, setConsents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [revoking, setRevoking] = useState(null);

  const userHash = localStorage.getItem('ac_userHash');

  useEffect(() => {
    loadConsents();
    loadAuditLogs();
  }, [userHash]);

  const loadConsents = () => {
    if (!userHash) return;
    api.get(`/api/user/consents?userHash=${userHash}`)
      .then(res => setConsents(res.data.data || []))
      .catch(console.error);
  };

  const loadAuditLogs = () => {
    if (!userHash) return;
    api.get(`/api/user/audit?userHash=${userHash}`)
      .then(res => setAuditLogs(res.data.data || []))
      .catch(console.error);
  };

  const handleRevoke = async (clientId) => {
    if (!confirm('Revoke access? This application will no longer be able to access your identity data.')) return;
    setRevoking(clientId);
    try {
      await api.post('/api/user/revoke', { userHash, clientId });
      loadConsents();
      loadAuditLogs();
    } catch (err) {
      console.error('Failed to revoke', err);
    } finally {
      setRevoking(null);
    }
  };

  // Build session table data from audit logs
  // Each row: Session ID | Platform | Last Access Date
  const getSessionRows = () => {
    // Group audit logs by session + client to build a table
    const sessionMap = new Map();

    // From audit logs — get session activity
    auditLogs.forEach(log => {
      const key = log.sessionId || log.clientId || 'unknown';
      if (!sessionMap.has(key)) {
        sessionMap.set(key, {
          sessionId: log.sessionId || '—',
          platform: log.clientId || '—',
          lastAccess: log.createdAt,
        });
      }
      // Update last access if newer
      const existing = sessionMap.get(key);
      if (log.createdAt && (!existing.lastAccess || new Date(log.createdAt) > new Date(existing.lastAccess))) {
        existing.lastAccess = log.createdAt;
      }
      // Prefer client name from consents
      if (log.clientId) {
        existing.platform = log.clientId;
      }
    });

    return Array.from(sessionMap.values());
  };

  // Map clientId to display name from consents
  const getClientName = (clientId) => {
    const consent = consents.find(c => c.clientId === clientId);
    if (consent?.clientName) return consent.clientName;
    // Fallback: capitalize clientId
    const names = {
      'groww': 'Groww',
      'phonepe': 'PhonePe',
      'hdfc-bank': 'HDFC Bank',
      'paytm': 'Paytm',
      'amazon-in': 'Amazon India',
    };
    return names[clientId] || clientId || '—';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const truncateSessionId = (id) => {
    if (!id || id === '—') return '—';
    if (id.length > 12) return id.substring(0, 8) + '...';
    return id;
  };

  const sessionRows = getSessionRows();

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-white mb-1">Security & Sign-In</h1>
      <p className="text-gray-400 text-sm mb-8">Platforms that accessed your AadhaarConnect identity.</p>

      {/* Session Access Table */}
      <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-aadhaar-border/30 bg-aadhaar-surface/30">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Session ID</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Platform</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Last Access</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold text-right">Action</p>
        </div>

        {/* Table Rows */}
        {sessionRows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-aadhaar-surface/50 flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No platforms have accessed your identity yet.</p>
            <p className="text-gray-600 text-xs mt-1">When you grant consent, sessions will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-aadhaar-border/20">
            {sessionRows.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 px-5 py-4 items-center hover:bg-aadhaar-surface/20 transition-colors">
                {/* Session ID */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                  <span
                    className="text-sm text-gray-300 font-mono cursor-pointer hover:text-white transition-colors"
                    title={row.sessionId}
                  >
                    {truncateSessionId(row.sessionId)}
                  </span>
                </div>

                {/* Platform */}
                <div>
                  <p className="text-sm font-medium text-white">{getClientName(row.platform)}</p>
                </div>

                {/* Last Access */}
                <div>
                  <p className="text-sm text-gray-400">{formatDate(row.lastAccess)}</p>
                </div>

                {/* Action */}
                <div className="text-right">
                  {consents.some(c => c.clientId === row.platform) && (
                    <button
                      onClick={() => handleRevoke(row.platform)}
                      disabled={revoking === row.platform}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      {revoking === row.platform ? 'Revoking...' : 'Revoke'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Consents Count */}
      <div className="mt-6 flex items-center gap-4">
        <div className="px-4 py-2 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
          <span className="text-xs text-gray-500">Active Consents: </span>
          <span className="text-sm text-white font-semibold">{consents.length}</span>
        </div>
        <div className="px-4 py-2 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
          <span className="text-xs text-gray-500">Total Sessions: </span>
          <span className="text-sm text-white font-semibold">{sessionRows.length}</span>
        </div>
      </div>
    </div>
  );
}
