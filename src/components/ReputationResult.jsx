import React from "react";

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
  return Number.isFinite(nota) ? `${nota} / 100` : "Sem nota confiável";
}

function scoreClasses(nota) {
  if (!Number.isFinite(nota)) return "bg-gray-100 text-gray-700";
  if (nota >= 71) return "bg-green-100 text-green-700";
  if (nota >= 51) return "bg-blue-100 text-blue-700";
  if (nota >= 31) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function ScoreBar({ nota }) {
  const valor = Number.isFinite(nota) ? Math.max(0, Math.min(100, nota)) : 0;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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
      <h4 className={`text-sm font-black uppercase tracking-wide ${alert ? "text-orange-700" : "text-dark"}`}>
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-gray-700">
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${alert ? "bg-orange-500" : "bg-primary"}`} />
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
    <details className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-card md:p-6">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-dark">{dimensaoLabels[dimensionKey] || dimensionKey}</p>
            <p className="mt-1 text-sm leading-6 text-gray-500">{data.classificacao || "Avaliação baseada nas evidências encontradas"}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${scoreClasses(data.nota)}`}>
            {Number.isFinite(data.nota) ? data.nota : "N/D"}
          </span>
        </div>
        <div className="mt-4">
          <ScoreBar nota={data.nota} />
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-primary group-open:hidden">
          Ver análise completa
        </p>
      </summary>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <p className="leading-7 text-gray-700">{data.analise}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <SimpleList title="Pontos positivos" items={data.pontosPositivos} />
          <SimpleList title="Gargalos" items={data.gargalos} alert />
          <SimpleList title="Melhorias práticas" items={data.melhorias} />
        </div>

        {safeArray(data.evidencias).length ? (
          <div className="mt-6 rounded-2xl bg-soft p-4">
            <p className="text-xs font-black uppercase tracking-wide text-gray-500">Evidências</p>
            <ul className="mt-3 space-y-3">
              {safeArray(data.evidencias).map((evidencia, index) => (
                <li key={`${evidencia.descricao || evidencia}-${index}`} className="text-sm leading-6 text-gray-700">
                  {typeof evidencia === "string" ? evidencia : evidencia.descricao}
                  {typeof evidencia === "object" && evidencia.fonteUrl ? (
                    <a
                      href={evidencia.fonteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 font-bold text-primary underline decoration-blue-200 underline-offset-2"
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
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
      <h3 className="text-xl font-black text-dark">{title}</h3>
      <ul className="mt-5 space-y-3">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-gray-700">
            <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${alert ? "bg-orange-500" : "bg-primary"}`} />
            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActionList({ title, items }) {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <div>
      <h5 className="text-sm font-black uppercase tracking-[0.14em] text-blue-200">{title}</h5>
      <ul className="mt-3 space-y-3">
        {list.map((item, index) => (
          <li key={`${title}-${item}-${index}`} className="flex gap-3 text-sm leading-6 text-gray-200">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-300" />
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
    <div className="rounded-3xl bg-dark p-6 text-white shadow-glow md:p-8">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-blue-200">Próximos passos recomendados</p>
      <h3 className="mt-3 text-3xl font-black">Plano de Ação de Autoridade de Reputação</h3>
      <p className="mt-4 max-w-4xl leading-7 text-gray-300">
        Ações organizadas por prioridade e frente de atuação, sem depender de prazo. O foco é fortalecer prova social, reputação e autoridade com base nos gargalos encontrados nesta análise.
      </p>

      {safeArray(planoAcao.prioridades).length ? (
        <div className="mt-8 rounded-3xl border border-blue-300/20 bg-blue-500/10 p-5 md:p-6">
          <h4 className="text-xl font-black">5 prioridades principais</h4>
          <p className="mt-2 text-sm leading-6 text-gray-300">Comece por estes pontos antes de avançar para as demais ações.</p>
          <ol className="mt-5 grid gap-3 md:grid-cols-2">
            {safeArray(planoAcao.prioridades).map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-gray-100">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-300 text-xs font-black text-dark">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {canais.map(([key, label]) => {
          const canal = planoAcao[key] || {};
          return (
            <div key={key} className="rounded-3xl border border-white/10 bg-white/10 p-5 md:p-6">
              <h4 className="text-xl font-black">{label}</h4>
              <div className="mt-6 space-y-6">
                <ActionList title="Prova Social" items={canal.provaSocial} />
                <ActionList title="Reputação" items={canal.reputacao} />
                <ActionList title="Autoridade" items={canal.autoridade} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Sources({ fontes }) {
  const list = safeArray(fontes);
  if (!list.length) return null;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card md:p-8">
      <h3 className="text-2xl font-black text-dark">Fontes analisadas</h3>
      <p className="mt-3 text-sm leading-6 text-gray-600">
        Abaixo estão as principais fontes efetivamente retornadas pela pesquisa utilizada na análise.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {list.map((fonte, index) => (
          <a
            key={`${fonte.url}-${index}`}
            href={fonte.url}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 rounded-2xl border border-gray-100 bg-soft p-4 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <p className="truncate text-sm font-black text-dark">{fonte.titulo || fonte.url}</p>
            <p className="mt-2 break-all text-xs leading-5 text-gray-500">{fonte.url}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ReputationResult({ diagnostico, onCtaClick, ctaMessage }) {
  if (!diagnostico) return null;

  const dadosInsuficientes = diagnostico.status === "dados_insuficientes" || !Number.isFinite(diagnostico.notaGeral);
  const dimensoes = diagnostico.dimensoes || {};
  const empresa = diagnostico.empresa || {};
  const falando = diagnostico.oQueEstaoFalando || {};

  return (
    <section id="resultado" className="px-6 pb-16 md:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-white p-6 shadow-card md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">Análise de reputação digital</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-dark md:text-5xl">{empresa.nome || "Empresa analisada"}</h2>
              <p className="mt-3 text-base font-semibold text-gray-500">
                {empresa.cidade || "Cidade não informada"}
                {diagnostico.dataAnalise ? ` • ${new Date(diagnostico.dataAnalise).toLocaleDateString("pt-BR")}` : ""}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-700">{diagnostico.resumoExecutivo}</p>
            </div>

            <div className="w-full shrink-0 rounded-3xl bg-soft p-6 lg:max-w-xs">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gray-500">Nota geral</p>
              <p className="mt-3 text-4xl font-black text-dark md:text-5xl">{formatarNota(diagnostico.notaGeral)}</p>
              <div className="mt-4"><ScoreBar nota={diagnostico.notaGeral} /></div>
              <p className="mt-4 text-sm font-bold leading-6 text-gray-700">{diagnostico.classificacaoGeral}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Confiança da análise: {diagnostico.nivelConfianca || "não informada"}
              </p>
            </div>
          </div>

          {dadosInsuficientes ? (
            <div className="mt-7 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm font-semibold leading-6 text-orange-900">
              Não foram encontradas evidências públicas suficientes para atribuir uma nota confiável. A ausência de informação não foi tratada como reputação negativa.
            </div>
          ) : null}

          {safeArray(diagnostico.avisos).map((aviso, index) => (
            <div key={`${aviso}-${index}`} className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
              {aviso}
            </div>
          ))}
        </div>

        <div>
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">7 dimensões</p>
            <h3 className="mt-2 text-3xl font-black text-dark">Pontuação por dimensão</h3>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Object.keys(dimensaoLabels).map((key) => (
              <DimensionCard key={key} dimensionKey={key} data={dimensoes[key]} />
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">O que estão falando da empresa</p>
              <h3 className="mt-2 text-3xl font-black text-dark">Percepção pública encontrada</h3>
            </div>
            <span className="rounded-full bg-soft px-4 py-2 text-sm font-black text-dark">
              {falando.classificacao || "Dados insuficientes"}
            </span>
          </div>
          <p className="mt-5 leading-7 text-gray-700">{falando.percepcaoGeral}</p>
          <div className="mt-7 grid gap-6 lg:grid-cols-3">
            <SimpleList title="Principais elogios" items={falando.elogios} />
            <SimpleList title="Principais críticas" items={falando.criticas} alert />
            <SimpleList title="Temas recorrentes" items={falando.temasRecorrentes} />
          </div>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-primary">Por que essa nota?</p>
          <p className="mt-4 text-lg leading-8 text-gray-800">{diagnostico.explicacaoNota}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Principais pontos positivos" items={diagnostico.pontosPositivos} />
          <SectionCard title="Principais gargalos" items={diagnostico.gargalos} alert />
        </div>

        <PlanoAcao planoAcao={diagnostico.planoAcao} />

        <Sources fontes={diagnostico.fontes} />

        <div className="rounded-3xl bg-white p-6 shadow-card md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="text-lg font-bold text-primary">Agora você já sabe quais sinais estão fortalecendo ou limitando sua autoridade digital.</p>
              <h3 className="mt-4 text-3xl font-black leading-tight text-dark md:text-4xl">
                Quer aprender como fortalecer esses sinais para o Google e para as Inteligências Artificiais?
              </h3>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Nossa equipe pode mostrar os próximos passos para melhorar presença, prova social, reputação e contexto digital da sua empresa.
              </p>
              {ctaMessage ? (
                <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">{ctaMessage}</div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onCtaClick}
              className="rounded-2xl bg-primary px-6 py-5 text-lg font-black text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Quero receber o convite
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
