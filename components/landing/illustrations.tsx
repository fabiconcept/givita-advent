type IllustrationProps = {
  className?: string;
  strokeWidth?: number;
};

export function IllustCommunity({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      <circle
        cx="100" cy="100" r="72"
        stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="2 6" opacity="0.25"
        className="transition-all duration-500 group-hover:opacity-50"
        style={{ transformOrigin: '100px 100px' }}
      />
      <line x1="100" y1="100" x2="100" y2="40" stroke="currentColor" strokeWidth={strokeWidth} opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-80" />
      <line x1="100" y1="100" x2="158" y2="130" stroke="currentColor" strokeWidth={strokeWidth} opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-80" />
      <line x1="100" y1="100" x2="42" y2="130" stroke="currentColor" strokeWidth={strokeWidth} opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-80" />
      <circle cx="100" cy="40" r="7" className="fill-[#7a5cfa] opacity-60 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '100px 40px' }} />
      <circle cx="158" cy="130" r="7" className="fill-[#7a5cfa] opacity-60 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '158px 130px' }} />
      <circle cx="42" cy="130" r="7" className="fill-[#7a5cfa] opacity-60 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '42px 130px' }} />
      <circle cx="100" cy="100" r="18" fill="currentColor" opacity="0.06" className="transition-opacity duration-500 group-hover:opacity-22" />
      <circle cx="100" cy="100" r="9" className="fill-[#7a5cfa] opacity-80 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '100px 100px' }} />
    </svg>
  );
}

export function IllustBroken({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      <line x1="45" y1="45" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 5" opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-0" />
      <line x1="155" y1="45" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 5" opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-0" />
      <line x1="45" y1="155" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 5" opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-0" />
      <line x1="155" y1="155" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 5" opacity="0.3" className="transition-opacity duration-500 group-hover:opacity-0" />

      <line x1="45" y1="45" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} opacity="0" className="transition-opacity duration-500 group-hover:opacity-75" style={{ transitionDelay: '150ms' }} />
      <line x1="155" y1="45" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} opacity="0" className="transition-opacity duration-500 group-hover:opacity-75" style={{ transitionDelay: '150ms' }} />
      <line x1="45" y1="155" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} opacity="0" className="transition-opacity duration-500 group-hover:opacity-75" style={{ transitionDelay: '150ms' }} />
      <line x1="155" y1="155" x2="100" y2="100" stroke="currentColor" strokeWidth={strokeWidth} opacity="0" className="transition-opacity duration-500 group-hover:opacity-75" style={{ transitionDelay: '150ms' }} />

      <circle cx="45" cy="45" r="7" className="fill-[#7a5cfa] opacity-70 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '45px 45px' }} />
      <circle cx="155" cy="45" r="7" className="fill-[#7a5cfa] opacity-70 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '155px 45px' }} />
      <circle cx="45" cy="155" r="7" className="fill-[#7a5cfa] opacity-70 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '45px 155px' }} />
      <circle cx="155" cy="155" r="7" className="fill-[#7a5cfa] opacity-70 transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:opacity-100 group-hover:scale-110" style={{ transformOrigin: '155px 155px' }} />

      <g className="transition-opacity duration-500 group-hover:opacity-0">
        <line x1="90" y1="90" x2="110" y2="110" stroke="currentColor" strokeWidth={strokeWidth + 0.2} strokeLinecap="round" />
        <line x1="110" y1="90" x2="90" y2="110" stroke="currentColor" strokeWidth={strokeWidth + 0.2} strokeLinecap="round" />
        <circle cx="100" cy="100" r="2.5" className="fill-current" />
      </g>

      <g className="opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ transitionDelay: '300ms' }}>
        <circle cx="100" cy="100" r="11" fill="#d6ff5d" fillOpacity="0.22" />
        <path d="M 92 100 L 98 107 L 110 93" stroke="#d6ff5d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export function IllustShift({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <path
        d="M 30 90 Q 60 30 100 70 T 170 50"
        stroke="#512ef8"
        strokeWidth={strokeWidth + 0.6}
        fill="none"
        strokeLinecap="round"
        className="transition-all duration-700 group-hover:[stroke-dasharray:200] group-hover:[stroke-dashoffset:0]"
        strokeDasharray="200"
        strokeDashoffset="200"
      />
      <path
        d="M 30 90 Q 60 30 100 70 T 170 50"
        stroke="#7a5cfa"
        strokeWidth={strokeWidth}
        strokeDasharray="2 6"
        fill="none"
        opacity="0.7"
      />
      <circle cx="30" cy="90" r="5" fill="#7a5cfa" className="transition-transform duration-500 group-hover:scale-150" style={{ transformOrigin: '30px 90px' }} />
      <circle cx="100" cy="70" r="4" fill="#d6ff5d" className="transition-transform duration-500 group-hover:scale-150" style={{ transformOrigin: '100px 70px' }} />
      <circle cx="170" cy="50" r="6" fill="#512ef8" className="transition-transform duration-500 group-hover:scale-150" style={{ transformOrigin: '170px 50px' }} />
      <path d="M 30 105 h 140" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="1 5" opacity="0.25" />
    </svg>
  );
}

