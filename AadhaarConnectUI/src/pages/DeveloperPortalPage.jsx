import { useState } from 'react';

export default function DeveloperPortalPage() {
  const [copied, setCopied] = useState('');

  const rpClient = {
    clientId: 'demo-rp-client',
    clientSecret: 'demo-secret-hash',
    clientName: 'Demo Relying Party',
    status: 'Active Production',
    endpoints: ['/authorize', '/token', '/userinfo'],
    scopes: ['openid', 'profile', 'aadhaar_number'],
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-baseline gap-3 mb-1">
        <h1 className="text-2xl font-bold text-white">Developer Portal</h1>
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Integrate Aadhaar-Based Authentication</span>
      </div>
      <p className="text-gray-400 text-sm mb-8">Manage your applications and integrate AadhaarConnect OIDC.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">System Status</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <div>
                <p className="text-sm font-medium text-white">Auth Gateway</p>
                <p className="text-xs text-gray-500">Operational (99.9% Uptime)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <div>
                <p className="text-sm font-medium text-white">KYC Pipeline</p>
                <p className="text-xs text-gray-500">Active (Latency: 42ms)</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">API Requests</p>
          <p className="text-3xl font-bold text-white">—</p>
          <p className="text-xs text-gray-500 mt-1">Demo mode — no production traffic</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Register New App */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 border-dashed p-6">
          <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Register New App
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">App Name</label>
              <input
                type="text"
                placeholder="e.g. My Secure Portal"
                className="w-full px-4 py-2.5 bg-aadhaar-surface border border-aadhaar-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wider mb-1.5 font-medium">Redirect URI</label>
              <input
                type="text"
                placeholder="https://api.myapp.com/callback"
                className="w-full px-4 py-2.5 bg-aadhaar-surface border border-aadhaar-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
              Create Application
            </button>
          </div>
        </div>

        {/* Registered Application */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Registered Applications (1)</p>
          </div>

          <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-xl border border-aadhaar-border/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-white">{rpClient.clientName}</p>
                  <span className="text-[10px] text-green-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    ACTIVE PRODUCTION
                  </span>
                </div>
              </div>
            </div>

            {/* Client credentials */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-lg bg-aadhaar-surface/40 border border-aadhaar-border/20">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Client ID</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-400 font-mono truncate">{rpClient.clientId}</p>
                  <button
                    onClick={() => copyToClipboard(rpClient.clientId, 'id')}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    {copied === 'id' ? (
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-aadhaar-surface/40 border border-aadhaar-border/20">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Client Secret</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400 font-mono">••••••••••••••</p>
                  <button
                    onClick={() => copyToClipboard(rpClient.clientSecret, 'secret')}
                    className="p-1 text-gray-500 hover:text-white transition-colors"
                  >
                    {copied === 'secret' ? (
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Endpoints & Scopes */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-aadhaar-surface/30 border border-aadhaar-border/20">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">OAuth 2.0 Endpoints</p>
                <div className="flex items-center gap-2">
                  {rpClient.endpoints.map(ep => (
                    <span key={ep} className="text-xs text-gray-400 font-mono">{ep}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rpClient.scopes.map(scope => (
                  <span key={scope} className="px-2 py-0.5 text-[9px] font-medium rounded bg-aadhaar-surface/60 text-gray-400 border border-aadhaar-border/30">
                    {scope}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
