import { useState } from 'react';

/**
 * Toggle component for individual claims on the consent page.
 */
export default function ClaimToggle({ claim, label, value, defaultChecked, onChange }) {
  const [checked, setChecked] = useState(defaultChecked ?? true);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange(claim, newValue);
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        checked
          ? 'bg-aadhaar-card/80 border-aadhaar-orange/40 shadow-lg shadow-aadhaar-orange/5'
          : 'bg-aadhaar-surface/50 border-aadhaar-border/30 opacity-60'
      }`}
      onClick={handleToggle}
      id={`claim-toggle-${claim}`}
    >
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className={`text-base font-semibold mt-1 ${checked ? 'text-white' : 'text-gray-500'}`}>
          {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : String(value)}
        </p>
      </div>
      <div className="ml-4">
        <div
          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${
            checked ? 'bg-aadhaar-orange' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform duration-300 ${
              checked ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
