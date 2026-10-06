import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Hero from "./components/Hero.jsx";
import DiagnosticSelector from "./components/DiagnosticSelector.jsx";
import DiagnosticForm from "./components/DiagnosticForm.jsx";
import DiagnosticResult from "./components/DiagnosticResult.jsx";
import ReputationForm from "./components/ReputationForm.jsx";
import ReputationResult from "./components/ReputationResult.jsx";
import SimplifiedResult from "./components/SimplifiedResult.jsx";
import DeliveryModeSwitch from "./components/DeliveryModeSwitch.jsx";
import InfoSection from "./components/InfoSection.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import VendedorAccessGate from "./components/VendedorAccessGate.jsx";
import VendedorHistory from "./components/VendedorHistory.jsx";
import AnalysisExperience from "./components/AnalysisExperience.jsx";
import ResultReveal from "./components/ResultReveal.jsx";
import LastDiagnosticCard from "./components/LastDiagnosticCard.jsx";
import UxNotice from "./components/UxNotice.jsx";
import NextStepJourney from "./components/NextStepJourney.jsx";
import { gerarDiagnostico, gerarDiagnosticoViaApi } from "./utils/diagnostico.js";
import { gerarReputacaoViaApi } from "./utils/reputacao.js";
import { montarPayloadDiagnostico } from "./utils/payload.js";
import {
  enviarLeadParaWebhook,
  marcarDiagnosticoSolicitadoLocal,
  obterClientId,
  salvarLeadNoLocalStorage
} from "./utils/storage.js";
import {
  limparSessaoVendedor,
  listarHistoricoVendedor,
  loginVendedor,
  obterDiagnosticoDoHistorico,
  obterSessaoVendedor,
  validarSessaoAtual
} from "./utils/vendedor.js";
import { carregarUltimoDiagnostico, salvarUltimoDiagnostico } from "./utils/uxPersistence.js";

const aguardar = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const progressSteps = {
  recomendacao_ia: {
    accepted: 0,
    foundation: 0,
    web_search: 1,
    interpretation: 2,
    synthesis: 3,
    saving: 4,
    completed: 4
  },
  reputacao: {
    accepted: 0,
    google_profile: 1,
    google_ready: 1,
    web_search: 2,
    interpretation: 3,
    synthesis: 3,
    saving: 4,
    completed: 4
  }
};

function executarViewTransition(update) {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!document.startViewTransition || reduced) {
    flushSync(update);
    return null;
  }
  return document.startViewTransition(() => flushSync(update));
}

function avisoParaErro(error, tipo) {
  if (error?.code === "DIAGNOSTICO_JA_SOLICITADO" || error?.bloqueado) {
    return { kind: "info", title: "Este diagnóstico já existe.", message: error.message || "Abra o histórico para consultar a análise anterior." };
  }
  if (error?.code === "DADOS_INVALIDOS") {
    const detalhes = Object.values(error?.errors || {}).filter(Boolean).join(" ");
    return {
      kind: "warning",
      title: "Alguns dados precisam ser corrigidos.",
      message: detalhes || error.message || "Revise os campos antes de tentar novamente."
    };
  }
  if (String(error?.code || "").startsWith("TIMEOUT")) {
    return { kind: "warning", title: "A leitura demorou mais do que o limite.", message: error.message, detail: "Os dados preenchidos foram preservados; você pode tentar novamente sem refazer o formulário." };
  }
  if (error?.code === "PESQUISA_INDISPONIVEL") {
    return { kind: "warning", title: "A pesquisa pública está indisponível.", message: error.message, detail: "Nenhuma nota fictícia será mostrada enquanto a fonte necessária estiver indisponível." };
  }
  if (error instanceof TypeError) {
    return { kind: "error", title: "O navegador perdeu contato com o servidor.", message: "Verifique a conexão e tente novamente.", detail: "Os dados do formulário continuam salvos nesta tela." };
  }
  return {
    kind: tipo === "reputacao" ? "warning" : "error",
    title: tipo === "reputacao" ? "Não foi possível fechar uma leitura confiável." : "A análise foi interrompida.",
    message: error?.message || "Tente novamente em alguns instantes."
  };
}

