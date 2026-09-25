import React from "react";
import ExportAnalysis from "./ExportAnalysis.jsx";
import AiBrandLogos from "./AiBrandLogos.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const dimensaoLabels = {
  presencaDigital: "Presença Digital",
  confiancaPercebida: "Confiança Percebida",
  provaSocial: "Prova Social",
  reputacao: "Reputação",
  consistenciaDigital: "Consistência",
  autoridadePercebida: "Autoridade",
  potencialIA: "Potencial de Recomendação por IA"
};

function formatarNota(nota) {
  return Number.isFinite(nota) ? `${nota}` : "N/D";
}

function scoreClasses(nota) {
  if (!Number.isFinite(nota)) return "bg-gray-100 text-gray-600";
  if (nota >= 71) return "bg-[#E6F4EA] text-[#137333]";
  if (nota >= 51) return "bg-blue-50 text-primary";
  if (nota >= 31) return "bg-[#FEF7E0] text-[#B06000]";
  return "bg-[#FCE8E6] text-[#B3261E]";
}

function ScoreBar({ nota }) {
  const valor = Number.isFinite(nota) ? Math.max(0, Math.min(100, nota)) : 0;

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${valor}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

function SimpleList({ title, items, alert = false }) {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <div>
      <h4 className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${alert ? "text-[#B06000]" : "text-gray-500"}`}>
        {title}
      </h4>
      <ul className="mt-3 space-y-2.5">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
            <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${alert ? "bg-[#F9AB00]" : "bg-primary"}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DimensionCard({ dimensionKey, data }) {
  if (!data) return null;

  return (
    <details className="group border-b border-line py-5 first:border-t">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[15px] font-semibold text-dark">{dimensaoLabels[dimensionKey] || dimensionKey}</p>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${scoreClasses(data.nota)}`}>
                  {Number.isFinite(data.nota) ? data.nota : "N/D"}
                </span>
                <span className="text-[15px] text-gray-400 transition group-open:rotate-180" aria-hidden="true">⌄</span>
              </div>
            </div>
            <p className="mt-1.5 max-w-[720px] text-[13px] leading-5 text-muted">
              {data.classificacao || "Avaliação baseada nas evidências encontradas"}
            </p>
            <div className="mt-3"><ScoreBar nota={data.nota} /></div>
          </div>
        </div>
      </summary>

      <div className="mt-5 rounded-xl bg-surface p-4 md:p-5">
        <p className="text-[14px] leading-6 text-gray-700">{data.analise}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SimpleList title="Pontos positivos" items={data.pontosPositivos} />
          <SimpleList title="Gargalos" items={data.gargalos} alert />
          <SimpleList title="Melhorias práticas" items={data.melhorias} />
        </div>

        {safeArray(data.evidencias).length ? (
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-500">Evidências</p>
            <ul className="mt-3 space-y-3">
              {safeArray(data.evidencias).map((evidencia, index) => (
                <li key={`${evidencia.descricao || evidencia}-${index}`} className="text-[13px] leading-5 text-gray-600">
                  {typeof evidencia === "string" ? evidencia : evidencia.descricao}
                  {typeof evidencia === "object" && evidencia.fonteUrl ? (
                    <a
                      href={evidencia.fonteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 font-medium text-primary underline decoration-blue-200 underline-offset-2"
                    >
                      Ver fonte
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </details>
  );
}

function SectionCard({ title, items, alert = false }) {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <section className="border-t border-line pt-7">
      <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-dark">{title}</h3>
      <ul className="mt-4 space-y-3">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-[14px] leading-6 text-gray-700">
            <span className={`mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full ${alert ? "bg-[#F9AB00]" : "bg-primary"}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionList({ title, items }) {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <div>
      <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">{title}</h5>
      <ul className="mt-3 space-y-2.5">
        {list.map((item, index) => (
          <li key={`${title}-${item}-${index}`} className="flex gap-2.5 text-[13px] leading-5 text-gray-600">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanoAcao({ planoAcao }) {
  if (!planoAcao) return null;

  const canais = [
    ["site", "Site"],
    ["perfilEmpresaGoogle", "Perfil da Empresa no Google"],
    ["redesSociais", "Redes Sociais"]
  ];

  return (
    <section className="border-t border-line pt-9">
      <p className="text-[13px] font-medium text-primary">Próximos passos recomendados</p>
      <h3 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-dark">Plano de Ação de Autoridade de Reputação</h3>
      <p className="mt-4 max-w-[780px] text-[14px] leading-6 text-muted">
        Ações organizadas por prioridade e frente de atuação, sem depender de prazo. O foco é fortalecer prova social, reputação e autoridade com base nos gargalos encontrados nesta análise.
      </p>

      {safeArray(planoAcao.prioridades).length ? (
        <div className="mt-7 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h4 className="text-[16px] font-semibold text-dark">5 prioridades principais</h4>
          <p className="mt-1.5 text-[13px] leading-5 text-muted">Comece por estes pontos antes de avançar para as demais ações.</p>
          <ol className="mt-5 divide-y divide-line border-y border-line">
            {safeArray(planoAcao.prioridades).map((item, index) => (
              <li key={`${item}-${index}`} className="grid gap-3 py-3.5 sm:grid-cols-[40px_1fr] sm:items-start">
                <span className="text-[12px] font-semibold text-gray-400">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[13px] leading-5 text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {canais.map(([key, label]) => {
          const canal = planoAcao[key] || {};
          return (
            <div key={key} className="rounded-2xl border border-line bg-white p-5">
              <h4 className="text-[16px] font-semibold text-dark">{label}</h4>
              <div className="mt-5 space-y-6 border-t border-line pt-5">
                <ActionList title="Prova Social" items={canal.provaSocial} />
                <ActionList title="Reputação" items={canal.reputacao} />
                <ActionList title="Autoridade" items={canal.autoridade} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Sources({ fontes }) {
  const list = safeArray(fontes);
  if (!list.length) return null;

  return (
    <section className="border-t border-line pt-9">
      <p className="text-[13px] font-medium text-primary">Referências</p>
      <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-dark">Fontes analisadas</h3>
      <p className="mt-3 max-w-[720px] text-[13px] leading-5 text-muted">
        Principais fontes efetivamente retornadas pela pesquisa utilizada na análise.
      </p>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {list.map((fonte, index) => (
          <a
            key={`${fonte.url}-${index}`}
            href={fonte.url}
            target="_blank"
            rel="noreferrer"
            className="group grid gap-2 py-4 transition hover:bg-surface sm:grid-cols-[42px_1fr_auto] sm:items-center sm:px-2"
          >
            <span className="text-[12px] font-semibold text-gray-400">[{index + 1}]</span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium text-dark">{fonte.titulo || fonte.url}</span>
              <span className="mt-1 block truncate text-[12px] text-gray-400">{fonte.url}</span>
            </span>
            <span className="text-[12px] font-medium text-primary opacity-0 transition group-hover:opacity-100">Abrir ↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function ReputationResult({ diagnostico, contexto, onCtaClick, ctaMessage }) {
  if (!diagnostico) return null;

  const dadosInsuficientes = diagnostico.status === "dados_insuficientes" || !Number.isFinite(diagnostico.notaGeral);
  const dimensoes = diagnostico.dimensoes || {};
  const empresa = diagnostico.empresa || {};
  const falando = diagnostico.oQueEstaoFalando || {};

  return (
    <section id="resultado" className="px-4 pb-16 pt-5 md:px-6 md:pb-24">
      <div className="mx-auto max-w-[920px] space-y-12">
        <ExportAnalysis contexto={contexto} tipo="reputacao" />

        <section>
          <div className="mb-3 flex items-center gap-2">
            <AiBrandLogos className="shrink-0" />
            <p className="text-[13px] font-medium text-primary">Análise de reputação concluída</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_220px] lg:items-start">
            <div>
              <h2 className="text-[30px] font-semibold leading-[1.2] tracking-[-0.04em] text-dark md:text-[34px]">
                {empresa.nome || "Empresa analisada"}
              </h2>
              <p className="mt-2 text-[13px] font-medium text-gray-400">
                {empresa.cidade || "Cidade não informada"}
                {diagnostico.dataAnalise ? ` · ${new Date(diagnostico.dataAnalise).toLocaleDateString("pt-BR")}` : ""}
              </p>
              <p className="mt-5 max-w-[720px] text-[15px] leading-7 text-gray-700">{diagnostico.resumoExecutivo}</p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Nota geral</p>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-[42px] font-semibold leading-none tracking-[-0.05em] text-dark">{formatarNota(diagnostico.notaGeral)}</span>
                {Number.isFinite(diagnostico.notaGeral) ? <span className="pb-1 text-[13px] text-gray-400">/ 100</span> : null}
              </div>
              <div className="mt-4"><ScoreBar nota={diagnostico.notaGeral} /></div>
              <p className="mt-4 text-[13px] font-medium leading-5 text-gray-700">{diagnostico.classificacaoGeral}</p>
              <p className="mt-3 text-[11px] leading-4 text-gray-400">
                Confiança da análise: {diagnostico.nivelConfianca || "não informada"}
              </p>
            </div>
          </div>

          {dadosInsuficientes ? (
            <div className="mt-6 rounded-xl border border-[#F3D7A3] bg-[#FEF7E0] p-4 text-[13px] font-medium leading-5 text-[#8A4D00]">
              Não foram encontradas evidências públicas suficientes para atribuir uma nota confiável. A ausência de informação não foi tratada como reputação negativa.
            </div>
          ) : null}

          {safeArray(diagnostico.avisos).map((aviso, index) => (
            <div key={`${aviso}-${index}`} className="mt-3 rounded-xl border border-line bg-surface p-4 text-[13px] leading-5 text-gray-600">
              {aviso}
            </div>
          ))}
        </section>

        <section>
          <p className="text-[13px] font-medium text-primary">7 dimensões</p>
          <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-dark">Pontuação por dimensão</h3>
          <p className="mt-3 text-[13px] leading-5 text-muted">Abra cada dimensão para ver análise, gargalos, melhorias e evidências.</p>
          <div className="mt-6">
            {Object.keys(dimensaoLabels).map((key) => (
              <DimensionCard key={key} dimensionKey={key} data={dimensoes[key]} />
            ))}
          </div>
        </section>

        <section className="border-t border-line pt-9">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[13px] font-medium text-primary">Percepção pública</p>
              <h3 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-dark">O que estão falando da empresa</h3>
            </div>
            <span className="rounded-full bg-surface px-3 py-1.5 text-[12px] font-medium text-gray-600">
              {falando.classificacao || "Dados insuficientes"}
            </span>
          </div>
          <p className="mt-5 text-[14px] leading-6 text-gray-700">{falando.percepcaoGeral}</p>
          <div className="mt-7 grid gap-7 lg:grid-cols-3">
            <SimpleList title="Principais elogios" items={falando.elogios} />
            <SimpleList title="Principais críticas" items={falando.criticas} alert />
            <SimpleList title="Temas recorrentes" items={falando.temasRecorrentes} />
          </div>
        </section>

        <section className="rounded-2xl border border-blue-100 bg-[#F6F9FE] p-5 md:p-6">
          <p className="text-[13px] font-medium text-primary">Por que essa nota?</p>
          <p className="mt-3 text-[15px] leading-7 text-gray-700">{diagnostico.explicacaoNota}</p>
        </section>

        <div className="grid gap-x-10 gap-y-9 lg:grid-cols-2">
          <SectionCard title="Principais pontos positivos" items={diagnostico.pontosPositivos} />
          <SectionCard title="Principais gargalos" items={diagnostico.gargalos} alert />
        </div>

        <PlanoAcao planoAcao={diagnostico.planoAcao} />

        <Sources fontes={diagnostico.fontes} />

        <section className="border-t border-line pt-9" data-export-hide="true">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-[690px]">
              <p className="text-[13px] font-medium text-primary">Próximo passo</p>
              <h3 className="mt-2 text-[24px] font-semibold leading-8 tracking-[-0.03em] text-dark md:text-[28px]">
                Quer fortalecer esses sinais para o Google e para as Inteligências Artificiais?
              </h3>
              <p className="mt-4 text-[14px] leading-6 text-muted">
                Nossa equipe pode mostrar os próximos passos para melhorar presença, prova social, reputação e contexto digital da sua empresa.
              </p>
              {ctaMessage ? (
                <div className="mt-5 rounded-xl border border-green-200 bg-[#E6F4EA] p-4 text-[13px] font-medium text-[#137333]">{ctaMessage}</div>
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
