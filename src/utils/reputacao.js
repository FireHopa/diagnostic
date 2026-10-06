import { consumirRespostaApi } from "./streamingApi.js";
import { montarPayloadDiagnostico } from "./payload.js";

export async function gerarReputacaoViaApi(formData, options = {}) {
  const timeoutMs = options.timeoutMs || 300000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    "Content-Type": "application/json",
    Accept: options.onProgress ? "application/x-ndjson" : "application/json"
  };

  if (options.clientId) headers["x-client-id"] = options.clientId;
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  try {
    const payload = montarPayloadDiagnostico(formData, "reputacao");
    const response = await fetch("/api/diagnostico-reputacao", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    return await consumirRespostaApi(response, {
      onProgress: options.onProgress,
      onResultMeta: options.onResultMeta,
      fallbackMessage: "Não foi possível gerar a análise de reputação neste momento."
    });
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("A pesquisa de reputação demorou mais do que o esperado. Tente novamente em alguns instantes.");
      timeoutError.code = "TIMEOUT_REPUTACAO";
      throw timeoutError;
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
