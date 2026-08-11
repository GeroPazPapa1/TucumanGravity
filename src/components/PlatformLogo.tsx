interface PlatformLogoProps {
  size?: number;
  className?: string;
}

/**
 * Ícono de la plataforma (Downhill App): una flecha en caída con estelas de
 * velocidad, en el degradé de marca. Deliberadamente distinto del escudo de
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
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff1e8e" />
          <stop offset="50%" stopColor="#8a2be2" />
          <stop offset="100%" stopColor="#c6ff1a" />
        </linearGradient>
      </defs>

      <rect x="8" y="8" width="184" height="184" rx="46" fill="#0a0a0a" stroke="#f5f5f2" strokeOpacity="0.18" strokeWidth="3" />

      {/* estelas de velocidad */}
      <path d="M40 26 L100 62 L160 26" fill="none" stroke="#f5f5f2" strokeOpacity="0.25" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 55 L100 96 L168 55" fill="none" stroke="#f5f5f2" strokeOpacity="0.4" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />

      {/* flecha principal en caída */}
      <path
        d="M25 88 L100 156 L175 88"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
