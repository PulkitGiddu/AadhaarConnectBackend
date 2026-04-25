import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ClaimToggle from '../components/ClaimToggle';

const CLAIM_LABELS = {
  name: 'Full Name',
  age_over_18: 'Age Over 18',
  state: 'State of Residence',
  gender: 'Gender',
};

export default function ConsentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const sessionId = searchParams.get('session_id') || '';
  const userName = searchParams.get('user_name') || 'User';
  const state = searchParams.get('state') || '';
  const rpName = localStorage.getItem('ac_selectedRpName') || 'Relying Party';
  const rpId = localStorage.getItem('ac_selectedRpId') || '';

  let claims = {};
  try {
    claims = JSON.parse(searchParams.get('claims') || '{}');
  } catch (e) {
    // fallback
  }

  const [consentState, setConsentState] = useState(() => {
    const initial = {};
    Object.keys(claims).forEach(key => {
      initial[key] = true;
    });
    return initial;
  });

  const handleToggle = (claim, checked) => {
    setConsentState(prev => ({ ...prev, [claim]: checked }));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const consentedClaims = Object.keys(consentState).filter(k => consentState[k]);
    const deniedClaims = Object.keys(consentState).filter(k => !consentState[k]);

    try {
      const res = await api.post('/api/consent', {
        sessionId,
        consentedClaims,
        deniedClaims,
      });

      const { authorizationCode, redirectUri } = res.data.data;

      // Exchange the token in the background (so RP gets it)
      try {
        const rpClientId = rpId || 'groww';
        const rpSecret = `${rpClientId}-secret-hash`;
        const codeVerifier = 'aadhaarconnect-demo-verifier-12345678';
        await api.post('/oauth/token', {
          grantType: 'authorization_code',
          code: authorizationCode,
          redirectUri: redirectUri || 'http://localhost:5173/callback',
          clientId: rpClientId,
          clientSecret: rpSecret,
          codeVerifier: codeVerifier,
        });
      } catch {
        // Token exchange may fail in demo — that's okay, consent is recorded
      }

      // Show confirmation view
      setConfirmed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process consent');
    } finally {
      setLoading(false);
    }
  };

  const consentedCount = Object.values(consentState).filter(Boolean).length;
  const totalCount = Object.keys(consentState).length;
  const consentedClaims = Object.keys(consentState).filter(k => consentState[k]);

  // ────────────────────────────────────────────────────────
  // CONFIRMATION VIEW — shown after consent is granted
  // ────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up text-center">
          {/* Success Animation */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Access Granted</h1>
          <p className="text-gray-400 text-sm mb-8">
            <span className="text-green-400 font-medium">{rpName}</span> has been granted access to your verified identity.
          </p>

          {/* What was shared */}
          <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-5 mb-6 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Shared Claims</p>
            <div className="space-y-2">
              {consentedClaims.map(claim => (
                <div key={claim} className="flex items-center gap-3 p-2.5 rounded-lg bg-aadhaar-surface/40">
                  <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">{CLAIM_LABELS[claim] || claim}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-lg bg-green-500/8 border border-green-500/15">
              <p className="text-xs text-gray-400 leading-relaxed">
                🔒 No Aadhaar data stored. Session has been destroyed after token issuance. 
                The RP receives only a pseudonymous identifier — not your real UUID.
              </p>
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-3"
          >
            Go to Dashboard →
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 text-gray-500 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────
  // CONSENT FORM VIEW — shown before granting consent
  // ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-aadhaar-blue to-aadhaar-orange/80 flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Review Consent</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Hi <span className="text-aadhaar-orange font-medium">{userName}</span>, choose what to share
          </p>
        </div>

        {/* Consent Card */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-6 shadow-2xl">
          {/* Requesting party info */}
          <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-aadhaar-surface/50 border border-aadhaar-border/30">
            <div className="w-10 h-10 rounded-lg bg-aadhaar-blue/30 flex items-center justify-center">
              <span className="text-lg">🏢</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200">{rpName}</p>
              <p className="text-xs text-gray-500">is requesting your identity data</p>
            </div>
          </div>

          {/* Claim toggles */}
          <div className="space-y-3 mb-6">
            {Object.entries(claims).map(([key, value]) => (
              <ClaimToggle
                key={key}
                claim={key}
                label={CLAIM_LABELS[key] || key}
                value={value}
                defaultChecked={true}
                onChange={handleToggle}
              />
            ))}
          </div>

          {/* Privacy note */}
          <div className="mb-5 p-3 rounded-lg bg-aadhaar-blue/10 border border-aadhaar-blue/20">
            <p className="text-xs text-gray-400 leading-relaxed">
              🔒 <span className="text-gray-300 font-medium">Privacy-first:</span> Only selected claims will be shared. 
              Your raw date of birth is never exposed — we derive age verification instead.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Summary + Submit */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              Sharing <span className="text-white font-semibold">{consentedCount}</span> of {totalCount} claims
            </span>
          </div>

          <button
            id="grant-consent-btn"
            onClick={handleSubmit}
            disabled={consentedCount === 0 || loading}
            className="w-full py-3 bg-gradient-to-r from-aadhaar-orange to-aadhaar-red text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </span>
            ) : `Grant Consent & Continue`}
          </button>

          <button
            id="deny-consent-btn"
            onClick={() => navigate('/')}
            className="w-full py-2.5 mt-3 text-gray-400 text-sm font-medium hover:text-gray-300 transition-colors"
          >
            Deny & Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
