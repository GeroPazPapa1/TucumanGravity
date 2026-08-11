"use client";

import { getCategoryAccent } from "./categoryColors";
import { useEnTorneo } from "@/lib/useEnTorneo";

interface RiderAvatarProps {
  nombre: string;
  fotoUrl?: string | null;
  categoriaId: string;
  size?: number;
}

/** Silueta genérica "brazos cruzados", en la línea de las fotos del torneo. */
function SiluetaBrazosCruzados() {
  return (
    <svg viewBox="0 0 64 64" className="w-[62%] h-[62%]" fill="currentColor">
      <circle cx="32" cy="18" r="10" />
      <path d="M32 30c-9 0-16 5.5-16 14v10c0 3 2.5 5 5.5 5h21c3 0 5.5-2 5.5-5V44c0-8.5-7-14-16-14Z" />
      <path d="M20 36c3 4 8 6 12 6s9-2 12-6l3 4c-4 5-10 8-15 8s-11-3-15-8Z" opacity="0.65" />
    </svg>
  );
}

export default function RiderAvatar({ nombre, fotoUrl, categoriaId, size = 56 }: RiderAvatarProps) {
  const enTorneo = useEnTorneo();
  const accent = getCategoryAccent(categoriaId, !enTorneo);

  return (
    <div
      className={`relative shrink-0 rounded-full border-2 ${accent.border} ${accent.bg} overflow-hidden flex items-center justify-center ${accent.text}`}
      style={{ width: size, height: size }}
    >
      {fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- fotos vienen de Supabase Storage (dominio dinámico por proyecto)
        <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
      ) : (
        <SiluetaBrazosCruzados />
      )}
    </div>
  );
}
