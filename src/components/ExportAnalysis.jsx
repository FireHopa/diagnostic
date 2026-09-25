import React, { useState } from "react";
import {
  exportarComoHtml,
  exportarComoPdf,
  exportarComoWord,
  nomeArquivoDiagnostico
} from "../utils/exportarDiagnostico.js";

export default function ExportAnalysis({ contexto = {}, tipo = "recomendacao_ia" }) {
  const [exportando, setExportando] = useState("");
  const [erro, setErro] = useState("");

  const empresa = contexto.empresa || "Empresa analisada";
  const principalProduto = contexto.principalProduto || "";
  const cidade = contexto.cidade || "";
  const filename = nomeArquivoDiagnostico({ empresa, tipo });
  const titulo = tipo === "reputacao" ? "Diagnóstico de Reputação e Autoridade Digital" : "Diagnóstico de Autoridade";
  const subtitulo = [cidade, principalProduto].filter(Boolean).join(" · ");

  const executar = async (formato) => {
    setErro("");
    setExportando(formato);

    try {
      const options = {
        rootId: "resultado",
        filename,
        titulo,
        empresa,
        subtitulo
      };

      if (formato === "pdf") {
        exportarComoPdf(options);
      } else if (formato === "word") {
        await exportarComoWord(options);
      } else {
        await exportarComoHtml(options);
      }
    } catch (error) {
      setErro(error.message || "Não foi possível exportar esta análise.");
    } finally {
      if (formato !== "pdf") setExportando("");
      else window.setTimeout(() => setExportando(""), 800);
    }
  };

  return (
    <>
      <div className="export-document-brand hidden" aria-hidden="true">
        <img data-export-logo="true" src="/brand/logo-casa-do-ads.png" alt="" />
        <div>
          <h1>Diagnóstico com Inteligência Artificial</h1>
          <p>{titulo} · {empresa}{subtitulo ? ` · ${subtitulo}` : ""}</p>
        </div>
      </div>

      <section
        className="mb-9 rounded-2xl border border-line bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:gap-5"
        data-export-hide="true"
      >
        <div>
          <p className="text-[13px] font-semibold text-dark">Exportar análise</p>
          <p className="mt-1 text-[12px] leading-5 text-muted">
            Salve o diagnóstico para apresentar, enviar ou arquivar.
          </p>
          {erro ? <p className="mt-2 text-[12px] font-medium text-red-600">{erro}</p> : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
          <button
            type="button"
            onClick={() => executar("pdf")}
            disabled={Boolean(exportando)}
            className="rounded-xl bg-[#4285F4] px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-[#3367D6] disabled:opacity-50"
          >
            {exportando === "pdf" ? "Abrindo..." : "PDF"}
          </button>
          <button
            type="button"
            onClick={() => executar("word")}
            disabled={Boolean(exportando)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-[12px] font-semibold text-gray-700 transition hover:bg-white/70 disabled:opacity-50"
          >
            {exportando === "word" ? "Gerando..." : "Word / Google Docs (.doc)"}
          </button>
          <button
            type="button"
            onClick={() => executar("html")}
            disabled={Boolean(exportando)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-[12px] font-semibold text-gray-700 transition hover:bg-white/70 disabled:opacity-50"
          >
            {exportando === "html" ? "Gerando..." : "HTML"}
          </button>
        </div>
      </section>
    </>
  );
}
