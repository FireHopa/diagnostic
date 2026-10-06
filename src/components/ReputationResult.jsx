import React, { useEffect, useState } from "react";
import ExportAnalysis from "./ExportAnalysis.jsx";
import AiBrandLogos from "./AiBrandLogos.jsx";
import ProgressiveDisclosure from "./ProgressiveDisclosure.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

function AnimatedScore({ value, duration = 1050 }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(value)) return undefined;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) {
      setShown(Math.round(value));
      return undefined;
    }

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{Number.isFinite(value) ? shown : "N/D"}</>;
}

const dimensaoLabels = {
  presencaDigital: "Presença Digital",
  confiancaPercebida: "Confiança Percebida",
  provaSocial: "Prova Social",
  reputacao: "Reputação",
  consistenciaDigital: "Consistência",
  autoridadePercebida: "Autoridade",
  potencialIA: "Potencial de Recomendação por IA"
};

function BulletList({ items, alert = false }) {
  const list = safeArray(items);
  if (!list.length) return <p className="text-[12px] text-gray-400">Nenhum sinal relevante foi retornado nesta camada.</p>;
  return (
    <ul className="space-y-2.5">
      {list.map((item, index) => (
        <li key={`${typeof item === "string" ? item : item?.descricao}-${index}`} className="flex gap-2.5 text-[12px] leading-5 text-gray-600">
          <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${alert ? "bg-[#F9AB00]" : "bg-primary"}`} />
          <span>{typeof item === "string" ? item : item?.descricao || "Evidência encontrada"}{item?.fonteUrl ? <a className="ml-2 font-semibold text-primary" href={item.fonteUrl} target="_blank" rel="noreferrer">fonte ↗</a> : null}</span>
        </li>
      ))}
    </ul>
  );
}

function Dimension({ name, data }) {
  if (!data) return null;
  const nota = Number.isFinite(data.nota) ? Math.max(0, Math.min(100, data.nota)) : null;
  return (
    <ProgressiveDisclosure eyebrow={nota === null ? "N/D" : `${nota}/100`} title={dimensaoLabels[name] || name} description={data.classificacao || "Abra para ver análise e evidências."}>
      <div className="dimension-expanded">
        {nota !== null ? <div className="pillar-track mb-5"><span style={{ width: `${nota}%` }} /></div> : null}
        <p className="text-[13px] leading-6 text-gray-700">{data.analise}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div><p className="full-mini-label good">PONTOS POSITIVOS</p><BulletList items={data.pontosPositivos} /></div>
          <div><p className="full-mini-label warning">GARGALOS</p><BulletList items={data.gargalos} alert /></div>
          <div><p className="full-mini-label">MELHORIAS</p><BulletList items={data.melhorias} /></div>
        </div>
        {safeArray(data.evidencias).length ? <div className="mt-6 border-t border-line pt-5"><p className="full-mini-label">EVIDÊNCIAS</p><BulletList items={data.evidencias} /></div> : null}
      </div>
    </ProgressiveDisclosure>
  );
}

function Plan({ planoAcao }) {
  if (!planoAcao) return null;
  const channels = [["site", "Site"], ["perfilEmpresaGoogle", "Perfil da Empresa no Google"], ["redesSociais", "Redes sociais"]];
  return (
    <div className="space-y-6">
      {safeArray(planoAcao.prioridades).length ? (
        <div className="full-priority-list">
          {safeArray(planoAcao.prioridades).map((item, index) => <div key={`${item}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></div>)}
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-3">
        {channels.map(([key, label]) => {
          const channel = planoAcao[key] || {};
          return <div key={key} className="full-channel-card"><h4>{label}</h4><div className="mt-4 space-y-5"><div><p className="full-mini-label">PROVA SOCIAL</p><BulletList items={channel.provaSocial} /></div><div><p className="full-mini-label">REPUTAÇÃO</p><BulletList items={channel.reputacao} /></div><div><p className="full-mini-label">AUTORIDADE</p><BulletList items={channel.autoridade} /></div></div></div>;
        })}
      </div>
    </div>
  );
}

function Sources({ fontes }) {
  const list = safeArray(fontes);
  if (!list.length) return null;
  return (
    <ProgressiveDisclosure eyebrow="FONTES" title={`${list.length} fontes analisadas`} description="As referências ficam recolhidas para não roubar espaço da conclusão.">
      <div className="sources-list full-sources-list">{list.map((fonte, index) => <a key={`${fonte.url}-${index}`} href={fonte.url} target="_blank" rel="noreferrer">{fonte.titulo || fonte.url}</a>)}</div>
    </ProgressiveDisclosure>
  );
}

export default function ReputationResult({ diagnostico, contexto, onCtaClick }) {
  if (!diagnostico) return null;
  const dimensoes = diagnostico.dimensoes || {};
  const empresa = diagnostico.empresa || {};
  const falando = diagnostico.oQueEstaoFalando || {};
  const nota = Number.isFinite(diagnostico.notaGeral) ? diagnostico.notaGeral : null;

  return (
    <section id="resultado" className="full-result-shell px-4 pb-20 pt-5 md:px-6 md:pb-28">
      <div className="mx-auto max-w-[980px] space-y-6">
        <ExportAnalysis contexto={contexto} tipo="reputacao" />

        <section className="full-result-hero">
          <div className="flex items-center gap-2"><AiBrandLogos /><span className="full-result-kicker">RAIO-X COMPLETO DE REPUTAÇÃO</span></div>
          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <h2>{empresa.nome || contexto?.empresa || "Empresa analisada"}</h2>
              <p>{diagnostico.resumoExecutivo}</p>
            </div>
            <div className="full-score-card">
              <span>ÍNDICE GERAL</span>
              <div><strong>{nota === null ? "N/D" : <AnimatedScore value={nota} />}</strong>{nota !== null ? <small>/100</small> : null}</div>
              {nota !== null ? <div className="pillar-track"><span style={{ width: `${nota}%` }} /></div> : null}
              <p>{diagnostico.classificacaoGeral || "Leitura pública"}</p>
            </div>
          </div>
        </section>

        <section className="full-dimension-overview">
          <div className="result-section-heading"><span>7 DIMENSÕES</span><h3>Leia o todo primeiro. Abra detalhes só quando precisar.</h3></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.keys(dimensaoLabels).map((key) => {
              const item = dimensoes[key];
              const value = Number.isFinite(item?.nota) ? item.nota : null;
              return <div key={key} className="pillar-card full-pillar-card" title={item?.classificacao || "Sem classificação"}><p>{dimensaoLabels[key]}</p><strong>{value === null ? "N/D" : value}</strong>{value !== null ? <div className="pillar-track"><span style={{ width: `${value}%` }} /></div> : null}<small>{item?.classificacao || "Abra abaixo para ver detalhes"}</small></div>;
            })}
          </div>
        </section>

        <ProgressiveDisclosure eyebrow="PERCEPÇÃO PÚBLICA" title="O que estão falando da empresa" description={falando.classificacao || "Abra para ver elogios, críticas e temas recorrentes."} defaultOpen>
          <p className="text-[13px] leading-6 text-gray-700">{falando.percepcaoGeral}</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3"><div><p className="full-mini-label good">ELOGIOS</p><BulletList items={falando.elogios} /></div><div><p className="full-mini-label warning">CRÍTICAS</p><BulletList items={falando.criticas} alert /></div><div><p className="full-mini-label">TEMAS RECORRENTES</p><BulletList items={falando.temasRecorrentes} /></div></div>
        </ProgressiveDisclosure>

        <div className="space-y-3">{Object.keys(dimensaoLabels).map((key) => <Dimension key={key} name={key} data={dimensoes[key]} />)}</div>

        <ProgressiveDisclosure eyebrow="POR QUE ESSA NOTA?" title="Explicação consolidada do resultado" description="A lógica que conecta as evidências ao veredito.">
          <p className="text-[13px] leading-6 text-gray-700">{diagnostico.explicacaoNota}</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-2"><div><p className="full-mini-label good">PONTOS POSITIVOS</p><BulletList items={diagnostico.pontosPositivos} /></div><div><p className="full-mini-label warning">GARGALOS</p><BulletList items={diagnostico.gargalos} alert /></div></div>
        </ProgressiveDisclosure>

        <ProgressiveDisclosure eyebrow="PLANO DE AÇÃO" title="Autoridade de reputação" description="A camada operacional permanece somente na entrega completa.">
          <Plan planoAcao={diagnostico.planoAcao} />
        </ProgressiveDisclosure>

        <Sources fontes={diagnostico.fontes} />

        <section className="result-conclusion" data-export-hide="true">
          <div className="conclusion-scan" aria-hidden="true" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">CONCLUSÃO</p>
          <h3 className="mt-4 max-w-[800px] text-[34px] font-bold leading-[0.96] tracking-[-0.055em] text-dark md:text-[52px]">A INTERNET TE CONHECE.<br /><span>A QUESTÃO É SE ELA CONFIA.</span></h3>
          <p className="mt-5 max-w-[720px] text-[13px] leading-6 text-gray-600">Use o próximo passo para transformar a leitura em um briefing objetivo, sem perder o contexto encontrado nesta análise.</p>
          <button type="button" onClick={onCtaClick} className="journey-primary-button mt-7">Abrir próximo passo <span>→</span></button>
        </section>
      </div>
    </section>
  );
}