export default function App() {
  const sessaoInicial = obterSessaoVendedor();
  const [sessaoVendedor, setSessaoVendedor] = useState(sessaoInicial);
  const [checkingSession, setCheckingSession] = useState(Boolean(sessaoInicial));
  const [accessNotice, setAccessNotice] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [openingHistoryId, setOpeningHistoryId] = useState("");
  const [contextoResultado, setContextoResultado] = useState(null);

  const [tipoDiagnostico, setTipoDiagnostico] = useState(null);
  const [modoEntrega, setModoEntrega] = useState("completo");
  const [loading, setLoading] = useState(false);
  const [diagnostico, setDiagnostico] = useState(null);
  const [ctaMessage, setCtaMessage] = useState("");
  const [apiNotice, setApiNotice] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [revealPending, setRevealPending] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState(null);
  const [lastAttemptPayload, setLastAttemptPayload] = useState(null);
  const [formDrafts, setFormDrafts] = useState({ recomendacao_ia: null, reputacao: null });
  const [nextStepOpen, setNextStepOpen] = useState(false);
  const resultRef = useRef(null);
  const analysisRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function verificarSessao() {
      const existente = obterSessaoVendedor();
      if (!existente) {
        if (active) setCheckingSession(false);
        return;
      }

      try {
        const validada = await validarSessaoAtual();
        if (active) {
          setSessaoVendedor(validada);
          if (!validada) setAccessNotice("Sua sessão expirou. Digite o código do vendedor novamente.");
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    verificarSessao();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const vendedorId = sessaoVendedor?.vendedor?.id;
    setLastSnapshot(vendedorId ? carregarUltimoDiagnostico(vendedorId) : null);
  }, [sessaoVendedor?.vendedor?.id]);

  useEffect(() => {
    if (!loading) return undefined;

    setElapsedSeconds(0);
    const secondsTimer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(secondsTimer);
    };
  }, [loading]);

  useEffect(() => {
    if (!diagnostico || revealPending) return undefined;
    const root = resultRef.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll("section, article")).filter((node) => !node.classList.contains("result-reveal"));
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((node) => node.classList.add("motion-reveal", "is-visible"));
      return undefined;
    }

    targets.forEach((node) => node.classList.add("motion-reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [diagnostico, revealPending, modoEntrega]);

  useEffect(() => {
    if (!diagnostico) {
      document.title = "Diagnóstico de Presença na IA";
      return;
    }
    const empresa = contextoResultado?.empresa || diagnostico?.empresa?.nome || "Empresa";
    const nota = Number.isFinite(diagnostico?.notaGeral) ? `${diagnostico.notaGeral}/100 — ` : "Diagnóstico — ";
    document.title = `${nota}${empresa}`;
  }, [diagnostico, contextoResultado]);

  const handleRevealComplete = useCallback(() => {
    executarViewTransition(() => setRevealPending(false));
  }, []);

  const handleLogin = async (codigo) => {
    const sessao = await loginVendedor(codigo);
    setSessaoVendedor(sessao);
    setAccessNotice("");
    setHistoryOpen(false);
    setHistoryItems([]);
  };

  const handleLogout = () => {
    if (loading) return;
    limparSessaoVendedor();
    setSessaoVendedor(null);
    setHistoryOpen(false);
    setHistoryItems([]);
    setHistoryError("");
    setTipoDiagnostico(null);
    setModoEntrega("completo");
    setDiagnostico(null);
    setContextoResultado(null);
    setCtaMessage("");
    setApiNotice("");
    setRevealPending(false);
    setLastSnapshot(null);
    setLastAttemptPayload(null);
    setAnalysisProgress(null);
    setNextStepOpen(false);
    setAccessNotice("");
  };

  const expirarSessao = (message) => {
    limparSessaoVendedor();
    setSessaoVendedor(null);
    setHistoryOpen(false);
    setHistoryItems([]);
    setTipoDiagnostico(null);
    setModoEntrega("completo");
    setDiagnostico(null);
    setContextoResultado(null);
    setApiNotice("");
    setRevealPending(false);
    setLastSnapshot(null);
    setLastAttemptPayload(null);
    setAnalysisProgress(null);
    setNextStepOpen(false);
    setAccessNotice(message || "Sua sessão expirou. Digite o código do vendedor novamente.");
  };

  const selecionarDiagnostico = (tipo, sourceNode) => {
    if (!sessaoVendedor) return;
    if (sourceNode) sourceNode.style.viewTransitionName = "diagnostic-stage";

    const transition = executarViewTransition(() => {
      setHistoryOpen(false);
      setTipoDiagnostico(tipo);
      setDiagnostico(null);
      setContextoResultado(null);
      setCtaMessage("");
      setApiNotice("");
      setRevealPending(false);
      setAnalysisProgress(null);
      setNextStepOpen(false);
    });

    transition?.finished?.finally(() => {
      if (sourceNode) sourceNode.style.removeProperty("view-transition-name");
    });

    window.setTimeout(() => {
      document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const voltarParaSelecao = () => {
    if (loading) return;
    setHistoryOpen(false);
    setTipoDiagnostico(null);
    setDiagnostico(null);
    setContextoResultado(null);
    setCtaMessage("");
    setApiNotice("");
    setRevealPending(false);
    setAnalysisProgress(null);
    setNextStepOpen(false);

    window.setTimeout(() => {
      document.getElementById("diagnosticos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const carregarHistorico = async () => {
    if (!sessaoVendedor) return;
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const data = await listarHistoricoVendedor({ limit: 100 });
      setHistoryItems(data.historico || []);
    } catch (error) {
      if (error.status === 401 || error.code === "SESSAO_VENDEDOR_NECESSARIA") {
        expirarSessao(error.message);
        return;
      }
      setHistoryError(error.message || "Não foi possível carregar o histórico.");
    } finally {
      setHistoryLoading(false);
    }
  };

  const abrirHistorico = async () => {
    if (loading || !sessaoVendedor) return;
    setHistoryOpen(true);
    setTipoDiagnostico(null);
    setDiagnostico(null);
    setContextoResultado(null);
    setCtaMessage("");
    setApiNotice("");
    setRevealPending(false);
    setNextStepOpen(false);
    await carregarHistorico();
  };

  const abrirDiagnosticoHistorico = async (item) => {
    setOpeningHistoryId(item.diagnosticoId);
    setHistoryError("");

    try {
      const data = await obterDiagnosticoDoHistorico(item.diagnosticoId);
      setTipoDiagnostico(data.tipoDiagnostico === "reputacao" ? "reputacao" : "recomendacao_ia");
      setDiagnostico(data.diagnostico);
      setContextoResultado({
        empresa: data.empresa || "",
        cidade: data.cidade || "",
        segmento: data.segmento || "",
        principalProduto: data.principalProduto || "",
        tipoDiagnostico: data.tipoDiagnostico || "recomendacao_ia"
      });
      setHistoryOpen(false);
      setCtaMessage("");
      setApiNotice("");
      setRevealPending(false);
      setNextStepOpen(false);

      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      if (error.status === 401 || error.code === "SESSAO_VENDEDOR_NECESSARIA") {
        expirarSessao(error.message);
        return;
      }
      setHistoryError(error.message || "Não foi possível abrir este diagnóstico.");
    } finally {
      setOpeningHistoryId("");
    }
  };

  const abrirUltimoDiagnostico = () => {
    if (!lastSnapshot?.diagnostico || !lastSnapshot?.contexto) return;
    setHistoryOpen(false);
    setTipoDiagnostico(lastSnapshot.tipo === "reputacao" ? "reputacao" : "recomendacao_ia");
    setModoEntrega(lastSnapshot.modoEntrega === "simplificado" ? "simplificado" : "completo");
    setContextoResultado(lastSnapshot.contexto);
    setDiagnostico(lastSnapshot.diagnostico);
    setApiNotice("");
    setCtaMessage("");
    setRevealPending(false);
    setNextStepOpen(false);
    window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleDraftChange = useCallback((tipo, data) => {
    setFormDrafts((current) => ({ ...current, [tipo]: data }));
  }, []);

  const handleRecommendationDraft = useCallback((data) => handleDraftChange("recomendacao_ia", data), [handleDraftChange]);
  const handleReputationDraft = useCallback((data) => handleDraftChange("reputacao", data), [handleDraftChange]);

  const handleDiagnosticSubmit = async (formData) => {
    if (!sessaoVendedor?.token) {
      expirarSessao("Digite o código do vendedor antes de iniciar uma análise.");
      return;
    }

    const tipoAtual = formData.tipoDiagnostico === "reputacao" ? "reputacao" : "recomendacao_ia";
    const payload = montarPayloadDiagnostico(formData, tipoAtual);
    const contextoAtual = {
      empresa: payload.empresa?.trim() || "",
      cidade: payload.cidade?.trim() || "",
      segmento: payload.segmento?.trim() || "",
      principalProduto: payload.principalProduto?.trim() || "",
      tipoDiagnostico: tipoAtual
    };

    setLastAttemptPayload(payload);
    setFormDrafts((current) => ({ ...current, [tipoAtual]: payload }));
    setLoadingStep(0);
    setAnalysisProgress({
      key: "accepted",
      label: "Preparando a conexão com o diagnóstico",
      detail: "Enviando os dados validados para o backend."
    });

    executarViewTransition(() => {
      setContextoResultado(contextoAtual);
      setDiagnostico(null);
      setCtaMessage("");
      setApiNotice("");
      setRevealPending(false);
      setNextStepOpen(false);
      setLoading(true);
    });

    window.setTimeout(() => analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    let completed = false;

    const onProgress = (event) => {
      setAnalysisProgress(event);
      const next = progressSteps[tipoAtual]?.[event.key];
      if (Number.isFinite(next)) setLoadingStep(next);
    };

    const finalizarComResultado = (resultado) => {
      executarViewTransition(() => {
        setDiagnostico(resultado);
        setRevealPending(true);
        setLoading(false);
      });
    };

    try {
      const clientId = obterClientId();
      const options = {
        timeoutMs: 300000,
        clientId,
        token: sessaoVendedor.token,
        onProgress
      };
      const chamada = tipoAtual === "reputacao"
        ? gerarReputacaoViaApi(payload, options)
        : gerarDiagnosticoViaApi(payload, options);

      const [resultado] = await Promise.all([chamada, aguardar(1200)]);

      const lead = {
        nome: payload.nome.trim(),
        empresa: payload.empresa.trim(),
        cidade: payload.cidade.trim(),
        segmento: payload.segmento?.trim() || "",
        principalProduto: payload.principalProduto?.trim() || "",
        siteEmpresa: payload.siteEmpresa?.trim() || "",
        perfilGoogle: payload.perfilGoogle?.trim() || "",
        tipoDiagnostico: tipoAtual,
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultado.status,
        notaGeral: Number.isFinite(resultado.notaGeral) ? resultado.notaGeral : null,
        vendedorId: sessaoVendedor.vendedor.id,
        vendedorNome: sessaoVendedor.vendedor.nome
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(payload, lead);
      enviarLeadParaWebhook(lead);

      const snapshot = { tipo: tipoAtual, modoEntrega, diagnostico: resultado, contexto: contextoAtual };
      salvarUltimoDiagnostico(sessaoVendedor.vendedor.id, snapshot);
      setLastSnapshot({ ...snapshot, savedAt: new Date().toISOString() });
      completed = true;
      finalizarComResultado(resultado);
    } catch (error) {
      if (error.status === 401 || error.code === "SESSAO_VENDEDOR_NECESSARIA") {
        setLoading(false);
        expirarSessao(error.message);
        return;
      }

      if (error.code === "DIAGNOSTICO_JA_SOLICITADO" || error.bloqueado) {
        setApiNotice(avisoParaErro(error, tipoAtual));
        setLoading(false);
        return;
      }

      console.warn("Não foi possível concluir a análise completa agora.", error);

      if (tipoAtual === "reputacao") {
        setApiNotice(avisoParaErro(error, tipoAtual));
        setLoading(false);
        return;
      }

      // O diagnóstico de recomendação mantém o fallback legado, mas deixa claro
      // quando a pesquisa pública real não pôde ser concluída.
      await aguardar(700);
      const resultadoLocal = gerarDiagnostico(payload);
      const lead = {
        nome: payload.nome.trim(),
        empresa: payload.empresa.trim(),
        cidade: payload.cidade.trim(),
        segmento: payload.segmento.trim(),
        principalProduto: payload.principalProduto?.trim() || "",
        tipoDiagnostico: "recomendacao_ia",
        dataEnvio: new Date().toISOString(),
        diagnosticoStatus: resultadoLocal.status,
        vendedorId: sessaoVendedor.vendedor.id,
        vendedorNome: sessaoVendedor.vendedor.nome
      };

      salvarLeadNoLocalStorage(lead);
      marcarDiagnosticoSolicitadoLocal(payload, lead);
      enviarLeadParaWebhook(lead);
      setApiNotice({
        kind: "info",
        title: "Leitura inicial exibida.",
        message: "A pesquisa pública completa não fechou, então o sistema preservou a experiência com uma prévia local.",
        detail: "Esta prévia não substitui o diagnóstico salvo no histórico do servidor."
      });

      const snapshot = { tipo: tipoAtual, modoEntrega, diagnostico: resultadoLocal, contexto: contextoAtual };
      salvarUltimoDiagnostico(sessaoVendedor.vendedor.id, snapshot);
      setLastSnapshot({ ...snapshot, savedAt: new Date().toISOString() });
      completed = true;
      finalizarComResultado(resultadoLocal);
    } finally {
      if (!completed) setLoading(false);

      if (completed) {
        window.setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  };

  const handleRetry = () => {
    if (!lastAttemptPayload || loading) return;
    setApiNotice("");
    handleDiagnosticSubmit(lastAttemptPayload);
  };

  const handleCtaClick = () => {
    setCtaMessage("");
    setNextStepOpen(true);
    window.setTimeout(() => {
      document.getElementById("proximo-passo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const autenticado = !checkingSession && Boolean(sessaoVendedor?.token && sessaoVendedor?.vendedor);

  return (
    <main className="ai-page-shell min-h-screen bg-white">
      <Header
        onNewAnalysis={voltarParaSelecao}
        showNewAnalysis={autenticado && Boolean(tipoDiagnostico || diagnostico || historyOpen)}
        disabled={loading || checkingSession}
        vendedor={autenticado ? sessaoVendedor.vendedor : null}
        onOpenHistory={abrirHistorico}
        onLogout={handleLogout}
      />
      <Hero tipoDiagnostico={historyOpen ? null : tipoDiagnostico} />

      {!autenticado ? (
        <VendedorAccessGate onLogin={handleLogin} checking={checkingSession} notice={accessNotice} />
      ) : historyOpen ? (
        <VendedorHistory
          vendedor={sessaoVendedor.vendedor}
          items={historyItems}
          loading={historyLoading}
          openingId={openingHistoryId}
          error={historyError}
          onClose={voltarParaSelecao}
          onOpen={abrirDiagnosticoHistorico}
          onRefresh={carregarHistorico}
        />
      ) : (
        <>
          {!tipoDiagnostico && lastSnapshot ? (
            <LastDiagnosticCard snapshot={lastSnapshot} onOpen={abrirUltimoDiagnostico} />
          ) : null}

          {!tipoDiagnostico ? (
            <DiagnosticSelector onSelect={selecionarDiagnostico} disabled={loading} />
          ) : null}

          {tipoDiagnostico && !diagnostico && !loading ? (
            <DeliveryModeSwitch
              value={modoEntrega}
              onChange={setModoEntrega}
              disabled={loading}
            />
          ) : null}

          {tipoDiagnostico === "recomendacao_ia" && !loading && !diagnostico ? (
            <DiagnosticForm
              onSubmit={handleDiagnosticSubmit}
              loading={loading}
              onBack={voltarParaSelecao}
              initialData={formDrafts.recomendacao_ia}
              onDraftChange={handleRecommendationDraft}
            />
          ) : null}

          {tipoDiagnostico === "reputacao" && !loading && !diagnostico ? (
            <ReputationForm
              onSubmit={handleDiagnosticSubmit}
              loading={loading}
              onBack={voltarParaSelecao}
              initialData={formDrafts.reputacao}
              onDraftChange={handleReputationDraft}
            />
          ) : null}

          {loading ? (
            <div ref={analysisRef}>
              <AnalysisExperience
                tipo={tipoDiagnostico}
                contexto={contextoResultado}
                activeStep={loadingStep}
                elapsedSeconds={elapsedSeconds}
                progressEvent={analysisProgress}
              />
            </div>
          ) : null}

          {tipoDiagnostico === "recomendacao_ia" && modoEntrega === "completo" && !loading && !diagnostico ? <InfoSection /> : null}

          <UxNotice
            notice={apiNotice}
            onRetry={apiNotice && apiNotice?.kind !== "info" && lastAttemptPayload ? handleRetry : null}
            onReturn={() => document.getElementById("diagnostico")?.scrollIntoView({ behavior: "smooth", block: "start" })}
            onDismiss={() => setApiNotice("")}
          />

          <div ref={resultRef} data-print-container="true">
            {diagnostico && revealPending ? (
              <ResultReveal
                tipo={tipoDiagnostico}
                diagnostico={diagnostico}
                contexto={contextoResultado}
                onComplete={handleRevealComplete}
              />
            ) : null}

            {diagnostico && !revealPending ? (
              <div className="px-4 pt-5 md:px-6" data-export-hide="true">
                <div className="mx-auto max-w-[920px]">
                  <DeliveryModeSwitch
                    value={modoEntrega}
                    onChange={setModoEntrega}
                    compact
                    disabled={loading}
                  />
                </div>
              </div>
            ) : null}

            {diagnostico && !revealPending && modoEntrega === "simplificado" ? (
              <SimplifiedResult
                tipo={tipoDiagnostico}
                diagnostico={diagnostico}
                contexto={contextoResultado}
                onCtaClick={handleCtaClick}
                ctaMessage={ctaMessage}
              />
            ) : null}

            {diagnostico && !revealPending && modoEntrega === "completo" && tipoDiagnostico === "recomendacao_ia" ? (
              <DiagnosticResult diagnostico={diagnostico} contexto={contextoResultado} onCtaClick={handleCtaClick} ctaMessage={ctaMessage} />
            ) : null}

            {diagnostico && !revealPending && modoEntrega === "completo" && tipoDiagnostico === "reputacao" ? (
              <ReputationResult diagnostico={diagnostico} contexto={contextoResultado} onCtaClick={handleCtaClick} ctaMessage={ctaMessage} />
            ) : null}
          </div>

          {diagnostico && !revealPending && nextStepOpen ? (
            <NextStepJourney
              tipo={tipoDiagnostico}
              diagnostico={diagnostico}
              contexto={contextoResultado}
              onNewAnalysis={voltarParaSelecao}
            />
          ) : null}
        </>
      )}

      <Footer />
    </main>
  );
}
