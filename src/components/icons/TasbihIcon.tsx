import React from 'react';

export default function TasbihIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Strap */}
      <path d="M16 24C6 24 6 40 16 40" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" />
      
      {/* Main Body */}
      <rect x="16" y="8" width="32" height="48" rx="12" fill="currentColor" />
      <rect x="16" y="8" width="32" height="48" rx="12" fill="url(#tasbih-grad)" fillOpacity="0.4" />
      
      {/* Screen Background */}
      <rect x="22" y="16" width="20" height="12" rx="3" fill="#ecfccb" />
      <rect x="22" y="16" width="20" height="12" rx="3" stroke="#000000" strokeWidth="1" strokeOpacity="0.2" />
      
      {/* Numbers on Screen */}
      <text x="32" y="25" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#166534" textAnchor="middle">000</text>
      
      {/* Big Button */}
      <circle cx="32" cy="40" r="8" fill="#ffffff" />
      <circle cx="32" cy="40" r="8" fill="url(#tasbih-btn-grad)" fillOpacity="0.8" />
      <circle cx="32" cy="40" r="7.5" stroke="#000000" strokeWidth="1" strokeOpacity="0.1" />
      
      {/* Small Reset Button */}
      <circle cx="42" cy="32" r="2.5" fill="#ffffff" />
      <circle cx="42" cy="32" r="2.5" fill="url(#tasbih-btn-grad)" fillOpacity="0.8" />
      
      <defs>
        <linearGradient id="tasbih-grad" x1="16" y1="8" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="tasbih-btn-grad" x1="24" y1="32" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
    </svg>
  );
}
