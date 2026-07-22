import React from "react";

const itensAnalise = [
  ["01", "QUEM", "Quem a IA está recomendando"],
  ["02", "POR QUÊ", "Por que essas empresas são escolhidas"],
  ["03", "O QUE FALTA", "Por que sua empresa pode não aparecer"],
  ["04", "PRÓXIMOS PASSOS", "O que precisa ser corrigido"]
];

export default function InfoSection() {
  return (
    <section className="px-4 pb-16 md:px-6 md:pb-20">
      <div className="mx-auto max-w-[840px] border-t border-line pt-8">
        <div className="mb-5">
          <p className="text-[13px] font-medium text-primary">Como funciona</p>
          <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.025em] text-dark">Os 4Q's do diagnóstico</h2>
        </div>

        <div className="divide-y divide-line rounded-2xl border border-line bg-white px-5 md:px-6">
          {itensAnalise.map(([numero, label, item]) => (
            <div key={numero} className="grid gap-2 py-4 sm:grid-cols-[52px_150px_1fr] sm:items-center">
              <span className="text-[12px] font-semibold text-gray-400">{numero}</span>
              <span className="text-[12px] font-semibold tracking-[0.08em] text-gray-500">{label}</span>
              <span className="text-[14px] leading-6 text-dark">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
