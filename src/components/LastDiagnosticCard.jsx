import React from "react";

function elapsedLabel(savedAt) {
  const diff = Math.max(0, Date.now() - new Date(savedAt).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h`;
}

export default function LastDiagnosticCard({ snapshot, onOpen }) {
  if (!snapshot?.diagnostico || !snapshot?.contexto) return null;
  const company = snapshot.contexto.empresa || snapshot.diagnostico?.empresa?.nome || "Último diagnóstico";
  const type = snapshot.tipo === "reputacao" ? "Reputação" : "Autoridade e recomendação";

  return (
    <section className="px-4 pb-5 md:px-6" data-export-hide="true">
      <div className="mx-auto max-w-[900px]">
        <button type="button" onClick={onOpen} className="last-diagnostic-card group">
          <span className="last-diagnostic-pulse" aria-hidden="true" />
          <span className="min-w-0 text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">SEU ÚLTIMO DIAGNÓSTICO · {elapsedLabel(snapshot.savedAt)}</span>
            <span className="mt-1 block truncate text-[14px] font-semibold text-dark">{company}</span>
            <span className="mt-0.5 block text-[11px] text-gray-500">{type} · continuar vendo</span>
          </span>
          <span className="ml-auto text-gray-400 transition group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
