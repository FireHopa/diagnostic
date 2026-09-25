import React from "react";
import ExportAnalysis from "./ExportAnalysis.jsx";
import AiBrandLogos from "./AiBrandLogos.jsx";
import PerguntasClientesIA from "./PerguntasClientesIA.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const SectionList = ({ title, items, alert = false }) => {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <section className="border-t border-line pt-7">
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-[14px] leading-6 text-gray-700">
            <span
              className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${alert ? "bg-[#B06000]" : "bg-primary"}`}
              aria-hidden="true"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

const EmpresasTop5 = ({ empresas }) => {
  const list = safeArray(empresas).slice(0, 5);
  if (!list.length) return null;

  return (
    <section>
      <div className="max-w-[800px]">
        <div className="mb-3 flex items-center gap-2">
          <AiBrandLogos className="shrink-0" />
          <p className="text-[13px] font-medium text-primary">Análise concluída</p>
        </div>
        <h2 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.035em] text-dark md:text-[32px]">
          Empresas com maior probabilidade de recomendação
        </h2>
        <p className="mt-4 max-w-[760px] text-[15px] leading-7 text-muted">
          A lista abaixo não é um ranking oficial do ChatGPT. É uma leitura inicial baseada em sinais públicos de autoridade, reputação, clareza e presença local.
        </p>
      </div>

      <div className="mt-9 divide-y divide-line border-y border-line">
        {list.map((empresa, index) => (
          <article key={`${empresa.nome}-${index}`} className="py-8 first:pt-7 last:pb-7">
            <div className="grid gap-5 md:grid-cols-[56px_1fr]">
              <div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-[12px] font-semibold text-gray-500">
                  {String(empresa.posicao || index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="min-w-0">
                <h3 className="text-[21px] font-semibold tracking-[-0.025em] text-dark">{empresa.nome}</h3>
                <p className="mt-3 text-[15px] leading-7 text-gray-700">{empresa.resumoAutoridade}</p>

                {empresa.porQueTemMaisAutoridade ? (
                  <div className="mt-5 rounded-xl bg-surface px-4 py-3.5 text-[14px] leading-6 text-gray-700">
                    <span className="font-medium text-dark">Por que pode aparecer antes: </span>
                    {empresa.porQueTemMaisAutoridade}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#137333]">Sinais fortes</p>
                    <ul className="mt-3 space-y-2.5">
                      {safeArray(empresa.sinaisFortes).map((sinal, sinalIndex) => (
                        <li key={`${sinal}-${sinalIndex}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#34A853]" />
                          <span>{sinal}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#B06000]">Possíveis fraquezas</p>
                    <ul className="mt-3 space-y-2.5">
                      {safeArray(empresa.possiveisFraquezas).map((fraqueza, fraquezaIndex) => (
                        <li key={`${fraqueza}-${fraquezaIndex}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F9AB00]" />
                          <span>{fraqueza}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

const EmpresaResumo = ({ diagnostico }) => {
  const resumo = diagnostico?.diagnosticoDaEmpresa;
  if (!resumo) return null;

  return (
    <section className="mt-12 rounded-2xl border border-line bg-surface p-5 md:p-7">
      <p className="text-[13px] font-medium text-primary">Resumo da sua empresa</p>
      <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-dark">Diagnóstico específico</h3>
      <p className="mt-4 max-w-[900px] text-[15px] leading-7 text-gray-700">{resumo.resumoEmpresa}</p>

      <div className="mt-7 grid gap-6 border-t border-line pt-6 lg:grid-cols-3">
        <div>
          <h4 className="text-[13px] font-semibold text-dark">Pontos fortes</h4>
          <ul className="mt-3 space-y-2.5">
            {safeArray(resumo.pontosFortes).map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#34A853]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[13px] font-semibold text-dark">Pontos de atenção</h4>
          <ul className="mt-3 space-y-2.5">
            {safeArray(resumo.pontosFracos).map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#F9AB00]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-white p-4">
          <h4 className="text-[13px] font-semibold text-dark">Prioridade principal</h4>
          <p className="mt-3 text-[13px] leading-6 text-gray-700">{resumo.prioridadeMaxima}</p>
        </div>
      </div>
    </section>
  );
};

export default function DiagnosticResult({ diagnostico, contexto, onCtaClick, ctaMessage }) {
  if (!diagnostico) return null;

  return (
    <section id="resultado" className="px-4 pb-16 pt-5 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[920px]">
        <ExportAnalysis contexto={contexto} tipo="recomendacao_ia" />

        <EmpresasTop5 empresas={diagnostico.empresasMaisRecomendadas} />

        <EmpresaResumo diagnostico={diagnostico} />

        <PerguntasClientesIA analise={diagnostico.analisePerguntasClientes} />

        <div className="mt-12 grid gap-x-10 gap-y-9 lg:grid-cols-2">
          <SectionList
            title="Por que essas empresas podem ser indicadas"
            items={diagnostico.motivosDasEmpresasIndicadas}
          />
          <SectionList
            title="Por que sua empresa pode não aparecer"
            items={[diagnostico.porQueSuaEmpresaPodeNaoAparecer]}
            alert
          />
          <SectionList
            title="Sinais encontrados sobre a empresa"
            items={diagnostico.sinaisEncontradosDaEmpresa}
          />
          <SectionList
            title="Sinais fracos ou não encontrados"
            items={diagnostico.sinaisNaoEncontradosOuFracos}
            alert
          />
          <SectionList
            title="Problemas urgentes que merecem atenção"
            items={diagnostico.problemasUrgentes}
            alert
          />
          <SectionList
            title="Próximos passos recomendados"
            items={diagnostico.proximosPassos}
          />
        </div>

        <section className="mt-14 border-t border-line pt-9" data-export-hide="true">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-[690px]">
              <p className="text-[13px] font-medium text-primary">Próximo passo</p>
              <h3 className="mt-2 text-[24px] font-semibold leading-8 tracking-[-0.03em] text-dark md:text-[28px]">
                Quer aprender como colocar sua empresa na disputa das recomendações da IA?
              </h3>
              <p className="mt-4 text-[14px] leading-6 text-muted">
                {diagnostico.chamadaFinal} Vou realizar uma aula especial mostrando como empresas locais podem se preparar para aparecer nas respostas da IA do Google e serem recomendadas pelo ChatGPT, Gemini e outras inteligências artificiais.
              </p>
              {ctaMessage ? (
                <div className="mt-5 rounded-xl border border-green-200 bg-[#E6F4EA] p-4 text-[13px] font-medium text-[#137333]">
                  {ctaMessage}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-[14px] font-semibold text-white transition hover:bg-[#1765CC]"
            >
              Receber convite
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}
