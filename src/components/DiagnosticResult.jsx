import React from "react";
import ExportAnalysis from "./ExportAnalysis.jsx";
import AiBrandLogos from "./AiBrandLogos.jsx";
import PerguntasClientesIA from "./PerguntasClientesIA.jsx";
import ProgressiveDisclosure from "./ProgressiveDisclosure.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

function BulletList({ items, alert = false }) {
  const list = safeArray(items);
  if (!list.length) return <p className="text-[12px] text-gray-400">Nenhum item relevante foi retornado nesta camada.</p>;
  return (
    <ul className="space-y-2.5">
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-2.5 text-[12px] leading-5 text-gray-600">
          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${alert ? "bg-[#F9AB00]" : "bg-primary"}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CompactSources({ fontes }) {
  const list = safeArray(fontes);
  if (!list.length) return null;
  return (
    <ProgressiveDisclosure eyebrow="FONTES" title={`${list.length} fontes consultadas`} description="Abra somente se quiser auditar a origem dos sinais usados na leitura.">
      <div className="sources-list full-sources-list">
        {list.map((fonte, index) => (
          <a key={`${fonte.url}-${index}`} href={fonte.url} target="_blank" rel="noreferrer">
            {fonte.titulo || fonte.url}
          </a>
        ))}
      </div>
    </ProgressiveDisclosure>
  );
}

function TopCompanies({ empresas }) {
  const list = safeArray(empresas).slice(0, 5);
  if (!list.length) return null;
  return (
    <div className="full-territory-list">
      {list.map((empresa, index) => (
        <article key={`${empresa.nome}-${index}`} className="full-territory-card">
          <div className="full-territory-head">
            <span>{String(empresa.posicao || index + 1).padStart(2, "0")}</span>
            <div className="min-w-0">
              <h4>{empresa.nome}</h4>
              <p>{empresa.resumoAutoridade}</p>
            </div>
          </div>
          {empresa.porQueTemMaisAutoridade ? <div className="full-territory-reason"><strong>Por que pode aparecer antes:</strong> {empresa.porQueTemMaisAutoridade}</div> : null}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div><p className="full-mini-label good">SINAIS FORTES</p><BulletList items={empresa.sinaisFortes} /></div>
            <div><p className="full-mini-label warning">POSSÍVEIS FRAQUEZAS</p><BulletList items={empresa.possiveisFraquezas} alert /></div>
          </div>
        </article>
      ))}
    </div>
  );
}

function FourQs({ data }) {
  if (!data) return null;
  const items = [
    ["01", "Quem a IA tende a recomendar", data.quemIARecomenda],
    ["02", "Por que essas empresas são escolhidas", data.porqueEssasEmpresasSaoEscolhidas],
    ["03", "Por que sua empresa pode ficar de fora", data.porqueMinhaEmpresaNaoERecomendada],
    ["04", "O que precisa mudar", data.pontosFortesFracosEOQuePrecisaSerFeito]
  ].filter(([, , text]) => text);
  return (
    <div className="full-fourqs-grid">
      {items.map(([number, title, text]) => (
        <div key={number} className="full-fourq-card">
          <span>{number}</span><h4>{title}</h4><p>{text}</p>
        </div>
      ))}
    </div>
  );
}

export default function DiagnosticResult({ diagnostico, contexto, onCtaClick }) {
  if (!diagnostico) return null;
  const empresa = contexto?.empresa || "Sua empresa";
  const company = diagnostico.diagnosticoDaEmpresa || {};
  const aparece = diagnostico.status === "aparece";

  return (
    <section id="resultado" className="full-result-shell px-4 pb-20 pt-5 md:px-6 md:pb-28">
      <div className="mx-auto max-w-[980px] space-y-6">
        <ExportAnalysis contexto={contexto} tipo="recomendacao_ia" />

        <section className="full-result-hero">
          <div className="flex items-center gap-2"><AiBrandLogos /><span className="full-result-kicker">DIAGNÓSTICO COMPLETO</span></div>
          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <h2>{aparece ? `${empresa} já entrou no radar.` : `${empresa} ainda não virou a resposta óbvia.`}</h2>
              <p>{diagnostico.resumo || company.resumoEmpresa || diagnostico.porQueSuaEmpresaPodeNaoAparecer}</p>
            </div>
            <div className="full-status-card">
              <span>STATUS DA LEITURA</span>
              <strong>{aparece ? "NO RADAR" : "EM DISPUTA"}</strong>
              <p>{aparece ? "Já existem sinais públicos úteis; agora a meta é consolidar preferência." : "Há presença, mas concorrentes podem estar mais fáceis de entender e recomendar."}</p>
            </div>
          </div>
        </section>

        <ProgressiveDisclosure eyebrow="4Q'S" title="A leitura estratégica em quatro perguntas" description="A síntese que organiza quem ocupa o território, por quê e onde sua empresa perde força." defaultOpen>
          <FourQs data={diagnostico.quatroQsResumo} />
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="TERRITÓRIO" title="Quem está ocupando mais espaço no seu mercado" description="Abra para comparar as empresas com maior probabilidade de recomendação e os sinais que sustentam essa posição." defaultOpen>
          <TopCompanies empresas={diagnostico.empresasMaisRecomendadas} />
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="SUA EMPRESA" title="Como a análise interpreta sua posição atual" description="Pontos fortes, lacunas e a prioridade que mais muda a leitura da marca.">
          <div className="full-company-diagnosis">
            <p>{company.resumoEmpresa}</p>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div><p className="full-mini-label good">PONTOS FORTES</p><BulletList items={company.pontosFortes} /></div>
              <div><p className="full-mini-label warning">PONTOS DE ATENÇÃO</p><BulletList items={company.pontosFracos} alert /></div>
              <div className="full-priority-card"><span>PRIORIDADE MÁXIMA</span><p>{company.prioridadeMaxima}</p></div>
            </div>
          </div>
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="INTENÇÃO" title="Perguntas que podem anteceder uma contratação" description="A visão completa das dúvidas e intenções que ajudam a construir conteúdo e contexto.">
          <PerguntasClientesIA analise={diagnostico.analisePerguntasClientes} embedded />
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="SINAIS" title="O que ajuda e o que ainda trava sua recomendabilidade" description="Camada técnica completa, disponível sem poluir a primeira leitura.">
          <div className="grid gap-7 lg:grid-cols-2">
            <div><p className="full-mini-label good">SINAIS ENCONTRADOS</p><BulletList items={diagnostico.sinaisEncontradosDaEmpresa} /></div>
            <div><p className="full-mini-label warning">SINAIS FRACOS OU AUSENTES</p><BulletList items={diagnostico.sinaisNaoEncontradosOuFracos} alert /></div>
            <div><p className="full-mini-label">POR QUE OUTRAS EMPRESAS SÃO INDICADAS</p><BulletList items={diagnostico.motivosDasEmpresasIndicadas} /></div>
            <div><p className="full-mini-label warning">POR QUE SUA EMPRESA PODE NÃO APARECER</p><BulletList items={[diagnostico.porQueSuaEmpresaPodeNaoAparecer]} alert /></div>
          </div>
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="AÇÃO" title="Problemas urgentes e próximos passos" description="A versão completa mantém a camada operacional; a simplificada continua sem plano de ação.">
          <div className="grid gap-7 lg:grid-cols-2">
            <div><p className="full-mini-label warning">URGENTE</p><BulletList items={diagnostico.problemasUrgentes} alert /></div>
            <div><p className="full-mini-label good">PRÓXIMOS PASSOS</p><BulletList items={diagnostico.proximosPassos} /></div>
          </div>
        </ProgressiveDisclosure>

        <CompactSources fontes={diagnostico.fontesConsultadas} />

        <section className="result-conclusion" data-export-hide="true">
          <div className="conclusion-scan" aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">CONCLUSÃO</p>
          <h3 className="mt-4 max-w-[800px] text-[34px] font-bold leading-[0.96] tracking-[-0.055em] text-dark md:text-[52px]">NÃO SEJA O PRIMEIRO RESULTADO.<br /><span>SEJA A RESPOSTA.</span></h3>
          <p className="mt-5 max-w-[720px] text-[13px] leading-6 text-gray-600">{diagnostico.chamadaFinal || "O próximo movimento é transformar os sinais encontrados em uma presença mais fácil de entender, confiar e recomendar."}</p>
          <button type="button" onClick={onCtaClick} className="journey-primary-button mt-7">Abrir próximo passo <span>→</span></button>
        </section>
      </div>
    </section>
  );
}
