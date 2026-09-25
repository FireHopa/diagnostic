import React from "react";

export default function Header({
  onNewAnalysis,
  showNewAnalysis = false,
  disabled = false,
  vendedor = null,
  onOpenHistory,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/90 bg-white/90 backdrop-blur-xl" data-export-hide="true">
      <div className="mx-auto flex min-h-[68px] max-w-[1200px] items-center justify-between gap-3 px-4 py-2 md:min-h-[72px] md:px-6">
        <div className="flex min-w-0 items-center">
          <img
            src="/brand/logo-casa-do-ads.png"
            alt="Casa do Ads"
            className="h-[50px] w-auto object-contain md:h-[56px]"
          />
        </div>

        {vendedor ? (
          <div className="flex items-center gap-2">
            <span className="hidden text-[12px] font-medium text-gray-400 md:inline">
              {vendedor.nome}
            </span>
            {showNewAnalysis ? (
              <button
                type="button"
                onClick={onNewAnalysis}
                disabled={disabled}
                className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-medium text-gray-600 transition hover:bg-surface-hover hover:text-dark disabled:cursor-not-allowed disabled:opacity-50 md:px-3.5 md:text-[13px]"
              >
                Nova análise
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenHistory}
              disabled={disabled}
              className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-medium text-gray-600 transition hover:bg-surface-hover hover:text-dark disabled:cursor-not-allowed disabled:opacity-50 md:px-3.5 md:text-[13px]"
            >
              Histórico
            </button>
            <button
              type="button"
              onClick={onLogout}
              disabled={disabled}
              className="rounded-xl px-2.5 py-2 text-[12px] font-medium text-gray-400 transition hover:bg-surface-hover hover:text-gray-700 disabled:opacity-50"
            >
              Sair
            </button>
          </div>
        ) : (
          <span className="text-[12px] font-medium text-gray-400">Análise inteligente</span>
        )}
      </div>
    </header>
  );
}
