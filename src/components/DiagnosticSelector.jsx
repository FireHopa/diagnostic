import React from "react";

const cards = [
  {
    tipo: "recomendacao_ia",
    eyebrow: "Diagnóstico 1",
    titulo: "Sua empresa está sendo recomendada pela IA?",
    descricao:
      "Descubra quais empresas aparecem com maior força nas respostas das Inteligências Artificiais e o que elas estão fazendo diferente.",
    botao: "Analisar recomendação por IA"
  },
  {
    tipo: "reputacao",
    eyebrow: "Diagnóstico 2",
    titulo: "Sua empresa transmite confiança e autoridade no digital?",
    descricao:
      "Descubra como sua reputação, avaliações, prova social, presença digital e autoridade estão sendo percebidas.",
    botao: "Analisar reputação da empresa"
  }
];

export default function DiagnosticSelector({ onSelect, disabled = false }) {
  return (
    <section id="diagnosticos" className="px-6 py-10 md:px-8 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 md:grid-cols-2">
          {cards.map((card) => (
            <article
              key={card.tipo}
              className="group flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-blue-100 md:p-8"
            >
              <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">
                {card.eyebrow}
              </p>
              <h2 className="mt-4 text-2xl font-black leading-tight text-dark md:text-3xl">
                {card.titulo}
              </h2>
              <p className="mt-4 flex-1 text-base leading-7 text-gray-600">
                {card.descricao}
              </p>
              <button
                type="button"
                onClick={() => onSelect(card.tipo)}
                disabled={disabled}
                className="mt-7 w-full rounded-2xl bg-primary px-5 py-4 text-sm font-black uppercase tracking-wide text-white shadow-glow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {card.botao}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
