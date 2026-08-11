interface PlatformLogoProps {
  size?: number;
  className?: string;
}

/**
 * Ícono de la plataforma (Downhill App): silueta de un corredor de DH en
 * posición de ataque, en placa circular oscura. Distinto del escudo de
 * Tucumán Gravity — ese queda reservado para adentro de ese torneo puntual.
 */
export default function PlatformLogo({ size = 64, className = "" }: PlatformLogoProps) {
  const gradientId = "downhill-app-gradient";

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Downhill App"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff1e8e" />
          <stop offset="55%" stopColor="#8a2be2" />
          <stop offset="100%" stopColor="#c6ff1a" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="94" fill="#0a0a0a" stroke={`url(#${gradientId})`} strokeWidth="4" />

      {/* ruedas */}
      <circle cx="60" cy="136" r="25" fill="none" stroke="#f5f5f2" strokeWidth="6" />
      <circle cx="60" cy="136" r="3.5" fill="#f5f5f2" />
      <circle cx="144" cy="136" r="25" fill="none" stroke="#f5f5f2" strokeWidth="6" />
      <circle cx="144" cy="136" r="3.5" fill="#f5f5f2" />

      {/* cuadro */}
      <path
        d="M60 136 L90 104 M90 104 L128 100 L144 136 M90 104 L100 136"
        fill="none"
        stroke="#f5f5f2"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* corredor: espalda, brazo y pierna en posición de ataque */}
      <path d="M126 78 L104 100" stroke="#f5f5f2" strokeWidth="10" strokeLinecap="round" />
      <path d="M104 100 L76 116" stroke="#f5f5f2" strokeWidth="10" strokeLinecap="round" />
      <path d="M104 100 L130 112" stroke="#f5f5f2" strokeWidth="9" strokeLinecap="round" />
      <path
        d="M76 116 L84 128 L100 136"
        fill="none"
        stroke="#f5f5f2"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* casco integral */}
      <path
        d="M119 70
           C118 59, 128 51, 139 53
           C148 55, 153 64, 148 73
           L156 77
           L148 82
           L136 78
           C127 78, 120 76, 119 70 Z"
        fill="#f5f5f2"
      />
    </svg>
  );
}
