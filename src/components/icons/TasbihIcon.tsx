import React from 'react';

export default function TasbihIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* Finger shape */}
      <path 
        d="M4 16C4 16 6 14 10 14C14 14 20 16 22 18C24 20 22 22 20 22H8C6 22 4 20 4 18V16Z" 
        fill="#FFDBAC" 
      />
      <path 
        d="M4 16C4 16 6 14 10 14C14 14 18 15 20 16C22 17 22 19 20 20H8C6 20 4 18 4 16Z" 
        fill="#F1C27D" 
      />
      
      {/* Digital Counter Body (Yellow) */}
      <rect x="7" y="6" width="10" height="12" rx="3" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5" />
      
      {/* Display Screen */}
      <rect x="9" y="8" width="6" height="3" rx="0.5" fill="#E0E0E0" />
      <path d="M10 9.5H14" stroke="#333" strokeWidth="0.5" opacity="0.5" />
      
      {/* Buttons */}
      <circle cx="12" cy="14" r="1.5" fill="white" stroke="#DAA520" strokeWidth="0.5" />
      <circle cx="15" cy="13" r="0.8" fill="white" stroke="#DAA520" strokeWidth="0.5" />
      
      {/* Finger Nail */}
      <path 
        d="M18 17.5C18 16.5 19 16 20 16C21 16 22 16.5 22 17.5V18.5C22 19.5 21 20 20 20C19 20 18 19.5 18 18.5V17.5Z" 
        fill="#FFE4E1" 
        opacity="0.8"
      />
    </svg>
  );
}
