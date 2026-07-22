import React, { useEffect, useRef, useState } from "react";
import Hero from "./components/Hero.jsx";
import DiagnosticSelector from "./components/DiagnosticSelector.jsx";
import DiagnosticForm from "./components/DiagnosticForm.jsx";
import DiagnosticResult from "./components/DiagnosticResult.jsx";
import ReputationForm from "./components/ReputationForm.jsx";
import ReputationResult from "./components/ReputationResult.jsx";
import InfoSection from "./components/InfoSection.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import { gerarDiagnostico, gerarDiagnosticoViaApi } from "./utils/diagnostico.js";
import { gerarReputacaoViaApi } from "./utils/reputacao.js";
import {
  enviarLeadParaWebhook,
  marcarDiagnosticoSolicitadoLocal,
  obterClientId,
  salvarLeadNoLocalStorage
} from "./utils/storage.js";

const aguardar = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const loadingStepsPorTipo = {
  recomendacao_ia: [
    "Identificando quem aparece com mais força no seu nicho e na sua cidade...",
    "Comparando sinais de autoridade, reputação e clareza digital...",
    "Organizando os motivos que podem fazer concorrentes aparecerem antes...",
    "Preparando os 4Q's do seu diagnóstico...",
    "Finalizando seus pontos fortes, pontos fracos e próximos passos..."
  ],
  reputacao: [
    "Localizando a presença digital da empresa...",
    "Analisando avaliações e sinais de confiança...",
    "Investigando o que clientes e outras fontes estão falando...",
    "Analisando prova social e autoridade digital...",
    "Avaliando os sinais encontrados por mecanismos de busca e Inteligência Artificial...",
    "Organizando o plano de ação de autoridade de reputação..."
  ]
};

