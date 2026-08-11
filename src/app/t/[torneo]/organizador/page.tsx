"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import { useEnTorneo } from "@/lib/useEnTorneo";
import OrganizadorCarreras from "./OrganizadorCarreras";
import OrganizadorResultados from "./OrganizadorResultados";
import OrganizadorCategorias from "./OrganizadorCategorias";

type Tab = "resultados" | "carreras" | "categorias";

function PanelOrganizador({ torneoId }: { torneoId: string }) {
  const [tab, setTab] = useState<Tab>("resultados");
  const enTorneo = useEnTorneo();
  const dim = enTorneo ? "text-tg-text-dim" : "text-plat-text-dim";
  const activo = enTorneo ? "border-tg-green bg-tg-green text-tg-bg" : "border-plat-celeste bg-plat-celeste text-white";
  const inactivo = enTorneo
    ? "border-tg-border bg-tg-surface text-tg-text-dim"
    : "border-plat-border bg-plat-surface text-plat-text-dim";

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">PANEL DEL ORGANIZADOR</h1>
        <p className={`text-sm ${dim}`}>Cargá resultados, editá fechas y categorías de este torneo.</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: "resultados" as Tab, label: "Resultados" },
          { id: "carreras" as Tab, label: "Fechas" },
          { id: "categorias" as Tab, label: "Categorías" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`relative flex-1 px-3 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === item.id ? activo : inactivo
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "resultados" && <OrganizadorResultados torneoId={torneoId} />}
        {tab === "carreras" && <OrganizadorCarreras torneoId={torneoId} />}
        {tab === "categorias" && <OrganizadorCategorias torneoId={torneoId} />}
      </motion.div>
    </div>
  );
}

export default function OrganizadorPage({ params }: { params: Promise<{ torneo: string }> }) {
  const { torneo: torneoId } = use(params);

  return (
    <RoleGate organizadorDe={torneoId} seccion="Panel del organizador">
      <PanelOrganizador torneoId={torneoId} />
    </RoleGate>
  );
}
