import React, { useEffect, useRef, useState } from "react";
import Hero from "./components/Hero.jsx";
import DiagnosticForm from "./components/DiagnosticForm.jsx";
import DiagnosticResult from "./components/DiagnosticResult.jsx";
import InfoSection from "./components/InfoSection.jsx";
import Footer from "./components/Footer.jsx";
import { gerarDiagnostico, gerarDiagnosticoViaApi } from "./utils/diagnostico.js";
import {
  enviarLeadParaWebhook,
  marcarDiagnosticoSolicitadoLocal,
  obterClientId,
  salvarLeadNoLocalStorage,
  verificarBloqueioLocal
} from "./utils/storage.js";

const aguardar = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const loadingSteps = [
  "Identificando quem aparece com mais força no seu nicho e na sua cidade...",
  "Comparando sinais de autoridade, reputação e clareza digital...",
  "Organizando os motivos que podem fazer concorrentes aparecerem antes...",
  "Preparando os 4Q's do seu diagnóstico...",
  "Finalizando seus pontos fortes, pontos fracos e próximos passos..."
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  const [ctaMessage, setCtaMessage] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const resultRef = useRef(null);

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
  }, [loading]);

  const handleDiagnosticSubmit = async (formData) => {
    const bloqueioLocal = verificarBloqueioLocal(formData);

    setDiagnostico(null);
    setCtaMessage("");
    setApiNotice("");

    if (bloqueioLocal.bloqueado) {
      setApiNotice(bloqueioLocal.message);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

      return;
    }

    setLoading(true);

    try {
      const clientId = obterClientId();

      const [resultado] = await Promise.all([
        gerarDiagnosticoViaApi(formData, { timeoutMs: 120000, clientId }),
        aguardar(2000)
      ]);

      const lead = {
        nome: formData.nome.trim(),
        whatsapp: formData.whatsapp.trim(),
        empresa: formData.empresa.trim(),
        cidade: formData.cidade.trim(),
        segmento: formData.segmento.trim(),
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultado.status
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(formData, lead);
      enviarLeadParaWebhook(lead);

      setDiagnostico(resultado);
    } catch (error) {
      if (error.code === "DIAGNOSTICO_JA_SOLICITADO" || error.bloqueado) {
        setApiNotice(error.message || "Este diagnóstico já foi solicitado anteriormente.");
        return;
      }

      console.warn("Não foi possível concluir a análise completa agora.", error);

      await aguardar(1200);

      const resultadoLocal = gerarDiagnostico(formData);
      const lead = {
        nome: formData.nome.trim(),
        whatsapp: formData.whatsapp.trim(),
        empresa: formData.empresa.trim(),
        cidade: formData.cidade.trim(),
        segmento: formData.segmento.trim(),
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultadoLocal.status
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(formData, lead);
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

  const loadingMessage = loadingSteps[loadingStep];
  const showDelayNotice = elapsedSeconds >= 25;

  return (
    <main className="min-h-screen bg-soft">
      <Hero />
      <DiagnosticForm onSubmit={handleDiagnosticSubmit} loading={loading} />

      {loading ? (
        <section className="px-6 py-12 md:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-card">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-primary" />
            <p className="mt-6 text-lg font-black text-dark">
              {loadingMessage}
            </p>
            <p className="mt-3 text-sm font-semibold text-gray-500">
              Tempo de análise: {elapsedSeconds}s
            </p>
            {showDelayNotice ? (
              <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold leading-6 text-orange-900">
                A análise pode levar alguns segundos porque estamos comparando sinais de autoridade e concorrência antes de entregar o resultado. Não feche a página.
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <InfoSection />

      {apiNotice ? (
        <section className="px-6 py-4 md:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900">
            {apiNotice}
          </div>
        </section>
      ) : null}

      <div ref={resultRef}>
        <DiagnosticResult
          diagnostico={diagnostico}
          onCtaClick={handleCtaClick}
          ctaMessage={ctaMessage}
        />
      </div>

      <Footer />
    </main>
  );
}
