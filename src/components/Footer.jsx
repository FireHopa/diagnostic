import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-8 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
        <p>Diagnóstico de presença nas respostas da IA.</p>
        <p>Simulação inicial. Não substitui auditoria completa de presença digital.</p>
      </div>
    </footer>
  );
}
