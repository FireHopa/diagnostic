import React from "react";
import AiBrandLogos from "./AiBrandLogos.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const gruposConfig = [
  {
    key: "entenderProblema",
    numero: "01",
    titulo: "Tentando entender o problema",
    descricao: "Dúvidas de quem ainda está identificando a necessidade e tentando entender o que fazer."
  },
  {
    key: "procurarSolucao",
    numero: "02",
    titulo: "Procurando uma solução",
    descricao: "Perguntas de quem já entendeu a necessidade e começou a buscar caminhos e fornecedores."
  },
  {
    key: "compararOpcoes",
    numero: "03",
    titulo: "Comparando opções",
    descricao: "Dúvidas usadas para comparar empresas, abordagens, diferenciais e alternativas."
  },
  {
    key: "precoConfiancaReputacao",
    numero: "04",
    titulo: "Preço, confiança e reputação",
    descricao: "Perguntas que ajudam o cliente a reduzir risco antes de avançar para a contratação."
  },
  {
    key: "proximasDeComprar",
    numero: "05",
    titulo: "Próximas de comprar ou contratar",
    descricao: "Consultas com forte sinal de escolha, orçamento, recomendação e decisão."
  }
];

function ListaPerguntas({ perguntas, inicio = 1, destaque = false }) {
  const items = safeArray(perguntas);
  if (!items.length) return null;

  return (
    <ol className="mt-5 divide-y divide-line border-y border-line">
      {items.map((pergunta, index) => (
        <li key={`${pergunta}-${index}`} className="grid gap-3 py-3.5 sm:grid-cols-[34px_1fr] sm:items-start">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-semibold ${
              destaque ? "bg-blue-50 text-primary" : "bg-surface text-gray-500"
            }`}
          >
            {String(inicio + index).padStart(2, "0")}
          </span>
          <p className="pt-0.5 text-[14px] leading-6 text-gray-700">{pergunta}</p>
        </li>
      ))}
    </ol>
  );
}

export default function PerguntasClientesIA({ analise }) {
  const grupos = analise?.grupos || {};
  const totalPerguntas = gruposConfig.reduce((total, grupo) => total + safeArray(grupos[grupo.key]).length, 0);

  if (!analise || totalPerguntas === 0) return null;

  return (
    <section className="mt-14 border-t border-line pt-10">
      <div className="max-w-[820px]">
        <div className="mb-3 flex items-center gap-3">
          <AiBrandLogos className="shrink-0" />
          <p className="text-[13px] font-medium text-primary">Comportamento de busca e decisão</p>
        </div>

        <h2 className="text-[28px] font-semibold leading-[1.25] tracking-[-0.035em] text-dark md:text-[32px]">
          O que seus clientes estão perguntando para as Inteligências Artificiais
        </h2>
        <p className="mt-4 max-w-[780px] text-[15px] leading-7 text-muted">
          Uma leitura das 30 perguntas mais prováveis ao longo da jornada de decisão, do momento em que o cliente percebe o problema até a escolha de quem contratar.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface px-5 py-4 md:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Como interpretar esta análise</p>
        <p className="mt-2 text-[13px] leading-6 text-gray-600">{analise.avisoMetodologico}</p>
      </div>

      <div className="mt-9 space-y-5">
        {gruposConfig.map((grupo, grupoIndex) => {
          const perguntas = safeArray(grupos[grupo.key]);
          if (!perguntas.length) return null;

          return (
            <article key={grupo.key} className="rounded-2xl border border-line bg-white p-5 md:p-6">
              <div className="grid gap-4 sm:grid-cols-[44px_1fr]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-[12px] font-semibold text-gray-500">
                  {grupo.numero}
                </span>
                <div>
                  <h3 className="text-[19px] font-semibold tracking-[-0.025em] text-dark">{grupo.titulo}</h3>
                  <p className="mt-1.5 text-[13px] leading-5 text-gray-500">{grupo.descricao}</p>
                </div>
              </div>
              <ListaPerguntas perguntas={perguntas} inicio={grupoIndex * 6 + 1} />
            </article>
          );
        })}
      </div>

      <section className="mt-10 rounded-2xl border border-[#D2E3FC] bg-[#F8FBFF] p-5 md:p-7">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">Maior intenção comercial</p>
        <h3 className="mt-2 text-[23px] font-semibold tracking-[-0.03em] text-dark">
          10 perguntas com maior intenção de contratação
        </h3>
        <p className="mt-3 max-w-[760px] text-[13px] leading-6 text-gray-600">
          Estas perguntas indicam clientes mais próximos de comparar fornecedores, pedir orçamento ou tomar uma decisão.
        </p>
        <ListaPerguntas perguntas={analise.maiorIntencaoContratacao} inicio={1} destaque />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">Prioridade de conteúdo</p>
          <h3 className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-dark">
            O que sua empresa deveria responder primeiro
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-gray-500">
            Comece por estas perguntas para construir páginas, FAQ, artigos, vídeos e conteúdos de decisão.
          </p>
          <ListaPerguntas perguntas={analise.perguntasPrioritarias} inicio={1} />
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-primary">Oportunidades de autoridade</p>
          <h3 className="mt-2 text-[21px] font-semibold tracking-[-0.025em] text-dark">
            Principais temas de conteúdo
          </h3>
          <p className="mt-3 text-[13px] leading-6 text-gray-500">
            Temas que ajudam a ampliar contexto, especialização e relevância para clientes e Inteligências Artificiais.
          </p>

          <div className="mt-5 space-y-3">
            {safeArray(analise.temasConteudo).map((tema, index) => (
              <div key={`${tema}-${index}`} className="flex gap-3 rounded-xl border border-line bg-white px-4 py-3.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-semibold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="pt-0.5 text-[13px] font-medium leading-5 text-gray-700">{tema}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
