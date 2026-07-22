import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white px-4 py-7 md:px-6">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 text-[12px] leading-5 text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-gray-500">Diagnóstico IA</p>
        <p>Análise inicial baseada nos sinais encontrados. Não substitui auditoria completa de presença digital.</p>
      </div>
    </footer>
  );
}
