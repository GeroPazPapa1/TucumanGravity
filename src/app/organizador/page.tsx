"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import RoleGate from "@/components/RoleGate";
import OrganizadorCarreras from "./OrganizadorCarreras";
import OrganizadorResultados from "./OrganizadorResultados";

type Tab = "resultados" | "carreras";

function PanelOrganizador() {
  const [tab, setTab] = useState<Tab>("resultados");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-2xl tracking-wide">PANEL DEL ORGANIZADOR</h1>
        <p className="text-tg-text-dim text-sm">Cargá resultados, editá fechas y marcá carreras como disputadas.</p>
      </div>

      <div className="flex gap-2">
        {[
          { id: "resultados" as Tab, label: "Cargar resultados" },
          { id: "carreras" as Tab, label: "Carreras y circuitos" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`relative flex-1 px-3 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === item.id
                ? "border-tg-green bg-tg-green text-tg-bg"
                : "border-tg-border bg-tg-surface text-tg-text-dim"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        {tab === "resultados" ? <OrganizadorResultados /> : <OrganizadorCarreras />}
      </motion.div>
    </div>
  );
}

export default function OrganizadorPage() {
  return (
    <RoleGate permitido={["organizador", "superadmin"]}>
      <PanelOrganizador />
    </RoleGate>
  );
}