export function IllustSparkle({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <path
        d="M 100 20 L 100 120 M 50 70 L 150 70 M 65 35 L 135 105 M 135 35 L 65 105"
        stroke="#d6ff5d"
        strokeWidth={strokeWidth + 0.4}
        strokeLinecap="round"
        className="transition-transform duration-700 ease-out group-hover:rotate-45"
        style={{ transformOrigin: '100px 70px' }}
      />
      <circle cx="100" cy="70" r="22" fill="#d6ff5d" opacity="0.12" className="transition-all duration-500 group-hover:r-32 group-hover:opacity-30" />
      <circle cx="100" cy="70" r="10" fill="#d6ff5d" />
    </svg>
  );
}

export function IllustShield({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      <path
        d="M 100 32 L 160 54 V 108 Q 160 150 100 172 Q 40 150 40 108 V 54 Z"
        strokeWidth={strokeWidth}
        strokeDasharray="5 5"
        className="fill-[#7a5cfa] stroke-[#7a5cfa] fill-opacity-[0.06] transition-all duration-500 group-hover:fill-[#d6ff5d] group-hover:stroke-[#d6ff5d] group-hover:fill-opacity-[0.22] group-hover:[stroke-dasharray:0]"
      />
      <path
        d="M 72 104 L 92 124 L 132 84"
        stroke="currentColor"
        strokeWidth={strokeWidth + 0.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-500 group-hover:[stroke-width:3.2]"
      />
    </svg>
  );
}

export function IllustGlobe({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <circle cx="100" cy="70" r="50" stroke="#7a5cfa" strokeWidth={strokeWidth} />
      <ellipse cx="100" cy="70" rx="50" ry="20" stroke="#7a5cfa" strokeWidth={strokeWidth} opacity="0.5" />
      <ellipse cx="100" cy="70" rx="20" ry="50" stroke="#7a5cfa" strokeWidth={strokeWidth} opacity="0.5" />
      <path d="M 100 20 Q 130 50 100 70 Q 70 90 100 120" stroke="#7a5cfa" strokeWidth={strokeWidth} opacity="0.35" />
      <circle cx="60" cy="48" r="3" fill="#d6ff5d" className="transition-transform duration-500 group-hover:scale-150" style={{ transformOrigin: '60px 48px' }} />
      <circle cx="140" cy="92" r="3" fill="#d6ff5d" className="transition-transform duration-500 group-hover:scale-150" style={{ transformOrigin: '140px 92px' }} />
      <path d="M 60 48 Q 100 20 140 92" stroke="#d6ff5d" strokeWidth={strokeWidth} strokeDasharray="3 4" opacity="0.7" />
    </svg>
  );
}

export function IllustTrophy({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <path
        d="M 70 30 H 130 V 56 Q 130 80 100 84 Q 70 80 70 56 Z"
        stroke="#d6ff5d"
        strokeWidth={strokeWidth}
        fill="#d6ff5d"
        fillOpacity="0.1"
      />
      <path d="M 70 38 H 50 Q 50 56 70 60" stroke="#d6ff5d" strokeWidth={strokeWidth} />
      <path d="M 130 38 H 150 Q 150 56 130 60" stroke="#d6ff5d" strokeWidth={strokeWidth} />
      <path d="M 100 84 V 100" stroke="#d6ff5d" strokeWidth={strokeWidth} />
      <path d="M 80 110 H 120" stroke="#d6ff5d" strokeWidth={strokeWidth} strokeLinecap="round" />
      <path d="M 76 100 H 124 L 120 110 H 80 Z" stroke="#d6ff5d" strokeWidth={strokeWidth} fill="#d6ff5d" fillOpacity="0.1" />
      <text x="100" y="64" textAnchor="middle" fontFamily="system-ui" fontSize="22" fontWeight="700" fill="#d6ff5d">
        ★
      </text>
    </svg>
  );
}

export function IllustHeartHands({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <path
        d="M 100 56 C 100 30 70 30 70 56 C 70 76 100 96 100 96 C 100 96 130 76 130 56 C 130 30 100 30 100 56 Z"
        fill="#ef4444"
        fillOpacity="0.1"
        stroke="#ef4444"
        strokeWidth={strokeWidth}
      />
      <path
        d="M 50 110 Q 60 100 70 110 Q 80 120 90 110"
        stroke="#ef4444"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 110 110 Q 120 100 130 110 Q 140 120 150 110"
        stroke="#ef4444"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IllustStream({ className, strokeWidth = 1.4 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden>
      <path
        d="M 10 70 Q 40 30 70 70 T 130 70 T 190 70"
        stroke="#512ef8"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 10 90 Q 40 50 70 90 T 130 90 T 190 90"
        stroke="#7a5cfa"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />
      <circle cx="30" cy="70" r="4" fill="#512ef8" />
      <circle cx="90" cy="70" r="5" fill="#d6ff5d" />
      <circle cx="150" cy="70" r="4" fill="#7a5cfa" />
    </svg>
  );
}
