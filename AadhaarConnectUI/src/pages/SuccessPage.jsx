import { useSearchParams } from 'react-router-dom';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Authorization Complete</h1>
        <p className="text-gray-400 mb-6">Your identity has been verified and consent was granted.</p>

        <div className="bg-aadhaar-card/60 backdrop-blur-xl rounded-2xl border border-aadhaar-border/50 p-6 shadow-2xl text-left">
          <p className="text-sm font-medium text-gray-300 mb-2">Authorization Code</p>
          <p className="text-xs font-mono text-aadhaar-orange bg-aadhaar-surface p-3 rounded-lg break-all">
            {code || 'No code received'}
          </p>
          <p className="text-xs text-gray-500 mt-3">
            This code will be exchanged for a JWT token by the Relying Party.
          </p>
        </div>
      </div>
    </div>
  );
}
