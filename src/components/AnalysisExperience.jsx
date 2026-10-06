import React, { useEffect, useMemo, useState } from "react";
import AiBrandLogos from "./AiBrandLogos.jsx";

const phaseSets = {
  recomendacao_ia: [
    { key: "identity", label: "IDENTIDADE", title: "Preparando o contexto" },
    { key: "research", label: "PESQUISA", title: "Buscando sinais públicos" },
    { key: "interpretation", label: "INTERPRETAÇÃO", title: "Organizando autoridade e contexto" },
    { key: "synthesis", label: "SÍNTESE", title: "Construindo o veredito" },
    { key: "saving", label: "SALVANDO", title: "Registrando o resultado" }
  ],
  reputacao: [
    { key: "identity", label: "IDENTIDADE", title: "Confirmando a empresa" },
    { key: "google", label: "GOOGLE", title: "Validando o Perfil da Empresa" },
    { key: "research", label: "PESQUISA", title: "Buscando reputação pública" },
    { key: "interpretation", label: "INTERPRETAÇÃO", title: "Separando confiança de ausência de evidência" },
    { key: "saving", label: "SALVANDO", title: "Registrando o resultado" }
  ]
};

const orbitWords = ["reputação", "contexto", "presença", "autoridade", "confiança", "recomendação"];

function PhaseIcon({ done, active }) {
  return <span className={`analysis-phase-icon ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>{done ? "✓" : active ? "•" : "○"}</span>;
}

function buildQuestions(contexto = {}) {
  const produto = contexto.principalProduto || contexto.segmento || "esse serviço";
  const cidade = contexto.cidade || "sua cidade";
  return [
    `“Qual a melhor empresa para ${produto} em ${cidade}?”`,
    `“Quem contratar para ${produto} em ${cidade}?”`,
    `“Quem é referência em ${produto} perto de mim?”`
  ];
}

function DelayMessage({ elapsedSeconds }) {
  if (elapsedSeconds >= 70) return { title: "A pesquisa está mais profunda que o normal.", body: "O servidor continua trabalhando. Não atualize a página; o resultado será revelado assim que a síntese terminar." };
  if (elapsedSeconds >= 40) return { title: "Ainda cruzando fontes e contexto.", body: "Algumas empresas exigem mais buscas para evitar uma conclusão rasa ou baseada em homônimos." };
  if (elapsedSeconds >= 20) return { title: "Encontramos uma leitura que exige mais contexto.", body: "O processamento continua normalmente e não precisa ser reiniciado." };
  return null;
}

export default function AnalysisExperience({ tipo, contexto, activeStep = 0, elapsedSeconds = 0, progressEvent }) {
  const phases = phaseSets[tipo] || phaseSets.recomendacao_ia;
  const bounded = Math.min(activeStep, phases.length - 1);
  const current = phases[bounded];
  const company = contexto?.empresa || "Sua empresa";
  const meta = useMemo(() => [contexto?.cidade, contexto?.segmento || contexto?.principalProduto].filter(Boolean).join(" · "), [contexto]);
  const questions = useMemo(() => buildQuestions(contexto), [contexto]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const delayMessage = DelayMessage({ elapsedSeconds });

  useEffect(() => {
    if (tipo !== "recomendacao_ia" || bounded !== 1) return undefined;
    const timer = window.setInterval(() => setQuestionIndex((index) => (index + 1) % questions.length), 1900);
    return () => window.clearInterval(timer);
  }, [tipo, bounded, questions.length]);

  return (
    <section className="analysis-scene px-4 py-8 md:px-6 md:py-12" aria-live="polite">
      <div className="mx-auto max-w-[1040px]">
        <div className="analysis-scene-header">
          <div className="flex items-center gap-3">
            <AiBrandLogos className="shrink-0" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">LEITURA EM ANDAMENTO</p>
              <p className="mt-1 text-[12px] text-gray-400">As etapas abaixo avançam quando o backend realmente muda de fase.</p>
            </div>
          </div>
          <span className="analysis-live-pill"><span /> processando · {elapsedSeconds}s</span>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          <div className="analysis-timeline-card">
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-400">PIPELINE REAL</p>
            <div className="mt-5">
              {phases.map((phase, index) => {
                const done = index < bounded;
                const active = index === bounded;
                return (
                  <div key={phase.key} className={`analysis-phase ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                    <div className="analysis-phase-rail"><PhaseIcon done={done} active={active} />{index < phases.length - 1 ? <span className="analysis-phase-line" /> : null}</div>
                    <div className="pb-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-gray-400">{phase.label}</p>
                      <p className="mt-1 text-[13px] font-semibold text-dark">{phase.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div key={progressEvent?.key || "waiting"} className="analysis-event-copy">
              <span className="analysis-current-dot" />
              <div>
                <p>{progressEvent?.label || current.title}</p>
                <span>{progressEvent?.detail || "Preparando a próxima etapa da leitura."}</span>
              </div>
            </div>
          </div>

          <div className="analysis-nucleus-card analysis-object-morph" style={{ viewTransitionName: "analysis-object" }}>
            <div className="analysis-grid-bg" aria-hidden="true" />
            <div className="analysis-orbit analysis-orbit-one" aria-hidden="true" />
            <div className="analysis-orbit analysis-orbit-two" aria-hidden="true" />
            {orbitWords.map((word, index) => <span key={word} className={`analysis-orbit-word orbit-word-${index + 1}`}>{word}</span>)}

            <div className="analysis-nucleus">
              <span className="analysis-nucleus-pulse" aria-hidden="true" />
              <div className="analysis-company-icon">{company.trim().slice(0, 1).toUpperCase()}</div>
              <p className="mt-3 max-w-[250px] truncate text-[18px] font-semibold tracking-[-0.03em] text-dark">{company}</p>
              {meta ? <p className="mt-1 max-w-[290px] truncate text-[11px] text-gray-400">{meta}</p> : null}
            </div>

            {tipo === "recomendacao_ia" && bounded === 1 ? (
              <div className="analysis-query-stage">
                <p>PERGUNTA DE COMPRA SOB ANÁLISE</p>
                <strong key={questionIndex}>{questions[questionIndex]}</strong>
                <span>Exemplos de intenção usados para interpretar recomendabilidade — não um histórico privado de usuários.</span>
              </div>
            ) : null}

            {tipo === "reputacao" && bounded === 1 ? (
              <div className="analysis-google-stage">
                <span className={progressEvent?.meta?.officialProfile ? "is-ok" : ""}>{progressEvent?.meta?.officialProfile ? "✓" : "•"}</span>
                <div><p>{progressEvent?.meta?.officialProfile ? "Perfil oficial confirmado" : "Validando identidade no Google"}</p><small>{progressEvent?.meta?.placesStatus ? `Places: ${progressEvent.meta.placesStatus}` : "Cruzando nome, link, cidade e site."}</small></div>
              </div>
            ) : null}

            <div key={current.key} className="analysis-current-caption">
              <span className="analysis-current-dot" />
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">{current.label}</p><p className="mt-1 text-[12px] font-medium text-gray-700">{current.title}</p></div>
            </div>
          </div>
        </div>

        {delayMessage ? (
          <div className="analysis-delay-note">
            <span className="analysis-delay-spinner" aria-hidden="true" />
            <div><p className="text-[12px] font-semibold text-gray-700">{delayMessage.title}</p><p className="mt-1 text-[11px] leading-5 text-gray-500">{delayMessage.body}</p></div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
