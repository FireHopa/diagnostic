import React from "react";

const cards = [
  {
    tipo: "recomendacao_ia",
    numero: "01",
    titulo: "Diagnóstico de Autoridade",
    descricao:
      "Vamos entender como sua empresa aparece hoje, quem são as principais referências do seu mercado e o que seus clientes estão perguntando para as Inteligências Artificiais."
  },
  {
    tipo: "reputacao",
    numero: "02",
    titulo: "Reputação e Perfil de Empresa Google",
    descricao:
      "Analise confiança, avaliações, prova social, presença digital e autoridade percebida da sua empresa perante os algoritmos das Inteligências Artificiais."
  }
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DiagnosticCard({ card, onSelect, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(card.tipo)}
      disabled={disabled}
      className="group flex w-full items-start gap-4 rounded-2xl border border-line bg-white p-5 text-left transition duration-200 hover:border-[#DADCE0] hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 md:p-6"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-[12px] font-semibold text-gray-500 transition group-hover:bg-white">
        {card.numero}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[17px] font-semibold leading-6 tracking-[-0.015em] text-dark md:text-[18px]">
          {card.titulo}
        </span>
        <span className="mt-2 block max-w-[650px] text-[14px] leading-6 text-muted md:text-[15px]">
          {card.descricao}
        </span>
      </span>
      <span className="mt-2 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-primary">
        <ArrowIcon />
      </span>
    </button>
  );
}

export default function DiagnosticSelector({ onSelect, disabled = false }) {
  return (
    <section id="diagnosticos" className="px-4 pb-16 pt-6 md:px-6 md:pb-20 md:pt-8">
      <div className="mx-auto max-w-[800px]">
        <DiagnosticCard card={cards[0]} onSelect={onSelect} disabled={disabled} />

        <p className="mb-3 mt-7 text-[16px] font-semibold tracking-[-0.015em] text-dark md:text-[17px]">
          Sua empresa é confiável?
        </p>

        <DiagnosticCard card={cards[1]} onSelect={onSelect} disabled={disabled} />
      </div>
    </section>
  );
}
