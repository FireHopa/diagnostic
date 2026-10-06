import React, { useEffect, useMemo, useState } from "react";

const transitionWords = ["TRÁFEGO", "CLIQUES", "IMPRESSÕES", "POSIÇÃO", "SEO"];

function buildVerdict(tipo, diagnostico, contexto) {
  const empresa = contexto?.empresa || diagnostico?.empresa?.nome || "Sua empresa";
  if (tipo === "reputacao") {
    const nota = diagnostico?.notaGeral;
    if (!Number.isFinite(nota)) return { empresa, title: "Ainda faltam sinais para uma leitura forte.", subtitle: "O diagnóstico encontrou presença, mas não evidência pública suficiente para transformar isso em uma nota defensável." };
    if (nota >= 86) return { empresa, title: "Sua empresa já transmite sinais fortes de confiança.", subtitle: "Agora o desafio é transformar autoridade em preferência recorrente." };
    if (nota >= 71) return { empresa, title: "Sua empresa é visível. E já começa a parecer confiável.", subtitle: "Existem bons sinais; ainda há espaço para tornar a escolha mais óbvia." };
    if (nota >= 51) return { empresa, title: "Sua empresa é visível. Mas ainda não é inevitável.", subtitle: "A internet encontra a marca; a autoridade ainda pode ser consolidada." };
    return { empresa, title: "A internet sabe que você existe. Ainda falta motivo para escolher você.", subtitle: "Os sinais digitais encontrados ainda não sustentam uma percepção forte de autoridade." };
  }

  if (diagnostico?.status === "aparece") {
    return { empresa, title: "Sua empresa já entrou no radar. Agora precisa virar referência.", subtitle: "O próximo nível é ocupar mais contexto até a recomendação parecer natural." };
  }
  return { empresa, title: "Sua empresa existe. Mas ainda não virou a resposta.", subtitle: "Hoje existem concorrentes com sinais mais fáceis de entender, confiar e recomendar." };
}

function previewItems(tipo, diagnostico) {
  if (tipo === "reputacao") {
    const d = diagnostico?.dimensoes || {};
    return [
      ["PRESENÇA", d.presencaDigital?.nota],
      ["AUTORIDADE", d.autoridadePercebida?.nota],
      ["REPUTAÇÃO", d.reputacao?.nota],
      ["CONTEXTO", d.potencialIA?.nota]
    ].map(([label, value]) => ({ label, value: Number.isFinite(value) ? `${value}/100` : "N/D" }));
  }

  const strong = Array.isArray(diagnostico?.sinaisEncontradosDaEmpresa) ? diagnostico.sinaisEncontradosDaEmpresa.length : 0;
  const weak = Array.isArray(diagnostico?.sinaisNaoEncontradosOuFracos) ? diagnostico.sinaisNaoEncontradosOuFracos.length : 0;
  return [
    { label: "PRESENÇA", value: diagnostico?.status === "aparece" ? "DETECTADA" : "EM DISPUTA" },
    { label: "AUTORIDADE", value: strong ? `${strong} SINAIS` : "EM LEITURA" },
    { label: "REPUTAÇÃO", value: "CRUZADA" },
    { label: "CONTEXTO", value: weak ? `${weak} LACUNAS` : "CONSOLIDADO" }
  ];
}

export default function ResultReveal({ tipo, diagnostico, contexto, onComplete }) {
  const [stage, setStage] = useState(0);
  const verdict = useMemo(() => buildVerdict(tipo, diagnostico, contexto), [tipo, diagnostico, contexto]);
  const preview = useMemo(() => previewItems(tipo, diagnostico), [tipo, diagnostico]);

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const times = reduced ? [80, 150, 230, 520] : [700, 1450, 2200, 3950];
    const timers = [
      window.setTimeout(() => setStage(1), times[0]),
      window.setTimeout(() => setStage(2), times[1]),
      window.setTimeout(() => setStage(3), times[2]),
      window.setTimeout(() => onComplete?.(), times[3])
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [onComplete]);

  return (
    <section className="result-reveal px-4 py-12 md:px-6 md:py-20" aria-live="polite">
      <div className="mx-auto flex min-h-[540px] max-w-[920px] flex-col items-center justify-center text-center">
        <p className="result-reveal-kicker">DIAGNÓSTICO CONCLUÍDO</p>

        <div className={`pre-verdict-preview reveal-analysis-object ${stage >= 1 ? "is-hidden" : ""}`} style={{ viewTransitionName: "analysis-object" }} aria-hidden="true">
          <p>LEITURA CONSOLIDADA</p>
          <div className="pre-verdict-grid">
            {preview.map((item) => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong><i /></div>)}
          </div>
          <small>Os dados já estão prontos. O veredito ainda não.</small>
        </div>

        <div className={`result-word-collapse ${stage >= 2 ? "is-collapsed" : ""} ${stage >= 1 ? "is-visible" : ""}`} aria-hidden="true">
          {transitionWords.map((word, index) => <span key={word} style={{ "--i": index }}>{word}</span>)}
        </div>

        <div className={`result-recommendation-word ${stage >= 2 ? "is-visible" : ""}`} aria-hidden="true">RECOMENDAÇÃO</div>

        <div className={`result-verdict ${stage >= 3 ? "is-visible" : ""}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400">{verdict.empresa}</p>
          <h2 className="mx-auto mt-4 max-w-[850px] text-[36px] font-bold leading-[0.98] tracking-[-0.055em] text-dark md:text-[56px]">{verdict.title}</h2>
          <p className="mx-auto mt-5 max-w-[650px] text-[14px] leading-6 text-muted md:text-[16px]">{verdict.subtitle}</p>
          <div className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary"><span className="result-reveal-line" /> abrindo diagnóstico</div>
        </div>
      </div>
    </section>
  );
}
