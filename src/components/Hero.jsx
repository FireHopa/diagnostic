import React from "react";
import AiBrandLogos from "./AiBrandLogos.jsx";

const conteudo = {
  recomendacao_ia: {
    eyebrow: "DIAGNÓSTICO DE AUTORIDADE",
    titulo: "Descubra quem já virou resposta no seu mercado.",
    descricao: "Mapeie referências, sinais de autoridade e as perguntas que podem levar um cliente até uma recomendação de IA."
  },
  reputacao: {
    eyebrow: "REPUTAÇÃO E AUTORIDADE DIGITAL",
    titulo: "Descubra se sua empresa transmite confiança para pessoas e máquinas.",
    descricao: "Cruze presença, avaliações, prova social, consistência e autoridade percebida em uma leitura única."
  }
};

const signalWords = ["REPUTAÇÃO", "AUTORIDADE", "PRESENÇA", "CONTEXTO", "CONFIANÇA", "RECOMENDAÇÃO"];

export default function Hero({ tipoDiagnostico }) {
  const selected = conteudo[tipoDiagnostico];

  if (selected) {
    return (
      <section className="hero-selected px-4 pb-3 pt-9 md:px-6 md:pb-5 md:pt-12">
        <div className="mx-auto max-w-[780px] text-center">
          <p className="hero-enter text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">{selected.eyebrow}</p>
          <h1 className="hero-enter hero-enter-delay-1 mx-auto mt-3 max-w-[720px] text-[28px] font-semibold leading-[1.12] tracking-[-0.045em] text-dark md:text-[38px]">
            {selected.titulo}
          </h1>
          <p className="hero-enter hero-enter-delay-2 mx-auto mt-4 max-w-[660px] text-[14px] leading-6 text-muted md:text-[15px]">{selected.descricao}</p>
        </div>
      </section>
    );
  }

  const scrollToDiagnostics = () => document.getElementById("diagnosticos")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section className="hero-main overflow-hidden px-4 pb-9 pt-14 md:px-6 md:pb-12 md:pt-20">
      <div className="mx-auto max-w-[900px] text-center">
        <AiBrandLogos centered large className="hero-enter mx-auto mb-6" />
        <p className="hero-enter hero-enter-delay-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">DIAGNÓSTICO DE PRESENÇA EM IA</p>
        <h1 className="hero-enter hero-enter-delay-2 mx-auto mt-4 max-w-[880px] text-[40px] font-bold leading-[0.98] tracking-[-0.058em] text-dark sm:text-[52px] md:text-[68px]">
          NÃO SEJA O PRIMEIRO RESULTADO.<br />
          <span className="hero-answer">SEJA A RESPOSTA.</span>
        </h1>
        <p className="hero-enter hero-enter-delay-3 mx-auto mt-6 max-w-[690px] text-[15px] leading-7 text-muted md:text-[17px]">
          Descubra se sua empresa possui os sinais necessários para ser encontrada, compreendida e recomendada na era das respostas geradas por IA.
        </p>
        <button type="button" onClick={scrollToDiagnostics} className="hero-enter hero-enter-delay-4 hero-cta mt-7">
          Iniciar diagnóstico <span aria-hidden="true">↓</span>
        </button>

        <div className="signal-ribbon hero-enter hero-enter-delay-4 mt-11" aria-hidden="true">
          <span className="signal-scanner" />
          {signalWords.map((word) => <span key={word}>{word}</span>)}
        </div>
      </div>
    </section>
  );
}
