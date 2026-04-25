import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function LoginPage() {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Format Aadhaar number with spaces: XXXX XXXX XXXX
  const formatAadhaar = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleAadhaarChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    setAadhaarNumber(raw);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/send-otp', { aadhaarNumber });

      // Pass OIDC params forward
      const params = new URLSearchParams();
      params.set('aadhaar', aadhaarNumber);
      ['client_id', 'redirect_uri', 'scope', 'state', 'code_challenge'].forEach(key => {
        const val = searchParams.get(key);
        if (val) params.set(key, val);
      });

      navigate(`/otp?${params.toString()}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const demoUsers = [
    { name: 'Rahul Sharma', aadhaar: '234567890123', desc: 'Adult, Maharashtra' },
    { name: 'Priya Verma', aadhaar: '345678901234', desc: 'Adult, Karnataka' },
    { name: 'Arjun Minor', aadhaar: '456789012345', desc: 'Minor, Delhi' },
    { name: 'Rishita Patel', aadhaar: '567890123456', desc: 'Adult, Gujarat' },
    { name: 'Rahul Gupta', aadhaar: '678901234567', desc: 'Adult, Uttar Pradesh' },
    { name: 'Karan Singh', aadhaar: '789012345678', desc: 'Adult, Rajasthan' },
    { name: 'Pulkit Giddu', aadhaar: '890123456789', desc: 'Adult, Telangana' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-aadhaar-orange to-aadhaar-red flex items-center justify-center glow-effect">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-2xl font-bold gradient-text">AadhaarConnect</h1>
          <p className="text-gray-400 mt-2 text-sm">Verify your identity securely</p>
        </div>

        {/* Login Card */}
        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Login with Aadhaar</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your 12-digit Aadhaar number</p>

          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="aadhaar-input">
                Aadhaar Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                  </svg>
                </span>
                <input
                  id="aadhaar-input"
                  type="text"
                  inputMode="numeric"
                  value={formatAadhaar(aadhaarNumber)}
                  onChange={handleAadhaarChange}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full pl-12 pr-4 py-3 bg-aadhaar-surface border border-aadhaar-border rounded-xl text-white text-lg tracking-widest font-mono placeholder-gray-500 focus:outline-none focus:border-aadhaar-orange focus:ring-1 focus:ring-aadhaar-orange/30 transition-all"
                />
              </div>
              {aadhaarNumber.length > 0 && aadhaarNumber.length < 12 && (
                <p className="text-xs text-gray-500 mt-1.5">{aadhaarNumber.length}/12 digits entered</p>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              id="send-otp-btn"
              type="submit"
              disabled={aadhaarNumber.length !== 12 || loading}
              className="w-full py-3 bg-gradient-to-r from-aadhaar-orange to-aadhaar-red text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending OTP...
                </span>
              ) : 'Send OTP'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-aadhaar-blue/10 border border-aadhaar-blue/20">
            <p className="text-xs text-gray-400">
              🔒 OTP will be sent to the mobile number registered with your Aadhaar.
              <span className="text-gray-500"> Your Aadhaar number is never stored — only a hash is used internally.</span>
            </p>
          </div>
        </div>

        {/* Demo Users */}
        <div className="mt-6 bg-aadhaar-surface/40 rounded-2xl border border-aadhaar-border/30 p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Demo Users (OTP: 123456)</p>
          <div className="space-y-2">
            {demoUsers.map((user) => (
              <button
                key={user.aadhaar}
                onClick={() => setAadhaarNumber(user.aadhaar)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-aadhaar-card/40 hover:bg-aadhaar-card/70 border border-transparent hover:border-aadhaar-border/50 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-200">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.desc}</p>
                </div>
                <span className="text-xs text-gray-400 font-mono">{formatAadhaar(user.aadhaar)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
