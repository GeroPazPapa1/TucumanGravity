import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Escudo oficial de Tucumán Gravity. El archivo trae borde y trazos en
 * negro, por eso va sobre una placa clara: así se lee bien en la UI oscura
 * sin tocar el arte original.
 */
export default function Logo({ size = 64, className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-tg-text shrink-0 ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.09) }}
    >
      <Image
        src="/brand/logo-tucuman-gravity.png"
        alt="Escudo de Tucumán Gravity"
        width={size}
        height={size}
        className="w-full h-full object-contain"
        priority
      />
    </span>
  );
}
