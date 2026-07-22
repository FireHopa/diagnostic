import React from "react";

function SparkMark() {
  return (
    <span className="ai-gradient-mark flex h-7 w-7 items-center justify-center rounded-lg p-[1px]" aria-hidden="true">
      <span className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-dark" strokeWidth="1.8">
          <path d="M12 3.5c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8Z" />
        </svg>
      </span>
    </span>
  );
}

export default function Header({ onNewAnalysis, showNewAnalysis = false, disabled = false }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/90 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 md:h-[60px] md:px-6">
        <div className="flex items-center gap-3">
          <SparkMark />
          <div className="leading-none">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-dark">Diagnóstico IA</p>
            <p className="mt-1 hidden text-[11px] font-medium text-gray-400 sm:block">Autoridade e presença digital</p>
          </div>
        </div>

        {showNewAnalysis ? (
          <button
            type="button"
            onClick={onNewAnalysis}
            disabled={disabled}
            className="rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-surface-hover hover:text-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Nova análise
          </button>
        ) : (
          <span className="text-[12px] font-medium text-gray-400">Análise inteligente</span>
        )}
      </div>
    </header>
  );
}
