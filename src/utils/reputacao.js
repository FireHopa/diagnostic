export async function gerarReputacaoViaApi(formData, options = {}) {
  const timeoutMs = options.timeoutMs || 300000;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    "Content-Type": "application/json"
  };

  if (options.clientId) {
    headers["x-client-id"] = options.clientId;
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response;

  try {
    response = await fetch("/api/diagnostico-reputacao", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...formData, tipoDiagnostico: "reputacao" }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error(
        "A pesquisa de reputação demorou mais do que o esperado. Tente novamente em alguns instantes."
      );
      timeoutError.code = "TIMEOUT_REPUTACAO";
      throw timeoutError;
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "Não foi possível gerar a análise de reputação neste momento.");
    error.errors = data?.errors || {};
    error.code = data?.code;
    error.status = response.status;
    error.bloqueado = Boolean(data?.bloqueado);
    error.payload = data;
    throw error;
  }

  return data;
}
