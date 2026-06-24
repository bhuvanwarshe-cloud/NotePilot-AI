import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {}

export function LogoIcon({ className, ...props }: LogoProps) {
  return (
    <svg 
      viewBox="-5 -5 130 130" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="npGradIcon" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0066FF" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="npGradLightIcon" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* Document Outline */}
      <path d="M 45 100 L 35 100 C 26.7 100 20 93.3 20 85 L 20 35 C 20 26.7 26.7 20 35 20 L 65 20 L 90 45 L 90 60" stroke="url(#npGradIcon)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      
      {/* Document Fold */}
      <path d="M 65 20 L 65 35 C 65 40.5 69.5 45 75 45 L 90 45" stroke="url(#npGradIcon)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Horizontal Lines */}
      <line x1="55" y1="35" x2="65" y2="35" stroke="url(#npGradIcon)" strokeWidth="8" strokeLinecap="round"/>
      <line x1="40" y1="55" x2="70" y2="55" stroke="url(#npGradIcon)" strokeWidth="8" strokeLinecap="round"/>

      {/* Four-Pointed Star */}
      <path d="M 22 35 Q 35 35 35 22 Q 35 35 48 35 Q 35 35 35 48 Q 35 35 22 35 Z" fill="url(#npGradIcon)"/>

      {/* Orbit Ring */}
      <path d="M 15 65 A 45 18 -15 0 0 70 95" stroke="url(#npGradIcon)" strokeWidth="6" strokeLinecap="round"/>
      <path d="M 85 85 A 45 18 -15 0 0 105 55" stroke="url(#npGradIcon)" strokeWidth="6" strokeLinecap="round"/>

      {/* Paper Plane */}
      <path d="M 50 85 L 105 45 L 72 82 Z" fill="url(#npGradLightIcon)"/>
      <path d="M 105 45 L 80 105 L 72 82 Z" fill="url(#npGradIcon)"/>
    </svg>
  );
}
