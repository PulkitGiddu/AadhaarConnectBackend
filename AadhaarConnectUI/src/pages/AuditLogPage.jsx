import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const userHash = localStorage.getItem('ac_userHash');

  useEffect(() => {
    if (userHash) {
      api.get(`/api/user/audit?userHash=${userHash}`)
        .then(res => setLogs(res.data.data || []))
        .catch(console.error);
    }
  }, [userHash]);

  const filteredLogs = filter === 'ALL'
    ? logs
    : logs.filter(l => l.eventType === filter);

  const eventTypes = ['ALL', ...new Set(logs.map(l => l.eventType))];

  const getOutcomeStyle = (outcome) => {
    switch (outcome) {
      case 'SUCCESS': return 'bg-green-500/15 text-green-400 border-green-500/20';
      case 'FAILED': return 'bg-red-500/15 text-red-400 border-red-500/20';
      case 'DENIED': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/20';
    }
  };

  const getEventDot = (type) => {
    switch (type) {
      case 'TOKEN_ISSUED': return 'bg-green-500';
      case 'CONSENT_GIVEN': return 'bg-blue-500';
      case 'ACCESS_REVOKED': return 'bg-red-500';
      case 'OTP_SENT': return 'bg-aadhaar-orange';
      case 'OTP_VERIFIED': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventLabel = (type) => {
    switch (type) {
      case 'TOKEN_ISSUED': return 'Token issued';
      case 'CONSENT_GIVEN': return 'Consent granted';
      case 'ACCESS_REVOKED': return 'Access revoked';
      case 'OTP_SENT': return 'OTP requested';
      case 'OTP_VERIFIED': return 'OTP verified';
      default: return type;
    }
  };

  const getEventDescription = (log) => {
    switch (log.eventType) {
      case 'TOKEN_ISSUED': return `OAuth2 client grant validated. Scopes: ${(log.claims || []).join(', ') || 'identity_verification'}.`;
      case 'CONSENT_GIVEN': return `User consented to share selected claims with ${log.clientId || 'application'}.`;
      case 'ACCESS_REVOKED': return `User revoked application access. All tokens invalidated.`;
      case 'OTP_SENT': return 'OTP dispatched to registered mobile for Aadhaar verification.';
      case 'OTP_VERIFIED': return 'Identity verified via OTP. Secure session established.';
      default: return `Event: ${log.eventType}`;
    }
  };

  const formatEventTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="animate-slide-up">
      <h1 className="text-2xl font-bold text-white mb-1">Audit Logs</h1>
      <p className="text-gray-400 text-sm mb-8">
        A comprehensive immutable record of all cryptographic operations, authentication attempts, and data access requests.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Total Events</p>
          <p className="text-3xl font-bold text-white">{logs.length.toLocaleString()}</p>
        </div>
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Success Rate</p>
          <p className="text-3xl font-bold text-white">
            {logs.length > 0 ? Math.round((logs.filter(l => l.outcome === 'SUCCESS').length / logs.length) * 100) : 100}%
          </p>
        </div>
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Last Event</p>
          <p className="text-3xl font-bold text-white">
            {logs.length > 0 ? formatEventTime(logs[0].createdAt) : 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">UTC TIME</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {eventTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === type
                  ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                  : 'text-gray-400 hover:text-white bg-aadhaar-surface/30 border border-aadhaar-border/20'
              }`}
            >
              {type === 'ALL' ? 'All Events' : type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Live Operation Stream */}
      <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40">
        <div className="p-4 border-b border-aadhaar-border/30 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-white">Live Operation Stream</span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No events recorded yet.</div>
        ) : (
          <div className="divide-y divide-aadhaar-border/20">
            {filteredLogs.map(log => (
              <div key={log.eventId} className="p-4 hover:bg-aadhaar-surface/20 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Time */}
                  <div className="flex-shrink-0 w-20">
                    <p className="text-sm font-bold text-white font-mono">{formatEventTime(log.createdAt)}</p>
                    <p className="text-[10px] text-gray-600 uppercase">UTC TIME</p>
                  </div>

                  {/* Event dot */}
                  <div className={`w-6 h-6 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 ${getEventDot(log.eventType)}/20`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${getEventDot(log.eventType)}`}></span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{getEventLabel(log.eventType)}</p>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${getOutcomeStyle(log.outcome)}`}>
                        {log.outcome}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{getEventDescription(log)}</p>
                  </div>

                  {/* Info icon */}
                  <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 hover:bg-aadhaar-surface/30 transition-all flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
