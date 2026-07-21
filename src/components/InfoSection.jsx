import React from "react";

const itensAnalise = [
  "Quem a IA está recomendando",
  "Por que essas empresas são escolhidas",
  "Por que sua empresa pode não aparecer",
  "O que precisa ser corrigido"
];

export default function InfoSection() {
  return (
    <section className="px-6 pb-14 md:px-8 md:pb-16">
      <div className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">
          Como funciona
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {itensAnalise.map((item, index) => (
            <div key={item} className="rounded-2xl bg-soft p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-black text-white">
                {index + 1}Q
              </span>
              <p className="mt-3 text-sm font-black leading-5 text-dark">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
