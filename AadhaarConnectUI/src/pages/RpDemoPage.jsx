import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from '../api/axios';

/**
 * Landing page — Select an RP platform, then login with AadhaarConnect.
 * After callback, exchanges code for JWT and redirects to dashboard.
 */
export default function RpDemoPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [rpClients, setRpClients] = useState([]);
  const [selectedRp, setSelectedRp] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeVerifier] = useState('aadhaarconnect-demo-verifier-12345678');

  const isCallback = location.pathname === '/callback';
  const code = searchParams.get('code');

  // Fetch RP clients from backend
  useEffect(() => {
    api.get('/api/rp-clients')
      .then(res => setRpClients(res.data.data || []))
      .catch(() => {
        // Fallback if backend isn't running
        setRpClients([
          { clientId: 'groww', clientName: 'Groww' },
          { clientId: 'phonepe', clientName: 'PhonePe' },
          { clientId: 'hdfc-bank', clientName: 'HDFC Bank' },
          { clientId: 'paytm', clientName: 'Paytm' },
          { clientId: 'amazon-in', clientName: 'Amazon India' },
        ]);
      });
  }, []);

  // Generate PKCE code_challenge from verifier (S256)
  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Handle callback — exchange code for token, then redirect to dashboard
  useEffect(() => {
    if (isCallback && code && !tokenData) {
      exchangeToken(code);
    }
  }, [isCallback, code]);

  const exchangeToken = async (authCode) => {
    setLoading(true);
    setError('');

    const rpClientId = localStorage.getItem('ac_selectedRpId') || 'groww';
    const rpSecret = `${rpClientId}-secret-hash`;

    try {
      const res = await api.post('/oauth/token', {
        grantType: 'authorization_code',
        code: authCode,
        redirectUri: 'http://localhost:5173/callback',
        clientId: rpClientId,
        clientSecret: rpSecret,
        codeVerifier: codeVerifier,
      });

      setTokenData(res.data);

      // Redirect to dashboard after successful token exchange
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Token exchange failed');
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!selectedRp) return;

    // Clear previous user session data (fixes dashboard showing stale user)
    localStorage.removeItem('ac_userName');
    localStorage.removeItem('ac_maskedAadhaar');
    localStorage.removeItem('ac_userHash');
    localStorage.removeItem('ac_claims');

    // Store selected RP for callback
    localStorage.setItem('ac_selectedRpId', selectedRp.clientId);
    localStorage.setItem('ac_selectedRpName', selectedRp.clientName);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const params = new URLSearchParams({
      client_id: selectedRp.clientId,
      redirect_uri: 'http://localhost:5173/callback',
      response_type: 'code',
      scope: 'openid profile age_over_18',
      state: Math.random().toString(36).substring(7),
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `/login?${params.toString()}`;
  };

  // RP brand colors & initials
  const getRpStyle = (clientId) => {
    const styles = {
      'groww': { bg: 'from-green-600 to-green-500', icon: '📈', color: 'text-green-400' },
      'phonepe': { bg: 'from-purple-600 to-indigo-500', icon: '💳', color: 'text-purple-400' },
      'hdfc-bank': { bg: 'from-blue-600 to-blue-500', icon: '🏦', color: 'text-blue-400' },
      'paytm': { bg: 'from-sky-600 to-cyan-500', icon: '💰', color: 'text-sky-400' },
      'amazon-in': { bg: 'from-orange-600 to-amber-500', icon: '🛒', color: 'text-orange-400' },
    };
    return styles[clientId] || { bg: 'from-gray-600 to-gray-500', icon: '🏢', color: 'text-gray-400' };
  };

  // Callback loading state
  if (isCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-slide-up">
          <svg className="animate-spin h-12 w-12 mx-auto text-green-400 mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white font-semibold text-lg">Verifying Identity</p>
          <p className="text-gray-400 text-sm mt-2">Exchanging authorization code for secure token...</p>
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-w-md mx-auto">
              {error}
              <button onClick={() => window.location.href = '/'} className="block mt-2 text-white underline">← Back to Home</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main landing page — RP selection grid
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-aadhaar-orange via-aadhaar-red to-aadhaar-blue flex items-center justify-center glow-effect shadow-2xl">
            <span className="text-3xl font-extrabold text-white">Aa</span>
          </div>
          <h1 className="text-3xl font-extrabold">
            <span className="gradient-text">AadhaarConnect</span>
          </h1>
          <p className="text-gray-400 mt-3 text-base max-w-md mx-auto leading-relaxed">
            Privacy-first OIDC Identity Provider
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">OIDC Compliant</span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">PKCE</span>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-aadhaar-orange/10 text-aadhaar-orange border border-aadhaar-orange/20">RS256</span>
          </div>
        </div>

        {/* Select RP */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-4 text-center">Select a platform to verify your identity</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rpClients.map(rp => {
              const style = getRpStyle(rp.clientId);
              const isSelected = selectedRp?.clientId === rp.clientId;
              return (
                <button
                  key={rp.clientId}
                  onClick={() => setSelectedRp(rp)}
                  className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-aadhaar-card/80 border-green-500/50 ring-1 ring-green-500/20'
                      : 'bg-aadhaar-card/40 border-aadhaar-border/30 hover:border-aadhaar-border/60 hover:bg-aadhaar-card/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${style.bg} flex items-center justify-center text-lg`}>
                      {style.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{rp.clientName}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{rp.clientId}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                      <span className="text-[10px] text-green-400 font-medium">Selected</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Button */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-6 shadow-2xl">
          {selectedRp ? (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-aadhaar-surface/50 border border-aadhaar-border/30">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRpStyle(selectedRp.clientId).bg} flex items-center justify-center text-lg`}>
                {getRpStyle(selectedRp.clientId).icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{selectedRp.clientName}</p>
                <p className="text-xs text-gray-500">wants to verify your Aadhaar identity</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mb-4">Select a platform above to continue</p>
          )}

          <button
            id="login-with-aadhaar-btn"
            onClick={handleLogin}
            disabled={!selectedRp}
            className="w-full py-4 bg-gradient-to-r from-aadhaar-orange to-aadhaar-red text-white font-bold text-lg rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-aadhaar-orange/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
          >
            🔐 Login with AadhaarConnect
          </button>

          <p className="text-xs text-gray-500 text-center mt-3">
            This will initiate the OIDC Authorization Code Flow with PKCE
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="mt-6 bg-aadhaar-surface/30 rounded-2xl border border-aadhaar-border/20 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Authentication Flow</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['Select RP', '→', 'Aadhaar', '→', 'OTP', '→', 'Consent', '→', 'Dashboard'].map((step, i) => (
              <span
                key={i}
                className={step === '→'
                  ? 'text-gray-600 text-xs'
                  : 'px-2.5 py-1 text-xs rounded-md bg-aadhaar-card border border-aadhaar-border/50 text-gray-300 font-medium'
                }
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
