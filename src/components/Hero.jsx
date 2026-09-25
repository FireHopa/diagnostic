import React from "react";
import AiBrandLogos from "./AiBrandLogos.jsx";

const conteudo = {
  inicial: {
    eyebrow: "Diagnóstico com Inteligência Artificial",
    titulo: "Sua empresa aparece nas respostas da IA do Google e está sendo recomendada pelo ChatGPT e/ou Gemini?",
    descricao: "Escolha uma análise para começar."
  },
  recomendacao_ia: {
    eyebrow: "Recomendação por IA",
    titulo: "Descubra quem a IA tende a recomendar no seu mercado",
    descricao:
      "Veja quais empresas da sua área já aparecem com mais força e quais sinais podem colocá-las à frente nas respostas das Inteligências Artificiais."
  },
  reputacao: {
    eyebrow: "Reputação e autoridade digital",
    titulo: "Descubra como sua empresa transmite confiança no digital",
    descricao:
      "Analise presença, reputação, prova social, consistência, autoridade percebida e potencial de recomendação por Inteligência Artificial."
  }
};

export default function Hero({ tipoDiagnostico }) {
  const atual = conteudo[tipoDiagnostico] || conteudo.inicial;

  return (
    <section className="px-4 pb-4 pt-12 md:px-6 md:pb-6 md:pt-16">
      <div className="mx-auto max-w-[800px] text-center">
        <AiBrandLogos centered large className="mx-auto mb-5" />
        <p className="text-[13px] font-medium text-primary">{atual.eyebrow}</p>
        <h1 className="mt-3 text-[30px] font-semibold leading-[1.2] tracking-[-0.035em] text-dark md:text-[36px] md:leading-[44px]">
          {atual.titulo}
        </h1>
        <p className="mx-auto mt-4 max-w-[680px] text-[16px] leading-7 text-muted md:text-[17px]">
          {atual.descricao}
        </p>
      </div>
    </section>
  );
}
