import React from "react";

interface Props {
  size?: number;
  state?: "on" | "off";
}

export const Mascot: React.FC<Props> = ({ size = 280, state = "on" }) => {
  const asleep = state === "off";
  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size / 200) * 220}
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#ff7c7c" />
          <stop offset="70%" stopColor="#e63946" />
          <stop offset="100%" stopColor="#b3001b" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="200" rx="56" ry="6" fill="rgba(0,0,0,0.4)" />
      <circle
        cx="100"
        cy="105"
        r="72"
        fill="url(#bodyGrad)"
        stroke="#7a0014"
        strokeWidth="2"
      />
      <ellipse cx="100" cy="58" rx="38" ry="13" fill="rgba(255,255,255,0.25)" />
      <ellipse cx="100" cy="120" rx="50" ry="38" fill="#fff5f5" />
      {asleep ? (
        <>
          <path
            d="M 70 110 Q 78 117 86 110"
            stroke="#1a1c1f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 114 110 Q 122 117 130 110"
            stroke="#1a1c1f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 90 144 Q 100 138 110 144"
            stroke="#1a1c1f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <circle cx="78" cy="108" r="10" fill="#1a1c1f" />
          <circle cx="80" cy="105" r="3" fill="#fff" />
          <circle cx="122" cy="108" r="10" fill="#1a1c1f" />
          <circle cx="124" cy="105" r="3" fill="#fff" />
          <path
            d="M 86 138 Q 100 150 114 138"
            stroke="#1a1c1f"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 140 130 Q 140 118 152 116 Q 164 118 164 130 Q 164 146 152 152 Q 140 146 140 130 Z"
            fill="#fff"
            stroke="#7a0014"
            strokeWidth="2"
          />
          <circle
            cx="152"
            cy="132"
            r="6"
            fill="none"
            stroke="#e63946"
            strokeWidth="2.4"
          />
          <line
            x1="148"
            y1="136"
            x2="156"
            y2="128"
            stroke="#e63946"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};
