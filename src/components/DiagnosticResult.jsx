import React from "react";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const StatusBadge = ({ status }) => {
  const isPositive = status === "aparece";

  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-sm font-black ${
        isPositive ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {isPositive ? "Sua empresa tem sinais competitivos" : "Concorrentes podem estar mais fortes"}
    </span>
  );
};

const SectionList = ({ title, items, marker = "✓", alert = false }) => {
  const list = safeArray(items);
  if (!list.length) return null;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-card">
      <h3 className="text-xl font-black text-dark">{title}</h3>
      <ul className="mt-5 space-y-3">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-3 text-gray-700">
            <span
              className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
                alert ? "bg-orange-500" : "bg-primary"
              }`}
            >
              {marker}
            </span>
            <span className="leading-7">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const EmpresasTop5 = ({ empresas }) => {
  const list = safeArray(empresas).slice(0, 5);
  if (!list.length) return null;

  return (
    <div className="mt-8 rounded-3xl bg-white p-6 shadow-card md:p-8">
      <div className="max-w-4xl">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Quem a IA pode recomendar primeiro
        </p>
        <h3 className="mt-3 text-3xl font-black leading-tight text-dark md:text-4xl">
          As 5 empresas com maior probabilidade de recomendação
        </h3>
        <p className="mt-4 text-base leading-7 text-gray-600">
          A lista abaixo não é um ranking oficial do ChatGPT. É uma leitura inicial baseada em sinais públicos de autoridade, reputação, clareza e presença local.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        {list.map((empresa, index) => (
          <article key={`${empresa.nome}-${index}`} className="rounded-3xl border border-gray-100 bg-gray-50 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-dark px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                  #{empresa.posicao || index + 1}
                </div>
                <h4 className="mt-3 text-2xl font-black text-dark">{empresa.nome}</h4>
                <p className="mt-3 leading-7 text-gray-700">{empresa.resumoAutoridade}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-sm font-bold leading-6 text-gray-700 md:max-w-md">
                {empresa.porQueTemMaisAutoridade}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-green-700">Sinais fortes</p>
                <ul className="mt-3 space-y-2">
                  {safeArray(empresa.sinaisFortes).map((sinal, sinalIndex) => (
                    <li key={`${sinal}-${sinalIndex}`} className="flex gap-2 text-sm leading-6 text-gray-700">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                      {sinal}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-wide text-orange-700">Possíveis fraquezas</p>
                <ul className="mt-3 space-y-2">
                  {safeArray(empresa.possiveisFraquezas).map((fraqueza, fraquezaIndex) => (
                    <li key={`${fraqueza}-${fraquezaIndex}`} className="flex gap-2 text-sm leading-6 text-gray-700">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                      {fraqueza}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const EmpresaResumo = ({ diagnostico }) => {
  const resumo = diagnostico?.diagnosticoDaEmpresa;
  if (!resumo) return null;

  return (
    <div className="mt-8 rounded-3xl bg-dark p-6 text-white shadow-glow md:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-200">
        Depois dos 4Q's
      </p>
      <h3 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
        Resumo específico da sua empresa
      </h3>
      <p className="mt-5 max-w-5xl text-lg leading-8 text-gray-200">
        {resumo.resumoEmpresa}
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
          <h4 className="text-lg font-black text-white">Pontos fortes</h4>
          <ul className="mt-4 space-y-3">
            {safeArray(resumo.pontosFortes).map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-gray-200">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
          <h4 className="text-lg font-black text-white">Pontos fracos</h4>
          <ul className="mt-4 space-y-3">
            {safeArray(resumo.pontosFracos).map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-gray-200">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-5 text-dark">
          <h4 className="text-lg font-black">Prioridade máxima</h4>
          <p className="mt-4 text-sm font-semibold leading-7 text-gray-700">
            {resumo.prioridadeMaxima}
          </p>
        </div>
      </div>
    </div>
  );
};

export default function DiagnosticResult({ diagnostico, onCtaClick, ctaMessage }) {
  if (!diagnostico) return null;

  return (
    <section id="resultado" className="px-6 pb-16 md:px-8 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <EmpresasTop5 empresas={diagnostico.empresasMaisRecomendadas} />

        <EmpresaResumo diagnostico={diagnostico} />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <SectionList
            title="Por que essas empresas podem ser indicadas"
            items={diagnostico.motivosDasEmpresasIndicadas}
          />

          <SectionList
            title="Por que sua empresa pode não aparecer"
            items={[diagnostico.porQueSuaEmpresaPodeNaoAparecer]}
            marker="!"
            alert
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionList
            title="Sinais encontrados sobre a empresa"
            items={diagnostico.sinaisEncontradosDaEmpresa}
          />

          <SectionList
            title="Sinais fracos ou não encontrados"
            items={diagnostico.sinaisNaoEncontradosOuFracos}
            marker="!"
            alert
          />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <SectionList
            title="Problemas urgentes que merecem atenção"
            items={diagnostico.problemasUrgentes}
            marker="!"
            alert
          />

          <SectionList
            title="Próximos passos recomendados"
            items={diagnostico.proximosPassos}
          />
        </div>


        <div className="mt-8 rounded-3xl bg-white p-6 shadow-card md:p-10">
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="text-lg font-bold text-primary">{diagnostico.chamadaFinal}</p>
              <h3 className="mt-4 text-3xl font-black leading-tight text-dark md:text-4xl">
                Quer aprender como colocar sua empresa na disputa das recomendações da IA?
              </h3>
              <p className="mt-5 text-lg leading-8 text-gray-600">
                Vou realizar uma aula especial mostrando como empresas locais podem se preparar para aparecer nas respostas da IA do Google e serem recomendadas pelo ChatGPT, Gemini e outras inteligências artificiais.
              </p>
              {ctaMessage ? (
                <div className="mt-5 rounded-2xl bg-green-50 p-4 text-sm font-bold text-green-700">
                  {ctaMessage}
                </div>
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
