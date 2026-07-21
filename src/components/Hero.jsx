import React from "react";

export default function Hero() {
  return (
    <section className="bg-white px-6 pt-10 md:px-8 md:pt-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-primary md:text-sm">
          Diagnóstico gratuito
        </p>

        <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-dark md:text-6xl">
          Descubra quem são seus concorrentes recomendados pelas IAs
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
          Veja quais empresas da sua área já estão sendo indicadas como as melhores opções no seu nicho e na sua cidade.
        </p>
      </div>
    </section>
  );
}