export default function App() {
  const [tipoDiagnostico, setTipoDiagnostico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  const [ctaMessage, setCtaMessage] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const resultRef = useRef(null);

  const loadingSteps = loadingStepsPorTipo[tipoDiagnostico] || loadingStepsPorTipo.recomendacao_ia;

  useEffect(() => {
    if (!loading) return undefined;

    setLoadingStep(0);
    setElapsedSeconds(0);

    const stepTimer = window.setInterval(() => {
      setLoadingStep((current) => Math.min(current + 1, loadingSteps.length - 1));
    }, 9000);

    const secondsTimer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(secondsTimer);
    };
  }, [loading, tipoDiagnostico, loadingSteps.length]);

  const selecionarDiagnostico = (tipo) => {
    setTipoDiagnostico(tipo);
    setDiagnostico(null);
    setCtaMessage("");
    setApiNotice("");

    window.setTimeout(() => {
      document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const voltarParaSelecao = () => {
    if (loading) return;
    setTipoDiagnostico(null);
    setDiagnostico(null);
    setCtaMessage("");
    setApiNotice("");

    window.setTimeout(() => {
      document.getElementById("diagnosticos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleDiagnosticSubmit = async (formData) => {
    const tipoAtual = formData.tipoDiagnostico === "reputacao" ? "reputacao" : "recomendacao_ia";
    const payload = { ...formData, tipoDiagnostico: tipoAtual };
    setDiagnostico(null);
    setCtaMessage("");
    setApiNotice("");

    setLoading(true);

    try {
      const clientId = obterClientId();
      const chamada = tipoAtual === "reputacao"
        ? gerarReputacaoViaApi(payload, { timeoutMs: 300000, clientId })
        : gerarDiagnosticoViaApi(payload, { timeoutMs: 300000, clientId });

      const [resultado] = await Promise.all([chamada, aguardar(2000)]);

      const lead = {
        nome: payload.nome.trim(),
        whatsapp: payload.whatsapp.trim(),
        empresa: payload.empresa.trim(),
        cidade: payload.cidade.trim(),
        segmento: payload.segmento?.trim() || "",
        siteEmpresa: payload.siteEmpresa?.trim() || "",
        perfilGoogle: payload.perfilGoogle?.trim() || "",
        tipoDiagnostico: tipoAtual,
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultado.status,
        notaGeral: Number.isFinite(resultado.notaGeral) ? resultado.notaGeral : null
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(payload, lead);
      enviarLeadParaWebhook(lead);

      setDiagnostico(resultado);
    } catch (error) {
      if (error.code === "DIAGNOSTICO_JA_SOLICITADO" || error.bloqueado) {
        setApiNotice(error.message || "Este diagnóstico já foi solicitado anteriormente.");
        return;
      }

      console.warn("Não foi possível concluir a análise completa agora.", error);

      if (tipoAtual === "reputacao") {
        setApiNotice(
          error.message ||
            "Não foi possível realizar uma avaliação confiável da reputação neste momento. Nenhuma nota fictícia foi gerada."
        );
        return;
      }

      // O fallback local é preservado exclusivamente no diagnóstico legado de recomendação por IA.
      await aguardar(1200);

      const resultadoLocal = gerarDiagnostico(payload);
      const lead = {
        nome: payload.nome.trim(),
        whatsapp: payload.whatsapp.trim(),
        empresa: payload.empresa.trim(),
        cidade: payload.cidade.trim(),
        segmento: payload.segmento.trim(),
        tipoDiagnostico: "recomendacao_ia",
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultadoLocal.status
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(payload, lead);
      enviarLeadParaWebhook(lead);

      setApiNotice(
        "A análise completa levou mais tempo que o esperado. Exibimos uma prévia inicial e nossa equipe pode complementar pelo WhatsApp."
      );
      setDiagnostico(resultadoLocal);
    } finally {
      setLoading(false);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleCtaClick = () => {
    const message = "Convite solicitado com sucesso. Nossa equipe entrará em contato pelo WhatsApp.";
    setCtaMessage(message);
    window.alert(message);
  };

  const loadingMessage = loadingSteps[loadingStep] || loadingSteps[0];
  const showDelayNotice = elapsedSeconds >= 25;

  return (
    <main className="ai-page-shell min-h-screen bg-white">
      <Header
        onNewAnalysis={voltarParaSelecao}
        showNewAnalysis={Boolean(tipoDiagnostico || diagnostico)}
        disabled={loading}
      />
      <Hero tipoDiagnostico={tipoDiagnostico} />

      {!tipoDiagnostico ? (
        <DiagnosticSelector onSelect={selecionarDiagnostico} disabled={loading} />
      ) : null}

      {tipoDiagnostico === "recomendacao_ia" ? (
        <DiagnosticForm onSubmit={handleDiagnosticSubmit} loading={loading} onBack={voltarParaSelecao} />
      ) : null}

      {tipoDiagnostico === "reputacao" ? (
        <ReputationForm onSubmit={handleDiagnosticSubmit} loading={loading} onBack={voltarParaSelecao} />
      ) : null}

      {loading ? (
        <section className="px-4 py-10 md:px-6 md:py-12">
          <div className="mx-auto max-w-[720px] rounded-2xl border border-line bg-white p-5 md:p-6">
            <div className="flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-surface" aria-hidden="true">
                <span className="ai-gradient-mark h-4 w-4 animate-pulse rounded-[5px]" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-dark">Analisando sua empresa</p>
                <p className="mt-0.5 text-[12px] text-gray-400">A IA está organizando os sinais encontrados</p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-line border-y border-line">
              {loadingSteps.map((step, index) => {
                const completed = index < loadingStep;
                const active = index === loadingStep;
                return (
                  <div key={step} className="flex gap-3 py-3.5">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                        completed
                          ? "bg-[#E6F4EA] text-[#137333]"
                          : active
                            ? "bg-blue-50 text-primary"
                            : "bg-surface text-gray-400"
                      }`}
                    >
                      {completed ? "✓" : active ? "•" : "○"}
                    </span>
                    <p className={`text-[13px] leading-5 ${active ? "font-medium text-dark" : completed ? "text-gray-500" : "text-gray-400"}`}>
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-[12px] text-gray-400">
              <span>{loadingMessage}</span>
              <span className="shrink-0 font-medium text-gray-500">{elapsedSeconds}s</span>
            </div>

            {showDelayNotice ? (
              <div className="mt-5 rounded-xl border border-[#F3D7A3] bg-[#FEF7E0] p-4 text-[13px] font-medium leading-5 text-[#8A4D00]">
                {tipoDiagnostico === "reputacao"
                  ? "A análise pode levar alguns segundos porque estamos cruzando fontes públicas antes de atribuir qualquer nota. Não feche a página."
                  : "A análise pode levar alguns segundos porque estamos comparando sinais de autoridade e concorrência antes de entregar o resultado. Não feche a página."}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {tipoDiagnostico === "recomendacao_ia" ? <InfoSection /> : null}

      {apiNotice ? (
        <section className="px-4 py-4 md:px-6">
          <div className="mx-auto max-w-[840px] rounded-xl border border-[#F3D7A3] bg-[#FEF7E0] p-4 text-[13px] font-medium leading-5 text-[#8A4D00]">
            {apiNotice}
          </div>
        </section>
      ) : null}

      <div ref={resultRef}>
        {tipoDiagnostico === "recomendacao_ia" ? (
          <DiagnosticResult diagnostico={diagnostico} onCtaClick={handleCtaClick} ctaMessage={ctaMessage} />
        ) : null}

        {tipoDiagnostico === "reputacao" ? (
          <ReputationResult diagnostico={diagnostico} onCtaClick={handleCtaClick} ctaMessage={ctaMessage} />
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
