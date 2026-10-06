import React, { useMemo, useState } from "react";

const safeArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

function montarPrioridades(tipo, diagnostico) {
  if (tipo === "reputacao") {
    const plano = safeArray(diagnostico?.planoAcao?.prioridades);
    const gargalos = safeArray(diagnostico?.gargalos);
    return [...plano, ...gargalos].filter((item, index, all) => all.indexOf(item) === index).slice(0, 4);
  }

  const prioridade = diagnostico?.diagnosticoDaEmpresa?.prioridadeMaxima;
  const fracos = safeArray(diagnostico?.sinaisNaoEncontradosOuFracos || diagnostico?.diagnosticoDaEmpresa?.pontosFracos);
  const urgentes = safeArray(diagnostico?.problemasUrgentes);
  return [prioridade, ...fracos, ...urgentes].filter(Boolean).filter((item, index, all) => all.indexOf(item) === index).slice(0, 4);
}

function montarResumo(tipo, diagnostico, contexto) {
  const empresa = contexto?.empresa || diagnostico?.empresa?.nome || "Empresa";
  const linhas = [`Diagnóstico de IA — ${empresa}`];

  if (tipo === "reputacao" && Number.isFinite(diagnostico?.notaGeral)) {
    linhas.push(`Nota geral: ${diagnostico.notaGeral}/100`);
  } else if (tipo === "recomendacao_ia") {
    linhas.push(`Status: ${diagnostico?.status === "aparece" ? "já aparece no radar" : "ainda não virou resposta natural"}`);
  }

  const prioridades = montarPrioridades(tipo, diagnostico);
  if (prioridades.length) {
    linhas.push("", "Prioridades:");
    prioridades.forEach((item, index) => linhas.push(`${index + 1}. ${item}`));
  }

  linhas.push("", "Posicionamento: não seja o primeiro resultado. Seja a resposta.");
  return linhas.join("\n");
}

export default function NextStepJourney({ tipo, diagnostico, contexto, onNewAnalysis }) {
  const [feedback, setFeedback] = useState("");
  const priorities = useMemo(() => montarPrioridades(tipo, diagnostico), [tipo, diagnostico]);
  const resumo = useMemo(() => montarResumo(tipo, diagnostico, contexto), [tipo, diagnostico, contexto]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(resumo);
      setFeedback("Resumo copiado. Agora ele pode seguir direto para atendimento ou planejamento.");
    } catch {
      setFeedback("Não foi possível copiar automaticamente. Selecione o resumo e copie manualmente.");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Diagnóstico — ${contexto?.empresa || "Empresa"}`, text: resumo });
        setFeedback("Diagnóstico compartilhado.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }
    await copy();
  };

  return (
    <section id="proximo-passo" className="next-step-journey px-4 pb-24 pt-4 md:px-6 md:pb-32" data-export-hide="true">
      <div className="mx-auto max-w-[920px]">
        <div className="next-step-shell">
          <div className="next-step-orbit" aria-hidden="true" />
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">PRÓXIMA FASE</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
            <div>
              <h3 className="max-w-[620px] text-[34px] font-bold leading-[.98] tracking-[-.055em] text-dark md:text-[48px]">
                O diagnóstico acabou.<br /><span className="text-primary">Agora começa a ocupação.</span>
              </h3>
              <p className="mt-5 max-w-[610px] text-[14px] leading-6 text-gray-600">
                Em vez de encerrar em um botão genérico, esta etapa transforma a leitura em um briefing objetivo para o próximo movimento.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                <button type="button" onClick={copy} className="journey-primary-button">Copiar briefing <span>↗</span></button>
                <button type="button" onClick={share} className="journey-secondary-button">Compartilhar diagnóstico</button>
                <button type="button" onClick={onNewAnalysis} className="journey-ghost-button">Nova análise</button>
              </div>
              {feedback ? <p className="mt-4 text-[11px] font-medium text-[#137333]">{feedback}</p> : null}
            </div>

            <div className="next-step-priorities">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">PRIORIDADES EXTRAÍDAS</p>
                <span className="next-step-easter">prosperidade algorítmica: em construção</span>
              </div>
              <div className="mt-4 divide-y divide-line border-y border-line">
                {(priorities.length ? priorities : ["Consolidar os sinais encontrados antes de ampliar a distribuição."]).map((item, index) => (
                  <div key={`${item}-${index}`} className="next-step-priority-row">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
