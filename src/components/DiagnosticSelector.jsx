import React from "react";

const cards = [
  {
    tipo: "recomendacao_ia",
    numero: "01",
    tag: "RECOMENDAÇÃO",
    titulo: "Quem a IA tende a escolher?",
    descricao: "Entenda quais empresas ocupam mais autoridade no seu mercado, por que elas podem aparecer antes e quais perguntas têm intenção real de contratação.",
    footer: "autoridade · concorrência · intenção"
  },
  {
    tipo: "reputacao",
    numero: "02",
    tag: "REPUTAÇÃO",
    titulo: "A internet confia na sua empresa?",
    descricao: "Leia reputação, Perfil da Empresa no Google, prova social, consistência e autoridade digital com foco no que aumenta ou reduz confiança.",
    footer: "Google · avaliações · confiança"
  }
];

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h13M13 7l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function DiagnosticSelector({ onSelect, disabled = false }) {
  return (
    <section id="diagnosticos" className="px-4 pb-20 pt-5 md:px-6 md:pb-24 md:pt-7">
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">ESCOLHA A LEITURA</p>
            <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.035em] text-dark md:text-[26px]">O que você quer descobrir primeiro?</h2>
          </div>
          <span className="hidden text-[11px] text-gray-400 md:block">2 diagnósticos disponíveis</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {cards.map((card, index) => (
            <button
              key={card.tipo}
              type="button"
              onClick={(event) => onSelect(card.tipo, event.currentTarget)}
              disabled={disabled}
              className={`diagnostic-choice group ${index === 1 ? "diagnostic-choice-alt" : ""}`}
            >
              <span className="diagnostic-choice-glow" aria-hidden="true" />
              <span className="relative z-10 flex h-full flex-col">
                <span className="flex items-center justify-between gap-4">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{card.tag}</span>
                  <span className="text-[11px] font-semibold text-gray-300">{card.numero}</span>
                </span>
                <span className="mt-10 block max-w-[350px] text-[24px] font-semibold leading-[1.08] tracking-[-0.04em] text-dark md:text-[28px]">{card.titulo}</span>
                <span className="mt-4 block text-[13px] leading-6 text-muted md:text-[14px]">{card.descricao}</span>
                <span className="mt-auto flex items-center justify-between gap-4 pt-8">
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-gray-400">{card.footer}</span>
                  <span className="diagnostic-choice-arrow"><ArrowIcon /></span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
