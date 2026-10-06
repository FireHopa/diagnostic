import React, { useEffect, useMemo, useState } from "react";
import AiBrandLogos from "./AiBrandLogos.jsx";
import ExportAnalysis from "./ExportAnalysis.jsx";

const safeArray = (items) => (Array.isArray(items) ? items.filter(Boolean) : []);

const dimensaoLabels = {
  presencaDigital: "Presença digital",
  confiancaPercebida: "Confiança percebida",
  provaSocial: "Prova social",
  reputacao: "Reputação",
  consistenciaDigital: "Consistência",
  autoridadePercebida: "Autoridade",
  potencialIA: "Potencial na IA"
};

function AnimatedNumber({ value, duration = 950 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!Number.isFinite(value)) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) {
      setShown(Math.round(value));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{Number.isFinite(value) ? shown : "N/D"}</>;
}

function scoreTone(nota) {
  if (!Number.isFinite(nota)) return "neutral";
  if (nota >= 71) return "good";
  if (nota >= 51) return "medium";
  if (nota >= 31) return "warning";
  return "danger";
}

function BulletList({ items, limit = 5, alert = false }) {
  const list = safeArray(items).slice(0, limit);
  if (!list.length) return <p className="text-[12px] leading-5 text-gray-400">Nenhum sinal relevante encontrado nesta leitura.</p>;
  return (
    <ul className="space-y-3">
      {list.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3 text-[12px] leading-5 text-gray-700 md:text-[13px]">
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
  const dominios = [...new Set(list.map((fonte) => {
    try { return new URL(fonte.url).hostname.replace(/^www\./, ""); } catch { return "fonte"; }
  }))].slice(0, 5);

  return (
    <details className="sources-compact group">
      <summary>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-dark">{list.length} fontes consultadas</p>
          <p className="mt-1 truncate text-[10px] text-gray-400">{dominios.join(" · ")}</p>
        </div>
        <span className="sources-chevron">⌄</span>
      </summary>
      <div className="sources-list">
        {list.map((fonte, index) => (
          <a key={`${fonte.url}-${index}`} href={fonte.url} target="_blank" rel="noreferrer" title={fonte.url}>
            {fonte.titulo || `Fonte ${index + 1}`} <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </details>
  );
}

function ScoreHero({ nota, label = "Índice de reputação" }) {
  const tone = scoreTone(nota);
  return (
    <div className={`score-hero score-tone-${tone}`}>
      <div className="score-orbit" aria-hidden="true"><span /></div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</p>
      <div className="mt-4 flex items-end justify-center gap-1">
        <span className="text-[64px] font-semibold leading-none tracking-[-0.075em] text-dark md:text-[78px]"><AnimatedNumber value={nota} /></span>
        {Number.isFinite(nota) ? <span className="mb-2 text-[12px] font-medium text-gray-400">/100</span> : null}
      </div>
      <p className="mt-3 text-[11px] font-medium text-gray-500">
        {!Number.isFinite(nota) ? "dados insuficientes" : nota >= 86 ? "autoridade muito forte" : nota >= 71 ? "sinais fortes" : nota >= 51 ? "presença em construção" : "autoridade ainda frágil"}
      </p>
    </div>
  );
}

function PillarGrid({ dimensoes }) {
  const entries = Object.entries(dimensaoLabels).filter(([key]) => dimensoes?.[key]);
  if (!entries.length) return null;
  return (
    <section className="result-block">
      <div className="result-section-heading">
        <span>RAIO-X</span>
        <h3>Os sinais que formam sua leitura.</h3>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map(([key, label], index) => {
          const nota = dimensoes[key]?.nota;
          return (
            <div key={key} className="pillar-card" style={{ "--delay": `${index * 55}ms` }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold text-gray-700">{label}</span>
                <span className="text-[11px] font-semibold text-dark">{Number.isFinite(nota) ? nota : "N/D"}</span>
              </div>
              <div className="pillar-track"><span style={{ width: `${Number.isFinite(nota) ? Math.max(0, Math.min(100, nota)) : 0}%` }} /></div>
              <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-gray-500">{dimensoes[key]?.classificacao || dimensoes[key]?.resumo || "Abra a versão completa para ver evidências."}</p>
              {dimensoes[key]?.analise ? <div className="pillar-hover-detail">{dimensoes[key].analise}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PerceptionMap({ contexto, strong, weak }) {
  const empresa = contexto?.empresa || "Sua empresa";
  const centerMeta = [contexto?.segmento, contexto?.cidade].filter(Boolean);
  const strongTags = safeArray(strong).slice(0, 3).map((x) => String(x).split(/[.;:]/)[0].slice(0, 38));
  const weakTags = safeArray(weak).slice(0, 2).map((x) => String(x).split(/[.;:]/)[0].slice(0, 38));
  const tags = [...centerMeta, ...strongTags, ...weakTags].filter(Boolean).slice(0, 7);

  return (
    <section className="result-block perception-section">
      <div className="result-section-heading">
        <span>MODELO MENTAL</span>
        <h3>Como a análise interpreta sua presença.</h3>
        <p>Uma síntese visual dos sinais que cercam a sua empresa — não uma afirmação de que um modelo específico “pensa” exatamente assim.</p>
      </div>
      <div className="perception-map mt-6">
        <div className="perception-grid" aria-hidden="true" />
        <div className="perception-center">
          <span>{empresa.trim().slice(0, 1).toUpperCase()}</span>
          <strong>{empresa}</strong>
          <small>objeto da leitura</small>
        </div>
        {tags.map((tag, index) => (
          <div key={`${tag}-${index}`} className={`perception-node perception-node-${index + 1}`}>
            <span className="perception-node-dot" />{tag}
          </div>
        ))}
      </div>
    </section>
  );
}

function SignalCount({ diagnostico }) {
  const strong = safeArray(diagnostico.sinaisEncontradosDaEmpresa || diagnostico?.diagnosticoDaEmpresa?.pontosFortes);
  const weak = safeArray(diagnostico.sinaisNaoEncontradosOuFracos || diagnostico?.diagnosticoDaEmpresa?.pontosFracos);
  return (
    <div className="signal-count-panel">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">SINAIS DA LEITURA</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div><strong>{strong.length}</strong><span>sinais que ajudam</span></div>
        <div><strong>{weak.length}</strong><span>lacunas ou sinais fracos</span></div>
      </div>
      <p className="mt-4 text-[10px] leading-4 text-gray-400">Contagem direta dos itens encontrados pela análise. Não é um score artificial.</p>
    </div>
  );
}

function Conclusion({ tipo, diagnostico, contexto, onCtaClick, ctaMessage }) {
  const empresa = contexto?.empresa || diagnostico?.empresa?.nome || "Sua empresa";
  let leitura = "O jogo mudou: aparecer é bom, mas ser escolhido é melhor.";
  if (tipo === "reputacao") {
    const nota = diagnostico?.notaGeral;
    if (!Number.isFinite(nota)) leitura = `Hoje faltam sinais públicos claros o bastante para formar uma leitura forte sobre ${empresa}.`;
    else if (nota >= 86) leitura = `${empresa} já transmite sinais fortes. O objetivo agora é transformar autoridade em preferência recorrente.`;
    else if (nota >= 71) leitura = `A máquina encontra bons motivos para respeitar ${empresa}. O próximo nível é tornar essa escolha mais recorrente.`;
    else if (nota >= 51) leitura = `${empresa} existe para o algoritmo, mas ainda não é inevitável. Há presença; falta consolidar preferência.`;
    else leitura = `Os sinais digitais de ${empresa} ainda são fracos para a marca parecer uma resposta óbvia.`;
  } else if (diagnostico?.status === "aparece") leitura = `${empresa} já entrou no radar. Agora o jogo é ocupar mais contexto até virar uma resposta natural.`;
  else leitura = `Hoje, concorrentes podem estar mais fáceis de entender e recomendar do que ${empresa}. O problema não é só aparecer: é ser a resposta mais óbvia.`;

  return (
    <section className="result-conclusion">
      <div className="conclusion-scan" aria-hidden="true" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">CONCLUSÃO</p>
      <h3 className="mt-4 max-w-[800px] text-[34px] font-bold leading-[0.96] tracking-[-0.055em] text-dark md:text-[52px]">NÃO SEJA O PRIMEIRO RESULTADO.<br /><span>SEJA A RESPOSTA.</span></h3>
      <p className="mt-5 max-w-[760px] text-[14px] font-medium leading-6 text-gray-800 md:text-[15px]">{leitura}</p>
      <p className="mt-3 max-w-[740px] text-[12px] leading-5 text-gray-500">Pare de disputar só clique. Construa sinais reais e consistentes até sua empresa ficar fácil de entender, confiar e recomendar por pessoas e máquinas.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {["autoridade algorítmica", "presença em IA", "seja a resposta"].map((x) => <span key={x} className="result-chip">{x}</span>)}
      </div>
      <div className="mt-8 flex flex-col gap-4 border-t border-blue-100/80 pt-6 sm:flex-row sm:items-center sm:justify-between" data-export-hide="true">
        <div><p className="text-[12px] font-semibold text-dark">Quer transformar essa leitura em próximo passo?</p><p className="mt-1 text-[11px] text-gray-500">Continue a partir do que o diagnóstico acabou de encontrar.</p></div>
        <button type="button" onClick={onCtaClick} className="journey-primary-button">Desbloquear próximo passo <span>→</span></button>
      </div>
      {ctaMessage ? <div className="mt-4 rounded-xl border border-green-200 bg-[#E6F4EA] p-3 text-[12px] font-medium text-[#137333]">{ctaMessage}</div> : null}
    </section>
  );
}

function RecommendationResult({ diagnostico, contexto, onCtaClick, ctaMessage }) {
  const empresas = safeArray(diagnostico.empresasMaisRecomendadas).slice(0, 3);
  const perguntas = safeArray(diagnostico?.analisePerguntasClientes?.maiorIntencaoContratacao).slice(0, 5);
  const strong = diagnostico.sinaisEncontradosDaEmpresa || diagnostico?.diagnosticoDaEmpresa?.pontosFortes;
  const weak = diagnostico.sinaisNaoEncontradosOuFracos || diagnostico?.diagnosticoDaEmpresa?.pontosFracos;
  const aparece = diagnostico.status === "aparece";

  return (
    <>
      <section className="result-hero-grid">
        <div className="result-verdict-panel">
          <div className="flex items-center gap-2"><AiBrandLogos /><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">VEREDITO</span></div>
          <h2 className="mt-6 max-w-[680px] text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-dark md:text-[52px]">{aparece ? "Você já entrou no radar." : "Você ainda não virou a resposta óbvia."}</h2>
          <p className="mt-5 max-w-[650px] text-[14px] leading-6 text-gray-600">{diagnostico?.diagnosticoDaEmpresa?.resumoEmpresa || diagnostico.porQueSuaEmpresaPodeNaoAparecer}</p>
          <span className={`mt-6 inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold ${aparece ? "bg-[#E6F4EA] text-[#137333]" : "bg-[#FEF7E0] text-[#B06000]"}`}>{aparece ? "já aparece no radar" : "ainda não é resposta natural"}</span>
        </div>
        <SignalCount diagnostico={diagnostico} />
      </section>

      <PerceptionMap contexto={contexto} strong={strong} weak={weak} />

      <section className="result-block grid gap-4 md:grid-cols-2">
        <div className="signal-card signal-card-good"><p>O QUE JÁ TE AJUDA</p><BulletList items={strong} /></div>
        <div className="signal-card signal-card-warning"><p>O QUE TE TRAVA</p><BulletList items={weak} alert /></div>
      </section>

      {empresas.length ? (
        <section className="result-block">
          <div className="result-section-heading"><span>TERRITÓRIO</span><h3>Quem está ocupando mais espaço agora.</h3></div>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {empresas.map((empresa, index) => (
              <div key={`${empresa.nome}-${index}`} className="territory-row">
                <span>{String(index + 1).padStart(2, "0")}</span><strong>{empresa.nome}</strong><p>{empresa.porQueTemMaisAutoridade || empresa.resumoAutoridade}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {perguntas.length ? (
        <section className="result-block">
          <div className="result-section-heading"><span>INTENÇÃO DE COMPRA</span><h3>Perguntas que merecem atenção.</h3></div>
          <div className="mt-5 grid gap-2">
            {perguntas.map((pergunta, index) => <div key={`${pergunta}-${index}`} className="question-row"><span>{String(index + 1).padStart(2, "0")}</span><p>{pergunta}</p></div>)}
          </div>
        </section>
      ) : null}

      <CompactSources fontes={diagnostico.fontesConsultadas} />

      <Conclusion tipo="recomendacao_ia" diagnostico={diagnostico} contexto={contexto} onCtaClick={onCtaClick} ctaMessage={ctaMessage} />
    </>
  );
}

function ReputationResult({ diagnostico, contexto, onCtaClick, ctaMessage }) {
  const dimensoes = diagnostico.dimensoes || {};
  const falando = diagnostico.oQueEstaoFalando || {};
  const strong = diagnostico.pontosPositivos;
  const weak = diagnostico.gargalos;

  return (
    <>
      <section className="result-hero-grid">
        <div className="result-verdict-panel">
          <div className="flex items-center gap-2"><AiBrandLogos /><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">VEREDITO</span></div>
          <h2 className="mt-6 max-w-[680px] text-[36px] font-semibold leading-[0.98] tracking-[-0.055em] text-dark md:text-[52px]">{diagnostico?.empresa?.nome || contexto?.empresa || "Empresa analisada"}</h2>
          <p className="mt-5 max-w-[650px] text-[14px] leading-6 text-gray-600">{diagnostico.resumoExecutivo}</p>
          <p className="mt-4 text-[10px] leading-4 text-gray-400">{diagnostico.status === "dados_insuficientes" ? "Faltaram sinais públicos suficientes para uma nota defensável." : "Leitura baseada nos sinais públicos encontrados no momento da análise."}</p>
        </div>
        <ScoreHero nota={diagnostico.notaGeral} />
      </section>

      <PillarGrid dimensoes={dimensoes} />
      <PerceptionMap contexto={contexto} strong={strong} weak={weak} />

      <section className="result-block grid gap-4 md:grid-cols-2">
        <div className="signal-card signal-card-good"><p>O QUE JÁ GERA CONFIANÇA</p><BulletList items={strong} /></div>
        <div className="signal-card signal-card-warning"><p>O QUE ENFRAQUECE SUA AUTORIDADE</p><BulletList items={weak} alert /></div>
      </section>

      {falando.percepcaoGeral ? (
        <section className="result-block quote-insight">
          <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">O QUE ESTÃO FALANDO</span><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-500">{falando.classificacao || "leitura pública"}</span></div>
          <p className="mt-4 text-[15px] leading-7 text-gray-700">{falando.percepcaoGeral}</p>
        </section>
      ) : null}

      <CompactSources fontes={diagnostico.fontes} />
      <Conclusion tipo="reputacao" diagnostico={diagnostico} contexto={contexto} onCtaClick={onCtaClick} ctaMessage={ctaMessage} />
    </>
  );
}

export default function SimplifiedResult({ tipo, diagnostico, contexto, onCtaClick, ctaMessage }) {
  if (!diagnostico) return null;
  return (
    <section id="resultado" className="px-4 pb-20 pt-6 md:px-6 md:pb-28">
      <div className="mx-auto max-w-[980px] space-y-10 md:space-y-14">
        <ExportAnalysis contexto={contexto} tipo={tipo} />
        {tipo === "reputacao" ? <ReputationResult diagnostico={diagnostico} contexto={contexto} onCtaClick={onCtaClick} ctaMessage={ctaMessage} /> : <RecommendationResult diagnostico={diagnostico} contexto={contexto} onCtaClick={onCtaClick} ctaMessage={ctaMessage} />}
      </div>
    </section>
  );
}
