export function criarErroApi(payload = {}, fallback = {}) {
  const error = new Error(payload.message || fallback.message || "Não foi possível concluir a solicitação.");
  error.errors = payload.errors || {};
  error.code = payload.code || fallback.code;
  error.status = payload.status || fallback.status;
  error.bloqueado = Boolean(payload.bloqueado);
  error.payload = payload.payload || payload;
  return error;
}

export async function consumirRespostaApi(response, options = {}) {
  const contentType = String(response.headers.get("content-type") || "").toLowerCase();

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw criarErroApi(data || {}, {
      status: response.status,
      message: options.fallbackMessage
    });
  }

  if (!contentType.includes("application/x-ndjson") || !response.body?.getReader) {
    return response.json();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result = null;

  const processLine = (line) => {
    const clean = line.trim();
    if (!clean) return;

    let event;
    try {
      event = JSON.parse(clean);
    } catch {
      return;
    }

    if (event.type === "progress") {
      options.onProgress?.(event);
      return;
    }

    if (event.type === "error") {
      throw criarErroApi(event, {
        status: event.status || 500,
        message: options.fallbackMessage
      });
    }

    if (event.type === "result") {
      result = event.diagnostico ?? event.result ?? null;
      options.onResultMeta?.({ diagnosticoId: event.diagnosticoId || null });
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) processLine(line);
    if (done) break;
  }

  if (buffer.trim()) processLine(buffer);

  if (!result) {
    throw criarErroApi({}, {
      code: "STREAM_SEM_RESULTADO",
      status: 502,
      message: options.fallbackMessage || "A conexão terminou antes de receber o resultado."
    });
  }

  return result;
}
