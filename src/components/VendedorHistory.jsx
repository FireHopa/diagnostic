import React from "react";

function formatarData(data) {
  if (!data) return "Data não informada";

  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(data));
  } catch {
    return data;
  }
}

function nomeTipo(tipo) {
  return tipo === "reputacao" ? "Reputação e Perfil de Empresa Google" : "Diagnóstico de Autoridade";
}

export default function VendedorHistory({
  vendedor,
  items = [],
  loading = false,
  openingId = "",
  error = "",
  onClose,
  onOpen,
  onRefresh
}) {
  return (
    <section className="px-4 pb-16 pt-6 md:px-6 md:pb-20 md:pt-8">
      <div className="mx-auto max-w-[840px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[13px] font-medium text-[#4285F4]">Histórico de {vendedor?.nome || "vendedor"}</p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-dark">Diagnósticos realizados</h2>
            <p className="mt-2 text-[13px] leading-5 text-muted">Somente análises vinculadas a este código de vendedor aparecem aqui.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-xl border border-line bg-white px-3.5 py-2 text-[13px] font-medium text-gray-600 transition hover:bg-surface-hover disabled:opacity-50"
            >
              Atualizar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-[#4285F4] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#3367D6]"
            >
              Voltar
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] font-medium leading-5 text-red-700">{error}</div>
        ) : null}

        <div className="mt-7 overflow-hidden rounded-2xl border border-line bg-white">
          {loading ? (
            <div className="p-8 text-center text-[13px] text-gray-500">Carregando histórico...</div>
          ) : items.length ? (
            <div className="divide-y divide-line">
              {items.map((item) => (
                <article key={item.diagnosticoId} className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-gray-600">{nomeTipo(item.tipoDiagnostico)}</span>
                        {Number.isFinite(item.notaGeral) ? (
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-[#4285F4]">Nota {item.notaGeral}</span>
                        ) : null}
                      </div>
                      <h3 className="mt-3 truncate text-[17px] font-semibold text-dark">{item.empresa || "Empresa não informada"}</h3>
                      <p className="mt-1 text-[12px] text-gray-400">
                        {[item.cidade, item.segmento, item.principalProduto].filter(Boolean).join(" · ") || "Local não informado"}
                      </p>
                      <p className="mt-2 text-[12px] text-gray-400">{formatarData(item.dataEnvio)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      disabled={!item.resultadoDisponivel || openingId === item.diagnosticoId}
                      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl border border-line bg-white px-4 text-[13px] font-medium text-gray-700 transition hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {openingId === item.diagnosticoId
                        ? "Abrindo..."
                        : item.resultadoDisponivel
                          ? "Ver resultado"
                          : "Resultado indisponível"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[14px] font-medium text-dark">Nenhum diagnóstico neste histórico.</p>
              <p className="mt-2 text-[12px] leading-5 text-gray-400">As próximas análises feitas com este código aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
