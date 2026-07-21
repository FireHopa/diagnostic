import React from "react";

const conteudo = {
  inicial: {
    titulo: "Escolha qual diagnóstico você quer realizar",
    descricao:
      "Analise quem a Inteligência Artificial tende a recomendar ou descubra o nível de confiança, reputação e autoridade digital da sua própria empresa."
  },
  recomendacao_ia: {
    titulo: "Descubra quem são seus concorrentes recomendados pelas IAs",
    descricao:
      "Veja quais empresas da sua área já estão sendo indicadas como as melhores opções no seu nicho e na sua cidade."
  },
  reputacao: {
    titulo: "Descubra como sua empresa transmite confiança e autoridade no digital",
    descricao:
      "Analise presença digital, reputação, prova social, consistência, autoridade percebida e potencial de recomendação por Inteligência Artificial."
  }
};

export default function Hero({ tipoDiagnostico }) {
  const atual = conteudo[tipoDiagnostico] || conteudo.inicial;

  return (
    <section className="bg-white px-6 pt-10 md:px-8 md:pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-primary md:text-sm">
          Diagnóstico gratuito
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-dark md:text-6xl">
          {atual.titulo}
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray-600 md:text-xl">
          {atual.descricao}
        </p>
      </div>
    </section>
  );
}
