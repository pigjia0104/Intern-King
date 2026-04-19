import type { ReactElement, SVGProps } from "react";

export type MascotMood = "cool" | "fire" | "smug" | "cry" | "love";

interface MascotProps extends SVGProps<SVGSVGElement> {
  size?: number;
  mood?: MascotMood;
}

export function Mascot({ size = 120, mood = "cool", className, ...rest }: MascotProps) {
  const glasses = (
    <g>
      <rect x="32" y="58" width="28" height="18" rx="6" fill="#1a1613" />
      <rect x="64" y="58" width="28" height="18" rx="6" fill="#1a1613" />
      <rect x="58" y="64" width="8" height="4" fill="#1a1613" />
      <rect x="36" y="60" width="6" height="4" rx="1" fill="#ffffff" opacity="0.7" />
      <rect x="68" y="60" width="6" height="4" rx="1" fill="#ffffff" opacity="0.7" />
    </g>
  );
  const eyesCry = (
    <g>
      <circle cx="45" cy="66" r="4" fill="#1a1613" />
      <circle cx="80" cy="66" r="4" fill="#1a1613" />
      <path d="M41 72 Q43 82 45 72" stroke="#5bb8ff" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M76 72 Q78 82 80 72" stroke="#5bb8ff" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
  const eyesLove = (
    <g>
      <path d="M38 62 C38 58 42 56 45 60 C48 56 52 58 52 62 C52 66 45 72 45 72 C45 72 38 66 38 62 Z" fill="#e33" />
      <path d="M73 62 C73 58 77 56 80 60 C83 56 87 58 87 62 C87 66 80 72 80 72 C80 72 73 66 73 62 Z" fill="#e33" />
    </g>
  );

  const mouthByMood: Record<MascotMood, ReactElement> = {
    cool: <path d="M54 86 Q62 92 70 86" stroke="#1a1613" strokeWidth="3" fill="none" strokeLinecap="round" />,
    fire: <path d="M54 84 Q62 96 70 84 Q68 92 62 92 Q56 92 54 84 Z" fill="#1a1613" />,
    smug: <path d="M52 88 Q58 86 62 88 Q66 90 72 88" stroke="#1a1613" strokeWidth="3" fill="none" strokeLinecap="round" />,
    cry: <ellipse cx="62" cy="90" rx="5" ry="6" fill="#1a1613" />,
    love: <path d="M54 86 Q62 96 70 86" stroke="#1a1613" strokeWidth="3" fill="none" strokeLinecap="round" />,
  };

  const eyes =
    mood === "cry" ? eyesCry : mood === "love" ? eyesLove : glasses;

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 124 140"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M62 10 C 72 24, 90 34, 90 60 C 96 54, 100 50, 104 50 C 102 62, 110 78, 110 92 C 110 116, 88 132, 62 132 C 36 132, 14 116, 14 92 C 14 78, 22 62, 20 50 C 24 50, 28 54, 34 60 C 34 34, 52 24, 62 10 Z"
        fill="#ffb039"
      />
      <path
        d="M62 34 C 70 46, 82 56, 82 76 C 82 98, 72 116, 62 120 C 52 116, 42 98, 42 76 C 42 56, 54 46, 62 34 Z"
        fill="#f2692c"
      />
      <ellipse cx="62" cy="86" rx="34" ry="26" fill="#fff3d9" />
      {eyes}
      {mouthByMood[mood]}
      <ellipse cx="36" cy="82" rx="5" ry="3" fill="#ff8a65" opacity="0.5" />
      <ellipse cx="88" cy="82" rx="5" ry="3" fill="#ff8a65" opacity="0.5" />
      <path
        d="M62 10 C 72 24, 90 34, 90 60 C 96 54, 100 50, 104 50 C 102 62, 110 78, 110 92 C 110 116, 88 132, 62 132 C 36 132, 14 116, 14 92 C 14 78, 22 62, 20 50 C 24 50, 28 54, 34 60 C 34 34, 52 24, 62 10 Z"
        fill="none"
        stroke="#1a1613"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MascotMini({ size = 24, className, ...rest }: MascotProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 44"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M20 2 C24 8 30 12 30 22 C32 20 34 18 36 18 C35 22 38 28 38 32 C38 40 30 42 20 42 C10 42 2 40 2 32 C2 28 5 22 4 18 C6 18 8 20 10 22 C10 12 16 8 20 2 Z"
        fill="#ffb039"
        stroke="#1a1613"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 14 C23 20 27 24 27 30 C27 36 24 40 20 40 C16 40 13 36 13 30 C13 24 17 20 20 14 Z"
        fill="#f2692c"
      />
      <rect x="11" y="26" width="7" height="5" rx="1.5" fill="#1a1613" />
      <rect x="22" y="26" width="7" height="5" rx="1.5" fill="#1a1613" />
      <rect x="18" y="28" width="4" height="1.5" fill="#1a1613" />
    </svg>
  );
}
