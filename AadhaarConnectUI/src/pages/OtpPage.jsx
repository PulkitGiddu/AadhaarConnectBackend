import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function OtpPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inputRefs = useRef([]);
  const aadhaarNumber = searchParams.get('aadhaar') || '';

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) return;

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', { aadhaarNumber, otp: otpString });
      const { sessionId, userName, userHash, availableClaims } = res.data.data;

      // Store user data in localStorage for dashboard access
      localStorage.setItem('ac_userName', userName);
      localStorage.setItem('ac_maskedAadhaar', `XXXX XXXX ${aadhaarNumber.slice(-4)}`);
      localStorage.setItem('ac_userHash', userHash);
      localStorage.setItem('ac_claims', JSON.stringify(availableClaims));

      // Attach OIDC auth request to session
      const clientId = searchParams.get('client_id') || localStorage.getItem('ac_selectedRpId') || 'groww';
      const redirectUri = searchParams.get('redirect_uri') || 'http://localhost:5173/callback';
      const scope = searchParams.get('scope') || 'openid profile age_over_18';
      const state = searchParams.get('state') || '';
      const codeChallenge = searchParams.get('code_challenge') || '';

      await api.post('/oauth/authorize/session', {
        sessionId, clientId, redirectUri, scope, state, codeChallenge
      });

      // Navigate to consent page with session data
      const params = new URLSearchParams();
      params.set('session_id', sessionId);
      params.set('user_name', userName);
      params.set('claims', JSON.stringify(availableClaims));
      params.set('state', state);

      navigate(`/consent?${params.toString()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Mask Aadhaar: XXXX XXXX 1234
  const maskedAadhaar = aadhaarNumber
    ? `XXXX XXXX ${aadhaarNumber.slice(-4)}`
    : '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-aadhaar-orange to-aadhaar-red flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Verify OTP</h1>
          <p className="text-gray-400 mt-2 text-sm">
            Enter the 6-digit OTP sent to the mobile linked with Aadhaar
          </p>
          <p className="text-aadhaar-orange font-mono font-medium text-sm mt-1">{maskedAadhaar}</p>
        </div>

        {/* OTP Card */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-6 shadow-2xl">
          <form onSubmit={handleVerify}>
            {/* OTP Inputs */}
            <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  id={`otp-input-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-aadhaar-surface border border-aadhaar-border rounded-xl text-white focus:outline-none focus:border-aadhaar-orange focus:ring-1 focus:ring-aadhaar-orange/30 transition-all"
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              id="verify-otp-btn"
              type="submit"
              disabled={otp.join('').length !== 6 || loading}
              className="w-full py-3 bg-gradient-to-r from-aadhaar-orange to-aadhaar-red text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </span>
              ) : 'Verify OTP'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Demo OTP: <span className="text-aadhaar-orange font-mono font-bold">123456</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
